import { Router } from 'express';
import {
  createCaseHandler,
  getCaseHandler,
  discoverClueHandler,
  useHintHandler,
  accuseHandler,
  getCaseResultHandler,
} from '../controllers/cases.controller.js';

const router = Router();

// Case Lifecycle Endpoints matching SPEC.md Section 15
router.post('/cases', createCaseHandler);
router.get('/cases/:id', getCaseHandler);
router.post('/cases/:id/clues/:clueId/discover', discoverClueHandler);
router.post('/cases/:id/hints', useHintHandler);
router.post('/cases/:id/accuse', accuseHandler);
router.get('/cases/:id/result', getCaseResultHandler);

export default router;
