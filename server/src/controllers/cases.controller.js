import {
  createCaseRequestSchema,
  caseIdParamSchema,
  discoverClueParamSchema,
  accuseRequestSchema,
} from '../validators/case.schemas.js';
import * as caseService from '../services/case.service.js';
import { HttpError } from '../utils/http-error.js';

export async function createCaseHandler(req, res, next) {
  try {
    const parseResult = createCaseRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const message = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new HttpError(400, message, 'VALIDATION_ERROR');
    }

    const createdCase = await caseService.createCase(parseResult.data);
    res.status(201).json(createdCase);
  } catch (error) {
    next(error);
  }
}

export async function getCaseHandler(req, res, next) {
  try {
    const paramResult = caseIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      throw new HttpError(400, 'Invalid Case ID parameter', 'VALIDATION_ERROR');
    }

    const foundCase = await caseService.getCaseById(paramResult.data.id);
    res.status(200).json(foundCase);
  } catch (error) {
    next(error);
  }
}

export async function discoverClueHandler(req, res, next) {
  try {
    const paramResult = discoverClueParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      const message = paramResult.error.issues.map((i) => i.message).join(', ');
      throw new HttpError(400, message, 'VALIDATION_ERROR');
    }

    const result = await caseService.discoverClue(
      paramResult.data.id,
      paramResult.data.clueId
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function useHintHandler(req, res, next) {
  try {
    const paramResult = caseIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      throw new HttpError(400, 'Invalid Case ID parameter', 'VALIDATION_ERROR');
    }

    const result = await caseService.useHint(paramResult.data.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function accuseHandler(req, res, next) {
  try {
    const paramResult = caseIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      throw new HttpError(400, 'Invalid Case ID parameter', 'VALIDATION_ERROR');
    }

    const bodyResult = accuseRequestSchema.safeParse(req.body);
    if (!bodyResult.success) {
      const message = bodyResult.error.issues.map((i) => i.message).join(', ');
      throw new HttpError(400, message, 'VALIDATION_ERROR');
    }

    const result = await caseService.submitAccusation(
      paramResult.data.id,
      bodyResult.data
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCaseResultHandler(req, res, next) {
  try {
    const paramResult = caseIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      throw new HttpError(400, 'Invalid Case ID parameter', 'VALIDATION_ERROR');
    }

    const result = await caseService.getCaseResult(paramResult.data.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
