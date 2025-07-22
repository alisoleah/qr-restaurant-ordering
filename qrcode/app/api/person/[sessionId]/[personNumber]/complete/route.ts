import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string; personNumber: string } }
) {
  try {
    const { sessionId, personNumber } = params;
    const { paymentMethod, paymentId } = await request.json();

    const billSplit = await db.billSplit.findUnique({
      where: { sessionId },
      include: {
        persons: {
          where: {
            personNumber: parseInt(personNumber),
          },
        },
      },
    });

    if (!billSplit || billSplit.persons.length === 0) {
      return NextResponse.json({ error: 'Invalid session or person' }, { status: 404 });
    }

    const person = billSplit.persons[0];

    // Mark person as completed
    const updatedPerson = await db.person.update({
      where: { id: person.id },
      data: {
        isCompleted: true,
      },
    });

    // Update all orders for this person
    await db.order.updateMany({
      where: {
        personId: person.id,
        billSplitId: billSplit.id,
      },
      data: {
        paymentMethod,
        paymentId,
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({ person: updatedPerson });
  } catch (error) {
    console.error('Error completing person order:', error);
    return NextResponse.json(
      { error: 'Failed to complete order' },
      { status: 500 }
    );
  }
}