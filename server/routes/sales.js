const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const salesController = require('../controllers/salesController');
const checkRole = require('../middleware/roleMiddleware');


router.post('/', auth, salesController.createSale);
router.get('/', auth, salesController.getAllSales);
router.get('/:id', auth, salesController.getSaleById);
router.get('/report/range', auth, checkRole('admin'), salesController.getSalesReport);
router.delete('/:id', auth, checkRole('admin'), salesController.deleteSale);


module.exports = router;
