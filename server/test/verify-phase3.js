import assert from 'assert';
import { calculateScoreBreakdown } from '../src/services/scoring.service.js';
import { accuseRequestSchema, discoverClueParamSchema } from '../src/validators/case.schemas.js';

console.log('--- RUNNING PHASE 3 GAMEPLAY, SCORING & SECURITY TESTS ---');

// 1. Scoring Formula Across Difficulties (SPEC.md Section 13.2)
console.log('Test 1: Verifying Scoring Calculations...');
{
  // Easy: Base 100 for correct
  const easyCorrect = calculateScoreBreakdown({
    difficulty: 'easy',
    isCorrect: true,
    discoveredCluesCount: 5,
    hintsUsedCount: 1,
  });
  // 100 + (5 * 5) - (1 * 10) = 115
  assert.strictEqual(easyCorrect.basePoints, 100);
  assert.strictEqual(easyCorrect.cluePoints, 25);
  assert.strictEqual(easyCorrect.hintPenalty, 10);
  assert.strictEqual(easyCorrect.finalScore, 115);

  // Medium: Base 150 for correct
  const mediumCorrect = calculateScoreBreakdown({
    difficulty: 'medium',
    isCorrect: true,
    discoveredCluesCount: 7,
    hintsUsedCount: 2,
  });
  // 150 + (7 * 5) - (2 * 10) = 165
  assert.strictEqual(mediumCorrect.basePoints, 150);
  assert.strictEqual(mediumCorrect.cluePoints, 35);
  assert.strictEqual(mediumCorrect.hintPenalty, 20);
  assert.strictEqual(mediumCorrect.finalScore, 165);

  // Hard: Base 200 for correct
  const hardCorrect = calculateScoreBreakdown({
    difficulty: 'hard',
    isCorrect: true,
    discoveredCluesCount: 9,
    hintsUsedCount: 3,
  });
  // 200 + (9 * 5) - (3 * 10) = 215
  assert.strictEqual(hardCorrect.basePoints, 200);
  assert.strictEqual(hardCorrect.cluePoints, 45);
  assert.strictEqual(hardCorrect.hintPenalty, 30);
  assert.strictEqual(hardCorrect.finalScore, 215);

  // Incorrect accusation: Base points must be 0
  const incorrectAccusation = calculateScoreBreakdown({
    difficulty: 'medium',
    isCorrect: false,
    discoveredCluesCount: 4,
    hintsUsedCount: 1,
  });
  // 0 + (4 * 5) - (1 * 10) = 10
  assert.strictEqual(incorrectAccusation.basePoints, 0, 'Incorrect accusation receives 0 base points');
  assert.strictEqual(incorrectAccusation.cluePoints, 20);
  assert.strictEqual(incorrectAccusation.hintPenalty, 10);
  assert.strictEqual(incorrectAccusation.finalScore, 10);

  // Minimum score must not fall below zero (floor rule)
  const penaltyExceedsPoints = calculateScoreBreakdown({
    difficulty: 'easy',
    isCorrect: false,
    discoveredCluesCount: 1,
    hintsUsedCount: 2,
  });
  // 0 + 5 - 20 = -15 -> Floor to 0
  assert.strictEqual(penaltyExceedsPoints.finalScore, 0, 'Score must never be negative');
}
console.log('✓ Scoring rules and floor calculations verified.');

// 2. Accusation Request Validation & Anti-Tampering
console.log('Test 2: Verifying Accusation Validation & Anti-Tampering...');
{
  const validAccusation = accuseRequestSchema.safeParse({
    suspectId: 'suspect_2',
    reasoning: 'The alibi timestamp conflicts with the security camera log.',
  });
  assert.strictEqual(validAccusation.success, true);

  // Missing suspectId must fail
  const missingSuspect = accuseRequestSchema.safeParse({
    reasoning: 'Someone did it',
  });
  assert.strictEqual(missingSuspect.success, false, 'Missing suspectId must be rejected');

  // Reasoning > 200 chars must fail
  const longReasoning = accuseRequestSchema.safeParse({
    suspectId: 'suspect_1',
    reasoning: 'A'.repeat(201),
  });
  assert.strictEqual(longReasoning.success, false, 'Reasoning > 200 characters must be rejected');

  // Attempting to inject client score / isCorrect
  const tamperedPayload = {
    suspectId: 'suspect_3',
    reasoning: 'Valid reasoning',
    isCorrect: true,
    score: 99999,
  };
  const parsed = accuseRequestSchema.parse(tamperedPayload);
  assert.strictEqual(parsed.score, undefined, 'Client score must be ignored/stripped');
  assert.strictEqual(parsed.isCorrect, undefined, 'Client isCorrect flag must be ignored/stripped');
}
console.log('✓ Accusation validation and anti-tampering verified.');

// 3. Mock Game Engine In-Memory Simulation
console.log('Test 3: Simulating Complete Game Lifecycle & Security Bounds...');
{
  // Simulated initial case
  const testCase = {
    _id: '507f1f77bcf86cd799439011',
    difficulty: 'medium',
    status: 'active',
    suspects: [
      { id: 'suspect_1', name: 'Emma Carter', role: 'Curator' },
      { id: 'suspect_2', name: 'Jack Wilson', role: 'Security Guard' },
      { id: 'suspect_3', name: 'Sophia Lee', role: 'Art Dealer' },
      { id: 'suspect_4', name: 'Daniel Brooks', role: 'Conservator' },
    ],
    clues: [
      { id: 'clue_1', title: 'Torn Note', description: 'Secret message: Meet at warehouse' },
      { id: 'clue_2', title: 'Muddy Boots', description: 'Size 10 boots with harbor clay' },
      { id: 'clue_3', title: 'Missing Key', description: 'Master safe key removed' },
    ],
    hints: [
      'Look at financial motives.',
      'Check alibi timing.',
      'Connect the museum and the warehouse.',
    ],
    discoveredClueIds: [],
    usedHintCount: 0,
    solution: {
      culpritSuspectId: 'suspect_4',
      explanation: 'Daniel Brooks used his restoration access and left the torn note.',
      reasoningClueIds: ['clue_1', 'clue_2'],
    },
  };

  // 3a. Duplicate clue discovery test
  function simulateDiscover(caseObj, clueId) {
    if (caseObj.status === 'completed') throw new Error('CASE_ALREADY_COMPLETED');
    const clue = caseObj.clues.find((c) => c.id === clueId);
    if (!clue) throw new Error('CLUE_NOT_FOUND');
    const alreadyDiscovered = caseObj.discoveredClueIds.includes(clueId);
    if (!alreadyDiscovered) caseObj.discoveredClueIds.push(clueId);
    return {
      clue,
      pointsEarned: alreadyDiscovered ? 0 : 5,
      alreadyDiscovered,
    };
  }

  const d1 = simulateDiscover(testCase, 'clue_1');
  assert.strictEqual(d1.pointsEarned, 5);
  assert.strictEqual(d1.alreadyDiscovered, false);
  assert.strictEqual(testCase.discoveredClueIds.length, 1);

  // Duplicate discovery of same clue
  const d1Repeat = simulateDiscover(testCase, 'clue_1');
  assert.strictEqual(d1Repeat.pointsEarned, 0, 'Duplicate discovery must award 0 points');
  assert.strictEqual(d1Repeat.alreadyDiscovered, true);
  assert.strictEqual(testCase.discoveredClueIds.length, 1, 'Array must not duplicate clue IDs');

  // Discover second clue
  const d2 = simulateDiscover(testCase, 'clue_2');
  assert.strictEqual(d2.pointsEarned, 5);
  assert.strictEqual(testCase.discoveredClueIds.length, 2);

  // 3b. Hint limit test
  function simulateHint(caseObj) {
    if (caseObj.status === 'completed') throw new Error('CASE_ALREADY_COMPLETED');
    if (caseObj.usedHintCount >= caseObj.hints.length) throw new Error('NO_HINTS_REMAINING');
    const hint = caseObj.hints[caseObj.usedHintCount];
    caseObj.usedHintCount += 1;
    return hint;
  }

  const h1 = simulateHint(testCase);
  assert.strictEqual(h1, 'Look at financial motives.');
  assert.strictEqual(testCase.usedHintCount, 1);

  const h2 = simulateHint(testCase);
  assert.strictEqual(h2, 'Check alibi timing.');
  assert.strictEqual(testCase.usedHintCount, 2);

  const h3 = simulateHint(testCase);
  assert.strictEqual(h3, 'Connect the museum and the warehouse.');
  assert.strictEqual(testCase.usedHintCount, 3);

  // 4th hint should exceed limit (3 hints for medium)
  assert.throws(() => simulateHint(testCase), /NO_HINTS_REMAINING/);

  // 3c. Accusation submission test
  function simulateAccusation(caseObj, suspectId, reasoning) {
    if (caseObj.status === 'completed') throw new Error('CASE_ALREADY_COMPLETED');
    const suspect = caseObj.suspects.find((s) => s.id === suspectId);
    if (!suspect) throw new Error('INVALID_SUSPECT');

    const isCorrect = suspectId === caseObj.solution.culpritSuspectId;
    const scoreBreakdown = calculateScoreBreakdown({
      difficulty: caseObj.difficulty,
      isCorrect,
      discoveredCluesCount: caseObj.discoveredClueIds.length,
      hintsUsedCount: caseObj.usedHintCount,
    });

    caseObj.status = 'completed';
    caseObj.accusedSuspectId = suspectId;
    caseObj.isCorrect = isCorrect;
    caseObj.score = scoreBreakdown.finalScore;

    return { isCorrect, scoreBreakdown };
  }

  // Attempt unknown suspect
  assert.throws(() => simulateAccusation(testCase, 'suspect_ghost', 'Wrong'), /INVALID_SUSPECT/);

  // Submit correct accusation
  const accusationResult = simulateAccusation(testCase, 'suspect_4', 'The torn note matches his handwriting.');
  assert.strictEqual(accusationResult.isCorrect, true);
  // Medium correct: 150 base + (2 clues * 5 = 10) - (3 hints * 10 = 30) = 130
  assert.strictEqual(accusationResult.scoreBreakdown.finalScore, 130);
  assert.strictEqual(testCase.status, 'completed');

  // Subsequent actions on completed case MUST be rejected
  assert.throws(() => simulateDiscover(testCase, 'clue_3'), /CASE_ALREADY_COMPLETED/);
  assert.throws(() => simulateHint(testCase), /CASE_ALREADY_COMPLETED/);
  assert.throws(() => simulateAccusation(testCase, 'suspect_1', 'Try again'), /CASE_ALREADY_COMPLETED/);
}
console.log('✓ Full game lifecycle, hint limits, idempotency & completed-case locks verified.');

console.log('--- ALL PHASE 3 TESTS COMPLETED WITH 100% SUCCESS ---');

