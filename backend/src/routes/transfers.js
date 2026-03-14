const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

// Get transfers
router.get('/', authMid, async (req, res) => {
  try {
    const transfers = await prisma.operation.findMany({
      where: { type: 'transfer' },
      include: {
        user: { select: { name: true } },
        moves: {
          include: { product: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transfers" });
  }
});

// Fetch single transfer
router.get('/:id', authMid, async (req, res) => {
  try {
    const transfer = await prisma.operation.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true } },
        moves: {
          include: { product: true }
        }
      }
    });

    if (!transfer || transfer.type !== 'transfer') {
      return res.status(404).json({ error: "Transfer not found" });
    }

    res.json(transfer);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transfer" });
  }
});

// Create and automatically validate a transfer
router.post('/', authMid, async (req, res) => {
  try {
    const { ref_number, moves } = req.body;
    
    if (!moves || !moves.length) return res.status(400).json({ error: "Moves are required" });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the operation marked as done immediately
      const transferOp = await tx.operation.create({
        data: {
          type: 'transfer',
          status: 'done',
          ref_number,
          created_by: req.user.id,
          moves: {
            create: moves.map(m => ({
              product_id: m.product_id,
              qty: m.qty,
              from_location: m.from_location,
              to_location: m.to_location
            }))
          }
        },
        include: { moves: true }
      });

      // 2. Adjust stock
      for (const move of transferOp.moves) {
        // Deduct from source
        const sourceLoc = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.from_location }
        });

        if (!sourceLoc || sourceLoc.quantity < move.qty) {
           throw new Error(`Insufficient stock for product ID: ${move.product_id} at source location`);
        }

        await tx.stockLocation.update({
          where: { id: sourceLoc.id },
          data: { quantity: sourceLoc.quantity - move.qty }
        });

        // Add to dest
        const destLoc = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.to_location }
        });

        if (destLoc) {
          await tx.stockLocation.update({
            where: { id: destLoc.id },
            data: { quantity: destLoc.quantity + move.qty }
          });
        } else {
          await tx.stockLocation.create({
            data: {
              product_id: move.product_id,
              warehouse_id: move.to_location,
              quantity: move.qty
            }
          });
        }
      }

      return transferOp;
    });

    res.json({ message: "Transfer successful", operation: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
