#!/bin/sh
# SmartDine self-hosted setup
# Run:  sh setup.sh
set -e

echo ""
echo "============================================"
echo "  SmartDine — Self-Hosted Setup"
echo "============================================"
echo ""

ENV_FILE="backend/.env"

# ── Copy .env if not exists ──────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  cp backend/.env.example "$ENV_FILE"
  echo "[1/4] Created backend/.env from example"
  echo "      --> Edit $ENV_FILE and fill in your values, then run this script again."
  echo ""
  echo "      Required fields to fill in:"
  echo "        JWT_ACCESS_SECRET   (generate: openssl rand -hex 32)"
  echo "        JWT_REFRESH_SECRET  (generate: openssl rand -hex 32)"
  echo "        JWT_GUEST_SECRET    (generate: openssl rand -hex 32)"
  echo "        CORS_ORIGIN         (your frontend URL)"
  echo "        SEED_OWNER_EMAIL    (your login email)"
  echo "        SEED_OWNER_PASSWORD (your login password)"
  echo ""
  echo "      Optional (leave blank to disable):"
  echo "        CLOUDINARY_*   — image uploads"
  echo "        RAZORPAY_*     — UPI / card payments"
  echo "        TWILIO_*       — SMS / WhatsApp OTP"
  echo "        SMTP_*         — email notifications"
  echo ""
  exit 0
fi

echo "[1/4] backend/.env already exists"

# ── Start MongoDB + API ───────────────────────────────────────────────────────
echo "[2/4] Starting MongoDB and API..."
docker compose up -d mongo api
echo "      Waiting for API to be healthy..."
sleep 5

# ── Seed database ─────────────────────────────────────────────────────────────
echo "[3/4] Seeding database (owner account + menu)..."
docker compose --profile setup run --rm seed

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "[4/4] Done!"
echo ""
echo "============================================"
echo "  SmartDine is running!"
echo "============================================"
echo ""
echo "  API        : http://localhost:4000"
echo "  API docs   : http://localhost:4000/api/v1/docs"
echo "  Health     : http://localhost:4000/health"
echo ""
echo "  Point your SDK at your server:"
echo ""
echo "    import { SmartDineClient } from '@fixl1234/smartdine';"
echo "    const sdk = new SmartDineClient({ baseUrl: 'http://localhost:4000' });"
echo ""
echo "  Deploy frontend to Vercel:"
echo "    VITE_API_BASE_URL=http://localhost:4000/api/v1"
echo "    VITE_SOCKET_URL=http://localhost:4000"
echo ""
echo "  Stop:     docker compose down"
echo "  Logs:     docker compose logs -f api"
echo "  Data:     stored in Docker volume 'smartdine_mongo_data'"
echo ""
