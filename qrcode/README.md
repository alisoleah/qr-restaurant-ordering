# 🍽️ QR Restaurant Ordering System

A complete contactless restaurant ordering system built with Next.js 14, TypeScript, Prisma, and PostgreSQL. Customers scan QR codes to view menus, place orders individually or split bills, add tips, and pay directly from their phones.

## ✨ Features

### 👥 Customer Experience
- 📱 **QR Code Scanning** - Scan table QR codes to access menu
- 🍽️ **Digital Menu** - Browse categorized menu items with images and favorites
- 🛒 **Shopping Cart** - Add items, adjust quantities, review orders
- 👨‍👩‍👧‍👦 **Bill Splitting** - Multiple people can order individually from the same table
- 🔗 **Individual Sessions** - Each person gets their own QR code and ordering session
- 💰 **Flexible Tipping** - Choose from 5%, 10%, 20% or custom tip amounts
- 💳 **Secure Payment** - Pay with credit/debit cards or Apple Pay (each person pays separately)
- 📧 **Digital Receipts** - Automatic email receipts and confirmation

### 🏪 Restaurant Management
- 👨‍💼 **Admin Dashboard** - Monitor all orders in real-time
- 📊 **Order Tracking** - Track orders from pending to completion
- 🏷️ **QR Generator** - Generate and print QR codes for tables and individuals
- 👥 **Group Management** - Handle bill splitting sessions and individual orders
- 📈 **Analytics** - View revenue and order statistics
- ⚡ **Live Updates** - Real-time order status updates
- 🗄️ **Database Management** - Full data persistence with PostgreSQL

### 🛠️ Technical Features
- 🚀 **Next.js 14** - Built with App Router and TypeScript
- 🗄️ **PostgreSQL + Prisma** - Robust database with type-safe queries
- 🎨 **Tailwind CSS** - Modern, responsive design
- 📱 **Mobile-First** - Optimized for phone usage
- 🔒 **Secure** - Payment processing and data protection
- ☁️ **Cloud Ready** - Deploy to Vercel with Supabase
- 🔄 **Bill Splitting Engine** - Advanced group ordering and payment splitting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/qr-restaurant-ordering.git
   cd qr-restaurant-ordering
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database** (Choose one option)

   **Option A: Supabase (Recommended - Free cloud PostgreSQL)**
   ```bash
   # 1. Go to https://supabase.com and create a new project
   # 2. Get your database URL from Settings > Database
   # 3. Copy the connection string
   ```

   **Option B: Local PostgreSQL**
   ```bash
   # Install PostgreSQL locally and create a database
   createdb restaurant_db
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```bash
   # Database (Supabase example)
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
   
   # App Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-key
   
   # Optional for full functionality
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   
   # Seed with initial data
   npm run db:seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Visit `http://localhost:3000`

## 🗄️ Database Schema

### Core Models
- **Restaurant**: Restaurant information and settings (tax rates, service charges)
- **Table**: Restaurant tables with QR codes and status tracking
- **BillSplit**: Bill splitting sessions for group ordering
- **Person**: Individual people in bill splitting scenarios with their own QR codes
- **Category**: Menu categories for organization
- **MenuItem**: Menu items with pricing, images, and availability
- **Order**: Customer orders with payment information (linked to persons for bill splitting)
- **OrderItem**: Individual items within orders

### Key Relationships & Features
- Tables belong to Restaurants
- BillSplits belong to Tables and manage group sessions
- Persons belong to BillSplits (each person gets unique QR code)
- Orders can be regular OR linked to Persons (bill splitting mode)
- OrderItems belong to Orders and reference MenuItems
- Automatic tax and service charge calculations per restaurant
- Individual payment tracking per person in bill splits

## 🗄️ Database Commands

### Core Database Operations
```bash
# Generate Prisma client (run after schema changes)
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create and apply migrations (production)
npx prisma migrate dev

# Seed database with sample data
npm run db:seed

# Open database admin interface
npx prisma studio
```

### Development Workflow
```bash
# Reset database (careful - deletes all data!)
npx prisma migrate reset

# Pull schema from existing database
npx prisma db pull

# Validate your schema
npx prisma validate

# View database connection
npx prisma version
```

### Data Management
```bash
# Backup database (PostgreSQL)
pg_dump $DATABASE_URL > backup.sql

# Restore database (PostgreSQL)
psql $DATABASE_URL < backup.sql

# View all tables in Prisma Studio
npx prisma studio
```

## 📱 Demo & Testing

### Regular Customer Flow
1. Visit `http://localhost:3000/table/12` (or scan generated QR code)
2. Browse menu items with images and descriptions
3. Add items to cart with quantity selection
4. Proceed to checkout and add tip (5%, 10%, 20%, or custom)
5. Enter email and complete payment
6. Receive digital receipt

### Bill Splitting Flow
1. **Scan Table QR**: First person scans the table QR code
2. **Choose Bill Split**: Select "Split Bill" option
3. **Set Group Size**: Specify number of people in the group
4. **Generate Individual QRs**: System creates unique QR codes for each person
5. **Individual Ordering**: Each person scans their QR code at `/person/[sessionId]/[personNumber]`
6. **Separate Carts**: Each person has their own cart and ordering session
7. **Individual Payments**: Each person pays only for their own items
8. **Separate Receipts**: Each person gets their own digital receipt

### Restaurant Management
1. Visit `http://localhost:3000/admin` to view all orders
2. Monitor both regular orders and bill split sessions
3. Update order status as you prepare food
4. Generate QR codes at `http://localhost:3000/qr-generator`
5. Track individual payments within bill split groups
6. Monitor real-time order updates

### API Testing
```bash
# Test regular API endpoints
curl http://localhost:3000/api/menu
curl http://localhost:3000/api/tables/1
curl http://localhost:3000/api/orders

# Test bill splitting endpoints
curl http://localhost:3000/api/bill-split/12
curl http://localhost:3000/api/person/session123/1
```

## 🏗️ Project Structure

```
qr-restaurant-ordering/
├── app/                     # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── menu/           # Menu items endpoint
│   │   ├── orders/         # Order management
│   │   ├── payment/        # Payment processing
│   │   ├── tables/         # Table information
│   │   ├── bill-split/     # Bill splitting management
│   │   │   └── [tableId]/  # Table-specific bill splits
│   │   └── person/         # Individual person APIs
│   │       └── [sessionId]/[personNumber]/
│   │           ├── route.ts          # Get person data
│   │           ├── order/route.ts    # Create individual order
│   │           └── complete/route.ts # Complete payment
│   ├── admin/              # Admin dashboard
│   ├── checkout/           # Regular checkout with tips
│   ├── bill-split/         # Bill splitting setup interface
│   │   └── [tableId]/      # Bill split management per table
│   ├── person/             # Individual ordering interface
│   │   └── [sessionId]/[personNumber]/ # Personal menu & cart
│   ├── qr-generator/       # QR code generation
│   ├── receipt/            # Digital receipts
│   └── table/              # Customer menu interface
├── components/             # Reusable components
│   ├── MenuSection.tsx     # Menu display component
│   ├── PersonCartSummary.tsx # Individual cart for bill splitting
│   └── ...                 # Other UI components
├── context/               # React context (cart state)
├── lib/                   # Database configuration
│   └── db.ts              # Prisma client setup
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Complete database schema
│   └── seed.ts           # Sample data with bill splitting examples
├── types/                 # TypeScript definitions
└── data/                  # Static data (fallback)
```

## 🔧 API Endpoints

### Menu & Tables
- `GET /api/menu` - Get all menu items and categories
- `GET /api/tables/[id]` - Get table information
- `POST /api/tables/[id]/qr` - Generate table QR code

### Regular Orders
- `POST /api/orders` - Create new regular order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order status

### Bill Splitting APIs
- `GET /api/bill-split/[tableId]` - Get active bill split for table
- `POST /api/bill-split/[tableId]` - Create new bill split session
- `PATCH /api/bill-split/[tableId]` - Update bill split (add/remove people)

### Individual Person APIs (Bill Splitting)
- `GET /api/person/[sessionId]/[personNumber]` - Get person data and session info
- `POST /api/person/[sessionId]/[personNumber]/order` - Create individual order
- `POST /api/person/[sessionId]/[personNumber]/complete` - Complete individual payment

### Admin APIs
- `GET /api/admin/orders` - Get all orders with bill split details
- `GET /api/admin/bill-splits` - Get all active bill splitting sessions
- `PATCH /api/admin/orders/[id]` - Update order status

## 🎨 Customization

### Menu Items
Edit the database through Prisma Studio or update the seed file:

```bash
# Open database admin
npx prisma studio

# Or modify prisma/seed.ts and re-run
npm run db:seed
```

### Restaurant Settings
Update restaurant information in the database:

```sql
UPDATE restaurants SET 
  name = 'Your Restaurant Name',
  taxRate = 0.15,
  serviceChargeRate = 0.10
WHERE id = 'your-restaurant-id';
```

### Bill Splitting Configuration
Configure bill splitting limits and behavior:

```sql
-- Set maximum people per bill split
UPDATE restaurants SET 
  maxBillSplitPeople = 10
WHERE id = 'your-restaurant-id';
```

### Database Schema
Modify `prisma/schema.prisma` and apply changes:

```bash
# After schema changes
npx prisma db push

# Or create a migration
npx prisma migrate dev --name describe-your-changes
```

## 🚀 Deployment

### Deploy to Vercel with Supabase

1. **Set up Supabase database**
   ```bash
   # Already done in setup, just ensure it's working
   npx prisma db push
   npm run db:seed
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure environment variables in Vercel**
   - Go to your Vercel project dashboard
   - Add all environment variables from `.env.local`
   - Ensure `NEXTAUTH_URL` points to your Vercel domain
   - Redeploy

4. **Verify bill splitting functionality**
   ```bash
   # Test bill splitting in production
   curl https://your-app.vercel.app/api/bill-split/12
   ```

### Other Deployment Options
- **Railway**: `railway deploy`
- **Heroku**: Add PostgreSQL addon and deploy
- **DigitalOcean App Platform**: Connect GitHub and deploy

## 🔧 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgresql://...` |
| `NEXTAUTH_URL` | Your app's URL | ✅ | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Random secret key | ✅ | `your-secret-key` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | ⚪ | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | ⚪ | `sk_test_...` |
| `EMAIL_USER` | Email for receipts | ⚪ | `your@email.com` |
| `EMAIL_PASS` | Email password | ⚪ | `your-app-password` |

## 🧪 Testing

### Unit Tests
```bash
npm run test
npm run test:watch
```

### Bill Splitting Testing
```bash
# Test bill splitting flow
npm run test:bill-split

# Test individual person ordering
npm run test:person-flow
```

### Load Testing
```bash
# Test API endpoints
npm run test:api

# Test database performance with bill splits
npm run test:db
```

### Manual Testing Scenarios

**Scenario 1: Regular Order**
1. Visit `/table/12`
2. Add items to cart
3. Complete checkout with tip
4. Verify receipt

**Scenario 2: Bill Splitting**
1. Visit `/table/12`
2. Choose "Split Bill"
3. Set 3 people
4. Each person orders individually
5. Verify separate payments and receipts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly (including bill splitting)
4. Update database schema if needed: `npx prisma migrate dev`
5. Test both regular and bill splitting flows
6. Commit changes: `git commit -m 'Add feature'`
7. Push to branch: `git push origin feature-name`
8. Submit a pull request

## 🐛 Troubleshooting

### Database Issues
```bash
# Can't connect to database
npx prisma validate

# Schema out of sync
npx prisma db push

# Reset everything (careful!)
npx prisma migrate reset
```

### Bill Splitting Issues
```bash
# Debug bill split sessions
npx prisma studio
# Navigate to BillSplit and Person tables

# Check session IDs
curl http://localhost:3000/api/bill-split/[tableId]

# Verify person data
curl http://localhost:3000/api/person/[sessionId]/[personNumber]
```

### Common Errors
- **P1001**: Database unreachable - check connection string
- **P3006**: Migration failed - check schema syntax
- **P2025**: Record not found - ensure data exists
- **Bill Split Error**: Invalid session - check sessionId and personNumber
- **Person Not Found**: Check if bill split is active and person exists

### Performance Issues
```bash
# Check database performance
npx prisma studio

# Optimize bill splitting queries
npm run analyze

# Monitor active sessions
curl http://localhost:3000/api/admin/bill-splits
```

## 🗺️ Roadmap

### Upcoming Features
- [ ] Real-time payment integration (Stripe)
- [ ] Advanced bill splitting (custom splits, partial payments)
- [ ] Email receipt system with bill split details
- [ ] Restaurant staff authentication
- [ ] Multi-restaurant support
- [ ] Order analytics with bill splitting insights
- [ ] Mobile app for restaurant staff
- [ ] Integration with kitchen display systems
- [ ] Customer feedback and rating system
- [ ] Loyalty program integration
- [ ] Multi-language support

### Bill Splitting Enhancements
- [ ] Custom split amounts (not just equal splits)
- [ ] Shared items (split appetizers between people)
- [ ] Group discounts and promotions
- [ ] Advanced group management (add/remove people mid-session)
- [ ] Bill split analytics for restaurants

### Technical Improvements
- [ ] Comprehensive test coverage (including bill splitting)
- [ ] Performance optimization for large groups
- [ ] Advanced caching strategies
- [ ] Real-time WebSocket updates for group orders
- [ ] Progressive Web App (PWA) features
- [ ] Advanced error handling and logging
- [ ] Database migration strategies
- [ ] CI/CD pipeline setup

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

If you find this project helpful, please give it a ⭐️ on GitHub!

## 📞 Contact

- Create an [Issue](https://github.com/alisoleah/qr-restaurant-ordering/issues) for bug reports
- [Discussions](https://github.com/alisoleah/qr-restaurant-ordering/discussions) for questions
- Email: ali.soleah@gmail.com

---

Built with ❤️ for restaurants worldwide. Transform your dining experience with contactless ordering and advanced bill splitting!