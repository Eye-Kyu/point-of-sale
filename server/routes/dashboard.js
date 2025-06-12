const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.getSummary);

module.exports = router;

//bestseller logic
const Sale = require('../models/Sale');
const Product = require('../models/Product');


router.get('/summary', async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

        const todaySales = await Sale.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const weekSales = await Sale.aggregate([
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalStock = await Product.aggregate([
            { $group: { _id: null, total: { $sum: '$stock' } } }
        ]);

        const bestSellerAgg = await Sale.aggregate([
            { $unwind: '$products' },
            { $group: { _id: '$products.productId', qty: { $sum: '$products.quantity' } } },
            { $sort: { qty: -1 } },
            { $limit: 1 }
        ]);

        let bestSeller = 'N/A';
        if (bestSellerAgg.length > 0) {
            const bestProduct = await Product.findById(bestSellerAgg[0]._id);
            bestSeller = bestProduct?.name || 'Unknown';
        }

        // Weekly breakdown for chart
        const weekChart = await Sale.aggregate([
            { $match: { createdAt: { $gte: startOfWeek } } },
            {
                $group: {
                    _id: {
                        $dayOfWeek: '$createdAt',
                    },
                    total: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedChart = weekChart.map(item => ({
            day: days[item._id - 1],
            total: item.total
        }));

        res.json({
            todaySales: todaySales[0]?.total || 0,
            weekSales: weekSales[0]?.total || 0,
            totalStock: totalStock[0]?.total || 0,
            bestSeller,
            chartData: formattedChart
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Dashboard summary error' });
    }
});

module.exports = router;
