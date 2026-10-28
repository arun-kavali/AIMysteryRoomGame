import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorPanel({
  title = "Something went wrong",
  message = "We couldn't generate your mystery. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  className = ""
}) {
  return (
    <div className={`p-8 bg-red-50/50 rounded-card border border-red-100 flex flex-col items-center text-center max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-danger mb-4 shadow-xs">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-navy-900 mb-1.5">{title}</h3>
      <p className="text-sm text-secondary mb-5 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

