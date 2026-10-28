import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function NotFoundPage() {
  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto text-center space-y-6">
      <Card className="p-8 sm:p-10 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-primary flex items-center justify-center mx-auto shadow-sm">
          <SearchX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Case File Not Found
          </h1>
          <p className="text-sm text-secondary leading-relaxed">
            The clue or investigation page you are looking for does not exist or has been archived.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full">
            <Button variant="primary" size="md" fullWidth icon={Home}>
              Return to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

