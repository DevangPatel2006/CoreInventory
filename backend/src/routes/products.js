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
    
    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        category_id,
        unit_of_measure,
        min_stock_level
      }
    });
    
    // When creating a product, we might want to initialize its stock to 0 in all active warehouses
    const warehouses = await prisma.warehouse.findMany({ where: { is_active: true } });
    
    const stockPromises = warehouses.map(w => 
      prisma.stockLocation.create({
        data: {
          warehouse_id: w.id,
          product_id: newProduct.id,
          quantity: 0
        }
      })
    );
    await Promise.all(stockPromises);

    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product. Check if SKU is unique." });
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

module.exports = router;
