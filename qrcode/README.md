# 🍽️ QR Restaurant Ordering System

A complete contactless restaurant ordering system built with Next.js and PostgreSQL. Customers scan QR codes to view menus, place orders, add tips, and pay directly from their phones.

## ✨ Features

### 👥 Customer Experience
- 📱 **QR Code Scanning** - Scan table QR codes to access menu
- 🍽️ **Digital Menu** - Browse categorized menu items with images and favorites
- 🛒 **Shopping Cart** - Add items, adjust quantities, review orders
- 💰 **Flexible Tipping** - Choose from 5%, 10%, 20% or custom tip amounts
- 💳 **Secure Payment** - Pay with credit/debit cards or Apple Pay
- 📧 **Digital Receipts** - Automatic email receipts and confirmation

### 🏪 Restaurant Management
- 👨‍💼 **Admin Dashboard** - Monitor all orders in real-time
- 📊 **Order Tracking** - Track orders from pending to completion
- 🏷️ **QR Generator** - Generate and print QR codes for tables
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

### Customer Flow
1. Visit `http://localhost:3000/table/12` (or scan generated QR code)
2. Browse menu items with images and descriptions
3. Add items to cart with quantity selection
4. Proceed to checkout and add tip (5%, 10%, 20%, or custom)
5. Enter email and complete payment
6. Receive digital receipt

### Restaurant Management
1. Visit `http://localhost:3000/admin` to view orders
2. Update order status as you prepare food
3. Generate QR codes at `http://localhost:3000/qr-generator`
4. Monitor real-time order updates

### API Testing
```bash
# Test API endpoints
curl http://localhost:3000/api/menu
curl http://localhost:3000/api/tables/1
curl http://localhost:3000/api/orders
```

## 🏗️ Project Structure

```
qr-restaurant-ordering/
├── app/                     # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── menu/           # Menu items endpoint
│   │   ├── orders/         # Order management
│   │   ├── payment/        # Payment processing
│   │   └── tables/         # Table information
│   ├── admin/              # Admin dashboard
│   ├── checkout/           # Checkout with tips
│   ├── qr-generator/       # QR code generation
│   ├── receipt/            # Digital receipts
│   └── table/              # Customer menu interface
├── components/             # Reusable components
├── context/               # React context (cart state)
├── lib/                   # Database configuration
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Sample data
├── types/                 # TypeScript definitions
└── data/                  # Static data (fallback)
```

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
   - Redeploy

4. **Update database connection for production**
   ```bash
   # Set production URL in Vercel environment variables
   NEXTAUTH_URL=https://your-app.vercel.app
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

### Unit Tests (TODO)
```bash
npm run test
npm run test:watch
```

### Load Testing
```bash
# Test API endpoints
npm run test:api

# Test database performance
npm run test:db
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Update database schema if needed: `npx prisma migrate dev`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

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

### Common Errors
- **P1001**: Database unreachable - check connection string
- **P3006**: Migration failed - check schema syntax
- **P2025**: Record not found - ensure data exists

### Performance Issues
```bash
# Check database performance
npx prisma studio

# Optimize queries
npm run analyze
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

If you find this project helpful, please give it a ⭐️ on GitHub!

## 📞 Contact

- Create an [Issue](https://github.com/YOUR_USERNAME/qr-restaurant-ordering/issues) for bug reports
- [Discussions](https://github.com/YOUR_USERNAME/qr-restaurant-ordering/discussions) for questions
- Email: your-email@example.com

---

Built with ❤️ for restaurants worldwide. Transform your dining experience with contactless ordering!      