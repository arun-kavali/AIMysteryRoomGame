import React from 'react';

export default function ScoreBreakdown({
  basePoints = 0,
  cluesFoundCount = 0,
  cluePoints = 0,
  hintsUsedCount = 0,
  hintPenalty = 0,
  finalScore = 0
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">
        <span className="text-secondary font-medium">Base Points</span>
        <span className="font-bold text-navy-900">{basePoints}</span>
      </div>

      <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">
        <span className="text-secondary font-medium">
          Clues Found ({cluesFoundCount} × 5)
        </span>
        <span className="font-bold text-emerald-600">+{cluePoints}</span>
      </div>

      <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">
        <span className="text-secondary font-medium">
          Hints Used ({hintsUsedCount} × 10)
        </span>
        <span className="font-bold text-rose-600">-{hintPenalty}</span>
      </div>

      <div className="flex items-center justify-between text-base pt-2 font-extrabold">
        <span className="text-navy-900">Final Score</span>
        <span className="text-primary text-xl">{finalScore}</span>
      </div>
    </div>
  );
}

