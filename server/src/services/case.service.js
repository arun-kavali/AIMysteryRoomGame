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
      'Database service is currently unavailable. Operation could not be completed.',
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
 * Uses atomic conditional update to guarantee that concurrent discovery requests
 * cannot duplicate clue IDs or double-award points.
 */
export async function discoverClue(caseId, clueId) {
  ensureValidObjectId(caseId);
  ensureDatabaseReady();

  // Attempt atomic conditional insertion:
  // Must match active case, clue must exist in clues array, and clue must NOT already be in discoveredClueIds
  const updatedDoc = await Case.findOneAndUpdate(
    {
      _id: caseId,
      status: 'active',
      'clues.id': clueId,
      discoveredClueIds: { $ne: clueId },
    },
    {
      $addToSet: { discoveredClueIds: clueId },
    },
    { new: true }
  );

  // If successfully updated atomically, clue was newly discovered
  if (updatedDoc) {
    const targetClue = updatedDoc.clues.find((c) => c.id === clueId);
    return {
      clue: {
        id: targetClue.id,
        title: targetClue.title,
        description: targetClue.description,
        relevance: targetClue.relevance,
        alreadyDiscovered: false,
      },
      pointsEarned: 5,
      progress: {
        discoveredCount: updatedDoc.discoveredClueIds.length,
        totalClues: updatedDoc.clues.length,
      },
    };
  }

  // If atomic update did not match, inspect current case state to return exact, safe status
  const currentCase = await Case.findById(caseId);
  if (!currentCase) {
    throw new HttpError(404, `Case with ID ${caseId} was not found`, 'CASE_NOT_FOUND');
  }

  if (currentCase.status === 'completed') {
    throw new HttpError(
      409,
      'Cannot discover clues on an already completed case.',
      'CASE_ALREADY_COMPLETED'
    );
  }

  const targetClue = currentCase.clues.find((c) => c.id === clueId);
  if (!targetClue) {
    throw new HttpError(
      404,
      `Clue '${clueId}' does not belong to this case.`,
      'CLUE_NOT_FOUND'
    );
  }

  // If clue was already discovered (e.g. concurrent or duplicate request)
  return {
    clue: {
      id: targetClue.id,
      title: targetClue.title,
      description: targetClue.description,
      relevance: targetClue.relevance,
      alreadyDiscovered: true,
    },
    pointsEarned: 0,
    progress: {
      discoveredCount: currentCase.discoveredClueIds.length,
      totalClues: currentCase.clues.length,
    },
  };
}

/**
 * Reveals the next available hint for an active case.
 * Uses atomic conditional update ($expr $lt) to prevent concurrent requests
 * from exceeding the allowed hint allowance.
 */
export async function useHint(caseId) {
  ensureValidObjectId(caseId);
  ensureDatabaseReady();

  // Atomically increment usedHintCount only if case is active and usedHintCount < hints.length
  const updatedDoc = await Case.findOneAndUpdate(
    {
      _id: caseId,
      status: 'active',
      $expr: { $lt: ['$usedHintCount', { $size: '$hints' }] },
    },
    {
      $inc: { usedHintCount: 1 },
    },
    { new: true }
  );

  // Successfully incremented atomically
  if (updatedDoc) {
    const revealedIndex = updatedDoc.usedHintCount - 1;
    const hintText = updatedDoc.hints[revealedIndex];
    return {
      hint: {
        id: `hint_${revealedIndex + 1}`,
        number: revealedIndex + 1,
        text: hintText,
      },
      hintsProgress: {
        used: updatedDoc.usedHintCount,
        total: updatedDoc.hints.length,
        remaining: Math.max(0, updatedDoc.hints.length - updatedDoc.usedHintCount),
      },
      penaltyIncurred: 10,
      totalHintPenalty: updatedDoc.usedHintCount * 10,
    };
  }

  // If atomic update failed, determine exact reason
  const currentCase = await Case.findById(caseId);
  if (!currentCase) {
    throw new HttpError(404, `Case with ID ${caseId} was not found`, 'CASE_NOT_FOUND');
  }

  if (currentCase.status === 'completed') {
    throw new HttpError(
      409,
      'Cannot request hints on an already completed case.',
      'CASE_ALREADY_COMPLETED'
    );
  }

  throw new HttpError(
    409,
    'All available hints for this case have already been revealed.',
    'NO_HINTS_REMAINING'
  );
}

/**
 * Submits player accusation.
 * Calculates authoritative score on server and uses an atomic conditional transition
 * ({ status: 'active' } -> { status: 'completed' }) to ensure that only ONE final accusation
 * can ever be recorded.
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

  const now = new Date();

  // Atomic state transition from 'active' to 'completed'
  const completedDoc = await Case.findOneAndUpdate(
    {
      _id: caseId,
      status: 'active',
    },
    {
      $set: {
        status: 'completed',
        accusedSuspectId: suspectId,
        accusationReasoning: reasoning.trim(),
        isCorrect,
        score: scoreBreakdown.finalScore,
        completedAt: now,
      },
    },
    { new: true }
  );

  // If another concurrent request completed the case first:
  if (!completedDoc) {
    throw new HttpError(
      409,
      'An accusation has already been submitted for this case. Completed cases cannot be altered.',
      'CASE_ALREADY_COMPLETED'
    );
  }

  const culpritSuspect = completedDoc.suspects.find(
    (s) => s.id === completedDoc.solution.culpritSuspectId
  );

  return {
    caseId: completedDoc._id.toString(),
    status: 'completed',
    isCorrect,
    accusedSuspect: {
      id: accusedSuspect.id,
      name: accusedSuspect.name,
      role: accusedSuspect.role,
    },
    culprit: {
      id: culpritSuspect?.id || completedDoc.solution.culpritSuspectId,
      name: culpritSuspect?.name || 'Unknown',
      role: culpritSuspect?.role || '',
    },
    explanation: completedDoc.solution.explanation,
    reasoningClueIds: completedDoc.solution.reasoningClueIds,
    score: scoreBreakdown.finalScore,
    scoreBreakdown,
    completedAt: completedDoc.completedAt,
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
