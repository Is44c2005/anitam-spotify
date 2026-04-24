# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memory

Keep the memory system at `~/.claude/projects/.../memory/` up to date throughout every conversation. After any significant decision, discovery, or user preference — save or update the relevant memory file and its entry in `MEMORY.md`. Don't wait until the end of the session.

## Commands

```bash
npm run dev       # Start dev server on localhost:5173 (strictPort)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

## Environment variables

Create `.env.development` locally (not committed):
```
VITE_SPOTIFY_CLIENT_ID=<your_client_id>
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

In Vercel, set `VITE_SPOTIFY_REDIRECT_URI=https://anitam-spotify.vercel.app/callback`. When setting env vars via Vercel CLI, use `printf` (not heredoc) to avoid trailing newlines being embedded in the build.

## Architecture

**Auth flow** — Spotify PKCE (no backend). `src/utils/spotify.js` handles the full cycle: generating the code verifier/challenge, redirecting to Spotify, exchanging the code for tokens, auto-refreshing on expiry. Tokens are stored in `localStorage`.

**API layer** — `src/utils/api.js` wraps all Spotify API calls through a single `fetchSpotify()` helper that calls `getValidToken()` (which auto-refreshes if needed) before every request.

**Player** — `src/hooks/usePlayer.jsx` is a React context (`PlayerProvider`) that manages an `Audio` element for 30-second preview playback. `play()` accepts a track object with a `preview_url`; tracks without one are silently ignored. The `<Player>` component at the bottom of `AppLayout` is always mounted when authenticated.

**Routing** — All routes except `/` and `/callback` are wrapped in `<ProtectedRoute>`, which checks `isAuthenticated()` (looks for `spotify_access_token` in localStorage) and redirects to `/` if missing. `vercel.json` rewrites all paths to `index.html` for client-side routing to work on Vercel.

**Layout** — Authenticated pages use `AppLayout` (Navbar + main + Footer + Player). `PlayerProvider` wraps all routes so the player state persists across navigation.
