import { NextRequest, NextResponse } from 'next/server';
import { Order } from '../../../types';

// In-memory storage for demo purposes
// In production, use a real database like PostgreSQL, MongoDB, etc.
let orders: Order[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const order: Order = {
      id: Date.now().toString(),
      tableNumber: body.tableNumber,
      items: body.items,
      subtotal: body.subtotal,
      tax: body.tax,
      serviceCharge: body.serviceCharge,
      total: body.total,
      customerEmail: body.customerEmail,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod: body.paymentMethod,
      paymentStatus: 'pending'
    };

    orders.push(order);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return orders sorted by creation date (newest first)
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json(sortedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}