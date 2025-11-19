// 4. API Route for Payment Creation (app/api/payment/paymob/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { paymobService } from '../../../../lib/paymob';

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, customerEmail, customerPhone, customerName, items } = await req.json();

    const paymentData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'EGP',
      orderId,
      customerEmail,
      customerPhone,
      customerName,
      items,
    };

    const payment = await paymobService.createPayment(paymentData);

    return NextResponse.json({
      success: true,
      paymentKey: payment.paymentKey,
      iframeUrl: payment.iframeUrl,
      orderId: payment.orderId,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
