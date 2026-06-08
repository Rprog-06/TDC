# Matchmaker Dashboard — TDC (Assignment)

Short internal MVP for a Matchmaker Dashboard used by The Date Crew (TDC). This repo contains a small Express backend and a React + Vite frontend demonstrating customer management, a matchmaking pool, and a scoring-based matching algorithm.

Live demo: (replace with hosted link if available)

Repository: https://github.com/<your-username>/TDC

## Quick start

Requirements: Node.js >= 18, npm/yarn

1. Backend

```bash
cd backend
npm install
npm run dev   # starts server on http://localhost:5000 (default)
```

2. Frontend

```bash
cd frontend
npm install
npm run dev   # starts Vite dev server on http://localhost:5173
```

3. Tests

```bash
cd backend
npm test
```

## Sample login

- username: `matchmaker@example.com`
- password: `password123`

(These are demo credentials used by the simple login flow in the frontend.)

## Email Feature Setup

The "Send Match" button now sends **real emails** with a professional template. For setup (local or production), see [EMAIL_SETUP.md](./EMAIL_SETUP.md).

**Quick demo**: Use [Ethereal Email](https://ethereal.email) (free) for local testing.

## Tech choices

- Frontend: React + Vite — chosen for fast iteration and modern DX.
- Backend: Node.js + Express — minimal API surface for demo data and matching endpoints.
- Data: Static JSON files in `data/` to simplify running locally.
- AI: The backend includes a scoring engine (rule-based) suitable for LLM augmentation; the project includes a placeholder for adding OpenAI / generative APIs to produce email intros or explain match scores.

## Matching logic (summary)

The matcher applies a weighted scorecard across age, income, height, children preferences, relocation, profession, and city alignment. The backend `utils/matchingalgo.js` produces a numerical score, descriptive reasons, and tags such as `High Potential`, `Relocation Fit`, or `Review`. The frontend uses a simplified `calculateMatchScore` for quick client-side ranking.

Design goals: realistic, explainable scoring; gender-specific heuristics (as per brief) and clear flags for matchmakers to review.

## How AI is used (suggested / implemented)

- Score explanations: the matching algorithm returns `reasons` and `cautions` that can be fed to an LLM to produce natural-language summaries.
- Email intros: integrate OpenAI to generate short personalized intros for matches (placeholder present in backend to add generative calls).
- **Real email sending**: When matchmakers click "Send Match", a professional HTML email is sent to the customer with match details (using nodemailer + Ethereal/SendGrid).

## Assumptions

- Opposite-gender matching only (per assignment brief).
- Data is synthetic and intentionally anonymized.
- The MVP focuses on internal matchmaker workflows rather than public user onboarding.

## Next steps / Improvements to impress recruiters

- Add CI (GitHub Actions) to run tests and linting on pushes.
- Host the frontend on Vercel / Netlify and the backend on Render (or use one container for both).
- Integrate OpenAI to generate email copy and match explanations at send-time.

---
For the recommended email copy to submit this assignment, see `EMAIL.md`.
