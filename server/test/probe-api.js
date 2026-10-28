import assert from 'assert';
import http from 'http';
import app from '../src/app.js';

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Probe server listening on ephemeral port ${port}`);

  try {
    // 1. Test GET /api/health
    console.log('Testing GET /api/health...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    console.log('✓ GET /api/health returned 200 OK');

    // 2. Test POST /api/cases/:id/clues/:clueId/discover with malformed caseId
    console.log('Testing POST /api/cases/:id/clues/:clueId/discover with malformed case ID...');
    const invalidClueRes = await fetch(`${baseUrl}/api/cases/invalid_id/clues/clue_1/discover`, {
      method: 'POST',
    });
    assert.strictEqual(invalidClueRes.status, 400);
    const invalidClueData = await invalidClueRes.json();
    assert.strictEqual(invalidClueData.error.code, 'INVALID_CASE_ID');
    console.log('✓ Clue discovery rejected malformed case ID with 400');

    // 3. Test POST /api/cases/:id/hints with malformed caseId
    console.log('Testing POST /api/cases/:id/hints with malformed case ID...');
    const invalidHintRes = await fetch(`${baseUrl}/api/cases/invalid_id/hints`, {
      method: 'POST',
    });
    assert.strictEqual(invalidHintRes.status, 400);
    const invalidHintData = await invalidHintRes.json();
    assert.strictEqual(invalidHintData.error.code, 'INVALID_CASE_ID');
    console.log('✓ Hint request rejected malformed case ID with 400');

    // 4. Test POST /api/cases/:id/accuse with malformed caseId
    console.log('Testing POST /api/cases/:id/accuse with malformed case ID...');
    const invalidAccuseRes = await fetch(`${baseUrl}/api/cases/invalid_id/accuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspectId: 'suspect_1' }),
    });
    assert.strictEqual(invalidAccuseRes.status, 400);
    const invalidAccuseData = await invalidAccuseRes.json();
    assert.strictEqual(invalidAccuseData.error.code, 'INVALID_CASE_ID');
    console.log('✓ Accusation rejected malformed case ID with 400');

    // 5. Test POST /api/cases/:id/accuse with missing suspectId
    console.log('Testing POST /api/cases/:id/accuse with missing suspect ID...');
    const missingSuspectRes = await fetch(`${baseUrl}/api/cases/507f1f77bcf86cd799439011/accuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reasoning: 'Missing suspect' }),
    });
    assert.strictEqual(missingSuspectRes.status, 400);
    const missingSuspectData = await missingSuspectRes.json();
    assert.strictEqual(missingSuspectData.error.code, 'VALIDATION_ERROR');
    console.log('✓ Accusation rejected missing suspect with 400 VALIDATION_ERROR');

    // 6. Test POST /api/cases/:id/accuse with reasoning > 200 chars
    console.log('Testing POST /api/cases/:id/accuse with reasoning > 200 chars...');
    const longReasoningRes = await fetch(`${baseUrl}/api/cases/507f1f77bcf86cd799439011/accuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspectId: 'suspect_1', reasoning: 'x'.repeat(201) }),
    });
    assert.strictEqual(longReasoningRes.status, 400);
    const longReasoningData = await longReasoningRes.json();
    assert.strictEqual(longReasoningData.error.code, 'VALIDATION_ERROR');
    console.log('✓ Accusation rejected reasoning > 200 chars with 400 VALIDATION_ERROR');

    // 7. Test GET /api/cases/:id/result with malformed caseId
    console.log('Testing GET /api/cases/:id/result with malformed case ID...');
    const invalidResultRes = await fetch(`${baseUrl}/api/cases/invalid_id/result`);
    assert.strictEqual(invalidResultRes.status, 400);
    const invalidResultData = await invalidResultRes.json();
    assert.strictEqual(invalidResultData.error.code, 'INVALID_CASE_ID');
    console.log('✓ Result endpoint rejected malformed case ID with 400');

    console.log('--- ALL PHASE 3 API PROBE TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Probe test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
