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

    // Reset all order items for this table to unpaid
    const result = await db.orderItem.updateMany({
      where: {
        order: {
          tableId: table.id
        }
      },
      data: {
        isPaid: false,
        paidAt: null
      }
    });

    // Reset all orders for this table
    await db.order.updateMany({
      where: {
        tableId: table.id
      },
      data: {
        paymentStatus: 'PENDING',
        status: 'PENDING'
      }
    });

    // Mark table as OCCUPIED
    await db.table.update({
      where: { id: table.id },
      data: { status: 'OCCUPIED' }
    });

    console.log(`[Reset Table] Table ${tableNumber} - Reset ${result.count} items to unpaid`);

    return NextResponse.json({
      success: true,
      message: `Reset ${result.count} items for table ${tableNumber}`,
      count: result.count
    });
  } catch (error) {
    console.error('Error resetting table:', error);
    return NextResponse.json(
      { error: 'Failed to reset table' },
      { status: 500 }
    );
  }
}
