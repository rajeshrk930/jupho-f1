'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Objective, ProblemFaced, WhatChanged, AudienceType } from '@/types';
import { Target, AlertCircle, Users, TrendingUp, DollarSign, Upload, FileText, Type } from 'lucide-react';

interface AnalyzeFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const OBJECTIVES: { value: Objective; label: string }[] = [
  { value: 'LEADS', label: 'Leads' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'SALES', label: 'Sales' },
];

const PROBLEMS: { value: ProblemFaced; label: string }[] = [
  { value: 'LOW_CLICKS', label: 'Low clicks' },
  { value: 'CLICKS_NO_ACTION', label: 'Clicks but no action' },
  { value: 'MESSAGES_NO_CONVERSION', label: 'Messages but no conversion' },
];

const CHANGES: { value: WhatChanged; label: string }[] = [
  { value: 'CREATIVE_CHANGED', label: 'Creative changed' },
  { value: 'AUDIENCE_CHANGED', label: 'Audience changed' },
  { value: 'BUDGET_CHANGED', label: 'Budget changed' },
  { value: 'NOTHING_NEW_AD', label: 'Nothing (new ad)' },
];

const AUDIENCE_TYPES: { value: AudienceType; label: string }[] = [
  { value: 'BROAD', label: 'Broad' },
  { value: 'INTEREST_BASED', label: 'Interest-based' },
  { value: 'LOOKALIKE', label: 'Lookalike' },
];

export function AnalyzeForm({ onSubmit, isLoading }: AnalyzeFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [creativeType, setCreativeType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [primaryText, setPrimaryText] = useState('');
  const [headline, setHeadline] = useState('');
  const [objective, setObjective] = useState<Objective>('LEADS');
  const [problemFaced, setProblemFaced] = useState<ProblemFaced>('LOW_CLICKS');
  const [whatChanged, setWhatChanged] = useState<WhatChanged>('NOTHING_NEW_AD');
  const [audienceType, setAudienceType] = useState<AudienceType>('BROAD');
  const [ctr, setCtr] = useState('');
  const [cpm, setCpm] = useState('');
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
    
    // Validate required fields
    if (!file) {
      alert('Please upload a creative file');
      return;
    }
    if (!ctr || !cpm || !cpa) {
      alert('Please fill in all required metrics: CTR, CPM, and Cost per Result');
      return;
    }
    
    const formData = new FormData();
    formData.append('creative', file);
    formData.append('creativeType', creativeType);
    formData.append('primaryText', primaryText);
    formData.append('headline', headline);
    formData.append('objective', objective);
    formData.append('problemFaced', problemFaced);
    formData.append('whatChanged', whatChanged);
    formData.append('audienceType', audienceType);
    formData.append('ctr', ctr);
    formData.append('cpm', cpm);
    formData.append('cpa', cpa);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Creative Upload */}
      <div>
        <label className="label">
          Creative (Image or Video) <span className="text-red-600">*</span>
        </label>
        <div
          {...getRootProps()}
          className={`border-4 border-dashed rounded-2xl p-8 md:p-10 text-center cursor-pointer ${
            isDragActive 
              ? 'border-teal-600 bg-teal-50 shadow-colored-teal' 
              : file
              ? 'border-green-600 bg-green-50 shadow-bold'
              : 'border-gray-400 hover:border-teal-600 hover:bg-gray-50 shadow-bold'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-bold">
                <Upload size={32} className="text-white" />
              </div>
              <p className="font-black text-gray-900 text-lg">{file.name}</p>
              <p className="text-base text-gray-700 font-bold">
                {creativeType} • {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-bold">
                <Upload size={32} className="text-white" />
              </div>
              <div>
                <p className="text-gray-900 font-black text-lg">Drop your creative here</p>
                <p className="text-base text-gray-700 mt-2 font-bold">or click to browse</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Text */}
      <div>
        <label className="label flex items-center gap-2">
          <FileText size={16} className="text-gray-500" />
          Primary Text (optional)
        </label>
        <textarea
          value={primaryText}
          onChange={(e) => setPrimaryText(e.target.value)}
          className="input min-h-[100px] resize-none"
          placeholder="Enter the primary ad text..."
        />
      </div>

      {/* Headline */}
      <div>
        <label className="label flex items-center gap-2">
          <Type size={16} className="text-gray-500" />
          Headline (optional)
        </label>
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
        <label className="label flex items-center gap-2">
          <Target size={16} className="text-gray-500" />
          Objective <span className="text-red-500">*</span>
        </label>
        <select
          value={objective}
          onChange={(e) => setObjective(e.target.value as Objective)}
          className="input"
          required
        >
          {OBJECTIVES.map((obj) => (
            <option key={obj.value} value={obj.value}>
              {obj.label}
            </option>
          ))}
        </select>
      </div>

      {/* Problem Faced */}
      <div>
        <label className="label flex items-center gap-2">
          <AlertCircle size={16} className="text-gray-500" />
          Problem Faced <span className="text-red-500">*</span>
        </label>
        <select
          value={problemFaced}
          onChange={(e) => setProblemFaced(e.target.value as ProblemFaced)}
          className="input"
          required
        >
          {PROBLEMS.map((prob) => (
            <option key={prob.value} value={prob.value}>
              {prob.label}
            </option>
          ))}
        </select>
      </div>

      {/* What Changed Recently */}
      <div>
        <label className="label">
          What Changed Recently? <span className="text-red-500">*</span>
        </label>
        <select
          value={whatChanged}
          onChange={(e) => setWhatChanged(e.target.value as WhatChanged)}
          className="input"
          required
        >
          {CHANGES.map((change) => (
            <option key={change.value} value={change.value}>
              {change.label}
            </option>
          ))}
        </select>
      </div>

      {/* Audience Type */}
      <div>
        <label className="label flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          Audience Type <span className="text-red-500">*</span>
        </label>
        <select
          value={audienceType}
          onChange={(e) => setAudienceType(e.target.value as AudienceType)}
          className="input"
          required
        >
          {AUDIENCE_TYPES.map((aud) => (
            <option key={aud.value} value={aud.value}>
              {aud.label}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics - REQUIRED */}
      <div>
        <label className="label flex items-center gap-2">
          <TrendingUp size={16} className="text-gray-500" />
          Metrics <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={ctr}
                onChange={(e) => setCtr(e.target.value)}
                className="input pr-8"
                placeholder="CTR *"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
            </div>
          </div>
          <div>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={cpm}
                onChange={(e) => setCpm(e.target.value)}
                className="input pl-10"
                placeholder="CPM *"
                required
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={cpa}
                onChange={(e) => setCpa(e.target.value)}
                className="input pl-10"
                placeholder="Cost/Result *"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg"
      >
        {isLoading && (
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {isLoading ? 'ANALYZING...' : 'ANALYZE CREATIVE!'}
      </button>
    </form>
  );
}
