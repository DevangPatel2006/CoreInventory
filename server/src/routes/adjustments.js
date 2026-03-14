const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMid, async (req, res) => {
  try {
    const adjustments = await prisma.operation.findMany({
      where: { type: 'adjust' },
      include: {
        user: { select: { name: true } },
        moves: { include: { product: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(adjustments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch adjustments' });
  }
});

router.post('/', authMid, async (req, res) => {
  const { product_id, warehouse_id, counted_quantity, notes } = req.body;

  if (counted_quantity < 0) {
    return res.status(400).json({ error: 'Counted quantity cannot be negative' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const location = await tx.stockLocation.findFirst({
        where: { product_id, warehouse_id },
      });

      // ✅ Use Number() to safely convert Decimal to JS number for arithmetic
      const current_qty = location ? Number(location.quantity) : 0;
      const difference = counted_quantity - current_qty;

      if (difference === 0) return { message: 'No adjustment needed' };

      const adjustOp = await tx.operation.create({
        data: {
          type: 'adjust',
          status: 'done',
          ref_number: `ADJ-${Date.now()}`,
          notes: notes || null,
          created_by: req.user.id,
          validated_by: req.user.id,
          validated_at: new Date(),
          moves: {
            create: {
              product_id,
              qty: Math.abs(difference),
              from_location: difference < 0 ? warehouse_id : null,
              to_location:   difference > 0 ? warehouse_id : null,
            },
          },
        },
      });

      if (location) {
        await tx.stockLocation.update({
          where: { id: location.id },
          data: { quantity: counted_quantity },
        });
      } else {
        await tx.stockLocation.create({
          data: { product_id, warehouse_id, quantity: counted_quantity },
        });
      }

      return adjustOp;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Adjustment failed' });
  }
});

module.exports = router;
