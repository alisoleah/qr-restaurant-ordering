import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string; personNumber: string } }
) {
  try {
    const { sessionId, personNumber } = params;
    const { items, tip, tipType, tipPercentage, customerEmail, customerPhone, specialRequests } = await request.json();

    // Find the bill split and person
    const billSplit = await db.billSplit.findUnique({
      where: { sessionId },
      include: {
        table: {
          include: {
            restaurant: true,
          },
        },
        persons: {
          where: {
            personNumber: parseInt(personNumber),
          },
        },
      },
    });

    if (!billSplit || billSplit.persons.length === 0) {
      return NextResponse.json({ error: 'Invalid session or person' }, { status: 404 });
    }

    const person = billSplit.persons[0];
    const restaurant = billSplit.table.restaurant;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.unitPrice * item.quantity), 0
    );

    const tax = subtotal * restaurant.taxRate;
    const serviceCharge = subtotal * restaurant.serviceChargeRate;
    const tipAmount = tip || 0;
    const total = subtotal + tax + serviceCharge + tipAmount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        tableId: billSplit.tableId,
        restaurantId: restaurant.id,
        billSplitId: billSplit.id,
        personId: person.id,
        customerEmail,
        customerPhone,
        subtotal,
        tax,
        serviceCharge,
        tip: tipAmount,
        tipType,
        tipPercentage,
        total,
        specialRequests,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes || '',
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        person: true,
        table: true,
      },
    });

    // Update person's total amount
    await db.person.update({
      where: { id: person.id },
      data: {
        totalAmount: {
          increment: total,
        },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating person order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}