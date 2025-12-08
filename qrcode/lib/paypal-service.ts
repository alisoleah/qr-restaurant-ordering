// PayPal SDK Service for processing payments
class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private mode: 'sandbox' | 'live';
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.mode = (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox';
    this.baseUrl = this.mode === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  async createOrder(params: {
    amount: number;
    currency?: string;
    orderId: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{
    orderId: string;
    approvalUrl: string;
  }> {
    const accessToken = await this.getAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: params.orderId,
        amount: {
          currency_code: params.currency || 'USD',
          value: params.amount.toFixed(2),
        },
      }],
      application_context: {
        brand_name: 'Restaurant Ordering',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    };

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal order creation error:', error);
      throw new Error('Failed to create PayPal order');
    }

    const data = await response.json();
    const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;

    return {
      orderId: data.id,
      approvalUrl: approvalUrl || '',
    };
  }

  async captureOrder(paypalOrderId: string): Promise<{
    status: string;
    captureId: string;
  }> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal capture error:', error);
      throw new Error('Failed to capture PayPal payment');
    }

    const data = await response.json();
    const capture = data.purchase_units[0].payments.captures[0];

    return {
      status: capture.status,
      captureId: capture.id,
    };
  }
}

export const paypalService = new PayPalService();
