# SmartDine

Single-restaurant management platform — built for Fixl Solutions per the [PRD](restaurent.md).

## Repo layout

- [`backend/`](backend/) — Node.js + Express + MongoDB API (12 phases, all built). See [backend/README.md](backend/README.md).
- `frontend/` — (placeholder) — guest QR menu + staff dashboard + KDS console + vendor admin

## Deploy

Backend deploys to **Render** via [backend/render.yaml](backend/render.yaml). MongoDB is **Atlas** (or any Mongo replica set with TLS).
