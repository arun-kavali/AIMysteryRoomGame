# AI Mystery Room 🔍

**Think • Investigate • Solve**

An interactive, AI-powered mystery investigation game built for a college workshop using Spec-Driven Development (SDD). Players examine suspects, uncover clues, evaluate alibis and motives, request strategic hints, identify culprits, and earn investigation scores.

---

## 🚀 Implementation Status

### Phase 1: Frontend Foundation & Design System (Complete ✅)
- **Frontend Stack**: React 18, Vite, Tailwind CSS, React Router DOM v6, Axios.
- **Design System**: Strict alignment with visual mockups and specification tokens (`#F5F8FC` background, `#1769F5` primary blue, `#12264A` navy headings, `#DCE5F1` borders, 16px card radius).
- **8 Responsive Pages & Views**:
  - `/`: Home Page (hero banner with detective art, 4 feature cards, 4-step workflow, CTAs)
  - `/create`: Create Mystery (premise input, 500-char validation, Easy/Medium/Hard difficulty cards, loading/error states)
  - `/case/:caseId`: Investigation Room (suspects grid, clues list, hints tracker, live progress bar and score tally)
  - `/case/:caseId/clues/:clueId`: Clue Details (evidence photo banner, excerpt note, forensic metadata, mark-as-found action)
  - `/case/:caseId/hints`: Hints (sequential unlocks, 10-point penalty warning, locked badges)
  - `/case/:caseId/accuse`: Accusation (suspect selector, optional 200-char reasoning input, modal confirmation dialog)
  - `/case/:caseId/result`: Final Results (verdict celebration/failure, culprit card, score breakdown table, case explanation)
  - `*`: 404 Case File Not Found

### Phase 2: Backend, Database & Secure Gemini AI Integration (Complete ✅)
- **Backend Stack**: Node.js, Express.js, MongoDB + Mongoose, `@google/genai` (v2.31.0), Zod, Dotenv, Cors, Nodemon.
- **Architecture**: Modular separation (Config, Models, Validators, Services, Controllers, Routes, Middleware, Utils).
- **Endpoints**: `GET /api/health`, `POST /api/cases`, `GET /api/cases/:id`.
- **Quality & Secrecy**: Zod validation, solution stripping on active cases, model verification (`gemini-2.5-flash`).

### Phase 3: Game Mechanics, Scoring & Accusation Lifecycle (Complete ✅)
- **Game Lifecycle Endpoints**:
  - `POST /api/cases/:id/clues/:clueId/discover`: Validates case/clue, reveals clue description, prevents duplicate scoring (+5 pts on first discovery, 0 pts thereafter), rejects completed cases.
  - `POST /api/cases/:id/hints`: Reveals sequential hint without spoiling solution, tracks used hints, enforces hint allowance, rejects completed cases.
  - `POST /api/cases/:id/accuse`: Validates suspect & reasoning (max 200 chars), evaluates guilt against hidden server solution, locks case status to `completed`, prevents subsequent alterations.
  - `GET /api/cases/:id/result`: Returns authoritative verdict, culprit reveal, and transparent score breakdown; blocks active cases with `409 CASE_STILL_ACTIVE` to prevent premature leaks.
- **Server-Authoritative Scoring Engine**:
  - Easy: 100 base points | Medium: 150 base points | Hard: 200 base points.
  - Clues: +5 points for each unique clue discovered.
  - Hints: -10 points for each hint revealed.
  - Score Floor: Minimum of zero (score is never negative).

### Phase 4: Full Frontend-Backend API Integration (Complete ✅)
- **Centralized API Client**:
  - Configured in `client/src/api/http.js` reading `VITE_API_BASE_URL` with 45s timeout for AI generation.
  - Dedicated API service in `client/src/api/cases.api.js` wrapping all endpoints.
- **End-to-End Connected User Flows**:
  - **Create Mystery**: Connected to `POST /api/cases`. Displays AI generation loading state, handles errors cleanly with form preservation, navigates to `/case/:id`.
  - **Investigation Room**: Connected to `GET /api/cases/:id`. Displays authoritative progress, clues, and suspects.
  - **Clue Discovery**: Connected to `POST /api/cases/:id/clues/:clueId/discover`. Reveals forensic description, awards 5 points, and refreshes tally.
  - **Hint Requests**: Connected to `POST /api/cases/:id/hints`. Reveals sequential hint with 10-point penalty tracking and allowance limits.
  - **Accusation**: Connected to `POST /api/cases/:id/accuse`. Confirmation modal, server-authoritative verdict computation, completed state lock.
  - **Results**: Connected to `GET /api/cases/:id/result`. Shows verdict banner, true culprit, and transparent score breakdown. Persists across browser refreshes.
- **Zero Fake Fallbacks**: Live user flows communicate exclusively with backend API; development fixtures are strictly separated.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended, verified on v22.14.0)
- npm (v10+)
- MongoDB Atlas cluster or local MongoDB instance (for persistence)
- Google Gemini API key (for AI mystery generation)

---

### Backend Setup (`server/`)

1. Copy the example environment file:
```bash
cd server
cp .env.example .env
```

2. Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai_mystery_room
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```

3. Start backend:
```bash
npm run dev
# Server listens at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

4. Run backend tests:
```bash
npm test
```

---

### Frontend Setup (`client/`)

1. Configure environment in `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

2. Start frontend development server:
```bash
npm run dev
# Accessible at http://localhost:5173
```

3. Run production build:
```bash
npm run build
```

---

## 📁 Repository Structure

```
AIInvestigationRoom/
├── spec.md                     # Main functional requirements specification
├── README.md                   # Project documentation & phase tracking
├── package.json                # Root convenience scripts
├── .gitignore                  # Git ignore rules protecting secrets
├── client/                     # Frontend React application (Phases 1 & 4)
│   ├── .env.example            # VITE_API_BASE_URL=http://localhost:5000
│   ├── index.html              # HTML shell & font definitions
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Custom theme colors, borders, and shadows
│   ├── package.json            # Client dependencies and build scripts
│   └── src/
│       ├── main.jsx            # React root & BrowserRouter
│       ├── App.jsx             # Top-level shell with AppLayout
│       ├── api/                # Centralized Axios client & API methods
│       │   ├── http.js         # Axios instance with interceptors
│       │   └── cases.api.js    # Case API service calls
│       ├── components/         # Navbar, Footer, Buttons, Cards, Badges, Modals
│       ├── constants/          # Difficulty metadata & specifications
│       ├── pages/              # 8 full application page views
│       ├── routes/             # AppRoutes mapping
│       └── styles/             # Tailwind directives & typography
└── server/                     # Backend API service (Phases 2 & 3)
    ├── .env.example            # Environment variables template
    ├── package.json            # Server dependencies & scripts
    ├── src/
    │   ├── app.js              # Express app configuration & middleware
    │   ├── server.js           # Server bootstrap & database initializer
    │   ├── config/             # env.js & database.js
    │   ├── controllers/        # cases.controller.js
    │   ├── middleware/         # error-handler.js & not-found.js
    │   ├── models/             # Mongoose Case model
    │   ├── routes/             # health.routes.js & cases.routes.js
    │   ├── services/           # gemini.service.js, case.service.js, scoring.service.js
    │   ├── utils/              # public-case.js & http-error.js
    │   └── validators/         # case.schemas.js & ai.schemas.js
    └── test/                   # Verification test suite
        ├── verify-phase2.js    # Unit & logic validation tests
        ├── verify-phase3.js    # Gameplay, scoring & security tests
        ├── e2e-integration.js  # Full E2E user flow tests
        └── probe-api.js        # Live API HTTP probe tests
```
