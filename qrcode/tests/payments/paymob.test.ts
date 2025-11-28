// tests/payments/paymob.test.ts
import { paymobService } from '../../lib/paymob';

describe('Paymob Payment Integration', () => {
  beforeAll(() => {
    // Set test environment variables
    process.env.PAYMOB_API_KEY = 'test_api_key';
    process.env.PAYMOB_INTEGRATION_ID = 'test_integration_id';
  });

  test('should create payment successfully', async () => {
    const paymentData = {
      amount: 1000,
      currency: 'EGP',
      orderId: 'TEST_123',
      customerEmail: 'test@example.com',
    };

    const result = await paymobService.createPayment(paymentData);
    
    expect(result).toHaveProperty('paymentKey');
    expect(result).toHaveProperty('iframeUrl');
    expect(result.iframeUrl).toContain('payment_token=');
  });

  test('should handle bill split payments', async () => {
    // Test individual person payments in bill splitting
    const billSplitPayments = [
      { personId: '1', amount: 1500 },
      { personId: '2', amount: 2000 },
      { personId: '3', amount: 1000 },
    ];

    for (const payment of billSplitPayments) {
      const result = await paymobService.createPayment({
        amount: payment.amount,
        currency: 'EGP',
        orderId: `BILL_SPLIT_${payment.personId}_${Date.now()}`,
      });

      expect(result).toHaveProperty('paymentKey');
    }
  });
});