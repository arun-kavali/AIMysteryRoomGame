import assert from 'assert';
import app from '../src/app.js';
import { validateAiMystery, DIFFICULTY_SPECS } from '../src/validators/ai.schemas.js';
import { createCaseRequestSchema } from '../src/validators/case.schemas.js';
import { sanitizeCaseForPlayer } from '../src/utils/public-case.js';

console.log('--- RUNNING PHASE 2 UNIT & INTEGRATION TESTS ---');

// Test 1: Request Schema Validation
console.log('Test 1: Validating Request Schemas...');
{
  const validEasy = createCaseRequestSchema.safeParse({ premise: 'Stolen art in Paris', difficulty: 'easy' });
  assert.strictEqual(validEasy.success, true, 'Valid easy request should succeed');

  const validEmptyPremise = createCaseRequestSchema.safeParse({ difficulty: 'hard' });
  assert.strictEqual(validEmptyPremise.success, true, 'Empty premise is optional and should succeed');

  const invalidDiff = createCaseRequestSchema.safeParse({ difficulty: 'impossible' });
  assert.strictEqual(invalidDiff.success, false, 'Invalid difficulty must fail validation');

  const longPremise = createCaseRequestSchema.safeParse({ premise: 'x'.repeat(501), difficulty: 'medium' });
  assert.strictEqual(longPremise.success, false, 'Premise > 500 chars must fail validation');
}
console.log('✓ Request schemas validated correctly.');

// Test 2: AI Output Schema & Cross-Reference Validation
console.log('Test 2: Validating AI Output Quality & Structure...');
{
  const sampleMediumAiOutput = {
    title: 'The Vault Phantom',
    story: 'At midnight, the high-security bank vault was opened without an alarm sounding.',
    suspects: [
      { id: 'suspect_1', name: 'Alice Smith', role: 'Manager', description: 'Has the key', motive: 'Debts', alibi: 'At diner' },
      { id: 'suspect_2', name: 'Bob Jones', role: 'Guard', description: 'On patrol', motive: 'Greed', alibi: 'Lobby' },
      { id: 'suspect_3', name: 'Carol White', role: 'Technician', description: 'Disabled cam', motive: 'Revenge', alibi: 'Basement' },
      { id: 'suspect_4', name: 'David Brown', role: 'Auditor', description: 'Reviewed books', motive: 'Blackmail', alibi: 'Hotel' },
    ],
    clues: [
      { id: 'clue_1', title: 'Cut Wire', description: 'Thermal wire bypass', relevance: 'Needs technical skill' },
      { id: 'clue_2', title: 'Badge Scan', description: 'Alice badge used', relevance: 'Implies Alice or stolen badge' },
      { id: 'clue_3', title: 'Coffee Receipt', description: 'Bob timestamped receipt', relevance: 'Validates Bob alibi' },
      { id: 'clue_4', title: 'Toolbox Residue', description: 'Solder flux matching Carol kit', relevance: 'Points to Carol' },
      { id: 'clue_5', title: 'Phone Log', description: 'Encrypted message to buyer', relevance: 'Arranged meeting' },
      { id: 'clue_6', title: 'Train Ticket', description: 'One way departure', relevance: 'Flight risk' },
      { id: 'clue_7', title: 'Glove Fibers', description: 'Insulated nylon fiber', relevance: 'Electrical work' },
    ],
    hints: [
      'Examine the tool residue found near the circuit breaker.',
      'Cross reference the technician shift hours with the blackout.',
      'Check which suspect had specialized wiring knowledge.',
    ],
    solution: {
      culpritSuspectId: 'suspect_3',
      explanation: 'Carol used her access and technical knowledge to splice the alarm wire before leaving the flux residue.',
      reasoningClueIds: ['clue_1', 'clue_4'],
    },
  };

  const validResult = validateAiMystery(sampleMediumAiOutput, 'medium');
  assert.strictEqual(validResult.isValid, true, 'Valid medium mystery should pass');

  // Test wrong suspect count for medium (expects 4)
  const invalidSuspectCount = {
    ...sampleMediumAiOutput,
    suspects: sampleMediumAiOutput.suspects.slice(0, 3),
  };
  const invalidCountResult = validateAiMystery(invalidSuspectCount, 'medium');
  assert.strictEqual(invalidCountResult.isValid, false, 'Wrong suspect count must fail');

  // Test culprit not in suspects list
  const invalidCulprit = {
    ...sampleMediumAiOutput,
    solution: {
      ...sampleMediumAiOutput.solution,
      culpritSuspectId: 'suspect_999',
    },
  };
  const invalidCulpritResult = validateAiMystery(invalidCulprit, 'medium');
  assert.strictEqual(invalidCulpritResult.isValid, false, 'Invalid culprit ID must fail');

  // Test reasoning clue not in clues list
  const invalidReasoning = {
    ...sampleMediumAiOutput,
    solution: {
      ...sampleMediumAiOutput.solution,
      reasoningClueIds: ['clue_nonexistent'],
    },
  };
  const invalidReasoningResult = validateAiMystery(invalidReasoning, 'medium');
  assert.strictEqual(invalidReasoningResult.isValid, false, 'Invalid reasoning clue ID must fail');
}
console.log('✓ AI output schema and cross-referencing logic verified.');

// Test 3: Solution Secrecy and Public Sanitization
console.log('Test 3: Testing Solution Secrecy and Payload Sanitization...');
{
  const activeCaseDoc = {
    id: 'case_secret_123',
    title: 'The Stolen Diamond',
    premise: 'Museum heist during thunder storm',
    story: 'A diamond was stolen...',
    difficulty: 'medium',
    status: 'active',
    suspects: [
      { id: 'suspect_1', name: 'Emma Carter', role: 'Curator', description: 'Curator bio', motive: 'Money', alibi: 'Office' },
    ],
    clues: [
      { id: 'clue_1', title: 'Torn Note', description: 'CRITICAL SECRET: Meet at warehouse - D', relevance: 'Identifies D' },
      { id: 'clue_2', title: 'Muddy Boots', description: 'SECRET EVIDENCE: Harbor clay', relevance: 'Points to harbor' },
    ],
    discoveredClueIds: ['clue_1'],
    hints: [
      'Look at financial motives.',
      'Check alibi timeline.',
      'Connect the museum and warehouse.',
    ],
    usedHintCount: 1,
    solution: {
      culpritSuspectId: 'suspect_4',
      explanation: 'CONFIDENTIAL: Daniel Brooks committed the crime using his glass-cutter.',
      reasoningClueIds: ['clue_1'],
    },
  };

  const sanitized = sanitizeCaseForPlayer(activeCaseDoc);

  // Assert solution is completely omitted
  assert.strictEqual(sanitized.solution, undefined, 'Solution must NEVER be in public active case payload');
  assert.strictEqual(sanitized.culpritSuspectId, undefined, 'Culprit ID must not be exposed');
  assert.strictEqual(sanitized.isCorrect, undefined, 'isCorrect must not be exposed on active case');

  // Assert discovered clue includes description
  const discoveredClue = sanitized.clues.find((c) => c.id === 'clue_1');
  assert.strictEqual(discoveredClue.discovered, true);
  assert.strictEqual(discoveredClue.description, 'CRITICAL SECRET: Meet at warehouse - D');

  // Assert undiscovered clue description is WITHHELD
  const undiscoveredClue = sanitized.clues.find((c) => c.id === 'clue_2');
  assert.strictEqual(undiscoveredClue.discovered, false);
  assert.strictEqual(undiscoveredClue.description, undefined, 'Undiscovered clue description MUST be withheld');
  assert.strictEqual(undiscoveredClue.relevance, undefined, 'Undiscovered clue relevance MUST be withheld');

  // Assert only used hints are revealed
  assert.strictEqual(sanitized.hints.length, 1, 'Only unlocked hints should be returned');
  assert.strictEqual(sanitized.hints[0].text, 'Look at financial motives.');
  assert.strictEqual(sanitized.hintsProgress.remaining, 2);
}
console.log('✓ Solution secrecy and payload sanitization strictly verified.');

console.log('--- ALL UNIT & LOGIC TESTS PASSED SUCCESSFULLY ---');

