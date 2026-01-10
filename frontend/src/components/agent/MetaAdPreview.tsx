'use client';

import { Facebook, Heart, MessageCircle, Share2, ThumbsUp, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

interface MetaAdPreviewProps {
  brandName: string;
  headline: string;
  primaryText: string;
  description: string;
  imageUrl: string;
  cta: string;
}

export default function MetaAdPreview({
  brandName,
  headline,
  primaryText,
  description,
  imageUrl,
  cta,
}: MetaAdPreviewProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-[500px] mx-auto">
      {/* Facebook Post Header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {brandName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-sm text-gray-900">{brandName}</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>Sponsored</span>
              <span>•</span>
              <Facebook className="w-3 h-3" />
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:bg-gray-100 rounded-full p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Text */}
      <div className="px-3 py-2">
        <p className="text-sm text-gray-900 leading-relaxed">{primaryText}</p>
      </div>

      {/* Ad Image */}
      <div className="relative bg-gray-900 aspect-[1.91/1]">
        <img
          src={imageUrl}
          alt="Ad preview"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="261"%3E%3Crect fill="%23f3f4f6" width="500" height="261"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="16"%3EAd Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Ad Card */}
      <div className="bg-gray-50 border-t border-gray-200 p-3">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {brandName.toLowerCase().replace(/\s+/g, '')}.com
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">{headline}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <button className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-md text-sm transition-colors">
          {cta}
        </button>
      </div>

      {/* Engagement Bar */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <ThumbsUp className="w-3 h-3 text-white" />
              </div>
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>
            <span>24</span>
          </div>
          <span>3 comments · 5 shares</span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-md flex-1 justify-center">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-md flex-1 justify-center">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-md flex-1 justify-center">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
