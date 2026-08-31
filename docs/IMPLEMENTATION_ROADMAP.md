# Implementation Roadmap

## Phase 1 — Foundation
- Establish Next.js web architecture and shared UI primitives.
- Establish Firebase client/server boundaries.
- Establish authentication and role model.
- Establish Firestore schemas and deny-by-default rules.
- Establish validated API layer.

## Phase 2 — Catalog and playback
- Songs, artists, albums, genres.
- Podcast shows and episodes.
- Search, pagination, favorites, playlists, listening history.
- Responsive global audio player.
- Admin audio-source CMS with URL validation.

## Phase 3 — Commerce
- Server-side Razorpay order creation.
- Signature verification.
- Webhook verification and idempotency.
- Subscription plans, payment ledger, entitlements, expiry and refund handling.

## Phase 4 — Admin and analytics
- Content management.
- Users and permissions.
- Homepage CMS.
- Payments/refunds.
- Analytics and audit logs.

## Phase 5 — Production hardening
- Rate limiting.
- SSRF protection.
- Security headers.
- Automated unit/integration/E2E tests.
- Production build verification.
- Vercel deployment configuration.
- Secret and dependency review.

## Release gate

Do not deploy live payments until test-mode payment, signature verification, webhook processing, entitlement activation, duplicate-event handling, expiry, and refund paths have passed automated and manual checks.
