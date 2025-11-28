// 3. Paymob Service (lib/paymob.ts)
import axios from 'axios';

interface PaymobConfig {
  apiKey: string;
  integrationId: string;
  hmacSecret: string;
  baseUrl: string;
  iframeUrl: string;
}

interface PaymentData {
  amount: number; // Amount in cents (e.g., 1000 = 10 EGP)
  currency: string;
  orderId: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  items?: Array<{
    name: string;
    amount: number;
    description?: string;
    quantity: number;
  }>;
}

class PaymobService {
  private config: PaymobConfig;

  constructor() {
    this.config = {
      apiKey: process.env.PAYMOB_API_KEY!,
      integrationId: process.env.PAYMOB_INTEGRATION_ID!,
      hmacSecret: process.env.PAYMOB_HMAC_SECRET!,
      baseUrl: process.env.PAYMOB_BASE_URL!,
      iframeUrl: process.env.PAYMOB_IFRAME_URL!,
    };
  }

  // Step 1: Get Authentication Token
  async getAuthToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.config.baseUrl}/auth/tokens`, {
        api_key: this.config.apiKey,
      });
      return response.data.token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Failed to authenticate with Paymob');
    }
  }

  // Step 2: Create Order
  async createOrder(token: string, paymentData: PaymentData) {
    try {
      const response = await axios.post(`${this.config.baseUrl}/ecommerce/orders`, {
        auth_token: token,
        delivery_needed: false,
        amount_cents: paymentData.amount,
        currency: paymentData.currency,
        merchant_order_id: paymentData.orderId,
        items: paymentData.items || [],
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Step 3: Create Payment Key
  async createPaymentKey(token: string, order: any, paymentData: PaymentData): Promise<string> {
    try {
      const billingData = {
        apartment: "NA",
        email: paymentData.customerEmail || "test@example.com",
        floor: "NA",
        first_name: paymentData.customerName?.split(' ')[0] || "Test",
        street: "NA",
        building: "NA",
        phone_number: paymentData.customerPhone || "+201000000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        last_name: paymentData.customerName?.split(' ')[1] || "User",
        state: "Cairo"
      };

      const response = await axios.post(`${this.config.baseUrl}/acceptance/payment_keys`, {
        auth_token: token,
        amount_cents: paymentData.amount,
        expiration: 3600,
        order_id: order.id,
        billing_data: billingData,
        currency: paymentData.currency,
        integration_id: this.config.integrationId,
      });

      return response.data.token;
    } catch (error) {
      console.error('Error creating payment key:', error);
      throw new Error('Failed to create payment key');
    }
  }

  // Complete payment process
  async createPayment(paymentData: PaymentData) {
    try {
      const token = await this.getAuthToken();
      const order = await this.createOrder(token, paymentData);
      const paymentKey = await this.createPaymentKey(token, order, paymentData);

      return {
        paymentKey,
        orderId: order.id,
        iframeUrl: `${this.config.iframeUrl}/${this.config.integrationId}?payment_token=${paymentKey}`,
      };
    } catch (error) {
      console.error('Error in payment process:', error);
      throw error;
    }
  }

  // Verify payment callback
  verifyCallback(data: any): boolean {
    // Implement HMAC verification here
    // This is crucial for security
    const hmacSignature = data.hmac;
    // Verify hmac using your secret
    return true; // Replace with actual verification
  }
}

export const paymobService = new PaymobService();