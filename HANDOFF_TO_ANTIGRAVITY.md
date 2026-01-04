# 🚀 Handoff Prompt for Antigravity (or New AI Assistant)

## Project Overview

This is **Splytro** - a QR-based restaurant ordering system with bill splitting capabilities. The system allows customers to scan QR codes at tables, order food, split bills (equal or itemized), and pay via Stripe (Apple Pay/Google Pay supported).

**Current Status:** Phase 2 Complete (Enhanced Admin QR Management & Testing Framework)
**Tech Stack:** Next.js 14, React 18, TypeScript, Prisma ORM, PostgreSQL (Supabase), Stripe, Tailwind CSS
**Repository:** https://github.com/alisoleah/qr-restaurant-ordering
**Production URL:** https://splytro.com
**Current Branch:** `feature/split` (Phase 2 completed)
**Main Branch:** Phase 1 only (stable)

---

## 🎯 Current State (What's Been Completed)

### Phase 0 (Foundation) ✅
- Next.js 14 app with TypeScript
- Prisma schema for database (Restaurant, Table, Order, MenuItem, BillSplit, Person, AdminUser)
- Admin authentication with JWT (jose library) + bcryptjs password hashing
- Splytro design system (Teal #00C2CB, Coral #FF6B6B, Slate #2E3A45)
- Basic QR code generator page (frontend-only, no database integration initially)
- Bill splitting system (equal and itemized)
- Stripe payment integration with Apple Pay/Google Pay
- Table-based ordering system

### Phase 1 (QR Code & Table Integration) ✅
- Backend API: `POST /api/admin/qr-generator` - Generates QR codes and saves tables to database
- Backend API: `GET /api/admin/tables` - Fetches all tables with statistics
- Updated QR generator page to save tables to database on generation
- QR codes use format: `{origin}/table/{number}`
- Single and bulk generation modes
- Protected `/qr-generator` route with admin authentication
- Seed script: `scripts/seed-restaurant.js` (creates default restaurant)

### Phase 2 (Enhanced Admin QR Management) ✅
- **New Page:** `app/admin/tables/page.tsx` - Complete table management dashboard
  - View all tables in grid layout with real-time statistics
  - Summary cards (total tables, with QR codes, available/occupied)
  - Individual table operations: view, edit, regenerate QR, delete
  - Bulk operations: multi-select and bulk delete
  - Edit modal for table properties (number, capacity, status)
  - Color-coded status badges (AVAILABLE/OCCUPIED/RESERVED/OUT_OF_SERVICE)

- **New API Endpoints:**
  - `GET /api/admin/tables/[tableId]` - Get single table
  - `PUT /api/admin/tables/[tableId]` - Update table (prevents duplicates, auto-updates QR URL)
  - `DELETE /api/admin/tables/[tableId]` - Delete table (prevents deletion if orders exist)

- **Testing Framework:**
  - Jest configuration with 80%+ coverage threshold
  - Test directory structure: `tests/unit/`, `tests/integration/`, `tests/security/`
  - Placeholder tests for JWT, password hashing, tax calculation, API, SQL injection
  - Test scripts: `npm run test:unit`, `test:integration`, `test:security`, `test:all`

- **Helper Scripts:**
  - `scripts/test-db-connection.js` - Diagnose database connectivity
  - `scripts/reset-admin-password.js` - Reset admin password to `Admin123!`

---

## 📁 Important Files & Structure

```
qr-restaurant-ordering/
├── qrcode/                          # Main Next.js app
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/page.tsx       # Admin login (username: admin)
│   │   │   ├── page.tsx             # Admin dashboard (orders view)
│   │   │   └── tables/page.tsx      # Table management (Phase 2)
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── auth/            # Login/logout endpoints
│   │   │   │   ├── qr-generator/    # QR generation API (Phase 1)
│   │   │   │   ├── tables/          # GET all tables (Phase 1)
│   │   │   │   └── tables/[tableId]/ # CRUD for single table (Phase 2)
│   │   │   ├── menu/                # Menu items API
│   │   │   ├── orders/              # Order management
│   │   │   ├── payment/             # Stripe payment processing
│   │   │   └── tables/[tableNumber]/ # Customer table view API
│   │   ├── qr-generator/page.tsx    # QR code generator (admin)
│   │   ├── table/[tableNumber]/     # Customer ordering page
│   │   └── checkout/                # Bill splitting & payment
│   ├── components/
│   │   └── Navigation.tsx           # Global navigation with logout
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.ts                  # Database seeding
│   ├── scripts/
│   │   ├── seed-restaurant.js       # Create default restaurant
│   │   ├── test-db-connection.js    # DB diagnostic
│   │   └── reset-admin-password.js  # Reset admin password
│   ├── tests/
│   │   ├── unit/auth/               # JWT & password tests
│   │   ├── unit/business-logic/     # Tax calculation tests
│   │   ├── integration/api/         # API endpoint tests
│   │   └── security/                # SQL injection tests
│   ├── middleware.ts                # Auth protection for routes
│   ├── jest.config.js               # Jest configuration
│   └── package.json                 # Dependencies & scripts
├── CURRENT_STATE.md                 # Project tracking (only in main branch)
├── SECURITY_AUDIT_PLAN.md           # Security checklist (only in main branch)
├── TESTING_IMPLEMENTATION.md        # Testing strategy (only in main branch)
└── VERCEL_SETUP_FIX.md              # Vercel deployment guide
```

---

## 🔐 Environment Variables Required

Create a `.env` file in the `qrcode/` directory with these variables:

```env
# Database (Supabase)
# IMPORTANT: Use connection pooling URL (port 6543 with pgbouncer=true)
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long-change-this"

# Stripe (Payment Processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"

# Node Environment
NODE_ENV="development"
```

### How to Get These Values:

1. **DATABASE_URL (Supabase):**
   - Go to Supabase Dashboard → Project Settings → Database
   - Select "Connection pooling" (NOT "Session mode")
   - Copy the URL (port 6543 with `?pgbouncer=true`)

2. **DIRECT_DATABASE_URL (Supabase):**
   - Same location, but select "Session mode"
   - Copy the URL (port 5432, no pgbouncer)

3. **JWT_SECRET:**
   - Generate a random string (min 32 characters)
   - Example: `openssl rand -base64 32`

4. **STRIPE Keys:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy "Publishable key" and "Secret key"

---

## 🖥️ Setup on a New Computer (Step-by-Step)

### Prerequisites:
- Node.js 18+ installed
- Git installed
- GitHub account with access to the repository

### Step 1: Clone Repository
```bash
git clone https://github.com/alisoleah/qr-restaurant-ordering.git
cd qr-restaurant-ordering/qrcode
```

### Step 2: Checkout Feature Branch
```bash
# Use feature/split for Phase 2 work (latest)
git checkout feature/split

# OR use main for stable Phase 1 only
git checkout main
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Create Environment File
```bash
# Create .env file in qrcode/ directory
# Add all environment variables from section above
```

### Step 5: Generate Prisma Client
```bash
npm run db:generate
```

### Step 6: Sync Database Schema (Optional - if database is empty)
```bash
# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### Step 7: Create Restaurant (If New Database)
```bash
node scripts/seed-restaurant.js
```

### Step 8: Reset Admin Password
```bash
node scripts/reset-admin-password.js
# Sets username: admin, password: Admin123!
```

### Step 9: Test Database Connection
```bash
node scripts/test-db-connection.js
# Should show: "All checks passed! Database is healthy."
```

### Step 10: Start Development Server
```bash
npm run dev
```

Visit:
- Main app: http://localhost:3000
- Admin login: http://localhost:3000/admin/login
- QR generator: http://localhost:3000/qr-generator
- Table management: http://localhost:3000/admin/tables

### Step 11: Run Tests (Optional)
```bash
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:security    # Security tests
npm run test:all         # All tests with coverage
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "FATAL: Tenant or user not found"
**Solution:** DATABASE_URL is incorrect. Use connection pooling URL (port 6543 with pgbouncer=true), NOT direct connection.

### Issue 2: Prisma Client not found
**Solution:** Run `npm run db:generate` or `npx prisma generate`

### Issue 3: Admin login fails
**Solution:** Run `node scripts/reset-admin-password.js` to reset password to `Admin123!`

### Issue 4: Tables page shows no tables
**Solution:** Generate QR codes from `/qr-generator` page first, or run database seed scripts.

### Issue 5: Vercel deployment errors
**Solution:** Check that DATABASE_URL in Vercel environment variables uses connection pooling (port 6543). See `VERCEL_SETUP_FIX.md` for full guide.

---

## 🎯 Next Steps (Phase 3 - What to Work On Next)

### Phase 3: Customer Experience Flow
**Goal:** Seamless customer journey from QR scan to payment

**Features to Implement:**
1. Auto-detect table from QR scan URL parameter
2. Table session management - Track active sessions per table
3. Multi-customer support - Multiple people scanning same table QR
4. Order aggregation - Combine orders from same table
5. Smart bill splitting - Automatically detect items per customer
6. Enhanced menu browsing
7. Cart optimization
8. Order status tracking for customers

**Flow:**
```
Scan QR → Table detected → Welcome screen
                                ↓
                          View Menu
                                ↓
                      Add items to cart
                                ↓
                      Place order (saved to table)
                                ↓
                  Option: Split bill or Pay full
                                ↓
                            Payment
                                ↓
                  Order status tracking
```

**Files to Create/Modify:**
- `app/table/[tableNumber]/page.tsx` - Add session detection
- `app/api/tables/[tableNumber]/session/route.ts` - Session management API
- `app/api/orders/route.ts` - Order aggregation by table
- `app/checkout/page.tsx` - Enhanced bill splitting UI

**Success Criteria:**
- Multiple customers can scan same QR and order independently
- Orders are automatically grouped by table
- Bill splitting shows all items from all customers at table
- Each customer can pay their portion
- Table status updates based on order activity

---

## 🔑 Admin Credentials

**Username:** `admin`
**Password:** `Admin123!`

To change password, edit `scripts/reset-admin-password.js` and run it.

---

## 📊 Database Schema Overview

### Key Models:
- **Restaurant** - Restaurant settings (tax rate, service charge)
- **Table** - Tables with QR codes (number, capacity, status, qrCode)
- **MenuItem** - Menu items (name, price, category, description, image)
- **Order** - Customer orders (tableId, items, status, totalAmount)
- **BillSplit** - Bill splitting sessions (tableId, totalPeople, splitType)
- **Person** - Individual persons in a bill split (billSplitId, personNumber, totalAmount)
- **AdminUser** - Admin authentication (username, password)
- **OrderItem** - Items in an order (orderId, menuItemId, quantity, price, isPaid)

### Key Relationships:
- Restaurant → Tables (1:many)
- Restaurant → MenuItems (1:many)
- Restaurant → Orders (1:many)
- Table → Orders (1:many)
- Table → BillSplits (1:many)
- BillSplit → Persons (1:many)
- Order → OrderItems (1:many)

---

## 🎨 Design System (Splytro Colors)

```css
--color-teal: #00C2CB;      /* Primary (buttons, links, active states) */
--color-coral: #FF6B6B;     /* Accent (call-to-action, errors, occupied) */
--color-slate: #2E3A45;     /* Text (headings, body text) */
--color-white: #FFFFFF;     /* Pure white */
--color-off-white: #F8F9FA; /* Background */
```

**Button Classes:**
- `.btn-primary` - Coral background (#FF6B6B)
- `.btn-secondary` - Teal background (#00C2CB)
- `.card` - White background with shadow
- `.input-field` - Standard form input

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed database

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests
npm run test:security    # Run security tests
npm run test:all         # Run all with coverage
npm run test:watch       # Watch mode

# Helper Scripts
node scripts/test-db-connection.js      # Test DB connection
node scripts/reset-admin-password.js    # Reset admin password
node scripts/seed-restaurant.js         # Create default restaurant
```

---

## 🔒 Security Considerations

1. **Authentication:** JWT with jose library (24-hour expiration)
2. **Password Hashing:** bcryptjs with 10 salt rounds
3. **Protected Routes:** Middleware protects `/admin/*` and `/qr-generator`
4. **SQL Injection:** Prevented by Prisma ORM (parameterized queries)
5. **XSS:** Prevented by React auto-escaping
6. **CORS:** Configured for production domain only
7. **Environment Variables:** Never committed to git (.env in .gitignore)

**Admin Session Cookie:**
- Name: `admin-session`
- HttpOnly: true
- Secure: true (production only)
- SameSite: 'lax'
- Max-Age: 24 hours

---

## 📝 Git Workflow

```bash
# Current branches
main           # Stable, Phase 1 only
feature/split  # Phase 2 complete, testing in progress

# Create new feature branch
git checkout feature/split
git pull origin feature/split
git checkout -b feature/phase3-customer-experience

# Make changes, commit
git add .
git commit -m "feat: Add session management for tables"

# Push to remote
git push origin feature/phase3-customer-experience

# When ready to merge to main (after testing)
git checkout main
git merge feature/split
git push origin main
```

**Commit Message Format:**
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
style: Update styling
chore: Update dependencies
```

Always end commits with:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 📞 Support & Resources

- **GitHub Issues:** https://github.com/alisoleah/qr-restaurant-ordering/issues
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Stripe Docs:** https://stripe.com/docs

---

## ✅ Verification Checklist

Before starting work, verify:
- [ ] Repository cloned successfully
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured in `.env`
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Database connection works (`node scripts/test-db-connection.js`)
- [ ] Admin password reset (`node scripts/reset-admin-password.js`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Can login to admin panel (http://localhost:3000/admin/login)
- [ ] Can access table management (http://localhost:3000/admin/tables)
- [ ] Tests run successfully (`npm run test:unit`)

---

## 🎯 Your Mission (if continuing work)

1. **Review the codebase** - Familiarize yourself with the structure
2. **Test locally** - Make sure everything works on your machine
3. **Read Phase 3 requirements** - Understand what needs to be built next
4. **Plan implementation** - Break down Phase 3 into smaller tasks
5. **Start coding** - Begin with session management for tables
6. **Write tests** - Add unit/integration tests for new features
7. **Document changes** - Update relevant docs as you build

**Remember:** This is a production system. Test thoroughly before deploying. Use the `feature/split` branch for development, merge to `main` only after testing.

Good luck! 🚀

---

**Last Updated:** 2026-01-04
**Created By:** Claude Sonnet 4.5 (via Claude Code)
**Current Phase:** Phase 2 Complete → Phase 3 Next
