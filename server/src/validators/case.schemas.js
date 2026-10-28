import { z } from 'zod';

export const createCaseRequestSchema = z.object({
  premise: z
    .string()
    .trim()
    .max(500, { message: 'Premise cannot exceed 500 characters' })
    .optional()
    .default(''),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard' }),
  }),
});

export const caseIdParamSchema = z.object({
  id: z.string().min(1, { message: 'Case ID is required' }),
});

export const discoverClueParamSchema = z.object({
  id: z.string().min(1, { message: 'Case ID is required' }),
  clueId: z.string().min(1, { message: 'Clue ID is required' }),
});

export const accuseRequestSchema = z.object({
  suspectId: z.string().min(1, { message: 'Suspect ID is required for accusation' }),
  reasoning: z
    .string()
    .trim()
    .max(200, { message: 'Reasoning cannot exceed 200 characters' })
    .optional()
    .default(''),
});
