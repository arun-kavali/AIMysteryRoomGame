import React from 'react';
import { Lightbulb, Lock, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function HintCard({
  hint,
  index,
  isNextToUnlock = false,
  onUnlock,
  isUnlocking = false,
  disabled = false
}) {
  const { id, number = index + 1, text, unlocked } = hint;

  return (
    <div
      className={`
        p-4 sm:p-5 rounded-card border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
        ${unlocked 
          ? 'bg-white border-border shadow-card' 
          : isNextToUnlock 
            ? 'bg-amber-50/30 border-amber-200 shadow-xs' 
            : 'bg-slate-50/50 border-slate-200 opacity-75'}
      `}
    >
      <div className="flex items-start gap-3 sm:gap-4 flex-1">
        {/* Icon */}
        <div 
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${unlocked 
              ? 'bg-emerald-100 text-emerald-600' 
              : isNextToUnlock 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-slate-200 text-slate-400'}
          `}
        >
          {unlocked ? (
            <Lightbulb className="w-5 h-5" />
          ) : isNextToUnlock ? (
            <Lightbulb className="w-5 h-5 animate-pulse" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-navy-900">
              Hint {number}
            </h4>
            {unlocked ? (
              <Badge variant="success" size="sm">
                Revealed
              </Badge>
            ) : isNextToUnlock ? (
              <Badge variant="warning" size="sm">
                Available (-10 pts)
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                Locked
              </Badge>
            )}
          </div>

          <p className="text-sm text-secondary leading-relaxed">
            {unlocked ? (
              text
            ) : isNextToUnlock ? (
              <span className="text-amber-800 font-medium">
                Click below to reveal this investigative hint. (Costs 10 score points).
              </span>
            ) : (
              <span className="text-slate-400 italic">
                Use previous hint to unlock this clue.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action button if next to unlock */}
      {!unlocked && isNextToUnlock && (
        <div className="w-full sm:w-auto flex-shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onUnlock && onUnlock(id)}
            isLoading={isUnlocking}
            disabled={disabled}
            icon={Sparkles}
          >
            Use Hint
          </Button>
        </div>
      )}
    </div>
  );
}

