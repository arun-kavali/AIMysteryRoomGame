import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: '' },
    description: { type: String, required: true },
    motive: { type: String, required: true },
    alibi: { type: String, required: true },
  },
  { _id: false }
);

const clueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    relevance: { type: String, default: '' },
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    culpritSuspectId: { type: String, required: true },
    explanation: { type: String, required: true },
    reasoningClueIds: [{ type: String }],
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    premise: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    story: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
      lowercase: true,
    },
    suspects: {
      type: [suspectSchema],
      required: true,
    },
    clues: {
      type: [clueSchema],
      required: true,
    },
    hints: {
      type: [String],
      required: true,
    },
    solution: {
      type: solutionSchema,
      required: true,
    },
    discoveredClueIds: {
      type: [String],
      default: [],
    },
    usedHintCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    accusedSuspectId: {
      type: String,
      default: null,
    },
    accusationReasoning: {
      type: String,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: null,
    },
    score: {
      type: Number,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index on status and createdAt
caseSchema.index({ status: 1, createdAt: -1 });

export const Case = mongoose.model('Case', caseSchema);
export default Case;

