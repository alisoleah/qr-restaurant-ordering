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

    // Get all order items for this table (current session)
    // We'll get orders that have at least one unpaid item (active session)
    const activeOrders = await db.order.findMany({
      where: {
        tableId: table.id,
        paymentStatus: {
          not: 'FAILED'
        },
        items: {
          some: {
            isPaid: false // Orders with unpaid items = current session
          }
        }
      },
      select: {
        id: true
      }
    });

    const activeOrderIds = activeOrders.map(order => order.id);

    // Get paid items only from active orders (current session)
    const paidItems = await db.orderItem.findMany({
      where: {
        orderId: {
          in: activeOrderIds
        },
        isPaid: true
      },
      include: {
        menuItem: true,
        order: true
      },
      orderBy: {
        paidAt: 'desc'
      }
    });

    console.log(`[Paid Items API] Table ${tableNumber} (ID: ${table.id}) - Found ${paidItems.length} paid items`);

    // Aggregate items by menuItemId to group same items together
    const aggregatedMap = new Map<string, {
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      totalPrice: number;
      image: string | null;
      paidAt: Date | null;
    }>();

    paidItems.forEach(item => {
      const existing = aggregatedMap.get(item.menuItemId);
      if (existing) {
        // Add to existing group
        existing.quantity += item.quantity;
        existing.totalPrice += item.totalPrice;
      } else {
        // Create new group
        aggregatedMap.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          name: item.menuItem.name,
          price: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          image: item.menuItem.image,
          paidAt: item.paidAt
        });
      }
    });

    const items = Array.from(aggregatedMap.values()).map(item => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      image: item.image,
      paidAt: item.paidAt
    }));

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return NextResponse.json({
      items,
      tableNumber,
      subtotal
    });
  } catch (error) {
    console.error('Error fetching paid items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paid items' },
      { status: 500 }
    );
  }
}
