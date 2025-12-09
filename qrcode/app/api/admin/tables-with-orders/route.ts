import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    // Fetch all tables with their orders
    const allTables = await db.table.findMany({
      include: {
        orders: {
          include: {
            items: {
              where: {
                isPaid: false  // Only fetch unpaid items
              },
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

    // Group tables by number to remove duplicates
    const tablesByNumber = new Map();
    allTables.forEach((table: any) => {
      if (!tablesByNumber.has(table.number)) {
        tablesByNumber.set(table.number, table);
      } else {
        // Merge orders from duplicate tables
        const existing = tablesByNumber.get(table.number);
        existing.orders = [...existing.orders, ...table.orders];
      }
    });

    const tables = Array.from(tablesByNumber.values());

    // Transform the data to include totals and payment status
    const tablesWithOrders = tables.map((table: any) => {
      // Filter out orders with no unpaid items
      const orders = (table.orders || []).filter((order: any) => order.items.length > 0);

      // Calculate total based on unpaid items only
      const totalAmount = orders.reduce((sum: number, order: any) => {
        const unpaidTotal = order.items.reduce((itemSum: number, item: any) =>
          itemSum + item.totalPrice, 0
        );
        return sum + unpaidTotal;
      }, 0);

      const isPaid = orders.length === 0;  // If no unpaid items, table is paid/available

      return {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        orders: orders.map((order: any) => {
          // Calculate order totals based on unpaid items
          const unpaidSubtotal = order.items.reduce((sum: number, item: any) =>
            sum + item.totalPrice, 0
          );

          return {
            id: order.id,
            orderNumber: order.orderNumber,
            tableNumber: table.number,
            subtotal: unpaidSubtotal,
            tax: order.tax,
            serviceCharge: order.serviceCharge,
            tip: order.tip,
            total: unpaidSubtotal + order.tax + order.serviceCharge + order.tip,
            status: order.status.toLowerCase(),
            paymentStatus: order.paymentStatus.toLowerCase(),
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: item.notes,
              isPaid: item.isPaid,
              paidAt: item.paidAt,
              menuItem: {
                id: item.menuItem.id,
                name: item.menuItem.name,
                description: item.menuItem.description,
                price: item.menuItem.price,
                image: item.menuItem.image,
                isAvailable: item.menuItem.isAvailable
              }
            }))
          };
        }),
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
