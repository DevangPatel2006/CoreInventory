const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/kpis', authMid, async (req, res) => {
  try {
    // 1. Total Products
    const totalProducts = await prisma.product.count();

    // 2. Low Stock Items (where any stock_location quantity < product.min_stock_level)
    // Prisma doesnt allow comparing fields across tables directly in findMany, 
    // so we fetch all stock locations with their product limits and JS filter it.
    // For a hackathon this is fine. For prod, we'd use raw SQL.
    const allStock = await prisma.stockLocation.findMany({
      include: { product: { select: { min_stock_level: true, name: true } } }
    });
    
    const lowStockCount = allStock.filter(s => s.quantity < s.product.min_stock_level).length;

    // 3. Pending Receipts
    const pendingReceipts = await prisma.operation.count({
      where: { type: 'receipt', status: { not: 'done' } }
    });

    // 4. Pending Deliveries
    const pendingDeliveries = await prisma.operation.count({
        where: { type: 'delivery', status: { not: 'done' } }
    });

    const scheduledTransfers = await prisma.operation.count({
        where: { type: 'transfer', status: { not: 'done' } }
    });

    res.json({
      totalProducts,
      lowStockCount,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch KPIs" });
  }
});

module.exports = router;
