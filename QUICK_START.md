# ⚡ Quick Start Guide

Get Splytro running on a new computer in 5 minutes.

## Prerequisites
- Node.js 18+
- Git
- Supabase account (for database)
- Stripe account (for payments)

## 🚀 Setup Steps

### 1. Clone & Install
```bash
git clone https://github.com/alisoleah/qr-restaurant-ordering.git
cd qr-restaurant-ordering/qrcode
git checkout feature/split
npm install
```

### 2. Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env and add your values:
# - DATABASE_URL (from Supabase, port 6543 with pgbouncer=true)
# - DIRECT_DATABASE_URL (from Supabase, port 5432)
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (from Stripe dashboard)
# - STRIPE_SECRET_KEY (from Stripe dashboard)
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Create default restaurant
node scripts/seed-restaurant.js

# Seed sample data (optional)
npm run db:seed

# Create admin user
node scripts/reset-admin-password.js
```

### 4. Verify & Start
```bash
# Test database connection
node scripts/test-db-connection.js

# Start dev server
npm run dev
```

Visit http://localhost:3000

## 🔐 Default Credentials

**Admin Login:** http://localhost:3000/admin/login
- Username: `admin`
- Password: `Admin123!`

## 📚 Next Steps

- Read [HANDOFF_TO_ANTIGRAVITY.md](HANDOFF_TO_ANTIGRAVITY.md) for full documentation
- See [VERCEL_SETUP_FIX.md](qrcode/VERCEL_SETUP_FIX.md) for deployment guide

## ⚠️ Common Issues

**Database connection fails?**
→ Make sure DATABASE_URL uses port 6543 with `?pgbouncer=true`

**Prisma client errors?**
→ Run `npm run db:generate`

**Can't login?**
→ Run `node scripts/reset-admin-password.js`

## 🆘 Need Help?

1. Check [HANDOFF_TO_ANTIGRAVITY.md](HANDOFF_TO_ANTIGRAVITY.md) - Full documentation
2. Check [VERCEL_SETUP_FIX.md](qrcode/VERCEL_SETUP_FIX.md) - Deployment troubleshooting
3. Run diagnostic: `node scripts/test-db-connection.js`
