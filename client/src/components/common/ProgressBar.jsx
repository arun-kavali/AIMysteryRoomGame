import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  sublabel,
  color = 'primary', // 'primary' | 'success' | 'warning' | 'purple'
  showCount = true,
  className = ''
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / (max || 1)) * 100)));

  const colorClasses = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    purple: "bg-purple-600",
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showCount) && (
        <div className="flex items-center justify-between text-xs font-medium text-secondary mb-1.5">
          {label && <span className="text-navy-900 font-semibold">{label}</span>}
          {showCount && (
            <span className="text-secondary">
              <strong className="text-navy-900">{value}</strong> / {max}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClasses[color] || colorClasses.primary}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {sublabel && (
        <p className="text-[11px] text-secondary mt-1">{sublabel}</p>
      )}
    </div>
  );
}

