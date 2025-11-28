Step-by-Step Instructions
1. Navigate to the qrcode directory
cd qrcode
2. Install dependencies
npm install
3. Set up the database
# Generate Prisma client
npx prisma generate

# Push the database schema to Supabase
npx prisma db push

# Seed the database with sample data
npm run db:seed
4. Run the development server
npm run dev
5. Open your browser
The app will be running at: http://localhost:3000
Test the Application
Once running, try these URLs:
Customer Menu: http://localhost:3000/table/12
Admin Dashboard: http://localhost:3000/admin
QR Generator: http://localhost:3000/qr-generator
Bill Splitting: http://localhost:3000/bill-split/12
Troubleshooting
If you encounter any database connection issues:
# Verify your Prisma setup
npx prisma validate

# Open Prisma Studio to view your database
npx prisma studio