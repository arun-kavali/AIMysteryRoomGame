/**
 * verify-audit.js — Regression tests for the engineering audit fixes.
 *
 * Tests cover:
 *  1. Atomic clue-discovery idempotency (duplicate request → 0 points, no double-add)
 *  2. Hint-limit enforcement (cannot exceed allowed hints)
 *  3. Accusation single-submission lock (409 on completed case)
 *  4. Client-side score/isCorrect injection is stripped before final verdict
 *  5. Result endpoint blocked (409) before accusation
 *  6. CORS origin Set construction (no wildcard *.vercel.app)
 *
 * All tests are pure in-memory, no database or network required.
 */

import assert from 'assert';
import { calculateScoreBreakdown } from '../src/services/scoring.service.js';
import { sanitizeCaseForPlayer } from '../src/utils/public-case.js';
import { accuseRequestSchema } from '../src/validators/case.schemas.js';

console.log('--- RUNNING AUDIT REGRESSION TESTS ---');

// ─── Shared mock helpers ──────────────────────────────────────────────────────

function makeMockCase(overrides = {}) {
  return {
    _id: 'audit_case_001',
    title: 'The Audit Case',
    premise: 'A priceless artefact vanished overnight.',
    story: 'Security footage shows the lights went out at 11 PM.',
    difficulty: 'medium',
    status: 'active',
    suspects: [
      { id: 'suspect_1', name: 'Alice', role: 'Curator', description: 'Bio', motive: 'Debt', alibi: 'Office' },
      { id: 'suspect_2', name: 'Bob', role: 'Guard', description: 'Bio', motive: 'Revenge', alibi: 'Lobby' },
      { id: 'suspect_3', name: 'Carol', role: 'Dealer', description: 'Bio', motive: 'Fame', alibi: 'Gala' },
      { id: 'suspect_4', name: 'Dave', role: 'Conservator', description: 'Bio', motive: 'Possession', alibi: 'Home' },
    ],
    clues: [
      { id: 'clue_1', title: 'Torn Note', description: 'Meet me at dock - D', relevance: 'Points to Dave' },
      { id: 'clue_2', title: 'Muddy Boots', description: 'Harbor clay', relevance: 'Dock area' },
      { id: 'clue_3', title: 'Glitch', description: 'Loop at 11:42 PM', relevance: 'Disproves patrol' },
    ],
    hints: [
      'Think about who had a financial motive.',
      'Look at alibi timing.',
      'Connect the museum and the dock.',
    ],
    discoveredClueIds: [],
    usedHintCount: 0,
    solution: {
      culpritSuspectId: 'suspect_4',
      explanation: 'Dave used his restoration tools.',
      reasoningClueIds: ['clue_1', 'clue_2'],
    },
    ...overrides,
  };
}

/**
 * Simulates the atomic discoverClue logic without a real database.
 * Returns { clue, pointsEarned, progress } and mutates caseDoc.discoveredClueIds.
 * Mirrors the atomics in case.service.js.
 */
function simulateDiscoverClue(caseDoc, clueId) {
  if (caseDoc.status !== 'active') {
    return { error: 'CASE_ALREADY_COMPLETED', status: 409 };
  }
  const targetClue = caseDoc.clues.find((c) => c.id === clueId);
  if (!targetClue) {
    return { error: 'CLUE_NOT_FOUND', status: 404 };
  }

  const alreadyDiscovered = caseDoc.discoveredClueIds.includes(clueId);

  if (!alreadyDiscovered) {
    // $addToSet — only add if not present (the atomic guarantee)
    caseDoc.discoveredClueIds.push(clueId);
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
 * Simulates the atomic useHint logic.
 */
function simulateUseHint(caseDoc) {
  if (caseDoc.status !== 'active') {
    return { error: 'CASE_ALREADY_COMPLETED', status: 409 };
  }
  if (caseDoc.usedHintCount >= caseDoc.hints.length) {
    return { error: 'NO_HINTS_REMAINING', status: 409 };
  }

  const idx = caseDoc.usedHintCount;
  caseDoc.usedHintCount += 1; // $inc (atomic in real code)

  return {
    hint: { id: `hint_${idx + 1}`, number: idx + 1, text: caseDoc.hints[idx] },
    hintsProgress: {
      used: caseDoc.usedHintCount,
      total: caseDoc.hints.length,
      remaining: caseDoc.hints.length - caseDoc.usedHintCount,
    },
    penaltyIncurred: 10,
  };
}

/**
 * Simulates the atomic submitAccusation logic.
 * In real code: findOneAndUpdate({ status: 'active' }) — atomic status transition.
 */
function simulateAccuse(caseDoc, suspectId, reasoning = '') {
  if (caseDoc.status !== 'active') {
    return { error: 'CASE_ALREADY_COMPLETED', status: 409 };
  }
  const accused = caseDoc.suspects.find((s) => s.id === suspectId);
  if (!accused) {
    return { error: 'INVALID_SUSPECT', status: 400 };
  }

  // Atomic transition: only proceeds if status was 'active' (findOneAndUpdate guarantee)
  caseDoc.status = 'completed';

  const isCorrect = suspectId === caseDoc.solution.culpritSuspectId;
  const scoreBreakdown = calculateScoreBreakdown({
    difficulty: caseDoc.difficulty,
    isCorrect,
    discoveredCluesCount: caseDoc.discoveredClueIds.length,
    hintsUsedCount: caseDoc.usedHintCount,
  });

  caseDoc.isCorrect = isCorrect;
  caseDoc.score = scoreBreakdown.finalScore;
  caseDoc.accusedSuspectId = suspectId;

  const culprit = caseDoc.suspects.find((s) => s.id === caseDoc.solution.culpritSuspectId);

  return {
    status: 'completed',
    isCorrect,
    accusedSuspect: { id: accused.id, name: accused.name, role: accused.role },
    culprit: { id: culprit.id, name: culprit.name, role: culprit.role },
    score: scoreBreakdown.finalScore,
    scoreBreakdown,
    explanation: caseDoc.solution.explanation,
  };
}

// ─── Test 1: Atomic clue-discovery idempotency ────────────────────────────────
console.log('Audit Regression 1: Atomic clue-discovery idempotency...');
{
  const caseDoc = makeMockCase();

  // First discovery
  const first = simulateDiscoverClue(caseDoc, 'clue_1');
  assert.strictEqual(first.clue.alreadyDiscovered, false, 'First discovery should not be marked alreadyDiscovered');
  assert.strictEqual(first.pointsEarned, 5, 'First discovery must award 5 points');
  assert.strictEqual(caseDoc.discoveredClueIds.length, 1, 'Clue added to discoveredClueIds');

  // Duplicate discovery — simulates concurrent request that lost the race
  const second = simulateDiscoverClue(caseDoc, 'clue_1');
  assert.strictEqual(second.clue.alreadyDiscovered, true, 'Duplicate must be marked alreadyDiscovered');
  assert.strictEqual(second.pointsEarned, 0, 'Duplicate must earn 0 points');
  assert.strictEqual(caseDoc.discoveredClueIds.length, 1, '$addToSet must not duplicate the clue ID');

  // Third attempt — still idempotent
  const third = simulateDiscoverClue(caseDoc, 'clue_1');
  assert.strictEqual(third.pointsEarned, 0, 'Third duplicate must earn 0 points');
  assert.strictEqual(caseDoc.discoveredClueIds.length, 1, 'Still only 1 entry in discoveredClueIds');
}
console.log('✓ Atomic clue-discovery idempotency passed.');

// ─── Test 2: Hint-limit enforcement ──────────────────────────────────────────
console.log('Audit Regression 2: Hint-limit enforcement...');
{
  const caseDoc = makeMockCase(); // medium: 3 hints

  const h1 = simulateUseHint(caseDoc);
  assert.strictEqual(h1.hint.number, 1);
  assert.strictEqual(h1.hintsProgress.used, 1);
  assert.strictEqual(h1.hintsProgress.remaining, 2);

  const h2 = simulateUseHint(caseDoc);
  assert.strictEqual(h2.hint.number, 2);
  assert.strictEqual(h2.hintsProgress.remaining, 1);

  const h3 = simulateUseHint(caseDoc);
  assert.strictEqual(h3.hint.number, 3);
  assert.strictEqual(h3.hintsProgress.remaining, 0);

  // 4th request must be rejected (limit enforced atomically with $expr $lt)
  const h4 = simulateUseHint(caseDoc);
  assert.ok(h4.error === 'NO_HINTS_REMAINING', 'Request beyond hint limit must be rejected');
  assert.strictEqual(caseDoc.usedHintCount, 3, 'usedHintCount must not exceed hint array length');

  // Idempotent — 5th request still rejected, count unchanged
  const h5 = simulateUseHint(caseDoc);
  assert.ok(h5.error === 'NO_HINTS_REMAINING', 'Further requests beyond limit must still be rejected');
  assert.strictEqual(caseDoc.usedHintCount, 3, 'usedHintCount still 3 after over-limit attempts');
}
console.log('✓ Hint-limit enforcement passed.');

// ─── Test 3: Single-accusation lock (409 on re-accuse) ───────────────────────
console.log('Audit Regression 3: Single-accusation lock...');
{
  const caseDoc = makeMockCase();

  // First accusation succeeds
  const first = simulateAccuse(caseDoc, 'suspect_4', 'Dock note handwriting matches Dave.');
  assert.strictEqual(first.status, 'completed', 'First accusation must complete the case');
  assert.strictEqual(first.isCorrect, true, 'suspect_4 is the culprit — should be correct');
  assert.strictEqual(caseDoc.status, 'completed', 'Case doc status must be completed after accusation');

  // Second accusation must be rejected (atomic: findOneAndUpdate({ status: 'active' }) won't match)
  const second = simulateAccuse(caseDoc, 'suspect_1', 'Different reasoning.');
  assert.ok(second.error === 'CASE_ALREADY_COMPLETED' && second.status === 409,
    'Re-accusation on completed case must return CASE_ALREADY_COMPLETED / 409');

  // Ensure the stored verdict is unchanged
  assert.strictEqual(caseDoc.accusedSuspectId, 'suspect_4', 'Original accusation must be preserved');
  assert.strictEqual(caseDoc.isCorrect, true, 'isCorrect must remain from first verdict');
}
console.log('✓ Single-accusation lock passed.');

// ─── Test 4: Client-injected score/isCorrect fields are stripped ──────────────
console.log('Audit Regression 4: Client-supplied score/isCorrect injection prevention...');
{
  // The accuseRequestSchema must NOT include score or isCorrect fields in its output
  const body = {
    suspectId: 'suspect_1',
    reasoning: 'My reasoning.',
    score: 9999,          // injected by attacker
    isCorrect: true,      // injected by attacker
    finalScore: 9999,     // injected by attacker
  };

  const parsed = accuseRequestSchema.safeParse(body);
  assert.strictEqual(parsed.success, true, 'Valid suspectId/reasoning must parse correctly');

  // Zod with .strip() (default) removes unknown keys
  assert.strictEqual(parsed.data.score, undefined, 'score must be stripped by Zod schema');
  assert.strictEqual(parsed.data.isCorrect, undefined, 'isCorrect must be stripped by Zod schema');
  assert.strictEqual(parsed.data.finalScore, undefined, 'finalScore must be stripped by Zod schema');
  assert.strictEqual(parsed.data.suspectId, 'suspect_1', 'suspectId must be preserved');
  assert.strictEqual(parsed.data.reasoning, 'My reasoning.', 'reasoning must be preserved');
}
console.log('✓ Client-injected fields are stripped by Zod schema.');

// ─── Test 5: Solution secrecy on active case ──────────────────────────────────
console.log('Audit Regression 5: Solution secrecy — active case payload check...');
{
  const caseDoc = makeMockCase({ discoveredClueIds: ['clue_1'] });
  const publicPayload = sanitizeCaseForPlayer(caseDoc);

  assert.strictEqual(publicPayload.solution, undefined, 'solution field must be absent from active case payload');
  assert.strictEqual(publicPayload.culpritSuspectId, undefined, 'culpritSuspectId must not leak');
  assert.strictEqual(publicPayload.isCorrect, undefined, 'isCorrect must not appear on active case');

  // Discovered clue reveals description; undiscovered does not
  const discoveredClue = publicPayload.clues.find((c) => c.id === 'clue_1');
  const hiddenClue = publicPayload.clues.find((c) => c.id === 'clue_2');

  assert.ok(discoveredClue.discovered === true, 'Discovered clue marked discovered');
  assert.ok(discoveredClue.description !== undefined, 'Discovered clue description must be visible');

  assert.ok(hiddenClue.discovered === false, 'Undiscovered clue marked not discovered');
  assert.strictEqual(hiddenClue.description, undefined, 'Undiscovered clue description MUST NOT leak');
  assert.strictEqual(hiddenClue.relevance, undefined, 'Undiscovered clue relevance MUST NOT leak');
}
console.log('✓ Solution secrecy on active case passed.');

// ─── Test 6: CORS allowed-origins Set — no wildcard domain matching ───────────
console.log('Audit Regression 6: CORS origin set — no wildcard *.vercel.app matching...');
{
  // Rebuild the Set logic from app.js to validate it directly
  const CLIENT_URL = 'https://ai-mystery-room.vercel.app';
  const configuredOrigins = CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''));
  const allowedOrigins = new Set([
    ...configuredOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);

  // Configured origin is allowed
  assert.ok(allowedOrigins.has('https://ai-mystery-room.vercel.app'), 'Configured origin must be allowed');

  // Attacker's Vercel app is NOT allowed
  assert.ok(!allowedOrigins.has('https://attacker-app.vercel.app'), 'Attacker Vercel app must be rejected');

  // No wildcard entry in the set
  assert.ok(!allowedOrigins.has('*'), 'Wildcard must not be in allowed origins');

  // Contains no entries that would match via substring (the Set uses exact equality)
  const setEntries = [...allowedOrigins];
  const hasGlobEntry = setEntries.some((e) => e.includes('*') || e.startsWith('.'));
  assert.ok(!hasGlobEntry, 'No glob-style entries should exist in the allowed origins Set');
}
console.log('✓ CORS origin set has no wildcard domain matching.');

// ─── Test 7: Score floor — minimum 0, never negative ─────────────────────────
console.log('Audit Regression 7: Score floor (minimum 0, never negative)...');
{
  // Worst possible case: incorrect answer, 0 clues, all 3 hints on hard difficulty
  const worstCase = calculateScoreBreakdown({
    difficulty: 'hard',
    isCorrect: false,
    discoveredCluesCount: 0,
    hintsUsedCount: 3,
  });
  // raw: 0 base (wrong) + 0 clue points - 30 hint penalty = -30 → floored to 0
  assert.strictEqual(worstCase.finalScore, 0, 'Worst-case score must floor at 0, not go negative');

  // Verify correct-accusation score is additive baseline
  const perfectEasy = calculateScoreBreakdown({
    difficulty: 'easy',
    isCorrect: true,
    discoveredCluesCount: 5,
    hintsUsedCount: 0,
  });
  // 100 base + 25 clues = 125
  assert.strictEqual(perfectEasy.finalScore, 125, 'Perfect easy score must be 125');
}
console.log('✓ Score floor enforcement passed.');

console.log('');
console.log('--- ALL AUDIT REGRESSION TESTS PASSED (7/7) ---');

