import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { tableNumber: string } }
) {
  try {
    const { tableNumber } = params;

    // Find the table
    const table = await db.table.findFirst({
      where: { number: tableNumber },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Get all unpaid order items for this table
    const unpaidItems = await db.orderItem.findMany({
      where: {
        order: {
          tableId: table.id,
          paymentStatus: {
            not: 'COMPLETED'
          }
        },
        isPaid: false
      },
      include: {
        menuItem: true,
        order: true
      }
    });

    // Return all unpaid items individually (do NOT aggregate by menuItemId)
    // Each OrderItem is separate, even if they're the same menu item
    const items = unpaidItems.map(item => ({
      orderItemId: item.id, // The specific OrderItem ID
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      price: item.unitPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      image: item.menuItem.image,
    }));

    return NextResponse.json({
      items,
      tableNumber,
    });
  } catch (error) {
    console.error('Error fetching unpaid items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unpaid items' },
      { status: 500 }
    );
  }
}
