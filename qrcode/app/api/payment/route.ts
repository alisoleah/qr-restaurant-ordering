import { NextRequest, NextResponse } from 'next/server';

// Mock payment processing for demo
// In production, integrate with Stripe, PayPal, or other payment providers
export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, paymentMethod, customerEmail } = await request.json();

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment success (90% success rate for demo)
    const paymentSuccess = Math.random() > 0.1;

    if (!paymentSuccess) {
      return NextResponse.json(
        { success: false, error: 'Payment declined' },
        { status: 400 }
      );
    }

    // Update order status
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
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

    if (!updateResponse.ok) {
      throw new Error('Failed to update order status');
    }

    // Send receipt email (optional - requires email configuration)
    try {
      await sendReceiptEmail(customerEmail, orderId, amount);
    } catch (emailError) {
      console.error('Failed to send receipt email:', emailError);
      // Don't fail the payment if email fails
    }

    return NextResponse.json({
      success: true,
      paymentId: `pay_${Date.now()}`,
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

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    
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