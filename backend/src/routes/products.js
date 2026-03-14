const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all products
router.get('/', authMid, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        stock_locations: {
          include: { warehouse: true }
        }
      }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Create a new product
router.post('/', authMid, async (req, res) => {
  try {
    const { name, sku, category_id, unit_of_measure, min_stock_level } = req.body;
    
    if (!name || !sku) return res.status(400).json({ error: "Name and SKU are required" });

    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        category_id,
        unit_of_measure,
        min_stock_level
      }
    });
    
    const warehouses = await prisma.warehouse.findMany({ where: { is_active: true } });
    
    for (const w of warehouses) {
      const existing = await prisma.stockLocation.findFirst({
        where: { warehouse_id: w.id, product_id: newProduct.id }
      });

      if (!existing) {
        await prisma.stockLocation.create({
          data: {
            warehouse_id: w.id,
            product_id: newProduct.id,
            quantity: 0
          }
        });
      }
    }

    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create product. Check if SKU is unique." });
  }
});

// Get stock for single product
router.get('/:id/stock', authMid, async (req, res) => {
  try {
    const stock = await prisma.stockLocation.findMany({
      where: { product_id: req.params.id },
      include: { warehouse: true }
    });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock" });
  }
});

// Edit a product
router.put('/:id', authMid, async (req, res) => {
  try {
    const { name, category_id, unit_of_measure, min_stock_level } = req.body;
    
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        category_id,
        unit_of_measure,
        min_stock_level
      }
    });

    res.json(updatedProduct);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(400).json({ error: "Failed to update product" });
  }
});

module.exports = router;
