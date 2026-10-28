import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import CreateMysteryPage from '../pages/CreateMysteryPage';
import InvestigationPage from '../pages/InvestigationPage';
import ClueDetailsPage from '../pages/ClueDetailsPage';
import HintsPage from '../pages/HintsPage';
import AccusationPage from '../pages/AccusationPage';
import ResultsPage from '../pages/ResultsPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreateMysteryPage />} />
      <Route path="/case/:caseId" element={<InvestigationPage />} />
      <Route path="/case/:caseId/clues/:clueId" element={<ClueDetailsPage />} />
      <Route path="/case/:caseId/hints" element={<HintsPage />} />
      <Route path="/case/:caseId/accuse" element={<AccusationPage />} />
      <Route path="/case/:caseId/result" element={<ResultsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

