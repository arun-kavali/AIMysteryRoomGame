import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, Sparkles } from 'lucide-react';
import Button from '../common/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg p-1">
            <div className="w-9 h-9 rounded-xl bg-primary-surface border border-blue-200 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
              {/* Detective icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 1.95.8 3.71 2.08 5H4v2h16v-2h-3.08c1.28-1.29 2.08-3.05 2.08-5 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.25-.46 2.39-1.22 3.28l-.78.91V14H9v-.81l-.78-.91C7.46 11.39 7 10.25 7 9c0-2.76 2.24-5 5-5zM2 18h20v2H2z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-navy-900 tracking-tight group-hover:text-primary transition-colors">
                AI Mystery Room
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-secondary">
                Think • Investigate • Solve
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link 
              to="/" 
              className={`transition-colors ${isHome ? 'text-primary font-semibold' : 'text-secondary hover:text-navy-900'}`}
            >
              Home
            </Link>
            <a 
              href="/#how-it-works" 
              className="text-secondary hover:text-navy-900 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="/#features" 
              className="text-secondary hover:text-navy-900 transition-colors"
            >
              About
            </a>
          </nav>

          {/* Right Action & Avatar */}
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/create">
              <Button size="sm" variant="primary" icon={Sparkles}>
                Start a Mystery
              </Button>
            </Link>
            {/* User Avatar Placeholder */}
            <div 
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer hover:border-slate-300"
              title="Guest Investigator"
            >
              <User className="w-4 h-4" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/create">
              <Button size="sm" variant="primary">
                Start
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-secondary hover:text-navy-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-navy-900 hover:bg-slate-50"
          >
            Home
          </Link>
          <a 
            href="/#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-secondary hover:bg-slate-50 hover:text-navy-900"
          >
            How It Works
          </a>
          <a 
            href="/#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-secondary hover:bg-slate-50 hover:text-navy-900"
          >
            About
          </a>
          <div className="pt-2">
            <Link to="/create" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button fullWidth variant="primary" icon={Sparkles}>
                Start a Mystery
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

