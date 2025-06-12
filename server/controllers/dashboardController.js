const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.getSummary = async (req, res) => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    try {
        const todaySales = await Sale.aggregate([
            { $match: { date: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);

        const weekSales = await Sale.aggregate([
            { $match: { date: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);

        const totalStock = await Product.aggregate([
            { $group: { _id: null, totalStock: { $sum: "$stock" } } }
        ]);

        const bestSeller = await Sale.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.product", qty: { $sum: "$items.quantity" } } },
            { $sort: { qty: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            { $project: { name: "$product.name", qty: 1 } }
        ]);

        res.json({
            todaySales: todaySales[0]?.total || 0,
            weekSales: weekSales[0]?.total || 0,
            totalStock: totalStock[0]?.totalStock || 0,
            bestSeller: bestSeller[0]?.name || "N/A"
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard summary' });
    }
};
