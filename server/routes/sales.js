const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const salesController = require('../controllers/salesController');

router.post('/', protect, salesController.createSale);
router.get('/', protect, salesController.getAllSales);
router.get('/:id', protect, salesController.getSaleById);
router.get('/report/range', protect, checkRole('admin'), salesController.getSalesReport);
router.delete('/:id', protect, checkRole('admin'), salesController.deleteSale);

module.exports = router;
