const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTable12() {
  try {
    console.log('Starting cleanup for table 12...');

    // Find table 12
    const table = await prisma.table.findFirst({
      where: { number: '12' }
    });

    if (!table) {
      console.log('Table 12 not found');
      return;
    }

    console.log(`Found table 12 (ID: ${table.id})`);

    // Get all orders for table 12
    const orders = await prisma.order.findMany({
      where: { tableId: table.id },
      include: {
        items: true
      }
    });

    console.log(`Found ${orders.length} orders for table 12`);

    // Delete all order items first (due to foreign key constraints)
    for (const order of orders) {
      console.log(`Deleting ${order.items.length} items from order ${order.orderNumber}`);
      await prisma.orderItem.deleteMany({
        where: { orderId: order.id }
      });
    }

    // Delete all orders
    const deletedOrders = await prisma.order.deleteMany({
      where: { tableId: table.id }
    });

    console.log(`Deleted ${deletedOrders.count} orders`);

    // Set table status to AVAILABLE
    await prisma.table.update({
      where: { id: table.id },
      data: { status: 'AVAILABLE' }
    });

    console.log('Table 12 status set to AVAILABLE');
    console.log('Cleanup completed successfully!');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTable12();
