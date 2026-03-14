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
        moves: {
          include: { product: true } // to display names
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

router.post('/', authMid, async (req, res) => {
  try {
    const { ref_number, moves } = req.body;
    // moves = [ { product_id, qty, from_location } ]

    const delivery = await prisma.operation.create({
      data: {
        type: 'delivery',
        ref_number,
        created_by: req.user.id,
        moves: {
          create: moves.map(m => ({
            product_id: m.product_id,
            qty: m.qty,
            from_location: m.from_location
          }))
        }
      },
      include: { moves: true }
    });

    res.json(delivery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create delivery" });
  }
});

router.post('/:id/validate', authMid, async (req, res) => {
  try {
    const operation_id = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const op = await tx.operation.findUnique({
        where: { id: operation_id },
        include: { moves: true }
      });

      if (!op) throw new Error("Operation not found");
      if (op.type !== 'delivery') throw new Error("Not a delivery");
      if (op.status === 'done') throw new Error("Already validated");

      for (const move of op.moves) {
        const location = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.from_location }
        });

        if (!location || location.quantity < move.qty) {
          throw new Error(`Insufficient stock for product ID: ${move.product_id}`);
        }

        await tx.stockLocation.update({
          where: { id: location.id },
          data: { quantity: location.quantity - move.qty } // Deduct stock
        });
      }

      const updatedOp = await tx.operation.update({
        where: { id: op.id },
        data: { status: 'done' }
      });

      return updatedOp;
    });

    res.json({ message: "Delivery validated", operation: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
