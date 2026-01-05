import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string; personNumber: string } }
) {
  try {
    const { sessionId, personNumber } = params;

    const billSplit = await db.billSplit.findFirst({
      where: {
        tableSessionId: sessionId,
        isActive: true
      },
      include: {
        table: {
          include: {
            restaurant: true,
          },
        },
        persons: {
          where: {
            personNumber: parseInt(personNumber),
          },
          include: {
            orders: {
              include: {
                items: {
                  include: {
                    menuItem: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!billSplit) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 404 });
    }

    const person = billSplit.persons[0];
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({
      billSplit,
      person,
      table: billSplit.table,
    });
  } catch (error) {
    console.error('Error fetching person data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch person data' },
      { status: 500 }
    );
  }
}