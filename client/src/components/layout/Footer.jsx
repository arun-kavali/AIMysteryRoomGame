import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-base font-bold text-navy-900 tracking-tight">
                AI Mystery Room
              </span>
              <span className="text-xs text-primary font-semibold px-2 py-0.5 bg-primary-surface rounded-full">
                Interactive Detective
              </span>
            </div>
            <p className="text-sm text-secondary max-w-md">
              An AI-powered interactive mystery game where you investigate crime scenes, interrogate suspects, find clues, and reveal the truth.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-secondary">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <a href="/#how-it-works" className="hover:text-primary transition-colors">
              How It Works
            </a>
            <Link to="/create" className="hover:text-primary transition-colors">
              Create Mystery
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-secondary gap-3">
          <p>© {new Date().getFullYear()} AI Mystery Room. Built with Spec-Driven Development.</p>
          <p className="text-slate-400">Spec-driven college workshop implementation • Phase 1</p>
        </div>
      </div>
    </footer>
  );
}

