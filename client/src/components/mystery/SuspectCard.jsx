import React, { useState } from 'react';
import { User, Check, Info } from 'lucide-react';
import Button from '../common/Button';

export default function SuspectCard({
  suspect,
  isSelectable = false,
  isSelected = false,
  onSelect,
  showActions = true,
  className = ""
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      onClick={isSelectable ? onSelect : undefined}
      className={`
        bg-white rounded-card border transition-all duration-200 flex flex-col p-5 sm:p-6 text-center items-center relative
        ${isSelectable ? 'cursor-pointer' : ''}
        ${isSelected 
          ? 'border-primary ring-2 ring-primary/25 shadow-selected bg-blue-50/20' 
          : 'border-border shadow-card hover:shadow-card-hover hover:border-slate-300'}
        ${className}
      `}
    >
      {/* Selected Indicator */}
      {isSelectable && isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Avatar Image with fallback */}
      <div className="relative mb-3">
        {suspect.avatar ? (
          <img
            src={suspect.avatar}
            alt={suspect.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md mx-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-slate-400 mx-auto"
          style={{ display: suspect.avatar ? 'none' : 'flex' }}
        >
          <User className="w-10 h-10" />
        </div>
      </div>

      {/* Name & Role */}
      <h3 className="text-base sm:text-lg font-bold text-navy-900 mb-0.5">
        {suspect.name}
      </h3>
      <p className="text-xs sm:text-sm font-semibold text-primary mb-3">
        {suspect.role}
      </p>

      {/* Motive & Alibi */}
      <div className="w-full bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs text-left space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-secondary font-medium">Motive:</span>
          <span className="font-semibold text-navy-900">{suspect.motive || 'Unknown'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-secondary font-medium">Alibi:</span>
          <span className="font-semibold text-navy-900">{suspect.alibi || 'Unconfirmed'}</span>
        </div>
      </div>

      {/* Expanded details if toggled */}
      {showDetails && (
        <div className="w-full bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-xs text-left mb-4 text-body leading-relaxed animate-fadeIn">
          <p className="font-semibold text-navy-900 mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-primary" />
            Background:
          </p>
          <p>{suspect.description || suspect.details}</p>
        </div>
      )}

      {/* Action button */}
      {showActions && !isSelectable && (
        <div className="mt-auto w-full pt-1">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
          >
            {showDetails ? "Hide Details" : "View Details"}
          </Button>
        </div>
      )}
    </div>
  );
}

