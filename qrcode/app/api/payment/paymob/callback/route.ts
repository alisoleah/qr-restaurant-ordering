// 5. API Route for Payment Callback (app/api/payment/paymob/callback/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { paymobService } from '../../../../../lib/paymob';
import { db } from '../../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const callbackData = await req.json();

    // Verify the callback
    if (!paymobService.verifyCallback(callbackData)) {
      return NextResponse.json({ error: 'Invalid callback' }, { status: 400 });
    }

    const { success, order, amount_cents } = callbackData;

    if (success === 'true') {
      // Update order status in database
      await db.order.update({
        where: { orderNumber: order.merchant_order_id },
        data: {
          paymentStatus: 'COMPLETED',
          paymentId: callbackData.id,
          status: 'CONFIRMED',
        },
      });

      // For bill splitting, update person status
      if (callbackData.order.items.length > 0) {
        const orderData = await db.order.findUnique({
          where: { orderNumber: order.merchant_order_id },
          include: { person: true },
        });

        if (orderData?.person) {
          await db.person.update({
            where: { id: orderData.person.id },
            data: { isCompleted: true },
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
