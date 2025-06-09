const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.createSale = async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod } = req.body;
        const cashierId = req.user.id;

        // Update stock
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ error: 'Product unavailable or out of stock' });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        const sale = new Sale({
            items,
            totalAmount,
            paymentMethod,
            cashier: cashierId
        });

        await sale.save();
        res.status(201).json(sale);
    }
    catch (err) {
        console.error('💥 Create Sale Error:', err.message);
        console.error(err.stack); // Logs full stack trace
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find().populate('items.product').populate('cashier', 'name email');
        res.json(sales);
    } catch (err) {
        console.error('💥 Create Sale Error:', err.message);
        console.error(err.stack); // Logs full stack trace
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('items.product')
            .populate('cashier', 'name email');

        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.json(sale);
    } catch (err) {
        console.error('💥 Get Sale By ID Error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getSalesReport = async (req, res) => {
    try {
        const { start, end } = req.query;
        const startDate = new Date(start);
        const endDate = new Date(end);

        const sales = await Sale.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate('items.product').populate('cashier', 'name email');

        res.json(sales);
    } catch (err) {
        console.error('💥 Sales Report Error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findByIdAndDelete(req.params.id);
        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json({ message: 'Sale deleted' });
    } catch (err) {
        console.error('💥 Delete Sale Error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

