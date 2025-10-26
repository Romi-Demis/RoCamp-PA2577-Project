import React from 'react';
import { Headphones } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <Headphones className="h-12 w-12 text-teal-600 mx-auto animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading RoCamp...</p>
      </div>
    </div>
  );
}
