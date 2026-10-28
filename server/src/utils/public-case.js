/**
 * Sanitizes a Case document into a safe public payload.
 * Crucial Security Boundary:
 * - When case status is 'active', the hidden solution and culprit are strictly stripped.
 * - Undiscovered clues have their descriptions withheld.
 * - Unused hints have their text withheld.
 */

export function sanitizeCaseForPlayer(caseDoc) {
  const caseObj = caseDoc.toObject ? caseDoc.toObject() : caseDoc;
  const isCompleted = caseObj.status === 'completed';

  const discoveredSet = new Set(caseObj.discoveredClueIds || []);

  // Sanitize clues: withhold description for undiscovered clues
  const publicClues = (caseObj.clues || []).map((clue, index) => {
    const isDiscovered = discoveredSet.has(clue.id);
    return {
      id: clue.id,
      clueNumber: index + 1,
      title: clue.title,
      discovered: isDiscovered,
      // Only include description and relevance if already discovered
      ...(isDiscovered ? { description: clue.description, relevance: clue.relevance } : {}),
    };
  });

  // Sanitize hints: only return hint strings that have actually been revealed
  const totalHints = (caseObj.hints || []).length;
  const usedCount = Math.min(caseObj.usedHintCount || 0, totalHints);
  const revealedHints = (caseObj.hints || []).slice(0, usedCount).map((text, idx) => ({
    id: `hint_${idx + 1}`,
    number: idx + 1,
    text,
    unlocked: true,
  }));

  const publicData = {
    id: caseObj._id?.toString() || caseObj.id,
    title: caseObj.title,
    premise: caseObj.premise,
    story: caseObj.story,
    difficulty: caseObj.difficulty,
    status: caseObj.status,
    suspects: (caseObj.suspects || []).map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      description: s.description,
      motive: s.motive,
      alibi: s.alibi,
    })),
    clues: publicClues,
    discoveredClueIds: Array.from(discoveredSet),
    hints: revealedHints,
    hintsProgress: {
      used: usedCount,
      total: totalHints,
      remaining: Math.max(0, totalHints - usedCount),
    },
    cluesProgress: {
      discovered: discoveredSet.size,
      total: publicClues.length,
    },
    createdAt: caseObj.createdAt,
    updatedAt: caseObj.updatedAt,
  };

  // If case is completed, player is allowed to see the final verdict and explanation
  if (isCompleted) {
    publicData.completedAt = caseObj.completedAt;
    publicData.accusedSuspectId = caseObj.accusedSuspectId;
    publicData.accusationReasoning = caseObj.accusationReasoning;
    publicData.isCorrect = caseObj.isCorrect;
    publicData.score = caseObj.score;
    publicData.solution = {
      culpritSuspectId: caseObj.solution?.culpritSuspectId,
      explanation: caseObj.solution?.explanation,
      reasoningClueIds: caseObj.solution?.reasoningClueIds,
    };
  }

  return publicData;
}

