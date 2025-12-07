import { NextRequest, NextResponse } from 'next/server';
import { paymobService } from '@/lib/paymob';
import { stripeService } from '@/lib/stripe-service';

type PaymentProvider = 'paymob' | 'stripe' | 'mock';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, paymentMethod, customerEmail, provider, customerName, customerPhone } = await request.json();

    console.log('Payment request:', { orderId, amount, paymentMethod, provider });

    // Determine which payment provider to use
    const paymentProvider: PaymentProvider = provider || 'mock';

    let paymentResult: any;

    // Route to appropriate payment provider
    switch (paymentProvider) {
      case 'paymob':
        paymentResult = await processPaymobPayment({
          orderId,
          amount,
          customerEmail,
          customerName,
          customerPhone,
        });
        break;

      case 'stripe':
        paymentResult = await processStripePayment({
          orderId,
          amount,
          customerEmail,
          customerName,
        });
        break;

      case 'mock':
      default:
        paymentResult = await processMockPayment({
          orderId,
          amount,
          customerEmail,
        });
        break;
    }

    // Update order status
    const baseUrl = process.env.NEXTAUTH_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    console.log('Updating order status:', { baseUrl, orderId, url: `${baseUrl}/api/orders/${orderId}` });

    const updateResponse = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentStatus: 'completed',
        status: 'confirmed'
      }),
    });

    console.log('Update response status:', updateResponse.status);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update order status:', errorText);
      throw new Error(`Failed to update order status: ${updateResponse.status} - ${errorText}`);
    }

    // Send receipt email (optional)
    try {
      await sendReceiptEmail(customerEmail, orderId, amount);
    } catch (emailError) {
      console.error('Failed to send receipt email:', emailError);
    }

    return NextResponse.json({
      success: true,
      ...paymentResult,
      orderId
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// Paymob payment processing
async function processPaymobPayment(data: any) {
  try {
    const paymentData = {
      amount: data.amount * 100, // Convert to cents
      currency: 'EGP',
      orderId: data.orderId,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerName: data.customerName,
    };

    const result = await paymobService.createPayment(paymentData);

    return {
      provider: 'paymob',
      paymentKey: result.paymentKey,
      iframeUrl: result.iframeUrl,
      paymobOrderId: result.orderId,
    };
  } catch (error) {
    console.error('Paymob payment error:', error);
    throw new Error('Paymob payment failed');
  }
}

// Stripe payment processing
async function processStripePayment(data: any) {
  try {
    if (!stripeService.isConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const paymentData = {
      amount: data.amount,
      currency: 'EGP',
      orderId: data.orderId,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
    };

    const result = await stripeService.createPaymentIntent(paymentData);

    return {
      provider: 'stripe',
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    };
  } catch (error) {
    console.error('Stripe payment error:', error);
    throw new Error('Stripe payment failed');
  }
}

// Mock payment processing (for demo/testing)
async function processMockPayment(data: any) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock payment success (90% success rate for demo)
  const paymentSuccess = Math.random() > 0.1;

  if (!paymentSuccess) {
    throw new Error('Payment declined');
  }

  return {
    provider: 'mock',
    paymentId: `pay_mock_${Date.now()}`,
  };
}

async function sendReceiptEmail(customerEmail: string, orderId: string, amount: number) {
  // Only send email if configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email configuration missing, skipping receipt email');
    return;
  }

  try {
    // Dynamic import to avoid build issues
    const nodemailer = await import('nodemailer');
    
    // Fixed: createTransport (not createTransporter)
    const transporter = nodemailer.default.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Receipt for Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Confirmation</h2>
          <p>Thank you for your order!</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total Amount:</strong> EGP ${amount.toFixed(2)}</p>
            <p><strong>Payment Status:</strong> Completed</p>
          </div>
          <p>Your order is being prepared and will be served shortly.</p>
          <p>You can view your receipt at: <a href="${baseUrl}/receipt/${orderId}">View Receipt</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Receipt email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error - just log it so payment still succeeds
  }
}