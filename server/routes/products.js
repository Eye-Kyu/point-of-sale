const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');
const checkRole = require('../middleware/roleMiddleware');

// Protect all product routes with auth middleware
router.get('/', auth, productController.getAllProducts);
router.post('/', auth, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);
//low stock alert
router.get('/low-stock', auth, productController.getLowStockProducts);
// Only admin can delete products
router.delete('/:id', auth, checkRole('admin'), productController.deleteProduct);

module.exports = router;





