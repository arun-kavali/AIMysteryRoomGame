import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import HintCard from '../components/mystery/HintCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorPanel from '../components/common/ErrorPanel';
import { getCaseById, requestHint } from '../api/cases.api';
import { DIFFICULTY_PRESETS } from '../constants/difficulty';

export default function HintsPage() {
  const { caseId } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchHints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCaseById(caseId);
      setCaseData(data);
    } catch (err) {
      setError(err.message || 'Unable to load hints from the case file.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHints();
  }, [caseId]);

  const handleUnlockHint = async () => {
    setIsUnlocking(true);
    setActionFeedback(null);
    try {
      const response = await requestHint(caseId);
      setCaseData((prev) => {
        if (!prev) return prev;
        const exists = prev.hints.some((h) => h.id === response.hint.id);
        const updatedHints = exists
          ? prev.hints
          : [...prev.hints, { ...response.hint, unlocked: true }];
        return {
          ...prev,
          hints: updatedHints,
          hintsProgress: response.hintsProgress,
        };
      });

      setActionFeedback({
        type: 'warning',
        text: `Hint revealed! -10 score penalty recorded for this case.`,
      });
    } catch (err) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Failed to reveal hint.',
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 max-w-lg mx-auto">
        <LoadingSpinner
          title="Loading investigation hints..."
          subtitle="Consulting case notes and verified clues..."
        />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <ErrorPanel
          title="Case Not Found"
          message={error || 'Could not load hints for this investigation.'}
          onRetry={fetchHints}
          retryLabel="Retry"
        />
        <div className="text-center mt-4">
          <Link to="/">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { hints = [], status, difficulty } = caseData;
  const isCompleted = status === 'completed';

  const usedCount = caseData.hintsProgress?.used ?? hints.filter((h) => h.unlocked).length;
  const totalHints = caseData.hintsProgress?.total ?? DIFFICULTY_PRESETS[difficulty]?.hintCount ?? 3;
  const remainingCount = Math.max(0, totalHints - usedCount);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          to={`/case/${caseId}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-secondary hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Investigation
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">Need a Hint?</h1>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          Use a hint when you're stuck. Each hint gives you a small nudge in the right direction{' '}
          <span className="font-semibold text-rose-600">(costs 10 score points)</span>.
        </p>
      </div>

      {/* Warning Box */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Strategic Warning:</strong> Every unlocked hint automatically reduces your final
          investigation score by 10 points upon submitting your accusation.
        </div>
      </div>

      {/* Action feedback */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium ${
            actionFeedback.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {actionFeedback.text}
        </div>
      )}

      {/* Main Card with Hints */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-navy-900">Available Hints</h2>
          </div>
          <span className="text-sm font-bold text-primary">
            {remainingCount} / {totalHints} remaining
          </span>
        </div>

        <div className="space-y-4">
          {hints.map((hint, idx) => (
            <HintCard
              key={hint.id || idx}
              hint={hint}
              index={idx}
              isNextToUnlock={false}
              disabled={isCompleted}
            />
          ))}

          {remainingCount > 0 && !isCompleted ? (
            <div className="p-5 rounded-card bg-amber-50/40 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900">
                    Hint {usedCount + 1} Ready to Reveal
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Unlocks investigative advice without naming the culprit. Costs 10 points.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUnlockHint}
                isLoading={isUnlocking}
                icon={Sparkles}
              >
                Use Hint
              </Button>
            </div>
          ) : isCompleted ? (
            <p className="text-xs text-secondary text-center italic py-2">
              Case completed. Hint requests are closed.
            </p>
          ) : (
            <p className="text-xs text-secondary text-center italic py-2">
              All available hints for this case have been revealed.
            </p>
          )}
        </div>
      </Card>

      {/* Bottom Back Button */}
      <div className="pt-2">
        <Link to={`/case/${caseId}`}>
          <Button variant="secondary" icon={ArrowLeft}>
            Back to Investigation
          </Button>
        </Link>
      </div>
    </div>
  );
}
