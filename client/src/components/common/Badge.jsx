import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon
}) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold rounded-full gap-1",
    md: "px-2.5 py-1 text-xs font-semibold rounded-full gap-1.5",
    lg: "px-3 py-1.5 text-sm font-semibold rounded-full gap-1.5",
  };

  const variantClasses = {
    default: "bg-slate-100 text-secondary border border-slate-200",
    primary: "bg-primary-surface text-primary border border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    easy: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    medium: "bg-blue-50 text-blue-700 border border-blue-200",
    hard: "bg-purple-50 text-purple-700 border border-purple-200",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.default}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}

