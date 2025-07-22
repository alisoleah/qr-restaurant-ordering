import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableNumber = params.tableId; // Changed to use tableId parameter

    // Find active bill split for this table
    const table = await db.table.findFirst({
      where: { number: tableNumber },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const billSplit = await db.billSplit.findFirst({
      where: {
        tableId: table.id,
        isActive: true,
      },
      include: {
        persons: {
          orderBy: { personNumber: 'asc' },
        },
      },
    });

    return NextResponse.json({ billSplit });
  } catch (error) {
    console.error('Error fetching bill split:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill split' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableNumber = params.tableId; // Changed to use tableId parameter
    const { totalPeople } = await request.json();

    const table = await db.table.findFirst({
      where: { number: tableNumber },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Deactivate any existing bill splits for this table
    await db.billSplit.updateMany({
      where: {
        tableId: table.id,
        isActive: true,
      },
      data: { isActive: false },
    });

    // Create new bill split
    const sessionId = `${table.id}-${Date.now()}`;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const billSplit = await db.billSplit.create({
      data: {
        tableId: table.id,
        sessionId,
        totalPeople,
        persons: {
          create: await Promise.all(
            Array.from({ length: totalPeople }, async (_, index) => {
              const personNumber = index + 1;
              const qrUrl = `${baseUrl}/person/${sessionId}/${personNumber}`;
              
              const qrCode = await QRCode.toDataURL(qrUrl, {
                width: 256,
                margin: 2,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF',
                },
              });

              return {
                personNumber,
                qrCode,
              };
            })
          ),
        },
      },
      include: {
        persons: {
          orderBy: { personNumber: 'asc' },
        },
      },
    });

    return NextResponse.json({ billSplit }, { status: 201 });
  } catch (error) {
    console.error('Error creating bill split:', error);
    return NextResponse.json(
      { error: 'Failed to create bill split' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableNumber = params.tableId; // Changed to use tableId parameter
    const { totalPeople } = await request.json();

    const table = await db.table.findFirst({
      where: { number: tableNumber },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const billSplit = await db.billSplit.findFirst({
      where: {
        tableId: table.id,
        isActive: true,
      },
      include: {
        persons: true,
      },
    });

    if (!billSplit) {
      return NextResponse.json({ error: 'No active bill split found' }, { status: 404 });
    }

    const currentPeople = billSplit.persons.length;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (totalPeople > currentPeople) {
      // Add new people
      const newPersons = [];
      for (let i = currentPeople + 1; i <= totalPeople; i++) {
        const qrUrl = `${baseUrl}/person/${billSplit.sessionId}/${i}`;
        const qrCode = await QRCode.toDataURL(qrUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        newPersons.push({
          billSplitId: billSplit.id,
          personNumber: i,
          qrCode,
        });
      }

      await db.person.createMany({
        data: newPersons,
      });
    } else if (totalPeople < currentPeople) {
      // Remove people (only if they haven't ordered)
      await db.person.deleteMany({
        where: {
          billSplitId: billSplit.id,
          personNumber: {
            gt: totalPeople,
          },
          isCompleted: false,
          totalAmount: 0,
        },
      });
    }

    // Update bill split
    const updatedBillSplit = await db.billSplit.update({
      where: { id: billSplit.id },
      data: { totalPeople },
      include: {
        persons: {
          orderBy: { personNumber: 'asc' },
        },
      },
    });

    return NextResponse.json({ billSplit: updatedBillSplit });
  } catch (error) {
    console.error('Error updating bill split:', error);
    return NextResponse.json(
      { error: 'Failed to update bill split' },
      { status: 500 }
    );
  }
}