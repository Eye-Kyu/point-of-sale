import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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



  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setForm({ name: '', price: '', stock: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSaveProduct = async () => {
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, {
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        });
        toast.success('Product updated!');
      } else {
        await api.post('/products', {
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        });
        toast.success('Product created!');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert('Error saving product');
    } finally {
      setSubmitting(false);
    }
  };



  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
    setEditingId(product._id);
    setShowForm(true);
  };


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts(); // Refresh list
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setForm({ name: '', price: '', stock: '' });
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {/* Modal / Form */}
      {showForm && (
        <div className="bg-white border p-4 rounded shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {editingId ? 'Edit Product' : 'Add Product'}
          </h3>
          <input
            placeholder="Name"
            className="border p-2 mb-2 w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Price"
            type="number"
            className="border p-2 mb-2 w-full"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            placeholder="Stock"
            type="number"
            className="border p-2 mb-2 w-full"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveProduct}
              disabled={!form.name || !form.price || !form.stock}
              className={`px-4 py-2 rounded text-white ${!form.name || !form.price || !form.stock ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600'}`}
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
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">KES {p.price}</td>
              <td className="border p-2">{p.stock}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="text-blue-600"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </button>
                {/* Delete will go here next */}
                <button
                  className=" ml-2 bg-red-600 hover:bg-red-800 text-white"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                  {submitting ? 'Deleting...' : editingId ? 'Update' : 'Save'}
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
