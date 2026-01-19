'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';

interface UploadResult {
  imported: number;
  skipped: Array<{
    row: number;
    name: string;
    reason: string;
  }>;
}

export default function TemplateUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/templates/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `TemplateName,Industry,Goal,PrimaryText,Headline,Headline2,Headline3,Description,CTA,Budget,Currency,AgeMin,AgeMax,Interests,IsLocal,Radius,Objective,ConversionMethod
Restaurant Special,Restaurant,Get More Orders,Craving delicious food? Order now and get 20% off your first order. Fresh ingredients delivered to your door!,Order Now & Save 20%,Fresh Food Delivered,Hungry? We Deliver!,Fresh food fast,Sign Up,500,INR,25,45,"Food,Restaurants,Delivery",true,5,OUTCOME_LEADS,lead_form
Gym Membership,Fitness,Get New Members,Ready to transform? Join today and get your first month FREE! Premium equipment and expert trainers included.,Join Now - First Month Free!,Transform Your Body,Limited Spots Available,First month FREE,Sign Up,800,INR,22,50,"Fitness,Gym,Health",true,10,OUTCOME_LEADS,lead_form`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-upload-example.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Admin: Bulk Upload Templates
          </h3>
          <p className="text-sm text-gray-600">Upload CSV file to import multiple templates at once</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition"
        >
          <Download className="w-4 h-4" />
          Download Example CSV
        </button>
      </div>

      {/* File Input */}
      <div className="mb-4">
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
        />
        {file && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: <span className="font-medium">{file.name}</span>
          </p>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Import Templates
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Upload Failed</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Import Complete!</p>
              <p className="text-sm text-green-700">
                Successfully imported <span className="font-bold">{result.imported}</span> template
                {result.imported !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Skipped Rows */}
          {result.skipped.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-yellow-900 mb-2">
                {result.skipped.length} row{result.skipped.length !== 1 ? 's' : ''} skipped
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.skipped.map((skip, idx) => (
                  <div key={idx} className="text-sm text-yellow-800 bg-white p-2 rounded">
                    <span className="font-medium">Row {skip.row}</span>
                    {skip.name && <span className="text-gray-600"> ({skip.name})</span>}
                    <span className="text-yellow-700"> - {skip.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Format Guide */}
      <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">
        <p className="font-semibold mb-1">Required CSV Columns:</p>
        <p>
          TemplateName, Industry, Goal, PrimaryText, Headline, CTA
        </p>
        <p className="mt-2 font-semibold mb-1">Validation Rules:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Headline: Max 40 characters</li>
          <li>PrimaryText: Max 125 characters</li>
          <li>Max 100 templates per upload</li>
          <li>Duplicates will be skipped automatically</li>
        </ul>
      </div>
    </div>
  );
}
