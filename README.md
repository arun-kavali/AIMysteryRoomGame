# 🕵️ AI Mystery Room

### Investigate. Connect the Clues. Uncover the Truth.

AI Mystery Room is an AI-powered mystery investigation web application where players investigate fictional cases, discover clues, request hints, evaluate suspects, and submit a final accusation. The application combines an interactive frontend, a Node.js backend, MongoDB persistence, and Google's Gemini AI to deliver a dynamic detective-style experience.

The objective is to solve the mystery by examining the available evidence, reasoning about the suspects, and making the correct accusation while managing a limited hint budget.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [How the Game Works](#-how-the-game-works)
- [Difficulty Levels](#-difficulty-levels)
- [Scoring System](#-scoring-system)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing and Verification](#-testing-and-verification)
- [Security Considerations](#-security-considerations)
- [Deployment Guide](#-deployment-guide)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 Project Overview

Traditional mystery games often follow fixed storylines and predetermined investigation paths. AI Mystery Room aims to provide an interactive investigation experience in which players collect evidence, interpret clues, request limited assistance, and make decisions that affect their final score.

The application follows a client-server architecture. The frontend provides the player interface, while the backend manages case creation, clue discovery, hint usage, accusation processing, scoring, and final results. MongoDB stores case data, and Gemini AI supports AI-generated mystery content.

### Project Objectives

- Create an interactive detective and mystery-solving experience.
- Generate mystery cases with different difficulty levels.
- Provide suspects, evidence, clues, and investigation hints.
- Implement server-side scoring and enforce gameplay rules.
- Persist investigation progress in a database.
- Protect the mystery solution until the case reaches the appropriate completion state.
- Provide a responsive web interface connected to a real backend API.
- Support deployment using modern cloud hosting platforms.

---

## ✨ Key Features

### 1. AI-Assisted Mystery Generation

The backend integrates Google's Gemini API through the official `@google/genai` SDK.

The AI integration supports the generation of mystery-case content, such as case narratives, suspects, evidence, clues, and related investigation information, according to the application's implemented generation logic.

### 2. Multiple Difficulty Levels

Players can investigate cases at Easy, Medium, or Hard difficulty. Each level defines the number of suspects, available clues, hint allowance, and base score.

### 3. Suspect Investigation

Players examine the available suspects and use the evidence collected during the investigation to determine who is responsible for the mystery.

### 4. Clue Discovery

Players reveal clues through the backend API. Unique clue discoveries award points, while repeated requests for an already-discovered clue must not award additional points.

### 5. Limited Hints

Players can request hints when they need assistance. Hints are limited according to the selected difficulty, and every accepted hint applies a score penalty.

### 6. Final Accusation

Players submit an accusation against a suspect. The backend evaluates the accusation, calculates the authoritative final score, and completes the case.

### 7. Server-Authoritative Scoring

Scoring is calculated and persisted on the backend. The frontend can display progress and estimates, but the server determines the final result.

### 8. Persistent Case Data

MongoDB Atlas stores case information, including investigation progress and completion information. Saved case data can remain available after a browser refresh, subject to the application's case retrieval and frontend state-restoration flow.

### 9. Result and Verdict

Once a case is completed, the result endpoint provides the final verdict and score information, including the culprit and explanation where returned by the backend.

### 10. Error Handling and State Protection

The backend enforces gameplay restrictions, including hint limits and restrictions on modifying completed cases. The frontend provides loading and error feedback for API operations.

---

## 🎮 How the Game Works

The general gameplay sequence is:

1. **Create a case:** Select a difficulty level and request a new mystery.
2. **Review the case:** Read the case description and examine the available suspects and investigation information.
3. **Discover clues:** Reveal evidence to develop a theory about what happened.
4. **Request hints:** Use the limited hint allowance if additional guidance is needed.
5. **Evaluate the evidence:** Compare clues and suspect information to identify the most likely culprit.
6. **Submit an accusation:** Select a suspect and submit the final decision.
7. **Receive the verdict:** The server evaluates the accusation and calculates the final score.
8. **Review the result:** Retrieve the completed case result and examine the outcome.

### Case State

Cases use an active investigation state and a completed state.

- **Active:** Investigation operations can be performed subject to the case rules.
- **Completed:** The final accusation has been processed. Further clue discovery, hint requests, and accusations are rejected by the backend.

The server protects the completed state so that the player cannot continue changing the case after submitting a final accusation.

---

## 🏆 Difficulty Levels

The configured gameplay rules are summarized below.

| Setting | Easy | Medium | Hard |
|---|---:|---:|---:|
| Suspects | 3 | 4 | 5 |
| Clues | 5 | 7 | 9 |
| Maximum hints | 2 | 3 | 3 |
| Base score | 100 | 150 | 200 |

These values describe the project's documented gameplay configuration.

---

## 🧮 Scoring System

The scoring system rewards evidence collection, penalizes hint usage, and awards base points for a correct final accusation.

### Scoring Rules

| Action or outcome | Score effect |
|---|---:|
| Discover a unique clue | +5 points |
| Request an accepted hint | -10 points |
| Correct final accusation | Earn the difficulty's base score |
| Incorrect final accusation | 0 base points |
| Duplicate clue discovery | 0 additional points |
| Final score below zero | Floor at 0 points |

### Final Score Formula

For a correct accusation:

`Final Score = max(0, Base Score + Clue Points - Hint Penalty)`

Where:

- **Base Score:** The score associated with the selected difficulty.
- **Clue Points:** 5 points for each unique clue discovered.
- **Hint Penalty:** 10 points for each accepted hint.

For an incorrect accusation, no base score is awarded, but already-earned clue points are preserved, subject to the hint penalty and the minimum score of zero.

### Example

Suppose a player selects Easy difficulty, discovers four unique clues, uses one hint, and correctly identifies the culprit.

- Base score: 100
- Clue points: 4 × 5 = 20
- Hint penalty: 1 × 10 = 10

**Final score = 100 + 20 − 10 = 110 points.**

The backend calculates and stores the authoritative score. Repeated clue-discovery requests must not award duplicate points, and hints cannot exceed the case's configured allowance.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development server and production build |
| Tailwind CSS | Utility-first styling |
| JavaScript | Application logic |
| Node.js | Backend JavaScript runtime |
| Express.js | REST API and server routing |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling and persistence |
| Google Gemini API | AI-assisted mystery content generation |
| `@google/genai` | Official Google GenAI JavaScript SDK |
| Git and GitHub | Version control and source-code hosting |
| Vercel | Intended frontend deployment platform |
| Render or another Node-compatible host | Intended backend deployment platform |

---

## 🏗️ System Architecture

The application follows a client-server architecture.

```text
                    PLAYER
                      |
                      v
           React + Vite Frontend
            Tailwind CSS Interface
                      |
                      v
                 REST API
              Express.js Server
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      Case Logic   Scoring     Validation
          |           |           |
          +-----------+-----------+
                      |
          +-----------+-----------+
          |                       |
          v                       v
    MongoDB Atlas             Gemini API
    Case Persistence          AI Generation
```

### Frontend Responsibilities

- Display case information, suspects, clues, and investigation progress.
- Submit requests to the backend API.
- Display loading indicators and error messages.
- Present score information and the final verdict.
- Maintain the user interface in accordance with the case's current state.

### Backend Responsibilities

- Validate requests and manage case operations.
- Generate or obtain mystery content through the configured AI integration.
- Persist case and investigation information.
- Enforce clue-discovery and hint limits.
- Process final accusations.
- Calculate and save the final score.
- Prevent mutations after case completion.
- Control when the final solution and verdict become available.

### Database Responsibilities

MongoDB Atlas stores application case data through Mongoose models. The backend uses the database to maintain case state and relevant investigation information.

### AI Integration Responsibilities

The Gemini API provides AI-generated content according to the application's server-side prompts and generation service. The backend remains responsible for enforcing game rules and controlling what information is returned to the player.

---

## 📂 Project Structure

The project is organized into a frontend client and a backend server. The following is a representative overview of the known application structure; individual filenames may vary with the repository's current implementation.

```text
AI-Mystery-Room/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── cases.api.js
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   └── cases.controller.js
│   │   ├── models/
│   │   │   └── Case.js
│   │   ├── routes/
│   │   │   ├── cases.routes.js
│   │   │   └── health.routes.js
│   │   ├── services/
│   │   │   ├── case.service.js
│   │   │   ├── scoring.service.js
│   │   │   └── ...
│   │   └── ...
│   ├── test/
│   │   ├── verify-phase2.js
│   │   ├── verify-phase3.js
│   │   ├── verify-phase5.js
│   │   └── verify-audit.js
│   ├── package.json
│   └── ...
│
├── spec.md
├── package.json
├── .gitignore
├── .env.example
├── vercel.json
└── README.md
```

**Note:** This is an overview of the known files and directories, not a guarantee that every listed file exists in every repository revision. Use the actual directory tree as the source of truth.

---

## ⚙️ Prerequisites

Install or prepare the following before running the project:

- Node.js 18 or later; the project has also been tested in the reported environment with Node.js 22.14.0.
- npm.
- A MongoDB Atlas cluster or another supported MongoDB deployment.
- A Google Gemini API key with access to the configured model.
- Git, if cloning the repository.
- A modern web browser.

Check the installed versions:

```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation and Setup

### 1. Clone the repository

Replace the example repository URL with your actual GitHub repository URL.

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
```

### 2. Install dependencies

Install the dependencies for the root, backend, and frontend according to the package manifests present in the repository.

For a project with separate package files:

```bash
npm install
```

Then install each application if it maintains its own dependencies:

```bash
cd server
npm install
cd ../client
npm install
cd ..
```

If the root project already manages workspaces or installs all dependencies, follow the scripts and package configuration in the root `package.json` rather than installing everything twice.

### 3. Configure the backend environment

Create `server/.env` using the existing `server/.env.example` as a reference.

**Important:** If you already have a working local `.env` file, preserve it. Do not overwrite valid database credentials or API keys.

Example environment configuration:

```dotenv
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

CLIENT_URL=http://localhost:5173
```

Replace the example values with your own credentials and the appropriate connection details.

The configured Gemini model is `gemini-3.8-flash`, based on the working model configuration established for this project. Model availability and access remain dependent on the Google API account.

### 4. Configure the frontend environment

Create `client/.env` if the frontend configuration requires it.

```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

The value should match the backend base URL expected by the API client. If the API client appends `/api` itself, do not include `/api` in the base URL; if it expects the full API prefix, configure it accordingly.

### 5. Start the backend

Open a terminal in the backend directory:

```bash
cd server
npm run dev
```

Use the actual development script defined in `server/package.json`. If the script has a different name, use that configured command.

The backend should start on the configured port and connect to MongoDB Atlas.

### 6. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Vite commonly serves the development frontend at:

`http://localhost:5173`

Open the URL printed in the terminal if Vite selects a different port.

### 7. Verify the backend

Send a request to:

```text
http://localhost:5000/api/health
```

A successful response is expected to resemble:

```json
{
  "status": "ok",
  "database": "connected"
}
```

The exact response format is determined by the implemented health route. A degraded or disconnected response indicates that database connectivity should be investigated.

---

## 🔐 Environment Variables

Never commit real environment files, passwords, database connection strings, or API keys to a public repository.

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Selects the backend environment, such as development or production |
| `PORT` | Port on which the backend listens; use the hosting provider's assigned port when required |
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API credential |
| `GEMINI_MODEL` | Gemini model identifier; configured locally as `gemini-3.8-flash` |
| `CLIENT_URL` | Allowed frontend origin used by backend CORS configuration |
| `VITE_API_BASE_URL` | Backend base URL used by the frontend API client |

Only variables actually read by the current source code need to be configured. Confirm optional settings against `server/src/config/env.js`, the frontend API client, and the relevant package configuration.

### Environment File Guidelines

- Keep `server/.env` and `client/.env` local.
- Track sanitized example files such as `.env.example`.
- Use hosting-provider environment settings for production secrets.
- Never place `GEMINI_API_KEY` in a `VITE_*` variable.
- Remember that frontend variables prefixed with `VITE_` are exposed to the browser bundle.
- If a secret is accidentally committed, revoke or rotate it; deleting it from the latest commit alone may not remove it from Git history.

---

## 🔌 API Documentation

The backend exposes REST endpoints for case creation, case retrieval, clue discovery, hints, accusations, and completed results.

The following routes describe the project's known API surface. Refer to `server/src/routes/cases.routes.js` and the associated controllers for exact request schemas and response fields.

### Base URL

Local development:

```text
http://localhost:5000
```

API prefix:

```text
/api
```

### 1. Health Check

**Endpoint:** `GET /api/health`

Checks backend availability and database connectivity.

Example:

```bash
curl http://localhost:5000/api/health
```

### 2. Create a Case

**Endpoint:** `POST /api/cases`

Creates a new mystery case at the requested difficulty.

Example request:

```json
{
  "difficulty": "easy"
}
```

Example command:

```bash
curl -X POST http://localhost:5000/api/cases \
  -H "Content-Type: application/json" \
  -d "{\"difficulty\":\"easy\"}"
```

The response should contain the created case information and its identifier.

### 3. Retrieve a Case

**Endpoint:** `GET /api/cases/:id`

Retrieves case information and current investigation progress.

Example:

```text
GET /api/cases/CASE_ID
```

The response may include the case status, suspects, available clue information, discovered-clue progress, and hint progress, depending on the implemented response schema.

The secret solution must not be exposed through ordinary active-case retrieval.

### 4. Discover a Clue

**Endpoint:** `POST /api/cases/:id/clues/:clueId/discover`

Requests discovery of a clue associated with a case.

Example:

```text
POST /api/cases/CASE_ID/clues/clue_1/discover
```

The backend records the discovery and awards clue points only for a unique discovery. Repeated requests must not award additional points.

### 5. Request a Hint

**Endpoint:** `POST /api/cases/:id/hints`

Requests the next available hint.

Example:

```text
POST /api/cases/CASE_ID/hints
```

A successful hint request applies the configured score penalty and consumes one hint from the allowance. Requests beyond the hint limit are rejected.

### 6. Submit a Final Accusation

**Endpoint:** `POST /api/cases/:id/accuse`

Submits the player's selected suspect as the final accusation.

Use the exact request field expected by the implemented controller and frontend API client; the precise field name should be checked in the source code.

The backend evaluates the accusation, calculates and persists the final score, and changes the case status to completed.

### 7. Retrieve the Final Result

**Endpoint:** `GET /api/cases/:id/result`

Retrieves the final verdict for a completed case.

The result can include the culprit, explanation, and final score as returned by the implementation. The endpoint should not reveal the completed verdict while the case remains active.

### Common API Behaviors

| Situation | Expected behavior |
|---|---|
| Valid case creation | Create and persist a case |
| First clue discovery | Record discovery and award clue points |
| Duplicate clue discovery | Do not award additional points |
| Hint within the allowance | Return a hint and apply the penalty |
| Hint allowance exhausted | Return `409 NO_HINTS_REMAINING` |
| Mutation after completion | Return `409 CASE_ALREADY_COMPLETED` |
| Result requested before completion | Reject access to the final verdict |
| Final accusation | Persist the final outcome and score |

Error responses may include additional details according to the backend error-handling implementation.

---

## 🧪 Testing and Verification

Testing is important because the score, hint allowance, case status, and final verdict must remain consistent even when requests are repeated.

### Backend Tests

The project verification report identifies these test files:

- `server/test/verify-phase2.js`
- `server/test/verify-phase3.js`
- `server/test/verify-phase5.js`
- `server/test/verify-audit.js`

The reported root command is:

```bash
npm run test:server
```

This script is expected to execute the configured backend verification suites. Run it from the directory containing the corresponding `package.json` script.

If the command is unavailable, inspect the scripts in the root `package.json` and `server/package.json`.

### Frontend Production Build

The reported root command is:

```bash
npm run build
```

A successful build should generate the production frontend bundle without compilation errors.

### Manual Integration Test Checklist

- [ ] Health endpoint responds successfully.
- [ ] MongoDB connection is established.
- [ ] A new case can be created.
- [ ] The selected difficulty has the correct configuration.
- [ ] Case details can be retrieved.
- [ ] Discovering a new clue awards the expected points.
- [ ] Discovering the same clue again awards no extra points.
- [ ] Hint usage applies the correct penalty.
- [ ] The hint limit is enforced.
- [ ] Correct accusations award the appropriate base score.
- [ ] Incorrect accusations do not award base points.
- [ ] Final score never drops below zero.
- [ ] Completed cases reject further mutations.
- [ ] Final results are available only after completion.
- [ ] The frontend displays backend errors appropriately.
- [ ] Case progress remains consistent after a browser refresh.
- [ ] Production build completes successfully.

**Verification status:** The supplied project verification report states that the backend tests, manual gameplay flow, frontend UI flow, and production build passed in its test environment. Run the tests again after significant code changes or deployment to confirm the current revision.

---

## 🔒 Security Considerations

The backend must remain the authority for game rules, case state, and final scoring.

### API and Gameplay Security

- Validate incoming request parameters.
- Validate case identifiers and requested clue identifiers.
- Enforce the maximum number of hints on the server.
- Prevent duplicate clue rewards.
- Prevent modifications to completed cases.
- Calculate and persist final scores on the backend.
- Keep the solution and other secret case information out of active-case responses.
- Return the final verdict only when the case reaches the appropriate completed state.

### Database and AI Security

- Keep MongoDB credentials on the backend.
- Keep Gemini API credentials on the backend.
- Never include private keys in frontend code or production bundles.
- Restrict MongoDB network access and database permissions where practical.
- Avoid logging API keys, connection strings, or other secrets.
- Handle AI API errors without exposing credentials or sensitive internal information.

### CORS and Deployment

Configure the backend's `CLIENT_URL` for the intended frontend origin. Production CORS settings should permit only the appropriate origins.

Do not use a wildcard origin as a substitute for the intended production configuration.

### Additional Production Hardening

For public deployments, consider adding:

- Rate limiting on case creation, hint requests, and other potentially expensive endpoints.
- Request-size limits and strict input validation.
- Monitoring and structured error logging.
- Abuse protection for AI generation endpoints.
- Dependency updates and periodic security audits.

These additional controls should be evaluated against the application's deployment requirements.

---

## ☁️ Deployment Guide

The intended deployment architecture is:

- **Frontend:** Vercel
- **Backend:** Render or another Node.js-compatible hosting provider
- **Database:** MongoDB Atlas
- **AI service:** Google Gemini API

Deployment settings must match the actual root and application package scripts.

### A. Prepare the Repository

Before pushing the project:

1. Review `.gitignore`.
2. Confirm real `.env` files are excluded.
3. Confirm `.env.example` contains only placeholder values.
4. Confirm the Gemini key and MongoDB URI are not hardcoded in source files.
5. Run the backend verification tests.
6. Run the frontend production build.
7. Commit and push the intended project files.

Example Git commands:

```bash
git status
git add .
git commit -m "Prepare AI Mystery Room for deployment"
git push
```

Review `git status` before committing. Do not stage real credentials or sensitive local files.

### B. Deploy the Backend

1. Create a Node.js web service on Render or a compatible platform.
2. Connect the Git repository.
3. Configure the service's root directory and install/build settings according to the backend package configuration.
4. Configure the production start command using the script actually defined by the backend package.
5. Add the required environment variables through the hosting dashboard.

Typical production environment variables:

```text
NODE_ENV=production
PORT=<provided by hosting platform>
MONGODB_URI=<production MongoDB connection string>
GEMINI_API_KEY=<Google Gemini API key>
GEMINI_MODEL=gemini-3.8-flash
CLIENT_URL=<deployed frontend origin>
```

Do not copy local secret values into this README or into Git.

After deployment, test the backend directly:

```text
https://YOUR-BACKEND-DOMAIN/api/health
```

Confirm that the service responds and can connect to the database.

### C. Deploy the Frontend

1. Import the repository into Vercel.
2. Set the frontend project root to `client` if the repository configuration requires it.
3. Configure the build command and output directory according to the Vite configuration.
4. Set `VITE_API_BASE_URL` to the deployed backend's expected API base URL.
5. Deploy the application.

Typical Vite settings are:

```text
Build command: npm run build
Output directory: dist
```

These values assume Vite is configured in the selected project root. Adjust them if the repository uses a different workspace configuration.

Example frontend environment setting:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND-DOMAIN
```

Use the exact base URL format expected by `client/src/api/cases.api.js` and the associated HTTP client.

### D. Configure Production CORS

After obtaining the deployed frontend URL, set the backend's `CLIENT_URL` to that origin and redeploy or restart the backend as required.

For example:

```text
CLIENT_URL=https://YOUR-FRONTEND-DOMAIN
```

Use your actual deployed domain, not the example value.

### E. Verify the Live Application

After both deployments:

- Open the deployed frontend.
- Create a new case.
- Discover clues and request a hint.
- Submit an accusation.
- Retrieve the final result.
- Confirm that the frontend communicates with the deployed backend.
- Confirm that the database is reachable from the deployed backend.
- Inspect the browser console and hosting logs for errors.

**Important:** A working local application and a successful production build do not automatically prove that the deployed application is fully operational. Complete a live gameplay test after deployment.

---

## 🐛 Troubleshooting

### MongoDB Connection Failure

**Possible causes:**

- Incorrect `MONGODB_URI`.
- Database user permissions are insufficient.
- The hosting provider is not permitted by the Atlas network-access configuration.
- The database is temporarily unavailable.

**What to do:** Verify the connection string, database permissions, and network-access settings. Check the backend logs without printing credentials.

### Gemini API Errors

**Possible causes:**

- Incorrect API key.
- The selected model is not available to the API account.
- API quota or access restrictions.
- Network errors or temporary provider failures.

**What to do:** Verify the backend's `GEMINI_API_KEY` and `GEMINI_MODEL` configuration, account access, and provider error messages. Do not expose the key in browser code.

### Frontend Cannot Reach the Backend

**Possible causes:**

- Incorrect `VITE_API_BASE_URL`.
- Backend service is unavailable.
- CORS does not allow the deployed frontend origin.
- API prefix is duplicated or missing.
- The frontend still contains a previous build-time environment value.

**What to do:** Check the API client's URL construction, backend health endpoint, browser network tab, CORS configuration, and hosting environment settings. Rebuild the frontend after changing Vite environment variables.

### Health Endpoint Reports a Degraded Database

**Possible causes:**

- The backend is running but cannot connect to MongoDB.
- The database connection is still initializing.
- Database credentials or network permissions are incorrect.

**What to do:** Inspect the backend logs and verify database connectivity.

### Frontend Build Fails

**What to do:**

1. Review the first meaningful build error.
2. Confirm dependencies are installed in the correct project directory.
3. Check the configured Node.js version.
4. Verify the Vite configuration and frontend environment variables.
5. Re-run the build after correcting the underlying issue.

### Hint or Accusation Requests Return an Error

**What to do:** Check the case status, remaining hint allowance, request body, and case identifier. A completed case is expected to reject further gameplay mutations.

---

## 🔮 Future Enhancements

Potential improvements for future versions include:

- A mystery case history and replay interface.
- Additional mystery genres and story templates.
- More advanced AI-generated narratives and evidence relationships.
- Improved evidence-board interactions.
- A more detailed case timeline.
- Optional player accounts and saved-case libraries.
- Leaderboards and achievement tracking.
- Accessibility improvements and additional responsive UI refinements.
- Rate limiting, monitoring, and abuse prevention for public deployments.
- More comprehensive automated tests for concurrent requests and edge cases.

These are possible future enhancements, not claims about features currently implemented.

---

## 📄 License

No specific open-source license has been confirmed in this documentation. Add a `LICENSE` file and update this section if you intend to publish the project under a particular license.

---

## 👨‍💻 Project Status

AI Mystery Room is a full-stack AI-assisted mystery investigation application built with React, Node.js, Express, MongoDB Atlas, and Google's Gemini API.

The supplied verification report records successful backend tests, a frontend production build, and a manual end-to-end gameplay walkthrough. Production deployment still requires correct hosting configuration, secure environment-variable setup, and a successful live integration test.

**Investigate carefully. Think critically. Solve the mystery.**
