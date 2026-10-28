import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { DIFFICULTY_SPECS, validateAiMystery } from '../validators/ai.schemas.js';
import { HttpError } from '../utils/http-error.js';

/**
 * Builds the structured prompt instructing Gemini to craft a consistent mystery.
 */
function buildMysteryPrompt(premise, difficulty) {
  const spec = DIFFICULTY_SPECS[difficulty];

  return `You are an expert mystery author and detective game designer for an interactive investigation room.
Generate a solvable, original, and logically coherent fictional mystery case.

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
MANDATORY COUNTS:
- Exactly ${spec.suspectCount} suspects.
- Exactly ${spec.clueCount} clues.
- Exactly ${spec.hintCount} hints.

${premise ? `USER PREMISE: "${premise}"` : 'PREMISE: Invent a fresh, engaging mystery scenario (e.g. theft of a rare item, museum heist, locked-room puzzle, or sabotage).'}

GAME DESIGN RULES:
1. One Intended Culprit: Exactly ONE suspect among the ${spec.suspectCount} suspects must be the guilty culprit.
2. Solvability & Consistency: The mystery MUST be solvable using the provided clues. Suspect alibis, motives, and physical/digital clues must fit together logically without contradiction.
3. Reasonable Red Herrings: Innocent suspects must have believable alibis or motives, but clues must conclusively point to the single culprit.
4. Clues: Each clue must have a title, forensic/investigative description, and relevance note.
5. Hints: Progressive hints that gently guide player reasoning (e.g. noticing timeline gaps or motive alignment) WITHOUT directly naming the culprit.
6. Unique IDs:
   - Suspects must use ids: "suspect_1", "suspect_2", etc.
   - Clues must use ids: "clue_1", "clue_2", etc.
7. Solution: Must specify culpritSuspectId (matching one suspect ID), an evidence-based explanation detailing how the clues solve the case, and reasoningClueIds (array of clue IDs that substantiate the verdict).

OUTPUT FORMAT:
Return pure JSON conforming to this structure:
{
  "title": "Title of the Mystery Case",
  "story": "The complete narrative of the crime/incident, setting the scene for the detective.",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full Name",
      "role": "Occupation or Role",
      "description": "Short background bio",
      "motive": "Stated or uncovered motive",
      "alibi": "Claimed whereabouts at time of incident"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "Evidence Name",
      "description": "Detailed forensic finding revealed upon discovery",
      "relevance": "How this relates to the crime"
    }
  ],
  "hints": [
    "Subtle guidance 1..."
  ],
  "solution": {
    "culpritSuspectId": "suspect_1",
    "explanation": "Clear explanation connecting the clues and disproving the culprit's alibi...",
    "reasoningClueIds": ["clue_1", "clue_2"]
  }
}`;
}

/**
 * Generates an original mystery using the official @google/genai SDK.
 */
export async function generateMysteryWithGemini({ premise = '', difficulty = 'medium' }) {
  if (!env.GEMINI_API_KEY) {
    throw new HttpError(
      503,
      'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in server/.env',
      'AI_SERVICE_UNCONFIGURED'
    );
  }

  const spec = DIFFICULTY_SPECS[difficulty];
  if (!spec) {
    throw new HttpError(400, `Invalid difficulty level: ${difficulty}`, 'INVALID_DIFFICULTY');
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const prompt = buildMysteryPrompt(premise, difficulty);

  let rawText = '';
  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    rawText = response.text || '';
  } catch (apiError) {
    console.error('[Gemini Service] API error:', apiError);
    throw new HttpError(
      502,
      `AI generation service failed: ${apiError.message || 'Unable to contact Gemini'}`,
      'AI_PROVIDER_ERROR'
    );
  }

  // Parse JSON
  let parsedJson;
  try {
    // Strip optional markdown code fences if model enclosed JSON
    const cleanText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    parsedJson = JSON.parse(cleanText);
  } catch (parseError) {
    console.error('[Gemini Service] Failed to parse JSON response:', rawText);
    throw new HttpError(
      502,
      'AI provider returned an invalid response format. Please try again.',
      'AI_MALFORMED_OUTPUT'
    );
  }

  // Validate structured output
  const validation = validateAiMystery(parsedJson, difficulty);
  if (!validation.isValid) {
    console.error('[Gemini Service] Output validation failed:', validation.error);
    throw new HttpError(
      502,
      `Generated case failed quality validation: ${validation.error}`,
      'AI_VALIDATION_ERROR'
    );
  }

  return validation.data;
}

