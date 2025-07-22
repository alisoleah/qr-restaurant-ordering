import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableNumber = params.tableId;

    // Find table by number (not ID) - your schema uses String for number field
    const table = await db.table.findFirst({
      where: { 
        number: tableNumber,
        // Optionally add restaurantId filter if you have multiple restaurants
      },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const billSplit = await db.billSplit.findFirst({
      where: {
        tableId: table.id, // This is correct - using the table.id (String)
        isActive: true,
      },
      include: {
        persons: {
          orderBy: { personNumber: 'asc' },
        },
        table: true, // Include table info
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
    const tableNumber = params.tableId;
    const { totalPeople } = await request.json();

    // Validate totalPeople
    if (!totalPeople || totalPeople < 1 || totalPeople > 20) {
      return NextResponse.json(
        { error: 'Invalid number of people (1-20)' }, 
        { status: 400 }
      );
    }

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

    // Create new bill split with proper sessionId
    const sessionId = `${table.id}-${Date.now()}`;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Create persons data first
    const personsData = [];
    for (let i = 1; i <= totalPeople; i++) {
      const qrUrl = `${baseUrl}/person/${sessionId}/${i}`;
      
      const qrCode = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      personsData.push({
        personNumber: i,
        qrCode,
      });
    }

    const billSplit = await db.billSplit.create({
      data: {
        tableId: table.id,
        sessionId,
        totalPeople,
        persons: {
          create: personsData,
        },
      },
      include: {
        persons: {
          orderBy: { personNumber: 'asc' },
        },
        table: true,
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
    const tableNumber = params.tableId;
    const { totalPeople } = await request.json();

    // Validate totalPeople
    if (!totalPeople || totalPeople < 1 || totalPeople > 20) {
      return NextResponse.json(
        { error: 'Invalid number of people (1-20)' }, 
        { status: 400 }
      );
    }

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
          include: {
            orders: true, // Include orders to check if person has ordered
          },
        },
      },
    });

    if (!billSplit) {
      return NextResponse.json({ error: 'No active bill split found' }, { status: 404 });
    }

    const currentPeople = billSplit.persons.length;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (totalPeople > currentPeople) {
      // Add new people
      const newPersonsData = [];
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

        newPersonsData.push({
          billSplitId: billSplit.id,
          personNumber: i,
          qrCode,
        });
      }

      await db.person.createMany({
        data: newPersonsData,
      });
    } else if (totalPeople < currentPeople) {
      // Only remove people who haven't ordered and aren't completed
      const personsToDelete = billSplit.persons.filter(
        person => 
          person.personNumber > totalPeople && 
          !person.isCompleted && 
          person.totalAmount === 0 &&
          person.orders.length === 0 // Check if they have any orders
      );

      if (personsToDelete.length > 0) {
        await db.person.deleteMany({
          where: {
            id: {
              in: personsToDelete.map(p => p.id)
            }
          },
        });
      }
    }

    // Update bill split
    const updatedBillSplit = await db.billSplit.update({
      where: { id: billSplit.id },
      data: { totalPeople },
      include: {
        persons: {
          orderBy: { personNumber: 'asc' },
        },
        table: true,
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