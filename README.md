# Podmen X — Production-Grade Music & Podcast Platform

Podmen X is a professional music streaming and podcast subscription web application built with Next.js App Router, TypeScript, Tailwind CSS, Firebase Auth, Cloud Firestore, Razorpay Subscriptions, and Google Gemini AI.

## Features

- **User Panel**: Home, Explore, Search, Library, Favorites, Playlists, Podcasts, History, Pricing, Account, Login.
- **Persistent Global Audio Player**: HTML5 audio with 10s skip, volume, playback speed, queue management, repeat, shuffle, and progress synchronization.
- **Razorpay Subscriptions**: Secure server-side subscription creation, verification, and idempotent webhook handling.
- **Gemini AI Integration**: Server-side semantic search, AI recommendations, and content discovery.
- **Security**: Server-side authentication and role checks, robust input validation, and secure secrets management.

## Getting Started

1. Copy `.env.example` to `.env` and fill in your credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
