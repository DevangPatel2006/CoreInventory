// backend/src/routes/moves.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

// Get stock moves (ledger)
router.get('/', authMid, async (req, res) => {
  try {
    const moves = await prisma.stockMove.findMany({
      include: {
        product: true,
        operation: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { operation: { created_at: 'desc' } }
    });
    res.json(moves);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch moves history" });
  }
});

module.exports = router;
