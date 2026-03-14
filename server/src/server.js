require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Just a test route
app.get('/', (req, res) => {
  res.json({ message: "CoreInventory API is running!" });
});

// Import routes (we will create these)
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/warehouses', require('./routes/warehouses'));
app.use('/receipts', require('./routes/receipts'));
app.use('/deliveries', require('./routes/deliveries'));
app.use('/transfers', require('./routes/transfers'));
app.use('/adjustments', require('./routes/adjustments'));
app.use('/moves', require('./routes/moves'));
app.use('/dashboard', require('./routes/dashboard'));

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
