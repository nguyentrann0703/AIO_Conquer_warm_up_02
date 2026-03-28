This is the integrated frontend for the Late Delivery Prediction project.

## Local API Setup

Create a local env file before starting the app:

```bash
cp .env.local.example .env.local
```

By default, the frontend calls the local FastAPI backend at:

```text
http://127.0.0.1:8000/api/v1/predict
```

If your backend runs somewhere else, update `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Make sure the backend is running at the same time:

```bash
cd ../backend
uvicorn app.main:app --reload --port 8000
```
