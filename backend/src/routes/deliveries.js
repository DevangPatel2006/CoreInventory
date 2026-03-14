const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMid, async (req, res) => {
  try {
    const deliveries = await prisma.operation.findMany({
      where: { type: 'delivery' },
      include: {
        user: { select: { name: true } },
        moves: { include: { product: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

router.get('/:id', authMid, async (req, res) => {
  try {
    const delivery = await prisma.operation.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true } },
        moves: { include: { product: true } },
      },
    });

    if (!delivery || delivery.type !== 'delivery') {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery' });
  }
});

router.post('/', authMid, async (req, res) => {
  try {
    const { ref_number, contact_name, moves } = req.body;

    const ref = ref_number || `DEL-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    if (!moves || !moves.length) return res.status(400).json({ error: 'Moves are required' });

    const delivery = await prisma.operation.create({
      data: {
        type: 'delivery',
        ref_number: ref,
        contact_name: contact_name || null,
        created_by: req.user.id,
        moves: {
          create: moves.map(m => ({
            product_id: m.product_id,
            qty: m.qty,
            from_location: m.from_location,
          })),
        },
      },
      include: { moves: true },
    });

    res.json(delivery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
});

// Validate delivery → stock decreases
router.post('/:id/validate', authMid, async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const op = await tx.operation.findUnique({
        where: { id: req.params.id },
        include: { moves: true },
      });

      if (!op)                    throw new Error('Operation not found');
      if (op.type !== 'delivery') throw new Error('Not a delivery');
      if (op.status === 'done')   throw new Error('Already validated');

      for (const move of op.moves) {
        if (!move.from_location) throw new Error('Missing from_location on move');

        const location = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.from_location },
        });

        // ✅ Use Number() to compare Decimal values — never compare raw Decimal objects
        if (!location || Number(location.quantity) < Number(move.qty)) {
          throw new Error(`Insufficient stock for product ID: ${move.product_id}`);
        }

        // ✅ Use Prisma atomic decrement — never do Decimal - Decimal in JS
        await tx.stockLocation.update({
          where: { id: location.id },
          data: { quantity: { decrement: move.qty } },
        });
      }

      return tx.operation.update({
        where: { id: op.id },
        data: {
          status: 'done',
          validated_by: req.user.id,
          validated_at: new Date(),
        },
      });
    });

    res.json({ message: 'Delivery validated', operation: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
