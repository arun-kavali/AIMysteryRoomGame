import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Send, HelpCircle } from 'lucide-react';
import Button from '../components/common/Button';
import SuspectCard from '../components/mystery/SuspectCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorPanel from '../components/common/ErrorPanel';
import { getCaseById, submitAccusation } from '../api/cases.api';

export default function AccusationPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState(null);
  const [reasoning, setReasoning] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const maxReasoningLength = 200;

  const fetchCase = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getCaseById(caseId);
      setCaseData(data);

      if (data.status === 'completed') {
        navigate(`/case/${caseId}/result`, { replace: true });
      }
    } catch (err) {
      setFetchError(err.message || 'Unable to load case file for accusation.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!selectedSuspectId) {
      setValidationError('Please select the suspect you believe committed the crime.');
      return;
    }
    if (reasoning.length > maxReasoningLength) {
      setValidationError(`Reasoning cannot exceed ${maxReasoningLength} characters.`);
      return;
    }
    setValidationError('');
    setShowConfirmModal(true);
  };

  const handleConfirmAccusation = async () => {
    setIsSubmitting(true);
    try {
      // Connect to real backend API: POST /api/cases/:id/accuse
      await submitAccusation(caseId, {
        suspectId: selectedSuspectId,
        reasoning: reasoning.trim(),
      });

      setShowConfirmModal(false);
      navigate(`/case/${caseId}/result`);
    } catch (err) {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setValidationError(err.message || 'Failed to submit accusation. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 max-w-lg mx-auto">
        <LoadingSpinner
          title="Loading suspects docket..."
          subtitle="Preparing forensic accusation dossier..."
        />
      </div>
    );
  }

  if (fetchError || !caseData) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <ErrorPanel
          title="Case Not Found"
          message={fetchError || 'Unable to open accusation docket for this case.'}
          onRetry={fetchCase}
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

  const { suspects = [] } = caseData;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
          Make Your Accusation
        </h1>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          Choose the suspect you believe is the culprit. Once you submit, you won't be able to change
          your answer.
        </p>
      </div>

      {/* Validation warning */}
      {validationError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Suspect Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-navy-900">Select Culprit</label>
          <span className="text-xs text-secondary">
            {selectedSuspectId ? '1 suspect selected' : 'Click to select suspect'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suspects.map((suspect) => (
            <SuspectCard
              key={suspect.id}
              suspect={suspect}
              isSelectable={true}
              isSelected={selectedSuspectId === suspect.id}
              onSelect={() => {
                setSelectedSuspectId(suspect.id);
                setValidationError('');
              }}
              showActions={false}
            />
          ))}
        </div>
      </div>

      {/* Optional Reasoning */}
      <div className="bg-white rounded-card border border-border p-6 shadow-card space-y-3">
        <label htmlFor="reasoning" className="block text-sm font-bold text-navy-900">
          Your Reason <span className="font-normal text-secondary">(optional)</span>
        </label>

        <textarea
          id="reasoning"
          rows={3}
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          maxLength={maxReasoningLength}
          placeholder="Why do you think this person is the culprit? (optional)"
          className="w-full p-4 rounded-input border border-border text-sm text-body placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
        />

        <div className="flex items-center justify-between text-xs text-secondary">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Max 200 characters per investigation docket
          </span>
          <span
            className={
              reasoning.length > maxReasoningLength * 0.9 ? 'text-danger font-semibold' : ''
            }
          >
            {reasoning.length}/{maxReasoningLength}
          </span>
        </div>
      </div>

      {/* Submit Action */}
      <div className="space-y-4 pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handlePreSubmit}
          disabled={!selectedSuspectId || isSubmitting}
          icon={Send}
          className="py-3.5 shadow-md"
        >
          Submit Accusation
        </Button>

        <div className="text-center">
          <Link to={`/case/${caseId}`}>
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Investigation
            </Button>
          </Link>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        title="Confirm Accusation"
        message="Are you sure you want to submit your accusation? This will end your investigation and reveal the solution."
        confirmLabel="Confirm Accusation"
        cancelLabel="Continue Investigating"
        onConfirm={handleConfirmAccusation}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
}
