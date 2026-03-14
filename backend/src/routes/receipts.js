const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMid, async (req, res) => {
  try {
    const receipts = await prisma.operation.findMany({
      where: { type: 'receipt' },
      include: {
        user: { select: { name: true } },
        moves: { include: { product: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

router.get('/:id', authMid, async (req, res) => {
  try {
    const receipt = await prisma.operation.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true } },
        moves: { include: { product: true } },
      },
    });

    if (!receipt || receipt.type !== 'receipt') {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

router.post('/', authMid, async (req, res) => {
  try {
    const { ref_number, contact_name, moves } = req.body;

    const ref = ref_number || `REC-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    if (!moves || !moves.length) return res.status(400).json({ error: 'Moves are required' });

    const receipt = await prisma.operation.create({
      data: {
        type: 'receipt',
        ref_number: ref,
        contact_name: contact_name || null,
        created_by: req.user.id,
        moves: {
          create: moves.map(m => ({
            product_id: m.product_id,
            qty: m.qty,
            to_location: m.to_location,
          })),
        },
      },
      include: { moves: true },
    });

    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create receipt' });
  }
});

// Validate receipt → stock increases
router.post('/:id/validate', authMid, async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const op = await tx.operation.findUnique({
        where: { id: req.params.id },
        include: { moves: true },
      });

      if (!op)                   throw new Error('Operation not found');
      if (op.type !== 'receipt') throw new Error('Not a receipt');
      if (op.status === 'done')  throw new Error('Already validated');

      for (const move of op.moves) {
        const location = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.to_location },
        });

        if (location) {
          // ✅ Use Prisma atomic increment — never do Decimal + Decimal in JS
          await tx.stockLocation.update({
            where: { id: location.id },
            data: { quantity: { increment: move.qty } },
          });
        } else {
          await tx.stockLocation.create({
            data: {
              product_id: move.product_id,
              warehouse_id: move.to_location,
              quantity: move.qty,
            },
          });
        }
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

    res.json({ message: 'Receipt validated successfully', operation: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
