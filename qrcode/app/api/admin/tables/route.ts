import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get the default restaurant
    const restaurant = await prisma.restaurant.findFirst();

    if (!restaurant) {
      return NextResponse.json(
        { error: 'No restaurant found. Please run the seed script first.' },
        { status: 404 }
      );
    }

    // Fetch all tables for the restaurant
    const tables = await prisma.table.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      orderBy: [
        { number: 'asc' },
      ],
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      tables: tables.map(table => ({
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        qrCode: table.qrCode,
        hasQrCode: !!table.qrCode,
        orderCount: table._count.orders,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
      })),
      summary: {
        total: tables.length,
        withQrCodes: tables.filter(t => t.qrCode).length,
        withoutQrCodes: tables.filter(t => !t.qrCode).length,
        byStatus: {
          available: tables.filter(t => t.status === 'AVAILABLE').length,
          occupied: tables.filter(t => t.status === 'OCCUPIED').length,
          reserved: tables.filter(t => t.status === 'RESERVED').length,
          outOfService: tables.filter(t => t.status === 'OUT_OF_SERVICE').length,
        },
      },
    });
  } catch (error: any) {
    console.error('Tables API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables', details: error.message },
      { status: 500 }
    );
  }
}
