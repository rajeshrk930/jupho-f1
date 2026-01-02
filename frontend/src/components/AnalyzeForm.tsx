'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Industry, Objective } from '@/types';

interface AnalyzeFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const OBJECTIVES: { value: Objective; label: string }[] = [
  { value: 'AWARENESS', label: 'Awareness' },
  { value: 'TRAFFIC', label: 'Traffic' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'LEADS', label: 'Leads' },
  { value: 'APP_PROMOTION', label: 'App Promotion' },
  { value: 'SALES', label: 'Sales' },
];

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'ECOMMERCE', label: 'E-commerce' },
  { value: 'SAAS', label: 'SaaS' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'FOOD', label: 'Food' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'OTHER', label: 'Other' },
];

export function AnalyzeForm({ onSubmit, isLoading }: AnalyzeFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [creativeType, setCreativeType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [primaryText, setPrimaryText] = useState('');
  const [headline, setHeadline] = useState('');
  const [objective, setObjective] = useState<Objective>('SALES');
  const [industry, setIndustry] = useState<Industry>('ECOMMERCE');
  const [ctr, setCtr] = useState('');
  const [cpm, setCpm] = useState('');
  const [cpc, setCpc] = useState('');
  const [cpa, setCpa] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setCreativeType(file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    maxFiles: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    if (file) formData.append('creative', file);
    formData.append('creativeType', creativeType);
    formData.append('primaryText', primaryText);
    formData.append('headline', headline);
    formData.append('objective', objective);
    formData.append('industry', industry);
    if (ctr) formData.append('ctr', ctr);
    if (cpm) formData.append('cpm', cpm);
    if (cpc) formData.append('cpc', cpc);
    if (cpa) formData.append('cpa', cpa);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Creative Upload */}
      <div>
        <label className="label">Creative (Image or Video)</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {creativeType} • {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              Drop your creative here or click to browse
            </p>
          )}
        </div>
      </div>

      {/* Primary Text */}
      <div>
        <label className="label">Primary Text</label>
        <textarea
          value={primaryText}
          onChange={(e) => setPrimaryText(e.target.value)}
          className="input min-h-[100px] resize-none"
          placeholder="Enter the primary ad text..."
        />
      </div>

      {/* Headline */}
      <div>
        <label className="label">Headline</label>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="input"
          placeholder="Enter headline..."
        />
      </div>

      {/* Objective */}
      <div>
        <label className="label">Objective</label>
        <select
          value={objective}
          onChange={(e) => setObjective(e.target.value as Objective)}
          className="input"
        >
          {OBJECTIVES.map((obj) => (
            <option key={obj.value} value={obj.value}>
              {obj.label}
            </option>
          ))}
        </select>
      </div>

      {/* Industry */}
      <div>
        <label className="label">Industry</label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value as Industry)}
          className="input"
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics */}
      <div>
        <label className="label">Metrics</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="number"
              step="0.01"
              value={ctr}
              onChange={(e) => setCtr(e.target.value)}
              className="input"
              placeholder="CTR %"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              value={cpm}
              onChange={(e) => setCpm(e.target.value)}
              className="input"
              placeholder="CPM $"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              value={cpc}
              onChange={(e) => setCpc(e.target.value)}
              className="input"
              placeholder="CPC $"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              value={cpa}
              onChange={(e) => setCpa(e.target.value)}
              className="input"
              placeholder="CPA $"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Creative'}
      </button>
    </form>
  );
}
