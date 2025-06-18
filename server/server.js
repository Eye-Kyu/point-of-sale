require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');

connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // ✅ Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
//admin assigns role
app.use('/api/admin', adminRoutes);
//admin can delete users
app.use('/api/users', require('./routes/users'));


// Test route
app.get('/', (req, res) => res.send('POS API Running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
