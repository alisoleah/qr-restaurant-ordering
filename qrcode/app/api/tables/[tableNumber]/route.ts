import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { tableNumber: string } }
) {
  try {
    const tableNumber = params.tableNumber;

    // Find table by number
    const table = await db.table.findFirst({
      where: {
        number: tableNumber,
      },
      include: {
        restaurant: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      table: {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
      },
      restaurant: {
        id: table.restaurant.id,
        name: table.restaurant.name,
        address: table.restaurant.address,
        phone: table.restaurant.phone,
        taxRate: table.restaurant.taxRate,
        serviceChargeRate: table.restaurant.serviceChargeRate,
      },
    });
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table information' },
      { status: 500 }
    );
  }
}