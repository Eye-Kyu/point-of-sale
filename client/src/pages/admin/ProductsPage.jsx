import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    image: null, // Now stores File
    category: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      stock: '',
      image: null,
      category: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSaveProduct = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', parseFloat(form.price));
      formData.append('stock', parseInt(form.stock));
      formData.append('category', form.category);
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created!');
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error('Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.image || '',
      category: product.category || '',
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white border p-4 rounded shadow mb-4 space-y-2">
          <h3 className="text-lg font-semibold mb-2">
            {editingId ? 'Edit Product' : 'Add Product'}
          </h3>

          <input
            placeholder="Name"
            className="border p-2 w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Price"
            type="number"
            className="border p-2 w-full"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <input
            placeholder="Stock"
            type="number"
            className="border p-2 w-full"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          <select
            className="border p-2 w-full"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="beverages">Beverages</option>
            <option value="snacks">Snacks</option>
            <option value="dairy">Dairy</option>
            <option value="bakery">Bakery</option>
          </select>

          <input
            type="file"
            accept="image/*"
            className="border p-2 w-full"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />

          {form.image && (
            <img
              src={typeof form.image === 'string' ? form.image : URL.createObjectURL(form.image)}
              alt="Preview"
              className="w-24 h-24 object-cover rounded"
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveProduct}
              disabled={!form.name || !form.price || !form.stock}
              className={`px-4 py-2 rounded text-white ${!form.name || !form.price || !form.stock
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600'
                }`}
            >
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product Table */}
      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border p-2">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  '—'
                )}
              </td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2 capitalize">{p.category || '—'}</td>
              <td className="border p-2">KES {p.price}</td>
              <td className="border p-2">{p.stock}</td>
              <td className="border p-2 space-x-2">
                <button className="text-blue-600" onClick={() => handleEdit(p)}>
                  Edit
                </button>
                <button className="text-red-600" onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ProductsPage;
