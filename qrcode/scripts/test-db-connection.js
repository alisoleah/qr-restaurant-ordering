const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test 1: Connect to database
    console.log('1️⃣ Testing connection...');
    await prisma.$connect();
    console.log('   ✅ Connected successfully\n');

    // Test 2: Count tables
    console.log('2️⃣ Counting tables...');
    const tableCount = await prisma.table.count();
    console.log(`   ✅ Found ${tableCount} table(s)\n`);

    // Test 3: Count menu items
    console.log('3️⃣ Counting menu items...');
    const menuCount = await prisma.menuItem.count();
    console.log(`   ✅ Found ${menuCount} menu item(s)\n`);

    // Test 4: Check for restaurant
    console.log('4️⃣ Checking for restaurant...');
    const restaurant = await prisma.restaurant.findFirst();
    if (restaurant) {
      console.log(`   ✅ Found restaurant: ${restaurant.name}\n`);
    } else {
      console.log('   ⚠️  No restaurant found - run seed script\n');
    }

    // Test 5: Check for admin user
    console.log('5️⃣ Checking for admin user...');
    const admin = await prisma.adminUser.findFirst();
    if (admin) {
      console.log(`   ✅ Found admin: ${admin.email}\n`);
    } else {
      console.log('   ⚠️  No admin user found - run reset-admin-password.js\n');
    }

    console.log('🎉 All checks passed! Database is healthy.');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);

    if (error.message.includes('FATAL: Tenant or user not found')) {
      console.log('\n⚠️  SUPABASE CONNECTION ERROR');
      console.log('\nYour DATABASE_URL is incorrect or using wrong connection mode.');
      console.log('\n📝 How to fix:');
      console.log('1. Go to Supabase Dashboard → Project Settings → Database');
      console.log('2. Select "Connection pooling" (NOT "Session mode")');
      console.log('3. Copy the connection string (should have port 6543 and pgbouncer=true)');
      console.log('4. Update your .env file with the new URL');
      console.log('5. Run this script again');
    } else if (error.message.includes('invalid password')) {
      console.log('\n⚠️  PASSWORD ERROR');
      console.log('The password in your DATABASE_URL is incorrect.');
    } else if (error.message.includes('timeout')) {
      console.log('\n⚠️  TIMEOUT ERROR');
      console.log('Cannot reach the database. Check your internet connection.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
