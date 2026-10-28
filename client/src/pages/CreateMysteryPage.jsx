import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';
import DifficultyCard from '../components/mystery/DifficultyCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorPanel from '../components/common/ErrorPanel';
import { DIFFICULTY_PRESETS } from '../constants/difficulty';
import { createCase } from '../api/cases.api';

export default function CreateMysteryPage() {
  const navigate = useNavigate();

  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const maxPremiseLength = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (premise.length > maxPremiseLength) {
      setError(`Premise must be under ${maxPremiseLength} characters.`);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Real API call to Express backend
      const newCase = await createCase({
        premise: premise.trim(),
        difficulty,
      });

      const caseId = newCase.id || newCase._id;
      navigate(`/case/${caseId}`);
    } catch (err) {
      setIsLoading(false);
      setError(
        err.message || "We couldn't generate a valid mystery right now. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <LoadingSpinner
          title="Generating your mystery..."
          subtitle="Gemini is crafting suspects, planting evidence, and engineering the investigation case..."
        />
      </div>
    );
  }

  const selectedConfig = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medium;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-secondary hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
          Create a New Mystery
        </h1>
        <p className="text-sm sm:text-base text-secondary">
          Tell us a scenario or leave it empty, and let AI craft a unique investigation for you.
        </p>
      </div>

      {/* Error state if generation failed */}
      {error && (
        <ErrorPanel
          title="Mystery Creation Failed"
          message={error}
          onRetry={() => setError(null)}
          retryLabel="Dismiss & Edit Form"
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Premise Input Card */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card space-y-3">
          <label
            htmlFor="premise"
            className="block text-sm font-bold text-navy-900"
          >
            Enter your mystery premise <span className="font-normal text-secondary">(optional)</span>
          </label>

          <div className="relative">
            <textarea
              id="premise"
              rows={4}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              maxLength={maxPremiseLength}
              placeholder="Example: A priceless diamond was stolen from a locked museum during a storm. Four people had access to the museum..."
              className="w-full p-4 rounded-input border border-border text-sm text-body placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-secondary">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Leave blank to generate an original fictional scenario
            </span>
            <span className={premise.length > maxPremiseLength * 0.9 ? 'text-danger font-semibold' : ''}>
              {premise.length}/{maxPremiseLength}
            </span>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">
              Select Difficulty Level
            </h2>
            <span className="text-xs text-secondary">
              Selected: <strong className="text-primary capitalize">{difficulty}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DifficultyCard
              difficultyKey="easy"
              title="Easy"
              suspectCount={DIFFICULTY_PRESETS.easy.suspectCount}
              clueCount={DIFFICULTY_PRESETS.easy.clueCount}
              hintCount={DIFFICULTY_PRESETS.easy.hintCount}
              points={DIFFICULTY_PRESETS.easy.basePoints}
              accentColor="emerald"
              isSelected={difficulty === 'easy'}
              onClick={() => setDifficulty('easy')}
            />

            <DifficultyCard
              difficultyKey="medium"
              title="Medium"
              suspectCount={DIFFICULTY_PRESETS.medium.suspectCount}
              clueCount={DIFFICULTY_PRESETS.medium.clueCount}
              hintCount={DIFFICULTY_PRESETS.medium.hintCount}
              points={DIFFICULTY_PRESETS.medium.basePoints}
              accentColor="blue"
              isSelected={difficulty === 'medium'}
              onClick={() => setDifficulty('medium')}
            />

            <DifficultyCard
              difficultyKey="hard"
              title="Hard"
              suspectCount={DIFFICULTY_PRESETS.hard.suspectCount}
              clueCount={DIFFICULTY_PRESETS.hard.clueCount}
              hintCount={DIFFICULTY_PRESETS.hard.hintCount}
              points={DIFFICULTY_PRESETS.hard.basePoints}
              accentColor="purple"
              isSelected={difficulty === 'hard'}
              onClick={() => setDifficulty('hard')}
            />
          </div>

          {/* Difficulty summary callout */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-secondary leading-relaxed">
              <strong className="text-navy-900">{selectedConfig.name} Mode: </strong>
              {selectedConfig.description} Correct accusations reward {selectedConfig.basePoints} base points.
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon={Sparkles}
            disabled={isLoading}
            className="shadow-md hover:shadow-lg transition-shadow py-3.5"
          >
            Generate Mystery
          </Button>
          <p className="text-center text-xs text-secondary mt-2.5">
            Communicates securely with the backend API and initiates your case file.
          </p>
        </div>
      </form>
    </div>
  );
}
