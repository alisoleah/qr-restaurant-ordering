import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

interface UpdateTableRequest {
  number?: string;
  capacity?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
}

// GET single table
export async function GET(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const table = await prisma.table.findUnique({
      where: { id: params.tableId },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      table: {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        qrCode: table.qrCode,
        hasQrCode: !!table.qrCode,
        orderCount: table._count.orders,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get Table API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table', details: error.message },
      { status: 500 }
    );
  }
}

// PUT update table
export async function PUT(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const body: UpdateTableRequest = await request.json();
    const { number, capacity, status } = body;

    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: params.tableId },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // If changing table number, check if new number is already in use
    if (number && number !== existingTable.number) {
      const duplicateTable = await prisma.table.findUnique({
        where: {
          restaurantId_number: {
            restaurantId: existingTable.restaurantId,
            number: number,
          },
        },
      });

      if (duplicateTable) {
        return NextResponse.json(
          { error: `Table number ${number} already exists` },
          { status: 400 }
        );
      }
    }

    // Build update data object
    const updateData: any = {};
    if (number !== undefined) updateData.number = number;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (status !== undefined) updateData.status = status;

    // If table number is changing and QR code exists, update QR code URL
    if (number && number !== existingTable.number && existingTable.qrCode) {
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      updateData.qrCode = `${origin}/table/${number}`;
    }

    // Update the table
    const updatedTable = await prisma.table.update({
      where: { id: params.tableId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Table updated successfully',
      table: {
        id: updatedTable.id,
        number: updatedTable.number,
        capacity: updatedTable.capacity,
        status: updatedTable.status,
        qrCode: updatedTable.qrCode,
      },
    });
  } catch (error: any) {
    console.error('Update Table API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update table', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE table
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    // Check if table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: params.tableId },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Check if table has orders (optional - you may want to prevent deletion if orders exist)
    if (existingTable._count.orders > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete table ${existingTable.number} with ${existingTable._count.orders} order(s). Please delete orders first or set table status to OUT_OF_SERVICE.`,
        },
        { status: 400 }
      );
    }

    // Delete the table
    await prisma.table.delete({
      where: { id: params.tableId },
    });

    return NextResponse.json({
      success: true,
      message: `Table ${existingTable.number} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Delete Table API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete table', details: error.message },
      { status: 500 }
    );
  }
}
