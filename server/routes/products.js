const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Correct import
const checkRole = require('../middleware/roleMiddleware');
const productController = require('../controllers/productController');
const parser = require('../middleware/cloudinaryParser'); 

// Get all products
router.get('/', protect, productController.getAllProducts);

// Create product (with image and category)
router.post('/', protect, parser.single('image'), productController.createProduct);

// Update product (optional image)
router.put('/:id', protect, parser.single('image'), productController.updateProduct);

// Delete (admin only)
router.delete('/:id', protect, checkRole('admin'), productController.deleteProduct);

// Low stock alert
router.get('/low-stock', protect, productController.getLowStockProducts);

module.exports = router;
