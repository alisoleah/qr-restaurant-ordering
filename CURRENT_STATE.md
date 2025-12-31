# 🏗️ QR Restaurant Ordering System - Current State & Roadmap

**Last Updated:** 2025-12-31
**Project:** Splytro QR Restaurant Ordering System
**Repository:** https://github.com/alisoleah/qr-restaurant-ordering

---

## ✅ COMPLETED FEATURES

### Phase 0: Foundation & Design System ✓ (COMPLETED)
- [x] **Admin Authentication System**
  - Secure login/logout with JWT tokens (jose library)
  - bcryptjs password hashing with salt rounds
  - HTTP-only cookies for session management
  - Protected admin routes via Next.js middleware
  - Admin user seed script
  - Files: `lib/auth.ts`, `middleware.ts`, `app/admin/login/page.tsx`

- [x] **Splytro Design System**
  - Unified color palette: Electric Teal (#00C2CB), Sunny Coral (#FF6B6B), Slate Gray (#2E3A45)
  - Poppins font family
  - CSS custom properties in `globals.css`
  - Updated components: Navigation, Admin pages, Demo page, QR Generator
  - Landing page with Splytro branding

- [x] **Database Schema (Prisma + PostgreSQL)**
  - Restaurant model with tax/service charge settings
  - Table model with QR code support (qrCode field exists)
  - Menu items with categories
  - Orders with status tracking
  - Bill splitting (equal & itemized)
  - Order items with individual payment tracking
  - Admin user authentication

- [x] **Basic QR Generator**
  - Frontend QR code generation using qrcode library
  - Single table QR generation
  - Bulk table QR generation (range)
  - Download individual QR codes
  - Print all QR codes
  - File: `app/qr-generator/page.tsx`
  - **GAP:** QR codes NOT saved to database yet

- [x] **Bill Splitting**
  - Equal split functionality
  - Itemized split with person assignment
  - Multi-person checkout
  - Session-based bill tracking

- [x] **Order Management**
  - Order creation and tracking
  - Order status updates (PENDING → CONFIRMED → PREPARING → READY → COMPLETED)
  - Table-based order association
  - Admin dashboard for viewing orders

- [x] **Payment Integration**
  - Stripe checkout integration
  - Apple Pay and Google Pay support
  - Payment status tracking
  - Tip calculation (percentage & fixed amount)

- [x] **Table Management**
  - Table status tracking (AVAILABLE/OCCUPIED/RESERVED/OUT_OF_SERVICE)
  - Table capacity management
  - Real-time table occupancy in admin dashboard

---

## 🎯 IN PROGRESS

### Phase 1: QR Code & Table Integration ⭐ (CURRENT PHASE)

**Goal:** Admin generates QR codes that automatically create/update tables in database with permanent QR URLs.

#### 1.1 Backend API Endpoints (To Do)
- [ ] **Create:** `app/api/admin/qr-generator/route.ts`
  - POST endpoint to generate and save QR codes
  - Automatic table creation/update in database
  - Support single and bulk generation
  - Save QR URL to `table.qrCode` field

- [ ] **Create:** `app/api/admin/tables/route.ts`
  - GET endpoint to fetch all tables with QR codes
  - Filter by status, capacity, restaurant

- [ ] **Create:** `app/api/admin/qr-generator/[tableId]/route.ts`
  - DELETE endpoint to remove QR code
  - PUT endpoint to regenerate QR code

#### 1.2 Frontend Updates (To Do)
- [ ] **Update:** `app/qr-generator/page.tsx`
  - Add capacity input field
  - Call backend API to save to database
  - Show existing tables from database
  - Add loading states and error handling
  - Display success messages after save
  - Show which tables already exist vs new

- [ ] **Update:** `middleware.ts`
  - Protect `/qr-generator` route (admin-only)

- [ ] **Update:** `app/admin/page.tsx`
  - Add "Generate QR Codes" button/link
  - Show QR code status per table

#### 1.3 Workflow Implementation (To Do)
```
Admin logs in → Admin Dashboard → Generate QR Codes
                                        ↓
                         Enter table numbers (single/bulk)
                                        ↓
                         Select capacity per table
                                        ↓
                         Click "Generate & Save"
                                        ↓
                    API creates/updates tables in DB
                                        ↓
                         QR codes generated with URLs
                                        ↓
                    Admin downloads/prints QR codes
                                        ↓
                         Places QR codes on tables
                                        ↓
                    Customer scans QR → /table/{number}
                                        ↓
                         System detects table automatically
                                        ↓
                    Customer orders → Payment → Complete
```

---

## 📋 UPCOMING PHASES

### Phase 2: Enhanced Admin QR Management 📊 (PLANNED)

**Goal:** Full CRUD operations for table QR codes from admin panel.

#### Features:
- [ ] View all generated QR codes in table/grid layout
- [ ] Edit table details (number, capacity, status)
- [ ] Regenerate QR codes for specific tables
- [ ] Bulk delete QR codes
- [ ] Download individual or all QR codes
- [ ] Print QR codes with table information
- [ ] QR code history/audit log

#### New Pages:
- [ ] `app/admin/tables/page.tsx` - Table management dashboard
- [ ] `app/admin/tables/[id]/page.tsx` - Individual table edit page

---

### Phase 3: Customer Experience Flow 🍽️ (PLANNED)

**Goal:** Seamless customer journey from QR scan to payment.

#### Features:
- [ ] Auto-detect table from QR scan URL parameter
- [ ] Table session management - Track active sessions per table
- [ ] Multi-customer support - Multiple people scanning same table QR
- [ ] Order aggregation - Combine orders from same table
- [ ] Smart bill splitting - Automatically detect items per customer
- [ ] Enhanced menu browsing
- [ ] Cart optimization
- [ ] Order status tracking for customers

#### Flow:
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

---

### Phase 4: Real-time Features ⚡ (PLANNED)

**Goal:** Live updates for admin and customers.

#### Features:
- [ ] WebSocket/Polling for order status updates
- [ ] Live table occupancy dashboard for admin
- [ ] Kitchen display system for order preparation
- [ ] Customer notifications when order ready
- [ ] Admin alerts for new orders
- [ ] Real-time table status updates

#### Technologies:
- Pusher / Ably for WebSockets
- Server-Sent Events (SSE) alternative
- Polling fallback for compatibility

---

### Phase 5: Analytics & Reporting 📈 (PLANNED)

**Goal:** Business insights and performance metrics.

#### Features:
- [ ] Revenue dashboard - Daily/weekly/monthly reports
- [ ] Popular items - Best-selling menu items
- [ ] Table utilization - Occupancy rates and turnover
- [ ] Order analytics - Average order value, peak times
- [ ] Payment methods - Distribution of payment types
- [ ] Customer insights - Return rate, preferences
- [ ] Export reports (CSV, PDF)

---

### Phase 6: Advanced Features 🚀 (PLANNED)

**Goal:** Competitive differentiation and enhanced UX.

#### Features:
- [ ] Multi-restaurant support - Manage multiple locations
- [ ] Custom branding - Per-restaurant theming
- [ ] Loyalty program - Points and rewards
- [ ] Pre-ordering - Reserve table and order ahead
- [ ] Dietary filters - Vegetarian, vegan, gluten-free, etc.
- [ ] Multi-language support
- [ ] Waiter call button - Request assistance from table
- [ ] Feedback system - Rate orders and service
- [ ] Email/SMS notifications
- [ ] Inventory management

---

### Phase 7: Security Hardening 🔒 (PLANNED)

**Goal:** Comprehensive security audit and implementation of fixes.

#### Security Categories (35 Total):
1. [ ] Rate Limiting & DDoS Protection
2. [ ] API Key Management & Secrets Exposure
3. [ ] Authentication & Authorization
4. [ ] CORS Configuration
5. [ ] Input Validation & Sanitization
6. [ ] Next.js Specific Vulnerabilities
7. [ ] Dependency Vulnerabilities & Supply Chain Security
8. [ ] XSS Prevention & Output Encoding
9. [ ] Business Logic Vulnerabilities
10. [ ] Error Handling & Information Disclosure
11. [ ] Performance & Resource Exhaustion
12. [ ] Session Management
13. [ ] Password Security (bcrypt implementation)
14. [ ] Environment Consistency & Configuration
15. [ ] Threat Modeling
16. [ ] OWASP Top 10 Compliance
17. [ ] CSRF Protection
18. [ ] Clickjacking Protection
19. [ ] Security Headers
20. [ ] Database Security
21. [ ] File Upload Security
22. [ ] API Security
23. [ ] Third-Party Integrations
24. [ ] Logging & Monitoring
25. [ ] Data Privacy & Compliance (GDPR/CCPA)
26. [ ] Mobile/API Client Security
27. [ ] WebSocket Security
28. [ ] Server-Side Request Forgery (SSRF)
29. [ ] Subdomain Takeover Prevention
30. [ ] Container & Infrastructure Security
31. [ ] CI/CD Pipeline Security
32. [ ] Backup & Disaster Recovery
33. [ ] Time-Based Vulnerabilities
34. [ ] Cryptographic Implementation
35. [ ] HTTP Parameter Pollution

**Deliverables:**
- [ ] Executive summary report
- [ ] Detailed vulnerability report with severity ratings
- [ ] Remediation code implementations
- [ ] Security checklist prioritized by severity
- [ ] Automated security tests
- [ ] Security configuration files
- [ ] Threat model diagram
- [ ] Compliance gap analysis

---

## 🔑 KEY DECISIONS MADE

1. **Single Restaurant (for now):**
   - Starting with single restaurant support
   - Multi-restaurant can be added in Phase 6

2. **Table Numbering:**
   - Support both numeric (1, 2, 3) and alphanumeric (A1, B2)
   - String type for table.number field

3. **QR Code Storage:**
   - Store QR URL in database (not image)
   - Generate QR image on-the-fly for display/download
   - Format: `${origin}/table/${tableNumber}`

4. **Default Restaurant:**
   - Create seed script for default restaurant
   - Or require admin to create restaurant first

5. **Authentication:**
   - JWT with jose library (Edge Runtime compatible)
   - bcryptjs for password hashing
   - HTTP-only cookies for session tokens
   - 24-hour token expiration

---

## 📊 SUCCESS METRICS

### Phase 1 Success Criteria:
- [x] Code merged to main branch
- [ ] Admin can generate QR codes for tables
- [ ] QR codes saved to database with table association
- [ ] Customer scans QR → correct table detected
- [ ] Orders linked to correct table
- [ ] Admin can see table-specific orders

---

## 🛠️ TECHNICAL STACK

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Lucide React icons

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)
- jose (JWT handling)
- bcryptjs (password hashing)

**Payments:**
- Stripe
- Apple Pay
- Google Pay

**Deployment:**
- Vercel
- GitHub Actions (future CI/CD)

**Development:**
- Git
- npm
- Prisma Studio

---

## 📁 KEY FILES REFERENCE

### Authentication
- `lib/auth.ts` - Authentication utilities
- `middleware.ts` - Route protection
- `app/admin/login/page.tsx` - Admin login page
- `scripts/seed-admin.js` - Admin user seed script

### Database
- `prisma/schema.prisma` - Database schema
- `lib/prisma.ts` - Prisma client

### QR Generator
- `app/qr-generator/page.tsx` - QR generator page (needs backend integration)
- `app/api/admin/qr-generator/route.ts` - To be created

### Admin
- `app/admin/page.tsx` - Admin dashboard
- `components/Navigation.tsx` - Navigation component

### Styling
- `app/globals.css` - Global styles with Splytro colors
- `app/landing.module.css` - Landing page styles

### Public Assets
- `public/logo2.png` - Restaurant logo
- `public/logo3.png` - Splytro logo

---

## 🚀 IMMEDIATE NEXT STEPS

1. **Create Backend API for QR Generation** (Phase 1)
   - File: `app/api/admin/qr-generator/route.ts`
   - Save tables to database
   - Generate QR URLs

2. **Update QR Generator Frontend** (Phase 1)
   - Add capacity input
   - Call backend API
   - Show existing tables

3. **Protect QR Generator Route** (Phase 1)
   - Update middleware.ts
   - Admin-only access

4. **Create Default Restaurant** (Phase 1)
   - Seed script or migration
   - Required for table association

5. **Testing** (Phase 1)
   - End-to-end QR generation flow
   - Customer scan → table detection
   - Order → payment → completion

---

**Next Review Date:** After Phase 1 completion
