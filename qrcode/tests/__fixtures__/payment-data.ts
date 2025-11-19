export const testPaymentScenarios = {
  successful: {
    amount: 15000, // 150 EGP in cents
    currency: 'EGP',
    orderId: 'SUCCESS_TEST_123',
    customerEmail: 'success@test.com',
    customerPhone: '+201234567890',
    items: [
      {
        name: 'Test Menu Item',
        amount: 15000,
        quantity: 1,
        description: 'Test item for successful payment',
      },
    ],
  },
  
  failed: {
    amount: 5000,
    currency: 'EGP', 
    orderId: 'FAILED_TEST_456',
    customerEmail: 'failed@test.com',
    customerPhone: '+201234567891',
  },
  
  largeAmount: {
    amount: 500000, // 5000 EGP
    currency: 'EGP',
    orderId: 'LARGE_TEST_789',
    customerEmail: 'large@test.com',
  },
  
  billSplitScenario: {
    tableNumber: 'BS_TEST_001',
    totalPeople: 4,
    persons: [
      {
        personNumber: 1,
        orderAmount: 12000, // 120 EGP
        items: ['Burger', 'Fries'],
        tip: 1200, // 12 EGP
      },
      {
        personNumber: 2,
        orderAmount: 8000, // 80 EGP
        items: ['Pizza'],
        tip: 800, // 8 EGP
      },
      {
        personNumber: 3,
        orderAmount: 15000, // 150 EGP
        items: ['Steak', 'Salad'],
        tip: 2000, // 20 EGP
      },
      {
        personNumber: 4,
        orderAmount: 6000, // 60 EGP
        items: ['Soup'],
        tip: 600, // 6 EGP
      },
    ],
  },
};

export const testCallbacks = {
  successful: {
    success: 'true',
    id: 'paymob_success_123',
    order: { merchant_order_id: 'SUCCESS_TEST_123' },
    amount_cents: 15000,
    hmac: 'valid_hmac_signature',
  },
  
  failed: {
    success: 'false',
    id: 'paymob_failed_456',
    order: { merchant_order_id: 'FAILED_TEST_456' },
    amount_cents: 5000,
    hmac: 'valid_hmac_signature',
  },
  
  invalid: {
    success: 'true',
    id: 'paymob_invalid_789',
    order: { merchant_order_id: 'INVALID_TEST_789' },
    amount_cents: 10000,
    hmac: 'invalid_hmac_signature',
  },
};