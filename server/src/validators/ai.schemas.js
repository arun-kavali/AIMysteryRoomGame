import { z } from 'zod';

export const DIFFICULTY_SPECS = {
  easy: {
    suspectCount: 3,
    clueCount: 5,
    hintCount: 2,
    basePoints: 100,
  },
  medium: {
    suspectCount: 4,
    clueCount: 7,
    hintCount: 3,
    basePoints: 150,
  },
  hard: {
    suspectCount: 5,
    clueCount: 9,
    hintCount: 3,
    basePoints: 200,
  },
};

const suspectAiSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  role: z.string().max(100).optional().default(''),
  description: z.string().min(5).max(500),
  motive: z.string().min(3).max(300),
  alibi: z.string().min(3).max(300),
});

const clueAiSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(150),
  description: z.string().min(10).max(1000),
  relevance: z.string().max(500).optional().default(''),
});

const solutionAiSchema = z.object({
  culpritSuspectId: z.string().min(1),
  explanation: z.string().min(20).max(2000),
  reasoningClueIds: z.array(z.string()).min(1),
});

export const rawAiCaseSchema = z.object({
  title: z.string().min(3).max(150),
  story: z.string().min(30).max(3000),
  suspects: z.array(suspectAiSchema),
  clues: z.array(clueAiSchema),
  hints: z.array(z.string().min(5).max(500)),
  solution: solutionAiSchema,
});

/**
 * Validates generated AI mystery data against both schema types and difficulty specifications.
 * Enforces logical cross-referencing:
 * 1. Correct count of suspects, clues, hints for the difficulty.
 * 2. Culprit suspect ID exists in suspects array.
 * 3. Reasoning clue IDs exist in clues array.
 * 4. Suspect and clue IDs are unique.
 */
export function validateAiMystery(data, difficulty) {
  const parsed = rawAiCaseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      isValid: false,
      error: `AI output validation failed: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
      data: null,
    };
  }

  const mystery = parsed.data;
  const spec = DIFFICULTY_SPECS[difficulty];
  if (!spec) {
    return {
      isValid: false,
      error: `Unsupported difficulty: ${difficulty}`,
      data: null,
    };
  }

  // Count checks
  if (mystery.suspects.length !== spec.suspectCount) {
    return {
      isValid: false,
      error: `Expected exactly ${spec.suspectCount} suspects for ${difficulty}, got ${mystery.suspects.length}`,
      data: null,
    };
  }

  if (mystery.clues.length !== spec.clueCount) {
    return {
      isValid: false,
      error: `Expected exactly ${spec.clueCount} clues for ${difficulty}, got ${mystery.clues.length}`,
      data: null,
    };
  }

  if (mystery.hints.length !== spec.hintCount) {
    return {
      isValid: false,
      error: `Expected exactly ${spec.hintCount} hints for ${difficulty}, got ${mystery.hints.length}`,
      data: null,
    };
  }

  // ID Uniqueness
  const suspectIds = new Set(mystery.suspects.map((s) => s.id));
  if (suspectIds.size !== mystery.suspects.length) {
    return {
      isValid: false,
      error: 'Suspect IDs must be unique',
      data: null,
    };
  }

  const clueIds = new Set(mystery.clues.map((c) => c.id));
  if (clueIds.size !== mystery.clues.length) {
    return {
      isValid: false,
      error: 'Clue IDs must be unique',
      data: null,
    };
  }

  // Culprit validity
  if (!suspectIds.has(mystery.solution.culpritSuspectId)) {
    return {
      isValid: false,
      error: `Culprit suspect ID '${mystery.solution.culpritSuspectId}' does not match any suspect`,
      data: null,
    };
  }

  // Reasoning clues validity
  for (const reasoningId of mystery.solution.reasoningClueIds) {
    if (!clueIds.has(reasoningId)) {
      return {
        isValid: false,
        error: `Reasoning clue ID '${reasoningId}' does not match any generated clue`,
        data: null,
      };
    }
  }

  return {
    isValid: true,
    error: null,
    data: mystery,
  };
}

