/**
 * Difficulty presets and UI metadata conforming to SPEC.md Section 13.1
 */

export const DIFFICULTY_PRESETS = {
  easy: {
    key: 'easy',
    name: 'Easy',
    suspectCount: 3,
    clueCount: 5,
    hintCount: 2,
    basePoints: 100,
    description: 'Suitable for beginners with fewer suspects and straightforward clues.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: 'emerald',
  },
  medium: {
    key: 'medium',
    name: 'Medium',
    suspectCount: 4,
    clueCount: 7,
    hintCount: 3,
    basePoints: 150,
    description: 'Balanced challenge requiring careful analysis of motives and alibis.',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: 'blue',
  },
  hard: {
    key: 'hard',
    name: 'Hard',
    suspectCount: 5,
    clueCount: 9,
    hintCount: 3,
    basePoints: 200,
    description: 'Complex mystery with red herrings and intricate timelines.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: 'purple',
  },
};

