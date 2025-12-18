const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function seedAdmin() {
  try {
    console.log('Seeding admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    // Create default admin user
    // IMPORTANT: Change this password after first login!
    const defaultPassword = 'admin123';
    const hashedPassword = await hashPassword(defaultPassword);

    const admin = await prisma.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Please change the default password after first login!\n');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
