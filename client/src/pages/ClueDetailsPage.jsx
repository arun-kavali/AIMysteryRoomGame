import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Tag,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorPanel from '../components/common/ErrorPanel';
import { getCaseById, discoverClue } from '../api/cases.api';

export default function ClueDetailsPage() {
  const { caseId, clueId } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [clue, setClue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchClueData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCaseById(caseId);
      setCaseData(data);
      const foundClue = data.clues?.find((c) => c.id === clueId);
      if (!foundClue) {
        setError(`Clue '${clueId}' does not belong to this case.`);
      } else {
        setClue(foundClue);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve clue details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClueData();
  }, [caseId, clueId]);

  const handleMarkAsFound = async () => {
    if (!clue || clue.discovered) return;
    setIsDiscovering(true);
    setFeedback(null);
    try {
      const response = await discoverClue(caseId, clue.id);
      setClue((prev) => ({
        ...prev,
        discovered: true,
        description: response.clue.description,
        relevance: response.clue.relevance,
      }));
      setFeedback({
        type: 'success',
        message: `Clue marked as examined! +${response.pointsEarned} points added.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to examine clue.',
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 max-w-lg mx-auto">
        <LoadingSpinner
          title="Examining evidence file..."
          subtitle="Loading forensic photos and field descriptions..."
        />
      </div>
    );
  }

  if (error || !clue) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <ErrorPanel
          title="Evidence Not Found"
          message={error || 'The requested clue could not be found in this case docket.'}
          onRetry={fetchClueData}
          retryLabel="Retry"
        />
        <div className="text-center mt-4">
          <Link to={`/case/${caseId}`}>
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Investigation
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const clueIndex = caseData.clues.findIndex((c) => c.id === clue.id) + 1;
  const totalClues = caseData.clues.length;

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

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-900">Clue Details</h1>
        <Badge variant={clue.discovered ? 'success' : 'default'} size="md">
          {clue.discovered ? 'Discovered' : 'Undiscovered'}
        </Badge>
      </div>

      {/* Action Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Main Clue Card */}
      <Card className="overflow-hidden">
        {/* Evidence Photo banner */}
        <div className="w-full h-48 sm:h-64 bg-slate-100 overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&q=80&w=800"
            alt={clue.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white text-xs font-semibold px-2.5 py-1 rounded-md bg-navy-900/80 backdrop-blur-xs">
            Forensic Evidence Docket #{clueIndex}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-primary tracking-wide uppercase">
                Clue {clueIndex} of {totalClues}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">{clue.title}</h2>
          </div>

          {/* Description */}
          <div className="text-sm sm:text-base text-secondary leading-relaxed space-y-4">
            {clue.discovered ? (
              <>
                <p>{clue.description}</p>
                {clue.relevance && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-secondary leading-relaxed">
                    <strong className="text-navy-900">Investigative Relevance: </strong>
                    {clue.relevance}
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                <p className="font-semibold text-navy-900">Evidence Not Yet Examined</p>
                <p className="text-xs text-secondary">
                  Click 'Mark as Found' to examine the forensic details and earn +5 investigation points.
                </p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="lg">
                +5 points
              </Badge>
              {clue.discovered && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Score added to tally
                </span>
              )}
            </div>

            {!clue.discovered && caseData.status === 'active' ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleMarkAsFound}
                isLoading={isDiscovering}
                icon={Sparkles}
              >
                Mark as Found
              </Button>
            ) : (
              <Badge variant="primary" size="md">
                Evidence Examined
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Clue Information Card */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-3">
          Clue Information
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-50 gap-1">
            <span className="text-secondary font-medium flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              Evidence Status
            </span>
            <span className="font-semibold text-navy-900">
              {clue.discovered ? 'Forensically Logged' : 'Awaiting Examination'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-50 gap-1">
            <span className="text-secondary font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Location
            </span>
            <span className="font-semibold text-navy-900">Crime Scene Perimeter</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 gap-2">
            <span className="text-secondary font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Suspect Connection
            </span>
            <span className="text-xs text-secondary">
              Review suspect alibis and motives in the main investigation room.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
