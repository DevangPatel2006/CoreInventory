// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Generates a ref like REC-0001, DEL-0001 etc.
let counters = {};
function makeRef(prefix) {
  counters[prefix] = (counters[prefix] || 0) + 1;
  return `${prefix}-${String(counters[prefix]).padStart(4, '0')}`;
}

async function main() {
  console.log('\n🌱 Seeding CoreInventory...\n');

  // ── CLEAN ────────────────────────────────────────────────
  await prisma.stockMove.deleteMany();
  await prisma.operation.deleteMany();
  await prisma.reorderRule.deleteMany();
  await prisma.stockLocation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned existing data');

  // ── USERS ────────────────────────────────────────────────
  const hash = await bcrypt.hash('admin123', 10);
  const manager = await prisma.user.create({
    data: { name: 'Demo Admin', email: 'admin@demo.com', password_hash: hash, role: 'manager' },
  });
  const staff = await prisma.user.create({
    data: { name: 'Warehouse Staff', email: 'staff@demo.com', password_hash: await bcrypt.hash('staff123', 10), role: 'staff' },
  });
  console.log('✅ Users: admin@demo.com / admin123');

  // ── WAREHOUSES ───────────────────────────────────────────
  const mainWH = await prisma.warehouse.create({
    data: { name: 'Main Warehouse', short_code: 'MAIN', address: '12, GIDC Estate, Gandhinagar' },
  });
  const prodWH = await prisma.warehouse.create({
    data: { name: 'Production Unit', short_code: 'PROD', address: '45, Industrial Area, Sector 9' },
  });
  console.log('✅ Warehouses: 2');

  // ── CATEGORIES ───────────────────────────────────────────
  const [rawMat, packaging, electrical, safety, finished] = await Promise.all([
    prisma.category.create({ data: { name: 'Raw Materials' } }),
    prisma.category.create({ data: { name: 'Packaging' } }),
    prisma.category.create({ data: { name: 'Electrical' } }),
    prisma.category.create({ data: { name: 'Safety Equipment' } }),
    prisma.category.create({ data: { name: 'Finished Goods' } }),
  ]);
  console.log('✅ Categories: 5');

  // ── PRODUCTS ─────────────────────────────────────────────
  const [steelRods, aluminum, copper, wiring, switches,
         cardboxes, bubblewrap, helmet, gloves, steelFrames] = await Promise.all([
    prisma.product.create({ data: { name: 'Steel Rods',       sku: 'RM-001', unit_of_measure: 'kg',   category_id: rawMat.id,    min_stock_level: '50'  } }),
    prisma.product.create({ data: { name: 'Aluminum Sheets',  sku: 'RM-002', unit_of_measure: 'kg',   category_id: rawMat.id,    min_stock_level: '30'  } }),
    prisma.product.create({ data: { name: 'Copper Wire',      sku: 'RM-003', unit_of_measure: 'm',    category_id: rawMat.id,    min_stock_level: '100' } }),
    prisma.product.create({ data: { name: 'Elec. Wiring',     sku: 'EL-001', unit_of_measure: 'm',    category_id: electrical.id,min_stock_level: '200' } }),
    prisma.product.create({ data: { name: 'Circuit Switches', sku: 'EL-002', unit_of_measure: 'pcs',  category_id: electrical.id,min_stock_level: '30'  } }),
    prisma.product.create({ data: { name: 'Cardboard Boxes',  sku: 'PK-001', unit_of_measure: 'pcs',  category_id: packaging.id, min_stock_level: '100' } }),
    prisma.product.create({ data: { name: 'Bubble Wrap Roll', sku: 'PK-002', unit_of_measure: 'm',    category_id: packaging.id, min_stock_level: '50'  } }),
    prisma.product.create({ data: { name: 'Safety Helmet',    sku: 'SF-001', unit_of_measure: 'pcs',  category_id: safety.id,    min_stock_level: '10'  } }),
    prisma.product.create({ data: { name: 'Safety Gloves',    sku: 'SF-002', unit_of_measure: 'pair', category_id: safety.id,    min_stock_level: '20'  } }),
    prisma.product.create({ data: { name: 'Steel Frames',     sku: 'FG-001', unit_of_measure: 'pcs',  category_id: finished.id,  min_stock_level: '10'  } }),
  ]);
  console.log('✅ Products: 10');

  // ── STOCK LOCATIONS ──────────────────────────────────────
  // Main warehouse stock (after Done operations below)
  await prisma.stockLocation.createMany({
    data: [
      { warehouse_id: mainWH.id, product_id: steelRods.id, quantity: '244' }, // low vs 50 threshold? No — 244 is fine
      { warehouse_id: mainWH.id, product_id: aluminum.id,  quantity: '70'  },
      { warehouse_id: mainWH.id, product_id: copper.id,    quantity: '0'   }, // ← LOW STOCK alert fires
      { warehouse_id: mainWH.id, product_id: wiring.id,    quantity: '795' },
      { warehouse_id: mainWH.id, product_id: switches.id,  quantity: '110' },
      { warehouse_id: mainWH.id, product_id: cardboxes.id, quantity: '300' },
      { warehouse_id: mainWH.id, product_id: bubblewrap.id,quantity: '0'   }, // ← LOW STOCK
      { warehouse_id: mainWH.id, product_id: helmet.id,    quantity: '8'   }, // ← LOW STOCK (min=10)
      { warehouse_id: mainWH.id, product_id: gloves.id,    quantity: '15'  }, // ← LOW STOCK (min=20)
      // Production warehouse
      { warehouse_id: prodWH.id, product_id: steelRods.id,  quantity: '150' },
      { warehouse_id: prodWH.id, product_id: aluminum.id,   quantity: '80'  },
      { warehouse_id: prodWH.id, product_id: steelFrames.id,quantity: '25'  },
    ],
  });
  console.log('✅ Stock locations set');

  // ── OPERATIONS + MOVES ───────────────────────────────────

  // Receipt 1 — Done
  const rec1 = await prisma.operation.create({
    data: {
      type: 'receipt', status: 'done',
      ref_number: makeRef('REC'),
      contact_name: 'Gujarat Steel Pvt. Ltd.',
      created_by: manager.id, validated_by: manager.id,
      created_at: new Date('2024-03-01'), validated_at: new Date('2024-03-01'),
      moves: { create: [
        { product_id: steelRods.id, qty: '500', to_location: mainWH.id },
        { product_id: aluminum.id,  qty: '200', to_location: mainWH.id },
      ]},
    },
  });

  // Receipt 2 — Done
  await prisma.operation.create({
    data: {
      type: 'receipt', status: 'done',
      ref_number: makeRef('REC'),
      contact_name: 'National Electricals',
      created_by: manager.id, validated_by: manager.id,
      created_at: new Date('2024-03-05'), validated_at: new Date('2024-03-05'),
      moves: { create: [
        { product_id: wiring.id,   qty: '1000', to_location: mainWH.id },
        { product_id: switches.id, qty: '150',  to_location: mainWH.id },
      ]},
    },
  });

  // Receipt 3 — Ready (pending — shows on dashboard)
  await prisma.operation.create({
    data: {
      type: 'receipt', status: 'ready',
      ref_number: makeRef('REC'),
      contact_name: 'PackSafe Industries',
      created_by: staff.id,
      scheduled_date: new Date('2024-03-15'),
      moves: { create: [
        { product_id: cardboxes.id,  qty: '500', to_location: mainWH.id },
        { product_id: bubblewrap.id, qty: '300', to_location: mainWH.id },
      ]},
    },
  });

  // Receipt 4 — Draft
  await prisma.operation.create({
    data: {
      type: 'receipt', status: 'draft',
      ref_number: makeRef('REC'),
      contact_name: 'Safety First Co.',
      created_by: staff.id,
      moves: { create: [
        { product_id: helmet.id, qty: '50',  to_location: mainWH.id },
        { product_id: gloves.id, qty: '100', to_location: mainWH.id },
      ]},
    },
  });

  // Delivery 1 — Done
  await prisma.operation.create({
    data: {
      type: 'delivery', status: 'done',
      ref_number: makeRef('DEL'),
      contact_name: 'Raj Constructions',
      created_by: manager.id, validated_by: manager.id,
      created_at: new Date('2024-03-03'), validated_at: new Date('2024-03-03'),
      moves: { create: [
        { product_id: steelRods.id, qty: '100', from_location: mainWH.id },
        { product_id: aluminum.id,  qty: '50',  from_location: mainWH.id },
      ]},
    },
  });

  // Delivery 2 — Done
  await prisma.operation.create({
    data: {
      type: 'delivery', status: 'done',
      ref_number: makeRef('DEL'),
      contact_name: 'Mehta Electricals',
      created_by: staff.id, validated_by: manager.id,
      created_at: new Date('2024-03-07'), validated_at: new Date('2024-03-07'),
      moves: { create: [
        { product_id: wiring.id,   qty: '200', from_location: mainWH.id },
        { product_id: switches.id, qty: '40',  from_location: mainWH.id },
      ]},
    },
  });

  // Delivery 3 — Ready (pending)
  await prisma.operation.create({
    data: {
      type: 'delivery', status: 'ready',
      ref_number: makeRef('DEL'),
      contact_name: 'Patel Packaging House',
      created_by: staff.id,
      scheduled_date: new Date('2024-03-15'),
      moves: { create: [
        { product_id: cardboxes.id, qty: '200', from_location: mainWH.id },
      ]},
    },
  });

  // Delivery 4 — Draft
  await prisma.operation.create({
    data: {
      type: 'delivery', status: 'draft',
      ref_number: makeRef('DEL'),
      contact_name: 'Shree Industries',
      created_by: staff.id,
      moves: { create: [
        { product_id: steelRods.id, qty: '80', from_location: mainWH.id },
      ]},
    },
  });

  // Transfer 1 — Done
  await prisma.operation.create({
    data: {
      type: 'transfer', status: 'done',
      ref_number: makeRef('TRF'),
      notes: 'Main Store → Production Floor',
      created_by: manager.id, validated_by: manager.id,
      created_at: new Date('2024-03-04'), validated_at: new Date('2024-03-04'),
      moves: { create: [
        { product_id: steelRods.id, qty: '150', from_location: mainWH.id, to_location: prodWH.id },
        { product_id: aluminum.id,  qty: '80',  from_location: mainWH.id, to_location: prodWH.id },
      ]},
    },
  });

  // Transfer 2 — Ready
  await prisma.operation.create({
    data: {
      type: 'transfer', status: 'ready',
      ref_number: makeRef('TRF'),
      notes: 'Main → Production for assembly',
      created_by: staff.id,
      scheduled_date: new Date('2024-03-15'),
      moves: { create: [
        { product_id: switches.id, qty: '50', from_location: mainWH.id, to_location: prodWH.id },
      ]},
    },
  });

  // Adjustment — Done
  await prisma.operation.create({
    data: {
      type: 'adjust', status: 'done',
      ref_number: makeRef('ADJ'),
      notes: 'Damaged during storage — physical count correction',
      created_by: manager.id, validated_by: manager.id,
      created_at: new Date('2024-03-06'), validated_at: new Date('2024-03-06'),
      moves: { create: [
        { product_id: steelRods.id, qty: '6', from_location: mainWH.id }, // negative adjustment
      ]},
    },
  });

  console.log('✅ Operations: 11 (4 receipts, 4 deliveries, 2 transfers, 1 adjustment)');

  // ── REORDER RULES ────────────────────────────────────────
  await prisma.reorderRule.createMany({
    data: [
      { product_id: copper.id,    warehouse_id: mainWH.id, min_qty: '100', reorder_qty: '500' },
      { product_id: steelRods.id, warehouse_id: mainWH.id, min_qty: '50',  reorder_qty: '300' },
      { product_id: wiring.id,    warehouse_id: mainWH.id, min_qty: '200', reorder_qty: '800' },
      { product_id: helmet.id,    warehouse_id: mainWH.id, min_qty: '10',  reorder_qty: '50'  },
      { product_id: gloves.id,    warehouse_id: mainWH.id, min_qty: '20',  reorder_qty: '80'  },
    ],
  });
  console.log('✅ Reorder rules: 5');

  console.log('\n═══════════════════════════════════════════════');
  console.log('🎉 Seed complete!');
  console.log('═══════════════════════════════════════════════');
  console.log('  manager → admin@demo.com  / admin123');
  console.log('  staff   → staff@demo.com  / staff123');
  console.log('');
  console.log('  Dashboard will show:');
  console.log('  • 10 products | 5 categories | 2 warehouses');
  console.log('  • 2 pending receipts (ready + draft)');
  console.log('  • 2 pending deliveries (ready + draft)');
  console.log('  • 1 transfer ready');
  console.log('  • 4 LOW STOCK alerts (copper, bubblewrap, helmet, gloves)');
  console.log('═══════════════════════════════════════════════\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
