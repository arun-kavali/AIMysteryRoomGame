import mongoose from 'mongoose';
import Case from '../models/Case.js';
import { generateMysteryWithGemini } from './gemini.service.js';
import { calculateScoreBreakdown } from './scoring.service.js';
import { sanitizeCaseForPlayer } from '../utils/public-case.js';
import { HttpError } from '../utils/http-error.js';

function ensureDatabaseReady() {
  if (mongoose.connection.readyState !== 1) {
    throw new HttpError(
      503,
      'Database service is currently unavailable.',
      'DATABASE_UNAVAILABLE'
    );
  }
}

function ensureValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'Invalid Case ID format', 'INVALID_CASE_ID');
  }
}

/**
 * Creates a new case via Gemini and saves to MongoDB.
 */
export async function createCase({ premise = '', difficulty = 'medium' }) {
  const generated = await generateMysteryWithGemini({ premise, difficulty });
  ensureDatabaseReady();

  const newCase = new Case({
    premise,
    title: generated.title,
    story: generated.story,
    difficulty,
    suspects: generated.suspects,
    clues: generated.clues,
    hints: generated.hints,
    solution: generated.solution,
    status: 'active',
    discoveredClueIds: [],
    usedHintCount: 0,
  });

  const saved = await newCase.save();
  return sanitizeCaseForPlayer(saved);
}

/**
 * Retrieves public case data and player progress.
 */
export async function getCaseById(caseId) {
  ensureValidObjectId(caseId);
  ensureDatabaseReady();

  const found = await Case.findById(caseId);
  if (!found) {
    throw new HttpError(404, `Case with ID ${caseId} was not found`, 'CASE_NOT_FOUND');
  }

  return sanitizeCaseForPlayer(found);
}

/**
 * Discovers a clue for an active case.
 * Prevents duplicate discovery points and rejects completed cases.
 */
export async function discoverClue(caseId, clueId) {
  ensureValidObjectId(caseId);
  ensureDatabaseReady();

  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) {
    throw new HttpError(404, `Case with ID ${caseId} was not found`, 'CASE_NOT_FOUND');
  }

  if (caseDoc.status === 'completed') {
    throw new HttpError(
      409,
      'Cannot discover clues on an already completed case.',
      'CASE_ALREADY_COMPLETED'
    );
  }

  const targetClue = caseDoc.clues.find((c) => c.id === clueId);
  if (!targetClue) {
    throw new HttpError(
      404,
      `Clue '${clueId}' does not belong to this case.`,
      'CLUE_NOT_FOUND'
    );
  }

  const alreadyDiscovered = caseDoc.discoveredClueIds.includes(clueId);

  if (!alreadyDiscovered) {
    caseDoc.discoveredClueIds.push(clueId);
    await caseDoc.save();
  }

  return {
    clue: {
      id: targetClue.id,
      title: targetClue.title,
      description: targetClue.description,
      relevance: targetClue.relevance,
      alreadyDiscovered,
    },
    pointsEarned: alreadyDiscovered ? 0 : 5,
    progress: {
      discoveredCount: caseDoc.discoveredClueIds.length,
      totalClues: caseDoc.clues.length,
    },
  };
}

/**
 * Reveals the next available hint for an active case.
 * Enforces difficulty hint allowance and prevents repeat consumption.
 */
export async function useHint(caseId) {
  ensureValidObjectId(caseId);
  ensureDatabaseReady();

  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) {
    throw new HttpError(404, `Case with ID ${caseId} was not found`, 'CASE_NOT_FOUND');
  }

  if (caseDoc.status === 'completed') {
    throw new HttpError(
      409,
      'Cannot request hints on an already completed case.',
      'CASE_ALREADY_COMPLETED'
    );
  }

  const totalHints = caseDoc.hints.length;
  if (caseDoc.usedHintCount >= totalHints) {
    throw new HttpError(
      409,
      'All available hints for this case have already been revealed.',
      'NO_HINTS_REMAINING'
    );
  }

  const nextHintIndex = caseDoc.usedHintCount;
  const hintText = caseDoc.hints[nextHintIndex];

  // Atomically advance used hint counter
  caseDoc.usedHintCount += 1;
  await caseDoc.save();

  return {
    hint: {
      id: `hint_${nextHintIndex + 1}`,
      number: nextHintIndex + 1,
      text: hintText,
    },
    hintsProgress: {
      used: caseDoc.usedHintCount,
      total: totalHints,
      remaining: totalHints - caseDoc.usedHintCount,
    },
    penaltyIncurred: 10,
    totalHintPenalty: caseDoc.usedHintCount * 10,
  };
}

/**
 * Submits player accusation, calculates authoritative server-side score,
 * and marks the case completed.
 */
export async function submitAccusation(caseId, { suspectId, reasoning = '' }) {
  ensureValidObjectId(caseId);
  ensureDatabaseReady();

  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) {
    throw new HttpError(404, `Case with ID ${caseId} was not found`, 'CASE_NOT_FOUND');
  }

  if (caseDoc.status === 'completed') {
    throw new HttpError(
      409,
      'An accusation has already been submitted for this case. Completed cases cannot be altered.',
      'CASE_ALREADY_COMPLETED'
    );
  }

  const accusedSuspect = caseDoc.suspects.find((s) => s.id === suspectId);
  if (!accusedSuspect) {
    throw new HttpError(
      400,
      `Suspect '${suspectId}' does not belong to this case.`,
      'INVALID_SUSPECT'
    );
  }

  const isCorrect = suspectId === caseDoc.solution.culpritSuspectId;

  const scoreBreakdown = calculateScoreBreakdown({
    difficulty: caseDoc.difficulty,
    isCorrect,
    discoveredCluesCount: caseDoc.discoveredClueIds.length,
    hintsUsedCount: caseDoc.usedHintCount,
  });

  caseDoc.status = 'completed';
  caseDoc.accusedSuspectId = suspectId;
  caseDoc.accusationReasoning = reasoning.trim();
  caseDoc.isCorrect = isCorrect;
  caseDoc.score = scoreBreakdown.finalScore;
  caseDoc.completedAt = new Date();

  await caseDoc.save();

  const culpritSuspect = caseDoc.suspects.find(
    (s) => s.id === caseDoc.solution.culpritSuspectId
  );

  return {
    caseId: caseDoc._id.toString(),
    status: 'completed',
    isCorrect,
    accusedSuspect: {
      id: accusedSuspect.id,
      name: accusedSuspect.name,
      role: accusedSuspect.role,
    },
    culprit: {
      id: culpritSuspect?.id || caseDoc.solution.culpritSuspectId,
      name: culpritSuspect?.name || 'Unknown',
      role: culpritSuspect?.role || '',
    },
    explanation: caseDoc.solution.explanation,
    reasoningClueIds: caseDoc.solution.reasoningClueIds,
    score: scoreBreakdown.finalScore,
    scoreBreakdown,
    completedAt: caseDoc.completedAt,
  };
}

/**
 * Retrieves the final result for a completed case.
 * Rejects requests for active cases with 409 to prevent solution leakage.
 */
export async function getCaseResult(caseId) {
  ensureValidObjectId(caseId);
  ensureDatabaseReady();

  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) {
    throw new HttpError(404, `Case with ID ${caseId} was not found`, 'CASE_NOT_FOUND');
  }

  if (caseDoc.status !== 'completed') {
    throw new HttpError(
      409,
      'Case investigation is still active. Accuse a suspect to complete the case and view results.',
      'CASE_STILL_ACTIVE'
    );
  }

  const accusedSuspect = caseDoc.suspects.find((s) => s.id === caseDoc.accusedSuspectId);
  const culpritSuspect = caseDoc.suspects.find(
    (s) => s.id === caseDoc.solution.culpritSuspectId
  );

  const scoreBreakdown = calculateScoreBreakdown({
    difficulty: caseDoc.difficulty,
    isCorrect: caseDoc.isCorrect,
    discoveredCluesCount: caseDoc.discoveredClueIds.length,
    hintsUsedCount: caseDoc.usedHintCount,
  });

  return {
    caseId: caseDoc._id.toString(),
    status: 'completed',
    isCorrect: caseDoc.isCorrect,
    accusedSuspect: accusedSuspect
      ? { id: accusedSuspect.id, name: accusedSuspect.name, role: accusedSuspect.role }
      : null,
    accusationReasoning: caseDoc.accusationReasoning,
    culprit: {
      id: culpritSuspect?.id || caseDoc.solution.culpritSuspectId,
      name: culpritSuspect?.name || 'Unknown',
      role: culpritSuspect?.role || '',
    },
    explanation: caseDoc.solution.explanation,
    reasoningClueIds: caseDoc.solution.reasoningClueIds,
    score: caseDoc.score,
    scoreBreakdown,
    completedAt: caseDoc.completedAt,
  };
}
