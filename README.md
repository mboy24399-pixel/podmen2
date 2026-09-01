# PODMEN X Tournament Arena

PODMEN X is now a tournament-first web application backed by Firebase and deployed with Next.js.

## Core features

- Public tournament discovery and search
- Tournament detail pages with rules, capacity, schedule and prize pool
- Authenticated player registration
- Atomic coin entry-fee charging with an idempotent Firestore ledger
- Player wallet and coin history
- Global leaderboard
- Admin tournament creation and lifecycle controls
- Firebase Admin server authorization and role-based access control
- Notifications, tasks and reward infrastructure

## Legacy systems removed

The previous podcast/audio player workflow and Razorpay payment/subscription API routes are no longer part of the web application. Payment credentials are not required by the tournament system.

## Firebase configuration

Keep Firebase browser configuration in the `NEXT_PUBLIC_FIREBASE_*` variables. Keep Firebase Admin credentials server-side using `FIREBASE_SERVICE_ACCOUNT_JSON` or the three individual Admin credential variables. Never commit a service-account JSON file to Git.

## Local development

```bash
bun install
bun run dev
```

Production build:

```bash
bun run build
```
