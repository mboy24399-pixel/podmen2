# Podmen X — Production Architecture

## Scope

Podmen X is being prepared as a production music and podcast streaming platform with Firebase authentication/data services, server-side Razorpay payments, subscription entitlements, user playback, and a privileged admin CMS.

## Non-negotiable security rules

- Never expose Firebase Admin credentials or `RAZORPAY_KEY_SECRET` to the browser.
- Never trust a payment amount, role, subscription status, or premium entitlement supplied by the client.
- Create Razorpay orders server-side from the active plan stored in Firestore.
- Verify Razorpay payment signatures server-side.
- Verify/process Razorpay webhooks server-side and make webhook handling idempotent.
- Grant premium access only from a server-verified entitlement.
- Admin role and permissions must be enforced server-side.
- Firestore and Storage rules must deny-by-default and explicitly grant access.
- Admin-managed remote audio URLs must be validated; any server-side URL fetcher must include SSRF protections.
- Only stream content that the operator has the legal right to distribute.

## Core domains

- Authentication and profiles
- Roles and permissions
- Music catalog: artists, albums, songs, genres
- Podcasts: shows and episodes
- Playback, queue, favorites, playlists, history
- Subscription plans and entitlements
- Razorpay orders, payments, refunds, and webhook events
- Admin CMS and homepage configuration
- Analytics and audit logs

## Payment state model

`pending -> active`

`pending -> failed`

`active -> expired`

`active -> cancelled`

`active -> refunded`

Invalid transitions must be rejected. Payment/webhook identifiers must be unique where appropriate so retries cannot activate access twice.

## Environments

Use separate Firebase/Razorpay configuration for development, preview, and production. Keep real credentials only in the deployment secret store; commit only placeholders in `.env.example`.

## Deployment target

The web application is intended for Vercel. The public Razorpay webhook endpoint must use HTTPS and production configuration before going live.
