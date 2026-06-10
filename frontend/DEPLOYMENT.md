# Frontend Deployment — Vercel

The SmartDine frontend is a Vite + React SPA. Vercel auto-detects the framework, runs `npm run build`, and serves `dist/`. The repo ships a `vercel.json` that handles SPA routing, asset caching, and a few security headers.

## Prerequisites

1. **Backend deployed** to Render (or any other host) with a public HTTPS URL — e.g. `https://smartdine-api.onrender.com`.
2. Backend `CORS_ORIGIN` env var includes the Vercel domain you plan to use (e.g. `https://smartdine.vercel.app`).
3. Backend `GUEST_APP_URL` env var points at the same Vercel domain — this is what scanned QR codes redirect to (`/order?qr=…&table=…`, `/window?qr=…`).
4. GitHub repo connected to Vercel (or use the Vercel CLI for direct deploys).

## One-time setup in Vercel

1. **Import the project** in the Vercel dashboard:
   - Choose this repo.
   - **Root directory:** `frontend`
   - **Framework preset:** Vite (auto-detected)
   - Build / install / output commands: leave defaults (they come from `vercel.json`).

2. **Set environment variables** (Settings → Environment Variables). Add these for both **Production** and **Preview** scopes:

   | Variable | Example value |
   | --- | --- |
   | `VITE_API_BASE_URL` | `https://smartdine-api.onrender.com/api/v1` |
   | `VITE_PUBLIC_BASE_URL` | `https://smartdine-api.onrender.com` |
   | `VITE_SOCKET_URL` | `https://smartdine-api.onrender.com` |
   | `VITE_GUEST_APP_URL` | `https://smartdine.vercel.app` |

   All four must be set — `src/config/env.ts` reads them at build time and bakes them into the bundle. After changing any var, redeploy.

3. **Custom domain (optional):** Settings → Domains → Add. Once propagated, update `VITE_GUEST_APP_URL` to the custom domain and redeploy.

## Deploying

- **From GitHub:** every push to `main` triggers a production build; PRs get preview deployments automatically.
- **From CLI:**
  ```bash
  cd frontend
  npx vercel           # first deploy: links the project
  npx vercel --prod    # subsequent production deploys
  ```

## What `vercel.json` does

- **SPA fallback** — `((?!assets/).*)` rewrites every non-asset request to `/index.html` so React Router handles deep links like `/track/abc123` or `/order?qr=xyz` on direct visits / page reload.
- **Asset caching** — hashed files under `/assets/*` get `Cache-Control: public, max-age=31536000, immutable`. The HTML stays uncached so deploys go live instantly.
- **Security headers** — `nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, and a `Permissions-Policy` that disables camera/mic/geo (this app doesn't need them).

## Post-deploy smoke test

After the first prod deploy:

1. Open `https://<your-domain>` — splash + landing renders.
2. `/login` — log in with the seeded owner account from the backend.
3. `/admin` — every module loads without 401s. If you see CORS errors in DevTools, update the backend's `CORS_ORIGIN`.
4. `/now-serving` — public page, no auth, should render even logged out.
5. Scan a table QR code from the admin (or open the QR target URL manually):
   - `https://<your-domain>/order?qr=<slug>&table=<id>` should load the guest menu.
6. WebSockets: place a guest order from `/order`, then watch `/admin` Orders update in real-time. If WS doesn't connect, confirm `VITE_SOCKET_URL` uses `https://` (Socket.IO auto-upgrades to `wss://`).

## Troubleshooting

- **Direct URL = 404** — `vercel.json` missing or wrong rewrite. Re-deploy after confirming the file is in `frontend/` root.
- **API calls fail with `CORS_ERROR`** — backend `CORS_ORIGIN` doesn't include the Vercel domain. Update the Render env var and restart the backend.
- **Sockets silent** — backend not running, or `VITE_SOCKET_URL` points to `http://` on a Render free tier that's gone to sleep. Hit `/health` to wake it.
- **Env vars not applied** — Vercel bakes them at build time. After changing a var, **redeploy** (Deployments → … → Redeploy). A simple "Production redeploy" is enough.
- **Build fails on `tsc --noEmit`** — the build script runs a strict type-check first. Fix the TS error locally, push, redeploy.
