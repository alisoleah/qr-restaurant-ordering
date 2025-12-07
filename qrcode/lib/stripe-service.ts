import Stripe from 'stripe';

interface PaymentData {
  amount: number; // Amount in EGP
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName?: string;
}

class StripeService {
  private stripe: Stripe | null = null;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return this.stripe !== null;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(paymentData: PaymentData) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        metadata: {
          orderId: paymentData.orderId,
        },
        receipt_email: paymentData.customerEmail,
        description: `Order #${paymentData.orderId}`,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw new Error('Failed to create Stripe payment intent');
    }
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(paymentIntentId: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new Error('Failed to confirm Stripe payment');
    }
  }

  /**
   * Retrieve payment status
   */
  async getPaymentStatus(paymentIntentId: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      console.error('Stripe status retrieval error:', error);
      throw new Error('Failed to get payment status');
    }
  }

  /**
   * Create a checkout session (alternative method)
   */
  async createCheckoutSession(paymentData: PaymentData, successUrl: string, cancelUrl: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: paymentData.currency.toLowerCase(),
              product_data: {
                name: `Order #${paymentData.orderId}`,
                description: `Restaurant order`,
              },
              unit_amount: Math.round(paymentData.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: paymentData.customerEmail,
        metadata: {
          orderId: paymentData.orderId,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Stripe checkout session error:', error);
      throw new Error('Failed to create checkout session');
    }
  }
}

export const stripeService = new StripeService();
