import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-[10px] gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
  };

  const variantClasses = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-sm focus:ring-primary/40",
    secondary: "bg-white hover:bg-slate-50 text-navy-900 border border-border shadow-xs focus:ring-slate-200",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary-surface focus:ring-primary/30",
    ghost: "bg-transparent hover:bg-slate-100 text-secondary hover:text-navy-900 focus:ring-slate-200",
    danger: "bg-danger hover:bg-red-700 text-white shadow-sm focus:ring-danger/40",
    subtle: "bg-primary-surface text-primary hover:bg-blue-100 focus:ring-primary/30",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
          {children}
        </>
      )}
    </button>
  );
}

