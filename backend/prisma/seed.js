const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a dummy category
  const cat = await prisma.category.create({
    data: { name: 'Raw Materials' }
  });

  // 2. Create a warehouse
  const wh = await prisma.warehouse.create({
    data: { name: 'Main Warehouse', address: '123 Hackathon St' }
  });

  // 3. Create Demo User
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('admin123', salt);
  const user = await prisma.user.create({
    data: {
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password_hash,
      role: 'manager'
    }
  });

  // 4. Create products
  const p1 = await prisma.product.create({
    data: { name: 'Steel Rods', sku: 'SR-001', category_id: cat.id, unit_of_measure: 'kg', min_stock_level: 50 }
  });
  
  const p2 = await prisma.product.create({
    data: { name: 'Wooden Pallets', sku: 'WP-002', category_id: cat.id, unit_of_measure: 'pcs', min_stock_level: 20 }
  });

  // 5. Initialize stock to 0
  await prisma.stockLocation.createMany({
    data: [
      { product_id: p1.id, warehouse_id: wh.id, quantity: 10 }, // 10 is low stock intentionally
      { product_id: p2.id, warehouse_id: wh.id, quantity: 50 },
    ]
  });

  console.log('Seed completed! Login with admin@demo.com / admin123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
