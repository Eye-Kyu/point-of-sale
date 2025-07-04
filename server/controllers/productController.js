const Product = require('../models/Product');

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching products' });
  }
};

// POST create new product
exports.createProduct = async (req, res) => {
  try {
    const { name, barcode, price, stock, category } = req.body;
    const imageUrl = req.file?.path || '';

    const product = new Product({
      name,
      barcode,
      price,
      stock,
      category,
      image: imageUrl,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: 'Invalid product data' });
  }
};

// PUT update product by id
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, barcode, price, stock, category } = req.body;

    const updateFields = { name, barcode, price, stock, category };

    if (req.file?.path) {
      updateFields.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateFields, { new: true });

    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: 'Invalid update data' });
  }
};

// DELETE product by id
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting product' });
  }
};

// Low stock alert
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStock = await Product.find({ stock: { $lt: 10 } });
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
