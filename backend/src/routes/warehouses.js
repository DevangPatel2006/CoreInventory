const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMid, async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({ where: { is_active: true } });
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

router.post('/', authMid, async (req, res) => {
  const { name, short_code, address } = req.body;

  if (!name)       return res.status(400).json({ error: 'Warehouse name is required' });
  if (!short_code) return res.status(400).json({ error: 'Short code is required (e.g. MAIN, PROD)' });

  try {
    const warehouse = await prisma.warehouse.create({
      data: { name, short_code: short_code.toUpperCase(), address: address || null },
    });
    res.json(warehouse);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create warehouse. Short code must be unique.' });
  }
});

module.exports = router;
