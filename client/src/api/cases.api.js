import http from './http';

/**
 * Real API integration layer for AI Mystery Room.
 * Communicates with the Express backend endpoints according to SPEC.md Section 15.
 */

export const getHealth = () => http.get('/api/health');

export const createCase = ({ premise, difficulty }) =>
  http.post('/api/cases', { premise, difficulty });

export const getCaseById = (caseId) =>
  http.get(`/api/cases/${caseId}`);

export const discoverClue = (caseId, clueId) =>
  http.post(`/api/cases/${caseId}/clues/${clueId}/discover`);

export const requestHint = (caseId) =>
  http.post(`/api/cases/${caseId}/hints`);

export const submitAccusation = (caseId, { suspectId, reasoning }) =>
  http.post(`/api/cases/${caseId}/accuse`, { suspectId, reasoning });

export const getCaseResult = (caseId) =>
  http.get(`/api/cases/${caseId}/result`);
