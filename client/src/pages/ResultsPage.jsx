import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  XCircle,
  RotateCcw,
  Home,
  User,
  BookOpen,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ScoreBreakdown from '../components/mystery/ScoreBreakdown';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorPanel from '../components/common/ErrorPanel';
import { getCaseResult } from '../api/cases.api';

export default function ResultsPage() {
  const { caseId } = useParams();

  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStillActive, setIsStillActive] = useState(false);

  const fetchResult = async () => {
    setIsLoading(true);
    setError(null);
    setIsStillActive(false);
    try {
      const data = await getCaseResult(caseId);
      setResultData(data);
    } catch (err) {
      if (err.status === 409) {
        setIsStillActive(true);
      } else {
        setError(err.message || 'Unable to retrieve case results.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [caseId]);

  if (isLoading) {
    return (
      <div className="py-16 max-w-lg mx-auto">
        <LoadingSpinner
          title="Tallying final score..."
          subtitle="Verifying evidence, alibis, and authoritative verdict..."
        />
      </div>
    );
  }

  // Active case guard (SPEC.md Section 15.7)
  if (isStillActive) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-6">
        <Card className="p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-primary flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Investigation Still Active</h2>
          <p className="text-sm text-secondary leading-relaxed">
            The verdict and solution are locked until an accusation is submitted. Return to the
            investigation room to examine evidence and make your accusation.
          </p>
          <div className="pt-2">
            <Link to={`/case/${caseId}`}>
              <Button variant="primary" fullWidth icon={ArrowLeft}>
                Return to Investigation Room
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <ErrorPanel
          title="Unable to Load Verdict"
          message={error || 'The results for this case could not be retrieved.'}
          onRetry={fetchResult}
          retryLabel="Retry"
        />
        <div className="text-center mt-4">
          <Link to="/">
            <Button variant="ghost" size="sm" icon={Home}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { isCorrect, culprit, accusedSuspect, explanation, scoreBreakdown, score } = resultData;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Banner Card */}
      <Card className="p-8 sm:p-10 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-50/50 -z-0" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-50/50 -z-0" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Trophy / Verdict Icon */}
          <div className="mb-4">
            {isCorrect ? (
              <div className="w-20 h-20 rounded-3xl bg-amber-100/90 text-amber-600 flex items-center justify-center shadow-md animate-bounce-short">
                <Trophy className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-md">
                <XCircle className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mb-2">
            {isCorrect ? 'Case Solved!' : 'Accusation Inaccurate'}
          </h1>
          <p className="text-sm sm:text-base text-secondary max-w-md">
            {isCorrect
              ? 'You correctly identified the culprit!'
              : 'Your accusation did not match the forensic evidence. The actual culprit escaped suspicion.'}
          </p>
        </div>
      </Card>

      {/* Culprit & Score Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Culprit Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-secondary tracking-wider uppercase block mb-3">
              The Culprit
            </span>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-slate-400 flex-shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">{culprit?.name || 'Unknown'}</h3>
                <p className="text-sm font-semibold text-primary">{culprit?.role || 'Suspect'}</p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    True Perpetrator
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-secondary">
            {accusedSuspect && (
              <p>
                Your Accusation:{' '}
                <strong className="text-navy-900">{accusedSuspect.name}</strong> ({accusedSuspect.role})
              </p>
            )}
          </div>
        </Card>

        {/* Score Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-secondary tracking-wider uppercase">
                Your Score
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-primary">
                Official Verdict
              </span>
            </div>

            <ScoreBreakdown
              basePoints={scoreBreakdown?.basePoints ?? 0}
              cluesFoundCount={scoreBreakdown?.cluesDiscovered ?? 0}
              cluePoints={scoreBreakdown?.cluePoints ?? 0}
              hintsUsedCount={scoreBreakdown?.hintsUsed ?? 0}
              hintPenalty={scoreBreakdown?.hintPenalty ?? 0}
              finalScore={scoreBreakdown?.finalScore ?? score ?? 0}
            />
          </div>
        </Card>
      </div>

      {/* Case Explanation Card */}
      <Card className="p-6 sm:p-8 space-y-3">
        <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Case Explanation
        </h3>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">{explanation}</p>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link to="/create" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" fullWidth icon={RotateCcw}>
            Play Again
          </Button>
        </Link>
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" fullWidth icon={Home}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
