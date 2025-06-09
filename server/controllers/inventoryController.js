const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');

exports.restockProduct = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        product.stock += quantity;
        await product.save();

        const log = new InventoryLog({
            product: productId,
            quantity,
            action: 'restock',
            user: userId
        });

        await log.save();

        res.status(200).json({ message: 'Product restocked', product, log });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getInventoryLogs = async (req, res) => {
    try {
        const logs = await InventoryLog.find().populate('product', 'name').populate('user', 'name email');
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
