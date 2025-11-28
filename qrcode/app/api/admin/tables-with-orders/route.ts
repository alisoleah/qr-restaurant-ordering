import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    // Fetch all tables with their orders
    const tables = await db.table.findMany({
      include: {
        orders: {
          include: {
            items: {
              include: {
                menuItem: true
              }
            },
            table: true,
            restaurant: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        restaurant: true
      },
      orderBy: {
        number: 'asc'
      }
    });

    // Transform the data to include totals and payment status
    const tablesWithOrders = tables.map((table: any) => {
      const orders = table.orders || [];
      const totalAmount = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      const isPaid = orders.length > 0 ? orders.every((order: any) => order.paymentStatus === 'completed') : true;

      return {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        orders: orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          tableNumber: table.number,
          subtotal: order.subtotal,
          tax: order.tax,
          serviceCharge: order.serviceCharge,
          tip: order.tip,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: order.items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
            menuItem: {
              id: item.menuItem.id,
              name: item.menuItem.name,
              description: item.menuItem.description,
              price: item.menuItem.price,
              image: item.menuItem.image,
              isAvailable: item.menuItem.isAvailable
            }
          }))
        })),
        totalAmount,
        isPaid
      };
    });

    return NextResponse.json(tablesWithOrders);
  } catch (error) {
    console.error('Error fetching tables with orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables with orders' },
      { status: 500 }
    );
  }
}
