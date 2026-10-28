import React from 'react';
import { Users, FileSearch, Lightbulb, Award, Check } from 'lucide-react';

export default function DifficultyCard({
  difficultyKey,
  title,
  suspectCount,
  clueCount,
  hintCount,
  points,
  isSelected,
  onClick,
  accentColor = 'blue' // 'emerald' | 'blue' | 'purple'
}) {
  const colorMap = {
    emerald: {
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
      selectedBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20',
      activeText: 'text-emerald-700',
    },
    blue: {
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100 text-primary',
      selectedBorder: 'border-primary ring-2 ring-primary/20 bg-blue-50/20',
      activeText: 'text-primary',
    },
    purple: {
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-100 text-purple-600',
      selectedBorder: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20',
      activeText: 'text-purple-700',
    }
  };

  const scheme = colorMap[accentColor] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        relative p-5 sm:p-6 rounded-card border transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-between
        ${isSelected ? `${scheme.selectedBorder} shadow-selected` : 'border-border bg-white hover:border-slate-300 hover:shadow-card-hover'}
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Icon */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${scheme.iconBg}`}>
        <Award className="w-6 h-6" />
      </div>

      {/* Title */}
      <h3 className={`text-lg font-bold mb-3 ${isSelected ? scheme.activeText : 'text-navy-900'}`}>
        {title}
      </h3>

      {/* Attributes List */}
      <div className="w-full space-y-2 text-xs sm:text-sm text-secondary mb-4">
        <div className="flex items-center justify-center gap-1.5 font-medium">
          <Users className="w-4 h-4 text-slate-400" />
          <span><strong>{suspectCount}</strong> Suspects</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 font-medium">
          <FileSearch className="w-4 h-4 text-slate-400" />
          <span><strong>{clueCount}</strong> Clues</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 font-medium">
          <Lightbulb className="w-4 h-4 text-slate-400" />
          <span><strong>{hintCount}</strong> Hints</span>
        </div>
      </div>

      {/* Points Pill */}
      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${scheme.badgeBg}`}>
        +{points} Points
      </div>
    </div>
  );
}

