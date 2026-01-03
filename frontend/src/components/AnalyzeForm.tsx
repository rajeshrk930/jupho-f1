'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Objective, ProblemFaced, WhatChanged, AudienceType } from '@/types';

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Creative Upload */}
      <div>
        <label className="label">
          Creative (Image or Video) <span className="text-red-500">*</span>
        </label>
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
        <label className="label">Primary Text (optional)</label>
        <textarea
          value={primaryText}
          onChange={(e) => setPrimaryText(e.target.value)}
          className="input min-h-[100px] resize-none"
          placeholder="Enter the primary ad text..."
        />
      </div>

      {/* Headline */}
      <div>
        <label className="label">Headline (optional)</label>
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
        <label className="label">
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
        <label className="label">
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
        <label className="label">
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
        <label className="label">
          Metrics <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input
              type="number"
              step="0.01"
              value={ctr}
              onChange={(e) => setCtr(e.target.value)}
              className="input"
              placeholder="CTR % *"
              required
            />
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              value={cpm}
              onChange={(e) => setCpm(e.target.value)}
              className="input"
              placeholder="CPM ($) *"
              required
            />
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              value={cpa}
              onChange={(e) => setCpa(e.target.value)}
              className="input"
              placeholder="Cost per Result ($) *"
              required
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
