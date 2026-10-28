import assert from 'assert';
import { calculateScoreBreakdown } from '../src/services/scoring.service.js';
import { DIFFICULTY_SPECS, validateAiMystery } from '../src/validators/ai.schemas.js';
import { createCaseRequestSchema, accuseRequestSchema } from '../src/validators/case.schemas.js';
import { sanitizeCaseForPlayer } from '../src/utils/public-case.js';

console.log('--- PHASE 5: FINAL PRODUCTION QA & SECURITY AUDIT ---');

// Audit 1: Difficulty Specifications & Score Floors
console.log('Audit 1: Auditing Difficulty Specifications & Edge-Case Scoring...');
{
  assert.strictEqual(DIFFICULTY_SPECS.easy.suspectCount, 3);
  assert.strictEqual(DIFFICULTY_SPECS.easy.clueCount, 5);
  assert.strictEqual(DIFFICULTY_SPECS.easy.hintCount, 2);
  assert.strictEqual(DIFFICULTY_SPECS.easy.basePoints, 100);

  assert.strictEqual(DIFFICULTY_SPECS.medium.suspectCount, 4);
  assert.strictEqual(DIFFICULTY_SPECS.medium.clueCount, 7);
  assert.strictEqual(DIFFICULTY_SPECS.medium.hintCount, 3);
  assert.strictEqual(DIFFICULTY_SPECS.medium.basePoints, 150);

  assert.strictEqual(DIFFICULTY_SPECS.hard.suspectCount, 5);
  assert.strictEqual(DIFFICULTY_SPECS.hard.clueCount, 9);
  assert.strictEqual(DIFFICULTY_SPECS.hard.hintCount, 3);
  assert.strictEqual(DIFFICULTY_SPECS.hard.basePoints, 200);

  // Maximum hints used with zero clues discovered and incorrect accusation
  const worstCase = calculateScoreBreakdown({
    difficulty: 'hard',
    isCorrect: false,
    discoveredCluesCount: 0,
    hintsUsedCount: 3,
  });
  // 0 + 0 - 30 = -30 -> Floor must be 0
  assert.strictEqual(worstCase.finalScore, 0, 'Score must strictly floor at 0');

  // Hard perfect run
  const perfectHard = calculateScoreBreakdown({
    difficulty: 'hard',
    isCorrect: true,
    discoveredCluesCount: 9,
    hintsUsedCount: 0,
  });
  // 200 + 45 - 0 = 245
  assert.strictEqual(perfectHard.finalScore, 245);
}
console.log('✓ Difficulty specs and edge scoring formulas passed.');

// Audit 2: Solution Secrecy and Data Leakage Prevention
console.log('Audit 2: Auditing Active Case Payload Secrecy...');
{
  const testDoc = {
    _id: '64a1f8c3b123456789abcdef',
    title: 'The Stolen Diamond',
    premise: 'Museum burglary',
    story: 'At midnight...',
    difficulty: 'medium',
    status: 'active',
    suspects: [
      { id: 'suspect_1', name: 'Emma Carter', role: 'Curator', description: 'Bio', motive: 'Debt', alibi: 'Office' },
      { id: 'suspect_2', name: 'Jack Wilson', role: 'Guard', description: 'Bio', motive: 'Revenge', alibi: 'Lobby' },
      { id: 'suspect_3', name: 'Sophia Lee', role: 'Dealer', description: 'Bio', motive: 'Fame', alibi: 'Gala' },
      { id: 'suspect_4', name: 'Daniel Brooks', role: 'Conservator', description: 'Bio', motive: 'Possession', alibi: 'Home' },
    ],
    clues: [
      { id: 'clue_1', title: 'Torn Note', description: 'SECRET: Warehouse meeting', relevance: 'Points to Daniel' },
      { id: 'clue_2', title: 'Muddy Boots', description: 'SECRET: Harbor clay', relevance: 'Points to harbor' },
    ],
    discoveredClueIds: ['clue_1'],
    hints: [
      'Look at financial motives.',
      'Check alibi timing.',
      'Connect the museum and the warehouse.',
    ],
    usedHintCount: 1,
    solution: {
      culpritSuspectId: 'suspect_4',
      explanation: 'CONFIDENTIAL: Daniel committed the crime.',
      reasoningClueIds: ['clue_1'],
    },
  };

  const publicPayload = sanitizeCaseForPlayer(testDoc);

  // Check that solution object is strictly undefined
  assert.strictEqual(publicPayload.solution, undefined, 'Solution MUST be undefined on active cases');
  assert.strictEqual(publicPayload.culpritSuspectId, undefined, 'Culprit ID MUST not be exposed');
  assert.strictEqual(publicPayload.accusedSuspectId, undefined);

  // Check undiscovered clue description is withheld
  const clue1 = publicPayload.clues.find((c) => c.id === 'clue_1');
  const clue2 = publicPayload.clues.find((c) => c.id === 'clue_2');
  assert.strictEqual(clue1.discovered, true);
  assert.strictEqual(clue1.description, 'SECRET: Warehouse meeting');
  assert.strictEqual(clue2.discovered, false);
  assert.strictEqual(clue2.description, undefined, 'Undiscovered clue description MUST NOT leak');
  assert.strictEqual(clue2.relevance, undefined, 'Undiscovered clue relevance MUST NOT leak');

  // Check unused hints are withheld
  assert.strictEqual(publicPayload.hints.length, 1);
  assert.strictEqual(publicPayload.hints[0].text, 'Look at financial motives.');
  assert.strictEqual(publicPayload.hintsProgress.remaining, 2);
}
console.log('✓ Solution secrecy and payload sanitization passed with 0 leaks.');

// Audit 3: Request Validation Boundaries
console.log('Audit 3: Auditing Input Validation Boundaries...');
{
  // Valid edge cases
  assert.strictEqual(createCaseRequestSchema.safeParse({ premise: '', difficulty: 'easy' }).success, true);
  assert.strictEqual(createCaseRequestSchema.safeParse({ difficulty: 'hard' }).success, true);

  // Invalid cases
  assert.strictEqual(createCaseRequestSchema.safeParse({ difficulty: 'nightmare' }).success, false);
  assert.strictEqual(createCaseRequestSchema.safeParse({ premise: 'a'.repeat(501), difficulty: 'medium' }).success, false);

  assert.strictEqual(accuseRequestSchema.safeParse({ suspectId: 'suspect_1' }).success, true);
  assert.strictEqual(accuseRequestSchema.safeParse({ suspectId: 'suspect_1', reasoning: 'b'.repeat(200) }).success, true);
  assert.strictEqual(accuseRequestSchema.safeParse({ suspectId: 'suspect_1', reasoning: 'b'.repeat(201) }).success, false);
  assert.strictEqual(accuseRequestSchema.safeParse({ suspectId: '' }).success, false);
}
console.log('✓ Request boundary validation passed.');

console.log('--- ALL PHASE 5 PRODUCTION QA AUDITS PASSED WITH 100% SUCCESS ---');
