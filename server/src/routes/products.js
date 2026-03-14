const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMid = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all products
router.get('/', authMid, async (req, res) => {
  try {
    const { search, category_id, low_stock } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category_id) {
      where.category_id = category_id;
    }

    let products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        stock_locations: {
          include: { warehouse: true }
        }
      }
    });

    if (low_stock === 'true') {
      products = products.filter(p => 
        p.stock_locations.some(loc => Number(loc.quantity) < Number(p.min_stock_level))
      );
    }

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
    
    await prisma.stockLocation.createMany({
      data: warehouses.map(w => ({
        warehouse_id: w.id,
        product_id: newProduct.id,
        quantity: 0
      })),
      skipDuplicates: true,
    });

    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create product. Check if SKU is unique." });
  }
});

// Reorder rules endpoints
router.get('/reorder-rules', authMid, async (req, res) => {
  try {
    const rules = await prisma.reorderRule.findMany({
      include: { product: true, warehouse: true }
    });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reorder rules' });
  }
});

router.post('/reorder-rules', authMid, async (req, res) => {
  try {
    const { product_id, warehouse_id, min_qty, reorder_qty } = req.body;
    const rule = await prisma.reorderRule.upsert({
      where: { product_id },
      update: { warehouse_id, min_qty, reorder_qty },
      create: { product_id, warehouse_id, min_qty, reorder_qty }
    });
    res.json(rule);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update reorder rule' });
  }
});

router.delete('/reorder-rules/:id', authMid, async (req, res) => {
  try {
    await prisma.reorderRule.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete reorder rule' });
  }
});

// Single product
router.get('/:id', authMid, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, stock_locations: { include: { warehouse: true } } }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
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

// Soft delete
router.patch('/:id/deactivate', authMid, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { is_active: false }
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to deactivate product' });
  }
});

module.exports = router;
