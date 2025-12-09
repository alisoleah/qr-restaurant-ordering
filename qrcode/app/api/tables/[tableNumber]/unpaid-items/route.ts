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

    // Aggregate items by menuItemId (since multiple orders might have the same item)
    const aggregatedItems = unpaidItems.reduce((acc, item) => {
      const existing = acc.find(i => i.menuItemId === item.menuItemId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.totalPrice += item.totalPrice;
        existing.orderItemIds.push(item.id);
      } else {
        acc.push({
          menuItemId: item.menuItemId,
          name: item.menuItem.name,
          price: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          image: item.menuItem.image,
          orderItemIds: [item.id], // Track which OrderItem IDs contribute to this aggregated item
        });
      }
      return acc;
    }, [] as Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      totalPrice: number;
      image?: string | null;
      orderItemIds: string[];
    }>);

    return NextResponse.json({
      items: aggregatedItems,
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
