import { INITIAL_MOCK_CASE } from '../data/mockCase';

const STORAGE_PREFIX = 'ai_mystery_case_';

/**
 * Service providing game state management for Phase 1 frontend demonstration.
 * Operates in-memory and caches in localStorage so browser refreshes maintain state.
 * Clearly demarcated as mock logic that will be swapped for backend API calls in Phase 2/3.
 */

// Difficulty presets per SPEC.md Section 13.1
export const DIFFICULTY_PRESETS = {
  easy: {
    name: 'Easy',
    suspectCount: 3,
    clueCount: 5,
    hintCount: 2,
    basePoints: 100,
    description: 'Suitable for beginners with fewer clues and direct links.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  medium: {
    name: 'Medium',
    suspectCount: 4,
    clueCount: 7,
    hintCount: 3,
    basePoints: 150,
    description: 'Balanced challenge requiring careful analysis of motives and alibis.',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  hard: {
    name: 'Hard',
    suspectCount: 5,
    clueCount: 9,
    hintCount: 3,
    basePoints: 200,
    description: 'Complex mystery with red herrings and intricate timelines.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  }
};

export const getCase = (caseId) => {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${caseId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  // Return the default initial mock case
  return { ...INITIAL_MOCK_CASE, id: caseId || INITIAL_MOCK_CASE.id };
};

export const saveCase = (caseData) => {
  localStorage.setItem(`${STORAGE_PREFIX}${caseData.id}`, JSON.stringify(caseData));
  return caseData;
};

export const createMockCase = ({ premise, difficulty = 'medium' }) => {
  const newId = `case_${Date.now()}`;
  const config = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medium;
  
  // Clone mock case adjusted for requested difficulty
  const newCase = {
    ...INITIAL_MOCK_CASE,
    id: newId,
    difficulty,
    premise: premise || 'A priceless diamond was stolen from a locked museum during a storm.',
    title: premise ? premise.slice(0, 32).trim() + '...' : INITIAL_MOCK_CASE.title,
    status: 'active',
    createdAt: new Date().toISOString(),
    suspects: INITIAL_MOCK_CASE.suspects.slice(0, config.suspectCount),
    clues: INITIAL_MOCK_CASE.clues.slice(0, config.clueCount).map((clue, idx) => ({
      ...clue,
      discovered: idx < 2 // first 2 discovered initially
    })),
    hints: INITIAL_MOCK_CASE.hints.slice(0, config.hintCount).map((h, idx) => ({
      ...h,
      unlocked: idx === 0 // 1 unlocked initially
    })),
    solution: {
      ...INITIAL_MOCK_CASE.solution,
      basePoints: config.basePoints
    }
  };

  saveCase(newCase);
  return newCase;
};

export const discoverClueInCase = (caseId, clueId) => {
  const caseData = getCase(caseId);
  if (!caseData || caseData.status === 'completed') return caseData;

  const updatedClues = caseData.clues.map((clue) => {
    if (clue.id === clueId) {
      return { ...clue, discovered: true };
    }
    return clue;
  });

  const updated = { ...caseData, clues: updatedClues };
  return saveCase(updated);
};

export const unlockNextHintInCase = (caseId) => {
  const caseData = getCase(caseId);
  if (!caseData || caseData.status === 'completed') return caseData;

  let unlockedOne = false;
  const updatedHints = caseData.hints.map((h) => {
    if (!h.unlocked && !unlockedOne) {
      unlockedOne = true;
      return { ...h, unlocked: true };
    }
    return h;
  });

  const updated = { ...caseData, hints: updatedHints };
  return saveCase(updated);
};

export const submitAccusationForCase = (caseId, suspectId, reasoning = '') => {
  const caseData = getCase(caseId);
  if (!caseData) return null;

  const isCorrect = suspectId === caseData.solution.culpritSuspectId;
  const config = DIFFICULTY_PRESETS[caseData.difficulty] || DIFFICULTY_PRESETS.medium;
  
  const discoveredCluesCount = caseData.clues.filter((c) => c.discovered).length;
  const hintsUsedCount = caseData.hints.filter((h) => h.unlocked).length;

  const basePoints = isCorrect ? config.basePoints : 0;
  const cluePoints = discoveredCluesCount * 5;
  const hintPenalty = hintsUsedCount * 10;
  const finalScore = Math.max(0, basePoints + cluePoints - hintPenalty);

  const accusedSuspect = caseData.suspects.find((s) => s.id === suspectId);

  const updated = {
    ...caseData,
    status: 'completed',
    accusedSuspectId: suspectId,
    accusedSuspect,
    accusationReasoning: reasoning,
    result: {
      isCorrect,
      culpritName: caseData.solution.culpritName,
      culpritRole: caseData.solution.culpritRole,
      culpritAvatar: caseData.solution.culpritAvatar,
      explanation: caseData.solution.explanation,
      basePoints,
      cluesFoundCount: discoveredCluesCount,
      cluePoints,
      hintsUsedCount,
      hintPenalty,
      finalScore
    }
  };

  return saveCase(updated);
};

