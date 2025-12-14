import { NextRequest, NextResponse } from 'next/server';
import { paymobService } from '@/lib/paymob';
import { stripeService } from '@/lib/stripe-service';
import { paypalService } from '@/lib/paypal-service';
import { db } from '@/lib/db';

type PaymentProvider = 'paymob' | 'stripe' | 'paypal' | 'mock';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, paymentMethod, customerEmail, provider, customerName, customerPhone, cardDetails, itemIds, tip, tipType, tipPercentage } = await request.json();

    console.log('Payment request:', { orderId, amount, paymentMethod, provider, hasCardDetails: !!cardDetails, itemIds, tip });

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

      case 'paypal':
        paymentResult = await processPayPalPayment({
          orderId,
          amount,
          customerEmail,
        });
        break;

      case 'mock':
      default:
        paymentResult = await processMockPayment({
          orderId,
          amount,
          customerEmail,
          cardDetails,
        });
        break;
    }

    // Update order status directly in database (avoids Vercel auth issues with fetch)
    console.log('Updating order status:', { orderId, itemIds });

    // If itemIds are provided, this is a partial payment - mark only those items as paid
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      console.log('Partial payment: marking items as paid:', itemIds);

      // Mark the specific items as paid
      await db.orderItem.updateMany({
        where: {
          id: { in: itemIds }
        },
        data: {
          isPaid: true,
          paidAt: new Date()
        }
      });

      // Get the paid items to calculate totals for the partial payment order
      const paidItems = await db.orderItem.findMany({
        where: { id: { in: itemIds } },
        include: {
          menuItem: true,
          order: {
            include: {
              table: true,
              restaurant: true
            }
          }
        }
      });

      if (paidItems.length > 0) {
        const firstItem = paidItems[0];
        const subtotal = paidItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const taxRate = firstItem.order.restaurant.taxRate;
        const serviceChargeRate = firstItem.order.restaurant.serviceChargeRate;
        const tax = subtotal * taxRate;
        const serviceCharge = subtotal * serviceChargeRate;
        const tipAmount = tip || 0;
        const total = subtotal + tax + serviceCharge + tipAmount;

        // Create a new order record for this partial payment
        const partialOrder = await db.order.create({
          data: {
            orderNumber: `PARTIAL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            tableId: firstItem.order.tableId,
            restaurantId: firstItem.order.restaurantId,
            customerEmail,
            subtotal,
            tax,
            serviceCharge,
            tip: tipAmount,
            tipType: tipType ? (tipType.toUpperCase() as any) : null,
            tipPercentage,
            total,
            paymentMethod: paymentMethod ? (paymentMethod.toUpperCase() as any) : 'CARD',
            status: 'CONFIRMED',
            paymentStatus: 'COMPLETED'
          },
          include: {
            table: true,
            restaurant: true
          }
        });

        // Return the new order ID for receipt page
        const newOrderId = partialOrder.id;

        // Check if there are any unpaid items remaining for the table
        const unpaidItemsCount = await db.orderItem.count({
          where: {
            order: {
              tableId: firstItem.order.tableId
            },
            isPaid: false
          }
        });

        console.log('Unpaid items remaining for table:', unpaidItemsCount);

        // If no unpaid items remain, mark all related orders as completed
        if (unpaidItemsCount === 0) {
          await db.order.updateMany({
            where: {
              tableId: firstItem.order.tableId,
              paymentStatus: { not: 'COMPLETED' }
            },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'CONFIRMED'
            }
          });

          // Mark table as available
          await db.table.update({
            where: { id: firstItem.order.tableId },
            data: { status: 'AVAILABLE' }
          });

          console.log('All items paid - table marked as available');
        }

        return NextResponse.json({
          success: true,
          orderId: newOrderId,  // Return the new partial order ID
          message: 'Partial payment successful',
          ...paymentResult,
        });
      }
    } else {
      // Full order payment - original behavior
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { tableId: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        },
      });

      // Mark all order items as paid
      await db.orderItem.updateMany({
        where: { orderId: orderId },
        data: {
          isPaid: true,
          paidAt: new Date()
        }
      });

      // Check if all items for the table are now paid
      const unpaidItemsCount = await db.orderItem.count({
        where: {
          order: { tableId: order.tableId },
          isPaid: false
        }
      });

      // If no unpaid items remain, mark table as AVAILABLE
      if (unpaidItemsCount === 0) {
        await db.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' }
        });

        console.log('All items paid - table marked as available');
      }
    }

    console.log('Payment processing completed successfully');

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

// PayPal payment processing
async function processPayPalPayment(data: any) {
  try {
    if (!paypalService.isConfigured()) {
      throw new Error('PayPal is not configured');
    }

    const baseUrl = process.env.NEXTAUTH_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const paymentData = {
      amount: data.amount,
      currency: 'USD',
      orderId: data.orderId,
      returnUrl: `${baseUrl}/receipt/${data.orderId}`,
      cancelUrl: `${baseUrl}/payment/${data.orderId}`,
    };

    const result = await paypalService.createOrder(paymentData);

    return {
      provider: 'paypal',
      paypalOrderId: result.orderId,
      approvalUrl: result.approvalUrl,
      redirectRequired: true,
    };
  } catch (error) {
    console.error('PayPal payment error:', error);
    throw new Error('PayPal payment failed');
  }
}

// Mock payment processing (for demo/testing)
async function processMockPayment(data: any) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // If card details are provided, validate the test card
  if (data.cardDetails) {
    const { number, expiry, cvc, name } = data.cardDetails;

    console.log('Processing test card payment:', { number: `****${number.slice(-4)}`, expiry, name });

    // List of valid test cards
    const validTestCards = [
      '4032032529364793', // Your test card
      '4111111111111111', // Standard Visa test card
      '5555555555554444', // Standard Mastercard test card
      '378282246310005',  // Standard Amex test card
    ];

    // Validate card number
    if (!validTestCards.includes(number)) {
      throw new Error('Card declined - Invalid test card number');
    }

    // Validate expiry (basic check - must be in future)
    const [month, year] = expiry.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (!month || !year) {
      throw new Error('Card declined - Invalid expiry date');
    }

    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      throw new Error('Card declined - Card has expired');
    }

    // Validate CVC (must be 3 or 4 digits)
    if (!cvc || cvc.length < 3) {
      throw new Error('Card declined - Invalid CVC');
    }

    // Validate cardholder name
    if (!name || name.trim().length < 3) {
      throw new Error('Card declined - Invalid cardholder name');
    }

    console.log('Test card payment approved');

    return {
      provider: 'mock',
      paymentId: `pay_card_${Date.now()}`,
      cardLastFour: number.slice(-4),
      cardBrand: number.startsWith('4') ? 'Visa' : number.startsWith('5') ? 'Mastercard' : 'Amex',
    };
  }

  // Original mock payment (non-card payments)
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