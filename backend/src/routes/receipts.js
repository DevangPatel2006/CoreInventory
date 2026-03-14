const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all receipts
router.get('/', authMid, async (req, res) => {
  try {
    const receipts = await prisma.operation.findMany({
      where: { type: 'receipt' },
      include: {
        user: { select: { name: true } },
        moves: {
          include: { product: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

// Create draft receipt
router.post('/', authMid, async (req, res) => {
  try {
    const { ref_number, moves } = req.body;
    // moves = [ { product_id, qty, to_location } ]

    const receipt = await prisma.operation.create({
      data: {
        type: 'receipt',
        ref_number,
        created_by: req.user.id,
        moves: {
          create: moves.map(m => ({
            product_id: m.product_id,
            qty: m.qty,
            to_location: m.to_location
          }))
        }
      },
      include: { moves: true }
    });

    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create receipt" });
  }
});

// Validate receipt (Updates stock!)
router.post('/:id/validate', authMid, async (req, res) => {
  try {
    const operation_id = req.params.id;

    // We use a transaction so if one fails, they all rollback
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the operation
      const op = await tx.operation.findUnique({
        where: { id: operation_id },
        include: { moves: true }
      });

      if (!op) throw new Error("Operation not found");
      if (op.type !== 'receipt') throw new Error("Not a receipt");
      if (op.status === 'done') throw new Error("Already validated");

      // 2. Loop through moves and update StockLocation
      for (const move of op.moves) {
        // Find existing stock record
        const location = await tx.stockLocation.findFirst({
          where: { product_id: move.product_id, warehouse_id: move.to_location }
        });

        if (location) {
          await tx.stockLocation.update({
            where: { id: location.id },
            data: { quantity: location.quantity + move.qty } // Add stock
          });
        } else {
          // rare case if warehouse was added after product
          await tx.stockLocation.create({
            data: {
              product_id: move.product_id,
              warehouse_id: move.to_location,
              quantity: move.qty
            }
          });
        }
      }

      // 3. Mark operation done
      const updatedOp = await tx.operation.update({
        where: { id: op.id },
        data: { status: 'done' }
      });

      return updatedOp;
    });

    res.json({ message: "Receipt validated successfully", operation: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
