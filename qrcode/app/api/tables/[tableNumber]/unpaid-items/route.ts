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

    console.log(`[Unpaid Items API] Table ${tableNumber} (ID: ${table.id}) - Found ${unpaidItems.length} unpaid items`);

    // Aggregate items by menuItemId to group same items together
    const aggregatedMap = new Map<string, {
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      totalPrice: number;
      image: string | null;
      orderItemIds: string[];
    }>();

    unpaidItems.forEach(item => {
      const existing = aggregatedMap.get(item.menuItemId);
      if (existing) {
        // Add to existing group
        existing.quantity += item.quantity;
        existing.totalPrice += item.totalPrice;
        existing.orderItemIds.push(item.id);
      } else {
        // Create new group
        aggregatedMap.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          name: item.menuItem.name,
          price: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          image: item.menuItem.image,
          orderItemIds: [item.id]
        });
      }
    });

    const items = Array.from(aggregatedMap.values()).map(item => ({
      orderItemId: item.orderItemIds[0], // Use first orderItemId as identifier
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      image: item.image,
      orderItemIds: item.orderItemIds // Include all orderItemIds for partial payment
    }));

    const response = NextResponse.json({
      items,
      tableNumber,
    });

    // Disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;
  } catch (error) {
    console.error('Error fetching unpaid items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unpaid items' },
      { status: 500 }
    );
  }
}
