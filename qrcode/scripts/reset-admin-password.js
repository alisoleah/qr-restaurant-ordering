const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...');

    // New password: Admin123!
    const newPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find admin user
    const admin = await prisma.adminUser.findFirst({
      where: {
        username: 'admin'
      }
    });

    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin user...');

      const newAdmin = await prisma.adminUser.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        }
      });

      console.log('✅ New admin user created!');
      console.log('👤 Username: admin');
      console.log('🔑 Password: Admin123!');

    } else {
      // Update existing admin password
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });

      console.log('✅ Admin password updated successfully!');
      console.log('👤 Username:', admin.username);
      console.log('🔑 New Password: Admin123!');
    }

    console.log('\n🎉 You can now login at https://splytro.com/admin/login');
    console.log('   Username: admin');
    console.log('   Password: Admin123!');

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);

    if (error.message.includes('FATAL: Tenant or user not found')) {
      console.log('\n⚠️  DATABASE CONNECTION ERROR');
      console.log('Make sure your DATABASE_URL in .env file is correct.');
      console.log('Use the Supabase connection pooling URL (port 6543 with pgbouncer=true)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
