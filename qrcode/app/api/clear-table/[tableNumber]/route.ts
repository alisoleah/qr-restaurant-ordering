import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
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

    // Delete all order items for this table
    const deletedItems = await db.orderItem.deleteMany({
      where: {
        order: {
          tableId: table.id
        }
      }
    });

    // Delete all orders for this table
    const deletedOrders = await db.order.deleteMany({
      where: {
        tableId: table.id
      }
    });

    // Mark table as AVAILABLE
    await db.table.update({
      where: { id: table.id },
      data: { status: 'AVAILABLE' }
    });

    console.log(`[Clear Table] Table ${tableNumber} - Deleted ${deletedItems.count} items and ${deletedOrders.count} orders`);

    return NextResponse.json({
      success: true,
      message: `Cleared table ${tableNumber}`,
      deletedItems: deletedItems.count,
      deletedOrders: deletedOrders.count
    });
  } catch (error) {
    console.error('Error clearing table:', error);
    return NextResponse.json(
      { error: 'Failed to clear table' },
      { status: 500 }
    );
  }
}
