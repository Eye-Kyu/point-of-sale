const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const inventoryController = require('../controllers/inventoryController');
const checkRole = require('../middleware/roleMiddleware');



// Requires login and typically admin role (optional to add role check)
router.post('/restock', auth, inventoryController.restockProduct);
router.post('/restock', auth, checkRole('admin'), inventoryController.restockProduct);
router.get('/logs', auth, inventoryController.getInventoryLogs);

module.exports = router;
