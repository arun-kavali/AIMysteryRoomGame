import React from 'react';

export default function LoadingSpinner({
  title = "Generating your mystery...",
  subtitle = "This may take a few seconds.",
  className = ""
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-card border border-border shadow-card ${className}`}>
      <div className="relative w-14 h-14 mb-4">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-1">{title}</h3>
      <p className="text-sm text-secondary">{subtitle}</p>
    </div>
  );
}

