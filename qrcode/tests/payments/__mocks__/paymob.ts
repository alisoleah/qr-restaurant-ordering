export const mockPaymobService = {
  getAuthToken: jest.fn().mockResolvedValue('mock_auth_token'),
  
  createOrder: jest.fn().mockResolvedValue({
    id: 'mock_order_123',
    amount_cents: 10000,
    currency: 'EGP',
  }),
  
  createPaymentKey: jest.fn().mockResolvedValue('mock_payment_key'),
  
  createPayment: jest.fn().mockResolvedValue({
    paymentKey: 'mock_payment_key',
    orderId: 'mock_order_123',
    iframeUrl: 'https://accept.paymob.com/api/acceptance/iframes/123?payment_token=mock_payment_key',
  }),
  
  verifyCallback: jest.fn().mockReturnValue(true),
};

// Replace the actual service in tests
jest.mock('../../../lib/paymob', () => ({
  paymobService: mockPaymobService,
}));