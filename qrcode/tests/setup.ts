import { beforeAll, afterAll } from '@jest/globals';
import { db } from '../lib/db';

// Global test setup
beforeAll(async () => {
  // Connect to test database
  console.log('Setting up test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  
  // Clean database before tests
  await cleanDatabase();
});

afterAll(async () => {
  // Clean up after all tests
  await cleanDatabase();
  await db.$disconnect();
  console.log('Test environment cleaned up');
});

async function cleanDatabase() {
  // Clean all tables in reverse dependency order
  const tablenames = [
    'order_items',
    'orders', 
    'persons',
    'bill_splits',
    'menu_items',
    'categories',
    'tables',
    'restaurants'
  ];

  try {
    for (const tablename of tablenames) {
      await db.$executeRawUnsafe(`DELETE FROM "${tablename}"`);
    }
  } catch (error) {
    console.log('Database cleanup error:', error);
  }
}

// Global test utilities
global.testUtils = {
  cleanDatabase,
  createTestRestaurant: async () => {
    return await db.restaurant.create({
      data: {
        name: 'Test Restaurant',
        address: '123 Test Street, Cairo',
        phone: '+201234567890',
        email: 'test@restaurant.com',
        taxRate: 0.14,
        serviceChargeRate: 0.12,
      },
    });
  },
  
  createTestTable: async (restaurantId: string) => {
    return await db.table.create({
      data: {
        number: `TEST_${Date.now()}`,
        capacity: 4,
        status: 'AVAILABLE',
        restaurantId,
      },
    });
  },
  
  createTestBillSplit: async (tableId: string, totalPeople: number = 3) => {
    return await db.billSplit.create({
      data: {
        tableId,
        sessionId: `TEST_SESSION_${Date.now()}`,
        totalPeople,
        isActive: true,
      },
    });
  },
};

// Extend global types
declare global {
  var testUtils: {
    cleanDatabase: () => Promise<void>;
    createTestRestaurant: () => Promise<any>;
    createTestTable: (restaurantId: string) => Promise<any>;
    createTestBillSplit: (tableId: string, totalPeople?: number) => Promise<any>;
  };
}