import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function POST(request: NextRequest) {
  console.log('Creating order...');
  try {
    const body = await request.json();
    const {
      tableNumber,
      items,
      subtotal,
      tax,
      serviceCharge,
      tip = 0,
      tipType,
      tipPercentage,
      total,
      customerEmail,
      paymentMethod
    } = body;

    // Find the table
    const table = await db.table.findFirst({
      where: { number: tableNumber },
      include: { restaurant: true }
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        tableId: table.id,
        restaurantId: table.restaurantId,
        customerEmail,
        subtotal,
        tax,
        serviceCharge,
        tip,
        tipType: tipType ? (tipType.toUpperCase() as any) : null,
        tipPercentage,
        total,
        paymentMethod: paymentMethod ? (paymentMethod.toUpperCase() as any) : null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItem?.id || item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.menuItem?.price || item.unitPrice,
            totalPrice: item.menuItem?.price ? item.menuItem.price * item.quantity : item.totalPrice,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
        restaurant: true,
      },
    });

    // Update table status to occupied
    await db.table.update({
      where: { id: table.id },
      data: { status: 'OCCUPIED' },
    });

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.table.number,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          price: item.menuItem.price,
          category: item.menuItem.category.name,
        },
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      serviceCharge: order.serviceCharge,
      tip: order.tip,
      tipType: order.tipType,
      tipPercentage: order.tipPercentage,
      total: order.total,
      customerEmail: order.customerEmail,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
        restaurant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        tableNumber: order.table.number,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
          menuItem: {
            id: item.menuItem.id,
            name: item.menuItem.name,
            description: item.menuItem.description,
            price: item.menuItem.price,
            category: item.menuItem.category.name,
          },
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        serviceCharge: order.serviceCharge,
        tip: order.tip,
        tipType: order.tipType,
        tipPercentage: order.tipPercentage,
        total: order.total,
        customerEmail: order.customerEmail,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}