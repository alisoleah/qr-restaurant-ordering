const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding default restaurant...');

  // Check if restaurant already exists
  const existingRestaurant = await prisma.restaurant.findFirst();

  if (existingRestaurant) {
    console.log('✅ Restaurant already exists:', existingRestaurant.name);
    console.log('   ID:', existingRestaurant.id);
    return existingRestaurant;
  }

  // Create default restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Splytro Restaurant',
      address: '123 Main Street, Cairo, Egypt',
      phone: '+20 2 1234 5678',
      email: 'contact@splytro.com',
      taxRate: 0.14, // 14% VAT (Egypt standard rate)
      serviceChargeRate: 0.12, // 12% service charge
    },
  });

  console.log('✅ Created default restaurant:', restaurant.name);
  console.log('   ID:', restaurant.id);
  console.log('   Tax Rate:', (restaurant.taxRate * 100) + '%');
  console.log('   Service Charge:', (restaurant.serviceChargeRate * 100) + '%');

  return restaurant;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding restaurant:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
