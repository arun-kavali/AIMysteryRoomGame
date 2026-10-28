import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  FileSearch,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Search,
  RotateCcw,
} from 'lucide-react';
import SuspectCard from '../components/mystery/SuspectCard';
import ClueCard from '../components/mystery/ClueCard';
import HintCard from '../components/mystery/HintCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorPanel from '../components/common/ErrorPanel';
import { getCaseById, discoverClue, requestHint } from '../api/cases.api';
import { DIFFICULTY_PRESETS } from '../constants/difficulty';

export default function InvestigationPage() {
  const { caseId } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('suspects'); // 'suspects' | 'clues' | 'hints'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discoverLoadingId, setDiscoverLoadingId] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchCase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCaseById(caseId);
      setCaseData(data);
    } catch (err) {
      setError(err.message || 'Unable to retrieve case file from the investigation server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const handleDiscoverClue = async (clueId) => {
    setDiscoverLoadingId(clueId);
    setActionMessage(null);
    try {
      const response = await discoverClue(caseId, clueId);

      // Update caseData state with authoritative backend response
      setCaseData((prev) => {
        if (!prev) return prev;
        const updatedClues = prev.clues.map((c) => {
          if (c.id === clueId) {
            return {
              ...c,
              discovered: true,
              description: response.clue.description,
              relevance: response.clue.relevance,
            };
          }
          return c;
        });

        return {
          ...prev,
          clues: updatedClues,
          discoveredClueIds: Array.from(new Set([...prev.discoveredClueIds, clueId])),
          cluesProgress: {
            discovered: response.progress.discoveredCount,
            total: response.progress.totalClues,
          },
        };
      });

      if (response.pointsEarned > 0) {
        setActionMessage({
          type: 'success',
          text: `Evidence examined! +${response.pointsEarned} investigation points awarded.`,
        });
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to examine clue.',
      });
    } finally {
      setDiscoverLoadingId(null);
    }
  };

  const handleUnlockHint = async () => {
    setHintLoading(true);
    setActionMessage(null);
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

      setActionMessage({
        type: 'warning',
        text: `Hint revealed. 10 point penalty incurred on final scoring tally.`,
      });
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to unlock hint.',
      });
    } finally {
      setHintLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 max-w-lg mx-auto">
        <LoadingSpinner
          title="Loading investigation case..."
          subtitle="Connecting to the case database and retrieving forensic docket..."
        />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <ErrorPanel
          title="Case Not Found or Inaccessible"
          message={error || 'The requested case could not be loaded.'}
          onRetry={fetchCase}
          retryLabel="Retry Connection"
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

  const { title, difficulty, story, suspects = [], clues = [], hints = [], status } = caseData;
  const isCompleted = status === 'completed';

  const discoveredCluesCount = caseData.cluesProgress?.discovered ?? clues.filter((c) => c.discovered).length;
  const totalCluesCount = caseData.cluesProgress?.total ?? clues.length;
  const hintsUsedCount = caseData.hintsProgress?.used ?? hints.filter((h) => h.unlocked).length;
  const totalHintsCount = caseData.hintsProgress?.total ?? DIFFICULTY_PRESETS[difficulty]?.hintCount ?? 3;

  // Real-time investigative points estimate
  const currentInvestigativeScore = Math.max(0, discoveredCluesCount * 5 - hintsUsedCount * 10);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-secondary hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {isCompleted ? (
          <Link to={`/case/${caseId}/result`}>
            <Button size="sm" variant="primary" icon={Trophy}>
              View Case Results
            </Button>
          </Link>
        ) : (
          <Link to={`/case/${caseId}/accuse`}>
            <Button size="sm" variant="danger" icon={AlertTriangle}>
              Accuse a Suspect
            </Button>
          </Link>
        )}
      </div>

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : actionMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Case Header Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Story */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-primary-surface flex items-center justify-center text-primary flex-shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                {title}
              </h1>
              <Badge variant={difficulty} size="md">
                {difficulty?.toUpperCase()}
              </Badge>
              {isCompleted && (
                <Badge variant="success" size="md" icon={CheckCircle2}>
                  Case Solved
                </Badge>
              )}
            </div>

            <p className="text-sm text-secondary leading-relaxed max-w-3xl">
              {story}
            </p>
          </div>

          {/* Right Progress Summary Widget */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 min-w-[220px]">
            <div className="text-left lg:text-right">
              <div className="text-xs font-semibold text-secondary">Progress</div>
              <div className="text-sm font-bold text-primary">
                {discoveredCluesCount}/{totalCluesCount} clues found
              </div>
              <div className="text-xs text-secondary mt-0.5">
                {hintsUsedCount}/{totalHintsCount} hints used
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                Investigation Points
              </div>
              <div className="text-xl sm:text-2xl font-black text-navy-900">
                {currentInvestigativeScore}
              </div>
            </div>
          </div>
        </div>

        {/* Clue Progress bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <ProgressBar
            value={discoveredCluesCount}
            max={totalCluesCount}
            label="Case Evidence Discovery"
            sublabel="Uncover all clues to strengthen your deduction before making the accusation."
            color="primary"
          />
        </div>
      </Card>

      {/* Case Completed Alert Banner */}
      {isCompleted && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-navy-900">This investigation has concluded.</p>
              <p className="text-xs text-secondary">
                The accusation was submitted and the official verdict is locked.
              </p>
            </div>
          </div>
          <Link to={`/case/${caseId}/result`}>
            <Button size="sm" variant="primary">
              View Results
            </Button>
          </Link>
        </div>
      )}

      {/* Investigation Navigation Tabs matching Image */}
      <div className="border-b border-border flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setActiveTab('suspects')}
          className={`
            pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all
            ${
              activeTab === 'suspects'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-navy-900'
            }
          `}
        >
          <Users className="w-4 h-4" />
          <span>Suspects</span>
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-100 text-secondary">
            {suspects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('clues')}
          className={`
            pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all
            ${
              activeTab === 'clues'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-navy-900'
            }
          `}
        >
          <FileSearch className="w-4 h-4" />
          <span>Clues</span>
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-primary">
            {discoveredCluesCount}/{totalCluesCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hints')}
          className={`
            pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all
            ${
              activeTab === 'hints'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-navy-900'
            }
          `}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Hints</span>
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
            {hintsUsedCount}/{totalHintsCount}
          </span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'suspects' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">
              Persons of Interest ({suspects.length})
            </h2>
            <span className="text-xs text-secondary">
              Review occupations, verified motives, and stated alibis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {suspects.map((suspect) => (
              <SuspectCard key={suspect.id} suspect={suspect} showActions={true} />
            ))}
          </div>
        </section>
      )}

      {activeTab === 'clues' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">
              Evidence & Crime Scene Clues ({discoveredCluesCount}/{totalCluesCount} Discovered)
            </h2>
            <span className="text-xs text-secondary">
              Discover each piece of evidence to earn +5 points
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {clues.map((clue) => (
              <ClueCard
                key={clue.id}
                clue={clue}
                caseId={caseId}
                onDiscover={handleDiscoverClue}
                isDiscovering={discoverLoadingId === clue.id}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === 'hints' && (
        <section className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Investigative Guidance ({hintsUsedCount}/{totalHintsCount} Used)
              </h2>
              <p className="text-xs text-secondary">
                Each hint provides guidance without directly giving away the solution (-10 pts).
              </p>
            </div>
            <Link to={`/case/${caseId}/hints`}>
              <Button size="sm" variant="outline">
                Open Full Hints View
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {/* Display revealed hints + 1 next available hint slot if remaining */}
            {hints.map((hint, idx) => (
              <HintCard
                key={hint.id || idx}
                hint={hint}
                index={idx}
                isNextToUnlock={false}
                disabled={isCompleted}
              />
            ))}

            {hintsUsedCount < totalHintsCount && !isCompleted && (
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">
                      Hint {hintsUsedCount + 1} Available
                    </h4>
                    <p className="text-xs text-amber-800">
                      Reveals an investigation hint. Incurs a 10-point scoring deduction.
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUnlockHint}
                  isLoading={hintLoading}
                >
                  Unlock Hint
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Investigation Footer Call-to-action */}
      {!isCompleted && (
        <div className="p-6 rounded-card bg-gradient-to-r from-navy-900 to-navy-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-base font-bold text-white mb-0.5">Ready to name the culprit?</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Once you make an accusation, the investigation ends and the verdict is revealed.
            </p>
          </div>
          <Link to={`/case/${caseId}/accuse`} className="w-full sm:w-auto">
            <Button
              size="md"
              variant="primary"
              icon={AlertTriangle}
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              Make Accusation
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
