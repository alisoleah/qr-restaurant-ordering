import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Fine Dining Restaurant',
      address: '123 Gourmet Street, Cairo, Egypt',
      phone: '+20 2 1234 5678',
      email: 'info@finedining.com',
      taxRate: 0.14,
      serviceChargeRate: 0.12,
    },
  })
  console.log('✅ Created restaurant:', restaurant.name)

  // Create categories
  const appetizers = await prisma.category.create({
    data: {
      name: 'Appetizers',
      description: 'Start your meal with our delicious appetizers',
      sortOrder: 1,
    },
  })

  const mainCourse = await prisma.category.create({
    data: {
      name: 'Main Course',
      description: 'Our signature main dishes',
      sortOrder: 2,
    },
  })

  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Refreshing drinks and beverages',
      sortOrder: 3,
    },
  })

  const desserts = await prisma.category.create({
    data: {
      name: 'Desserts',
      description: 'Sweet endings to your meal',
      sortOrder: 4,
    },
  })

  console.log('✅ Created categories:', [appetizers.name, mainCourse.name, beverages.name, desserts.name])

  // Create menu items
  const menuItems = await prisma.menuItem.createMany({
    data: [
      // Appetizers
      {
        name: 'Lobster Bisque',
        description: 'Rich and creamy lobster soup with cognac and fresh herbs',
        price: 1024.00,
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
        categoryId: appetizers.id,
        restaurantId: restaurant.id,
        sortOrder: 1,
      },
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan, croutons, and classic Caesar dressing',
        price: 680.00,
        image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400',
        categoryId: appetizers.id,
        restaurantId: restaurant.id,
        sortOrder: 2,
      },
      // Main Course
      {
        name: 'Filet Mignon',
        description: 'Tender beef filet grilled to perfection, served with roasted vegetables and red wine jus',
        price: 2432.00,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        categoryId: mainCourse.id,
        restaurantId: restaurant.id,
        sortOrder: 1,
      },
      {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with lemon butter and seasonal vegetables',
        price: 1890.00,
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        categoryId: mainCourse.id,
        restaurantId: restaurant.id,
        sortOrder: 2,
      },
      {
        name: 'Truffle Risotto',
        description: 'Creamy arborio rice with black truffle and parmesan',
        price: 1650.00,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400',
        categoryId: mainCourse.id,
        restaurantId: restaurant.id,
        sortOrder: 3,
      },
      // Beverages
      {
        name: 'Evian Water',
        description: 'Premium natural mineral water from the French Alps',
        price: 320.00,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        categoryId: beverages.id,
        restaurantId: restaurant.id,
        sortOrder: 1,
      },
      {
        name: 'House Wine',
        description: 'Selection of red or white wine from our house collection',
        price: 450.00,
        image: 'https://images.unsplash.com/photo-1566754966463-c492ff305ac7?w=400',
        categoryId: beverages.id,
        restaurantId: restaurant.id,
        sortOrder: 2,
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice from local oranges',
        price: 280.00,
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
        categoryId: beverages.id,
        restaurantId: restaurant.id,
        sortOrder: 3,
      },
      // Desserts
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        price: 520.00,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
        categoryId: desserts.id,
        restaurantId: restaurant.id,
        sortOrder: 1,
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 480.00,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        categoryId: desserts.id,
        restaurantId: restaurant.id,
        sortOrder: 2,
      },
    ],
  })

  console.log('✅ Created menu items:', menuItems.count)

  // Create tables
  const tables = []
  for (let i = 1; i <= 20; i++) {
    tables.push({
      number: i.toString(),
      capacity: i <= 10 ? 4 : i <= 15 ? 6 : 8,
      restaurantId: restaurant.id,
      status: 'AVAILABLE',
    })
  }

  const createdTables = await prisma.table.createMany({
    data: tables,
  })

  console.log('✅ Created tables:', createdTables.count)

  console.log('🎉 Database seeded successfully!')
  console.log(`
📊 Summary:
- Restaurant: ${restaurant.name}
- Categories: 4 (Appetizers, Main Course, Beverages, Desserts)
- Menu Items: ${menuItems.count}
- Tables: ${createdTables.count} (Tables 1-20)
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('✅ Database connection closed')
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })