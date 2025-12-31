import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

interface QRGeneratorRequest {
  mode: 'single' | 'bulk';
  tableNumber?: string;
  startTable?: number;
  endTable?: number;
  capacity?: number;
  restaurantId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QRGeneratorRequest = await request.json();
    const { mode, tableNumber, startTable, endTable, capacity = 4, restaurantId } = body;

    // Get the default restaurant if no restaurantId provided
    let restaurant;
    if (restaurantId) {
      restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });
    } else {
      // Get the first restaurant (default)
      restaurant = await prisma.restaurant.findFirst();
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: 'No restaurant found. Please create a restaurant first or run the seed script.' },
        { status: 404 }
      );
    }

    const tables: any[] = [];
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    if (mode === 'single' && tableNumber) {
      // Generate single QR code
      const qrCodeUrl = `${origin}/table/${tableNumber}`;

      // Check if table already exists
      const existingTable = await prisma.table.findUnique({
        where: {
          restaurantId_number: {
            restaurantId: restaurant.id,
            number: tableNumber,
          },
        },
      });

      if (existingTable) {
        // Update existing table
        const updatedTable = await prisma.table.update({
          where: { id: existingTable.id },
          data: {
            qrCode: qrCodeUrl,
            capacity: capacity,
          },
        });
        tables.push(updatedTable);
      } else {
        // Create new table
        const newTable = await prisma.table.create({
          data: {
            number: tableNumber,
            capacity: capacity,
            qrCode: qrCodeUrl,
            restaurantId: restaurant.id,
            status: 'AVAILABLE',
          },
        });
        tables.push(newTable);
      }
    } else if (mode === 'bulk' && startTable !== undefined && endTable !== undefined) {
      // Generate multiple QR codes
      if (startTable > endTable) {
        return NextResponse.json(
          { error: 'Start table number must be less than or equal to end table number' },
          { status: 400 }
        );
      }

      if (endTable - startTable > 100) {
        return NextResponse.json(
          { error: 'Cannot generate more than 100 tables at once' },
          { status: 400 }
        );
      }

      for (let i = startTable; i <= endTable; i++) {
        const tableNum = i.toString();
        const qrCodeUrl = `${origin}/table/${tableNum}`;

        // Check if table already exists
        const existingTable = await prisma.table.findUnique({
          where: {
            restaurantId_number: {
              restaurantId: restaurant.id,
              number: tableNum,
            },
          },
        });

        if (existingTable) {
          // Update existing table
          const updatedTable = await prisma.table.update({
            where: { id: existingTable.id },
            data: {
              qrCode: qrCodeUrl,
              capacity: capacity,
            },
          });
          tables.push(updatedTable);
        } else {
          // Create new table
          const newTable = await prisma.table.create({
            data: {
              number: tableNum,
              capacity: capacity,
              qrCode: qrCodeUrl,
              restaurantId: restaurant.id,
              status: 'AVAILABLE',
            },
          });
          tables.push(newTable);
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid request. Please provide either tableNumber for single mode or startTable/endTable for bulk mode.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${tables.length} QR code(s)`,
      tables: tables.map(table => ({
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        qrCode: table.qrCode,
        status: table.status,
      })),
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
    });
  } catch (error: any) {
    console.error('QR Generator API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes', details: error.message },
      { status: 500 }
    );
  }
}
