const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMid, async (req, res) => {
  try {
    const transfers = await prisma.operation.findMany({
      where: { type: 'transfer' },
      include: {
        user: { select: { name: true } },
        moves: { include: { product: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

router.get('/:id', authMid, async (req, res) => {
  try {
    const transfer = await prisma.operation.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true } },
        moves: { include: { product: true } },
      },
    });

    if (!transfer || transfer.type !== 'transfer') {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transfer' });
  }
});

// Create transfer
router.post('/', authMid, async (req, res) => {
  try {
    const { ref_number, notes, moves, validate_immediately = true } = req.body;

    if (!moves || !moves.length) return res.status(400).json({ error: 'Moves are required' });

    if (!validate_immediately) {
      const transfer = await prisma.operation.create({
        data: {
          type: 'transfer',
          status: 'draft',
          ref_number: ref_number || `TRF-${Date.now()}`,
          notes: notes || null,
          created_by: req.user.id,
          moves: {
            create: moves.map(m => ({
              product_id: m.product_id,
              qty: m.qty,
              from_location: m.from_location,
              to_location: m.to_location,
            })),
          },
        },
        include: { moves: true },
      });
      return res.json({ message: 'Draft transfer created', operation: transfer });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transferOp = await tx.operation.create({
        data: {
          type: 'transfer',
          status: 'done',
          ref_number: ref_number || `TRF-${Date.now()}`,
          notes: notes || null,
          created_by: req.user.id,
          validated_by: req.user.id,
          validated_at: new Date(),
          moves: {
            create: moves.map(m => ({
              product_id: m.product_id,
              qty: m.qty,
              from_location: m.from_location,
              to_location: m.to_location,
            })),
          },
        },
        include: { moves: true },
      });

      for (const move of transferOp.moves) {
        const source = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.from_location },
        });

        // ✅ Use Number() to compare Decimal values safely
        if (!source || Number(source.quantity) < Number(move.qty)) {
          throw new Error(`Insufficient stock for product ID: ${move.product_id} at source`);
        }

        // ✅ Atomic decrement from source
        await tx.stockLocation.update({
          where: { id: source.id },
          data: { quantity: { decrement: move.qty } },
        });

        const dest = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.to_location },
        });

        if (dest) {
          // ✅ Atomic increment at destination
          await tx.stockLocation.update({
            where: { id: dest.id },
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

      return transferOp;
    });

    res.json({ message: 'Transfer successful', operation: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Validate draft transfer
router.post('/:id/validate', authMid, async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const transferOp = await tx.operation.findUnique({
        where: { id: req.params.id },
        include: { moves: true },
      });

      if (!transferOp)                    throw new Error('Operation not found');
      if (transferOp.type !== 'transfer') throw new Error('Not a transfer');
      if (transferOp.status === 'done')   throw new Error('Already validated');

      for (const move of transferOp.moves) {
        const source = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.from_location },
        });

        if (!source || Number(source.quantity) < Number(move.qty)) {
          throw new Error(`Insufficient stock for product ID: ${move.product_id} at source`);
        }

        await tx.stockLocation.update({
          where: { id: source.id },
          data: { quantity: { decrement: move.qty } },
        });

        const dest = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.to_location },
        });

        if (dest) {
          await tx.stockLocation.update({
            where: { id: dest.id },
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
        where: { id: transferOp.id },
        data: {
          status: 'done',
          validated_by: req.user.id,
          validated_at: new Date(),
        },
      });
    });

    res.json({ message: 'Transfer validated', operation: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
