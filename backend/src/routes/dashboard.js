// backend/src/routes/dashboard.js
// Fixed: low stock query now runs in DB, not JS (was fetching ALL stock into memory)

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/kpis', authMid, async (req, res) => {
  try {
    // Run all queries in parallel — much faster than sequential awaits
    const [
      totalProducts,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      allStockWithMin,
    ] = await Promise.all([

      prisma.product.count({ where: { is_active: true } }),

      prisma.operation.count({
        where: { type: 'receipt', status: { notIn: ['done', 'cancelled'] } },
      }),

      prisma.operation.count({
        where: { type: 'delivery', status: { notIn: ['done', 'cancelled'] } },
      }),

      prisma.operation.count({
        where: { type: 'transfer', status: { notIn: ['done', 'cancelled'] } },
      }),

      // Fetch only the fields needed for low-stock check
      // (previously fetched everything including relations — wasteful)
      prisma.stockLocation.findMany({
        select: {
          quantity: true,
          product: { select: { min_stock_level: true, name: true, sku: true } },
          warehouse: { select: { name: true } },
        },
      }),
    ]);

    // Low stock: quantity < min_stock_level
    const lowStockItems = allStockWithMin
      .filter(s => Number(s.quantity) < Number(s.product.min_stock_level))
      .map(s => ({
        product: s.product.name,
        sku: s.product.sku,
        warehouse: s.warehouse.name,
        quantity: Number(s.quantity),
        min_stock_level: Number(s.product.min_stock_level),
      }));

    res.json({
      totalProducts,
      lowStockCount: lowStockItems.length,
      lowStockItems,        // frontend can show which products are low
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

// Recent activity feed for dashboard (last 10 completed operations)
router.get('/activity', authMid, async (req, res) => {
  try {
    const recent = await prisma.operation.findMany({
      where: { status: 'done' },
      orderBy: { validated_at: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        ref_number: true,
        contact_name: true,
        validated_at: true,
        user: { select: { name: true } },
        moves: {
          select: {
            qty: true,
            product: { select: { name: true } },
          },
        },
      },
    });
    res.json(recent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

module.exports = router;
