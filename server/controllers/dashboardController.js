const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.getSummary = async (req, res) => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    try {
        const [
            todaySales,
            weekSales,
            totalStock,
            bestSeller,
            topProducts,
            stockLevels,
            lowStockItems // ✅ Low stock query
        ] = await Promise.all([
            // Daily sales
            Sale.aggregate([
                { $match: { date: { $gte: startOfDay } } },
                { $group: { _id: null, total: { $sum: "$total" } } }
            ]),

            // Weekly sales
            Sale.aggregate([
                { $match: { date: { $gte: startOfWeek } } },
                { $group: { _id: null, total: { $sum: "$total" } } }
            ]),

            // Total stock
            Product.aggregate([
                { $group: { _id: null, totalStock: { $sum: "$stock" } } }
            ]),

            // Single best seller
            Sale.aggregate([
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
            ]),

            // Top 5 bestsellers (pie chart)
            Sale.aggregate([
                { $unwind: "$items" },
                { $group: { _id: "$items.product", qty: { $sum: "$items.quantity" } } },
                { $sort: { qty: -1 } },
                { $limit: 5 },
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
            ]),

            // Stock levels (bar chart)
            Product.find({}, "name stock"),

            // ✅ Low stock items (threshold < 10)
            Product.find({ stock: { $lt: 10 } }).select("name stock")
        ]);

        res.json({
            todaySales: todaySales[0]?.total || 0,
            weekSales: weekSales[0]?.total || 0,
            totalStock: totalStock[0]?.totalStock || 0,
            bestSeller: bestSeller[0]?.name || "N/A",
            topProducts,
            stockLevels,
            lowStockItems // ✅ Send to frontend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load dashboard summary' });
    }
};
