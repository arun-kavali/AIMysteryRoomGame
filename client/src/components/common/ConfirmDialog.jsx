import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({
  isOpen = false,
  title = "Confirm Accusation",
  message = "Are you sure you want to submit your accusation? This will end your investigation and reveal the solution.",
  confirmLabel = "Confirm Accusation",
  cancelLabel = "Continue Investigating",
  onConfirm,
  onCancel,
  isLoading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-card border border-border shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-secondary hover:text-navy-900 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex-shrink-0 flex items-center justify-center text-warning">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="dialog-title" className="text-lg font-bold text-navy-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

