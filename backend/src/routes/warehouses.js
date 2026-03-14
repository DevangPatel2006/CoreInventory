const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMid, async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany();
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch warehouses" });
  }
});

router.post('/', authMid, async (req, res) => {
  const { name, address } = req.body;
  if (!name) return res.status(400).json({ error: "Warehouse name is required" });

  try {
    const warehouse = await prisma.warehouse.create({ data: { name, address: address || null } });
    res.json(warehouse);
  } catch (err) {
    res.status(400).json({ error: "Failed to create warehouse" });
  }
});

module.exports = router;
