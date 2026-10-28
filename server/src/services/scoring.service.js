import { DIFFICULTY_SPECS } from '../validators/ai.schemas.js';

/**
 * Scoring Service for AI Mystery Room
 * Authoritative backend calculations according to SPEC.md Section 13.2:
 *
 * basePoints =
 *   - Difficulty base points if the accusation is correct (Easy: 100, Medium: 150, Hard: 200).
 *   - 0 if the accusation is incorrect.
 *
 * cluePoints = number of unique discovered clues * 5
 * hintPenalty = number of hints used * 10
 * finalScore = Math.max(0, basePoints + cluePoints - hintPenalty)
 */

export function calculateScoreBreakdown({
  difficulty = 'medium',
  isCorrect = false,
  discoveredCluesCount = 0,
  hintsUsedCount = 0,
}) {
  const spec = DIFFICULTY_SPECS[difficulty] || DIFFICULTY_SPECS.medium;

  const basePoints = isCorrect ? spec.basePoints : 0;
  const cluePoints = Math.max(0, discoveredCluesCount) * 5;
  const hintPenalty = Math.max(0, hintsUsedCount) * 10;
  const rawScore = basePoints + cluePoints - hintPenalty;
  const finalScore = Math.max(0, rawScore);

  return {
    difficulty,
    isCorrect,
    basePoints,
    cluesDiscovered: discoveredCluesCount,
    cluePoints,
    hintsUsed: hintsUsedCount,
    hintPenalty,
    finalScore,
  };
}

