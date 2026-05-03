# AI Google Review Responder

Paste Google reviews in and generate professional, on-brand replies in seconds. This portfolio app is built for local businesses such as restaurants, clinics, hotels, salons, and service companies that need fast reputation-management support without hiring a PR person.

## Features

- Brand voice profile saved in `localStorage`
- Single-review reply generation
- Batch mode for multiple reviews
- Gemini API integration with structured JSON output
- Demo mode that works without an API key
- Sentiment, urgency, topic, and quality scoring
- Google-safe checks for risky language, excessive length, and weak recovery paths
- One-click copy for public, short, and recovery replies
- Reply history with CSV and JSON export

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Gemini API via `@google/genai`
- `localStorage`

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Gemini Setup

The app works immediately in demo mode. To use Gemini:

1. Get a Gemini API key from Google AI Studio.
2. Open Settings in the app.
3. Paste the key.
4. Disable demo mode.

The key is stored only in the browser through `localStorage`. For production, move Gemini calls behind a serverless API route or backend proxy so API keys are never exposed to client code.

## Portfolio Pitch

Built an AI tool that generates professional, on-brand Google review responses in seconds, helping local businesses protect their online reputation without hiring a PR person.

## Production Upgrade Ideas

- Add a serverless Gemini proxy
- Add team seats and shared brand profiles
- Add OAuth integration with Google Business Profile
- Add approval workflows for managers
- Add per-location analytics and reply templates

Direct Google review posting is intentionally not included in the MVP because it requires Google Business Profile OAuth access and verified business locations. The current app focuses on copy-ready replies that can be safely reviewed and posted by a business owner.
