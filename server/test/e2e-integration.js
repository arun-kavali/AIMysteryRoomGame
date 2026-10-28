import assert from 'assert';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { calculateScoreBreakdown } from '../src/services/scoring.service.js';
import { sanitizeCaseForPlayer } from '../src/utils/public-case.js';
import { DIFFICULTY_SPECS } from '../src/validators/ai.schemas.js';

console.log('--- RUNNING FULL E2E LIFECYCLE SIMULATION (FRONTEND <-> BACKEND) ---');

// Mock in-memory database store for full lifecycle testing
const memoryDb = new Map();

// Standalone test app mirroring exact server endpoints and public serialization
const testApp = express();
testApp.use(cors());
testApp.use(express.json());

// Seed an active case
const mockSeedCase = {
  _id: '64a1f8c3b123456789abcdef',
  title: 'The Stolen Diamond',
  premise: 'A diamond was stolen during a storm.',
  story: 'At midnight, the curator found the glass cabinet shattered.',
  difficulty: 'medium',
  status: 'active',
  suspects: [
    { id: 'suspect_1', name: 'Emma Carter', role: 'Curator', description: 'Curator bio', motive: 'Money', alibi: 'In office' },
    { id: 'suspect_2', name: 'Jack Wilson', role: 'Guard', description: 'Guard bio', motive: 'Revenge', alibi: 'On duty' },
    { id: 'suspect_3', name: 'Sophia Lee', role: 'Dealer', description: 'Dealer bio', motive: 'Fame', alibi: 'At gala' },
    { id: 'suspect_4', name: 'Daniel Brooks', role: 'Conservator', description: 'Conservator bio', motive: 'Possession', alibi: 'At home' },
  ],
  clues: [
    { id: 'clue_1', title: 'Torn Note', description: 'Meet me at the old warehouse - D', relevance: 'Points to Daniel' },
    { id: 'clue_2', title: 'Muddy Boots', description: 'Size 10 boots with harbor clay', relevance: 'Matches conservator workshop' },
    { id: 'clue_3', title: 'Security Glitch', description: 'Video loops at 11:42 PM', relevance: 'Disproves patrol' },
  ],
  hints: [
    'Think about who had a financial motive.',
    'Look at the timing of the alibis.',
    'Connect the museum and the warehouse.',
  ],
  discoveredClueIds: [],
  usedHintCount: 0,
  solution: {
    culpritSuspectId: 'suspect_4',
    explanation: 'Daniel Brooks used his restoration tools to cut the glass.',
    reasoningClueIds: ['clue_1', 'clue_2'],
  },
};

memoryDb.set(mockSeedCase._id, JSON.parse(JSON.stringify(mockSeedCase)));

// Routes
testApp.get('/api/cases/:id', (req, res) => {
  const caseDoc = memoryDb.get(req.params.id);
  if (!caseDoc) return res.status(404).json({ error: { code: 'CASE_NOT_FOUND', message: 'Not found' } });
  res.status(200).json(sanitizeCaseForPlayer(caseDoc));
});

testApp.post('/api/cases/:id/clues/:clueId/discover', (req, res) => {
  const caseDoc = memoryDb.get(req.params.id);
  if (!caseDoc) return res.status(404).json({ error: { code: 'CASE_NOT_FOUND' } });
  if (caseDoc.status === 'completed') return res.status(409).json({ error: { code: 'CASE_ALREADY_COMPLETED' } });

  const targetClue = caseDoc.clues.find((c) => c.id === req.params.clueId);
  if (!targetClue) return res.status(404).json({ error: { code: 'CLUE_NOT_FOUND' } });

  const alreadyDiscovered = caseDoc.discoveredClueIds.includes(req.params.clueId);
  if (!alreadyDiscovered) caseDoc.discoveredClueIds.push(req.params.clueId);

  res.status(200).json({
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
  });
});

testApp.post('/api/cases/:id/hints', (req, res) => {
  const caseDoc = memoryDb.get(req.params.id);
  if (!caseDoc) return res.status(404).json({ error: { code: 'CASE_NOT_FOUND' } });
  if (caseDoc.status === 'completed') return res.status(409).json({ error: { code: 'CASE_ALREADY_COMPLETED' } });

  if (caseDoc.usedHintCount >= caseDoc.hints.length) {
    return res.status(409).json({ error: { code: 'NO_HINTS_REMAINING' } });
  }

  const idx = caseDoc.usedHintCount;
  const text = caseDoc.hints[idx];
  caseDoc.usedHintCount += 1;

  res.status(200).json({
    hint: { id: `hint_${idx + 1}`, number: idx + 1, text },
    hintsProgress: {
      used: caseDoc.usedHintCount,
      total: caseDoc.hints.length,
      remaining: caseDoc.hints.length - caseDoc.usedHintCount,
    },
    penaltyIncurred: 10,
  });
});

testApp.post('/api/cases/:id/accuse', (req, res) => {
  const caseDoc = memoryDb.get(req.params.id);
  if (!caseDoc) return res.status(404).json({ error: { code: 'CASE_NOT_FOUND' } });
  if (caseDoc.status === 'completed') return res.status(409).json({ error: { code: 'CASE_ALREADY_COMPLETED' } });

  const { suspectId, reasoning = '' } = req.body;
  const accused = caseDoc.suspects.find((s) => s.id === suspectId);
  if (!accused) return res.status(400).json({ error: { code: 'INVALID_SUSPECT' } });

  const isCorrect = suspectId === caseDoc.solution.culpritSuspectId;
  const scoreBreakdown = calculateScoreBreakdown({
    difficulty: caseDoc.difficulty,
    isCorrect,
    discoveredCluesCount: caseDoc.discoveredClueIds.length,
    hintsUsedCount: caseDoc.usedHintCount,
  });

  caseDoc.status = 'completed';
  caseDoc.accusedSuspectId = suspectId;
  caseDoc.accusationReasoning = reasoning;
  caseDoc.isCorrect = isCorrect;
  caseDoc.score = scoreBreakdown.finalScore;
  caseDoc.completedAt = new Date().toISOString();

  const culprit = caseDoc.suspects.find((s) => s.id === caseDoc.solution.culpritSuspectId);

  res.status(200).json({
    caseId: caseDoc._id,
    status: 'completed',
    isCorrect,
    accusedSuspect: { id: accused.id, name: accused.name, role: accused.role },
    culprit: { id: culprit.id, name: culprit.name, role: culprit.role },
    explanation: caseDoc.solution.explanation,
    score: scoreBreakdown.finalScore,
    scoreBreakdown,
  });
});

testApp.get('/api/cases/:id/result', (req, res) => {
  const caseDoc = memoryDb.get(req.params.id);
  if (!caseDoc) return res.status(404).json({ error: { code: 'CASE_NOT_FOUND' } });
  if (caseDoc.status !== 'completed') {
    return res.status(409).json({ error: { code: 'CASE_STILL_ACTIVE', message: 'Case still active' } });
  }

  const accused = caseDoc.suspects.find((s) => s.id === caseDoc.accusedSuspectId);
  const culprit = caseDoc.suspects.find((s) => s.id === caseDoc.solution.culpritSuspectId);
  const scoreBreakdown = calculateScoreBreakdown({
    difficulty: caseDoc.difficulty,
    isCorrect: caseDoc.isCorrect,
    discoveredCluesCount: caseDoc.discoveredClueIds.length,
    hintsUsedCount: caseDoc.usedHintCount,
  });

  res.status(200).json({
    caseId: caseDoc._id,
    status: 'completed',
    isCorrect: caseDoc.isCorrect,
    accusedSuspect: accused ? { id: accused.id, name: accused.name, role: accused.role } : null,
    culprit: { id: culprit.id, name: culprit.name, role: culprit.role },
    explanation: caseDoc.solution.explanation,
    score: caseDoc.score,
    scoreBreakdown,
  });
});

// Run server and execute all test steps
const server = http.createServer(testApp);
server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  const caseId = mockSeedCase._id;

  try {
    // Step 1: GET /api/cases/:id (Active Case)
    console.log('1. Testing active case retrieval & solution secrecy...');
    const getActive = await (await fetch(`${baseUrl}/api/cases/${caseId}`)).json();
    assert.strictEqual(getActive.status, 'active');
    assert.strictEqual(getActive.solution, undefined, 'Solution must be hidden on active case');
    assert.strictEqual(getActive.clues[0].description, undefined, 'Undiscovered clue description must be hidden');
    assert.strictEqual(getActive.hints.length, 0, 'No hints revealed yet');
    console.log('✓ Active case retrieved safely without data leaks.');

    // Step 2: Prevent early result access
    console.log('2. Testing result endpoint block on active case...');
    const earlyResultRes = await fetch(`${baseUrl}/api/cases/${caseId}/result`);
    assert.strictEqual(earlyResultRes.status, 409, 'Early result access must return 409');
    console.log('✓ Result access blocked while case is active.');

    // Step 3: Discover clue_1 (First time -> +5 points)
    console.log('3. Testing clue discovery...');
    const disc1 = await (await fetch(`${baseUrl}/api/cases/${caseId}/clues/clue_1/discover`, { method: 'POST' })).json();
    assert.strictEqual(disc1.pointsEarned, 5);
    assert.strictEqual(disc1.clue.alreadyDiscovered, false);
    assert.strictEqual(disc1.clue.description, 'Meet me at the old warehouse - D');
    console.log('✓ Clue 1 discovered: description revealed, +5 points awarded.');

    // Step 4: Duplicate clue discovery (Second time -> 0 points)
    console.log('4. Testing duplicate clue discovery idempotency...');
    const disc1Repeat = await (await fetch(`${baseUrl}/api/cases/${caseId}/clues/clue_1/discover`, { method: 'POST' })).json();
    assert.strictEqual(disc1Repeat.pointsEarned, 0, 'Duplicate discovery must award 0 points');
    assert.strictEqual(disc1Repeat.clue.alreadyDiscovered, true);
    console.log('✓ Duplicate discovery safely handled: 0 points awarded.');

    // Step 5: Request Hint 1
    console.log('5. Testing hint request...');
    const hint1 = await (await fetch(`${baseUrl}/api/cases/${caseId}/hints`, { method: 'POST' })).json();
    assert.strictEqual(hint1.hint.number, 1);
    assert.strictEqual(hint1.hint.text, 'Think about who had a financial motive.');
    assert.strictEqual(hint1.hintsProgress.used, 1);
    assert.strictEqual(hint1.hintsProgress.remaining, 2);
    console.log('✓ Hint 1 revealed with progress updated.');

    // Step 6: Accuse suspect (Daniel Brooks - suspect_4 -> Correct!)
    console.log('6. Submitting accusation...');
    const accuseRes = await (await fetch(`${baseUrl}/api/cases/${caseId}/accuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suspectId: 'suspect_4',
        reasoning: 'Torn note handwriting points to Daniel Brooks.',
      }),
    })).json();

    assert.strictEqual(accuseRes.status, 'completed');
    assert.strictEqual(accuseRes.isCorrect, true);
    assert.strictEqual(accuseRes.culprit.id, 'suspect_4');
    // Medium difficulty: 150 base + (1 clue * 5 = 5) - (1 hint * 10 = 10) = 145 points
    assert.strictEqual(accuseRes.score, 145);
    assert.strictEqual(accuseRes.scoreBreakdown.finalScore, 145);
    console.log('✓ Accusation processed: Correct verdict! Final score: 145.');

    // Step 7: Post-completion lock
    console.log('7. Verifying completed-case action locks...');
    const postDisc = await fetch(`${baseUrl}/api/cases/${caseId}/clues/clue_2/discover`, { method: 'POST' });
    assert.strictEqual(postDisc.status, 409, 'Discovery after completion must return 409');
    const postHint = await fetch(`${baseUrl}/api/cases/${caseId}/hints`, { method: 'POST' });
    assert.strictEqual(postHint.status, 409, 'Hint after completion must return 409');
    const postAccuse = await fetch(`${baseUrl}/api/cases/${caseId}/accuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspectId: 'suspect_1' }),
    });
    assert.strictEqual(postAccuse.status, 409, 'Re-accusation must return 409');
    console.log('✓ Completed case is fully immutable.');

    // Step 8: GET /api/cases/:id/result (Completed Case)
    console.log('8. Testing completed case results retrieval (Page Refresh Simulation)...');
    const resultRes = await (await fetch(`${baseUrl}/api/cases/${caseId}/result`)).json();
    assert.strictEqual(resultRes.status, 'completed');
    assert.strictEqual(resultRes.isCorrect, true);
    assert.strictEqual(resultRes.culprit.name, 'Daniel Brooks');
    assert.strictEqual(resultRes.score, 145);
    assert.strictEqual(resultRes.explanation, 'Daniel Brooks used his restoration tools to cut the glass.');
    console.log('✓ Result retrieved with complete breakdown and persists across refreshes.');

    console.log('--- ALL E2E USER FLOW TESTS PASSED WITH 100% SUCCESS ---');
  } catch (err) {
    console.error('E2E test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

