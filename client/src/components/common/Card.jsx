import React from 'react';

export default function Card({
  children,
  className = '',
  selected = false,
  hoverable = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-card border transition-all duration-200
        ${selected ? 'border-primary ring-2 ring-primary/20 shadow-selected bg-blue-50/20' : 'border-border shadow-card'}
        ${hoverable ? 'hover:shadow-card-hover hover:border-slate-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

