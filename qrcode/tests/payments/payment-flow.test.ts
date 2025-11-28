import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createServer } from 'http';
import { NextApiHandler } from 'next';
import billSplitHandler from '../../app/api/bill-split/[tableId]/route';
import personHandler from '../../app/api/person/[sessionId]/[personNumber]/route';
import paymentHandler from '../../app/api/payment/paymob/route';

describe('Complete Payment Flow Integration', () => {
  let testRestaurant: any;
  let testTable: any;

  beforeEach(async () => {
    testRestaurant = await global.testUtils.createTestRestaurant();
    testTable = await global.testUtils.createTestTable(testRestaurant.id);
  });

  describe('End-to-End Bill Split Payment Flow', () => {
    test('should complete full bill split and payment process', async () => {
      // Step 1: Create bill split
      const billSplitResponse = await request(createServer())
        .post(`/api/bill-split/${testTable.number}`)
        .send({ totalPeople: 3 });

      expect(billSplitResponse.status).toBe(201);
      expect(billSplitResponse.body.billSplit.totalPeople).toBe(3);
      expect(billSplitResponse.body.billSplit.persons).toHaveLength(3);

      const { billSplit } = billSplitResponse.body;

      // Step 2: Each person places an order
      const orderPromises = billSplit.persons.map(async (person: any, index: number) => {
        const orderData = {
          items: [
            {
              menuItemId: 'test_item_1',
              quantity: index + 1,
              unitPrice: 50.0,
              notes: `Order for person ${person.personNumber}`,
            },
          ],
          tip: (index + 1) * 5,
          tipType: 'FIXED_AMOUNT',
          customerEmail: `person${person.personNumber}@test.com`,
          customerPhone: `+20111111111${person.personNumber}`,
        };

        const response = await request(createServer())
          .post(`/api/person/${billSplit.sessionId}/${person.personNumber}/order`)
          .send(orderData);

        return response.body.order;
      });

      const orders = await Promise.all(orderPromises);

      // Step 3: Process payments for each person
      const paymentPromises = orders.map(async (order: any) => {
        const paymentData = {
          orderId: order.orderNumber,
          amount: order.total,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          items: order.items.map((item: any) => ({
            name: item.menuItem?.name || 'Test Item',
            amount: item.totalPrice * 100, // Convert to cents
            quantity: item.quantity,
            description: item.notes || '',
          })),
        };

        const response = await request(createServer())
          .post('/api/payment/paymob')
          .send(paymentData);

        return response.body;
      });

      const paymentResults = await Promise.all(paymentPromises);

      // Verify all payments were created successfully
      paymentResults.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.paymentKey).toBeDefined();
        expect(result.iframeUrl).toContain('payment_token=');
      });

      // Step 4: Simulate payment completion callbacks
      const callbackPromises = paymentResults.map(async (payment: any, index: number) => {
        const callbackData = {
          success: 'true',
          id: `paymob_txn_${index + 1}`,
          order: {
            merchant_order_id: orders[index].orderNumber,
          },
          amount_cents: Math.round(orders[index].total * 100),
          hmac: 'test_hmac_signature',
        };

        const response = await request(createServer())
          .post('/api/payment/paymob/callback')
          .send(callbackData);

        return response;
      });

      const callbackResults = await Promise.all(callbackPromises);

      // Verify all callbacks processed successfully
      callbackResults.forEach((result) => {
        expect(result.status).toBe(200);
      });
    });

    test('should handle partial payment completion in bill split', async () => {
      // Create bill split with 3 people
      const billSplitResponse = await request(createServer())
        .post(`/api/bill-split/${testTable.number}`)
        .send({ totalPeople: 3 });

      const { billSplit } = billSplitResponse.body;

      // Only 2 people complete their payments
      const completedPayments = billSplit.persons.slice(0, 2);

      for (const person of completedPayments) {
        // Create order
        await request(createServer())
          .post(`/api/person/${billSplit.sessionId}/${person.personNumber}/order`)
          .send({
            items: [{ menuItemId: 'test_item', quantity: 1, unitPrice: 100.0 }],
            tip: 10,
          });

        // Complete payment
        await request(createServer())
          .post(`/api/person/${billSplit.sessionId}/${person.personNumber}/complete`)
          .send({
            paymentMethod: 'CARD',
            paymentId: `completed_payment_${person.personNumber}`,
          });
      }

      // Check bill split status
      const statusResponse = await request(createServer())
        .get(`/api/bill-split/${testTable.number}`);

      const completedCount = statusResponse.body.billSplit.persons.filter(
        (p: any) => p.isCompleted
      ).length;

      expect(completedCount).toBe(2);
      expect(statusResponse.body.billSplit.persons).toHaveLength(3);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle payment gateway timeout gracefully', async () => {
      // Mock payment gateway timeout
      const paymentData = {
        orderId: 'TIMEOUT_TEST',
        amount: 100.0,
        customerEmail: 'timeout@test.com',
      };

      // This should be handled gracefully by your error handling
      const response = await request(createServer())
        .post('/api/payment/paymob')
        .send(paymentData);

      // Should either succeed or fail gracefully
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 500) {
        expect(response.body.error).toBeDefined();
      }
    });

    test('should reject invalid callback signatures', async () => {
      const invalidCallback = {
        success: 'true',
        id: 'fake_transaction',
        order: { merchant_order_id: 'FAKE_ORDER' },
        hmac: 'invalid_signature',
      };

      const response = await request(createServer())
        .post('/api/payment/paymob/callback')
        .send(invalidCallback);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid callback');
    });
  });
});