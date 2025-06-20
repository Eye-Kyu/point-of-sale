const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const inventoryController = require('../controllers/inventoryController');
const checkRole = require('../middleware/roleMiddleware');

// Only one route definition needed, with both auth and role check
router.post('/restock', protect, checkRole('admin'), inventoryController.restockProduct);
router.get('/logs', protect, inventoryController.getInventoryLogs);

module.exports = router;
