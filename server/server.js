require('dotenv').config();
const productRoutes = require('./routes/products');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');



dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // ✅ Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes); // ✅ Load routes BEFORE app.listen

// Test route
app.get('/', (req, res) => res.send('POS API Running'));

// use the productRoutes module to handle requests to the '/api/products' endpoint.
app.use('/api/products', productRoutes);

//handles sales- directs to the sales api
app.use('/api/sales', salesRoutes);

//handles inventory- directs to inventory api
app.use('/api/inventory', inventoryRoutes);

//dashboard summary cards for day,week and month
app.use('/api/dashboard', require('./routes/dashboard'));

//bestseller logic and charts
app.use('/api/dashboard', require('./routes/dashboard'));



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
