import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 5;

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [saleForm, setSaleForm] = useState({ customerName: '', items: [{ productId: '', quantity: 1 }] });
  const [editingSale, setEditingSale] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [productFilter, setProductFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          api.get('/sales'),
          api.get('/products'),
        ]);
        setSales(salesRes.data);
        setProductsList(productsRes.data);
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportToExcel = () => {
    const exportData = sales.map((sale) => ({
      'Sale ID': sale._id,
      'Date': new Date(sale.date).toLocaleDateString(),
      'Customer': sale.customerName || 'N/A',
      'Total (KES)': sale.total,
      'Items': sale.items.map((item) => {
        const product = productsList.find(p => p._id === item.productId);
        return `${product?.name || 'Unknown'} (x${item.quantity})`;
      }).join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `sales-report-${today}.xlsx`);
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const product = productsList.find(p => p._id === item.productId);
      return product ? total + product.price * item.quantity : total;
    }, 0);
  };

  const handleItemChange = (form, setForm, index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = field === 'quantity' ? parseInt(value) : value;
    setForm({ ...form, items: updatedItems });
  };

  const validateForm = (form) => {
    if (!form.customerName.trim()) return 'Customer name is required.';
    for (let item of form.items) {
      if (!item.productId) return 'All products must be selected.';
      if (item.quantity < 1) return 'Quantities must be at least 1.';
    }
    return null;
  };

  const handleSaveSale = async () => {
    const error = validateForm(saleForm);
    if (error) return toast.error(error);

    try {
      const total = calculateTotal(saleForm.items);
      await api.post('/sales', { ...saleForm, total });
      const res = await api.get('/sales');
      setSales(res.data);
      setSaleForm({ customerName: '', items: [{ productId: '', quantity: 1 }] });
      setShowForm(false);
      toast.success('Sale saved successfully!');
    } catch {
      toast.error('Failed to save sale');
    }
  };

  const handleUpdateSale = async () => {
    const error = validateForm(editingSale);
    if (error) return toast.error(error);

    try {
      const total = calculateTotal(editingSale.items);
      await api.put(`/sales/${editingSale._id}`, { ...editingSale, total });
      const res = await api.get('/sales');
      setSales(res.data);
      setEditingSale(null);
      setShowEditModal(false);
      toast.success('Sale updated!');
    } catch {
      toast.error('Failed to update sale');
    }
  };

  const handleDeleteSale = async (id) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
      await api.delete(`/sales/${id}`);
      const res = await api.get('/sales');
      setSales(res.data);
      toast.success('Sale deleted.');
    } catch {
      toast.error('Failed to delete sale');
    }
  };

  const handleAddItem = () => {
    setSaleForm({ ...saleForm, items: [...saleForm.items, { productId: '', quantity: 1 }] });
  };

  const handleEditClick = (sale) => {
    setEditingSale({
      _id: sale._id,
      customerName: sale.customerName,
      items: sale.items.map(item => ({ productId: item.productId, quantity: item.quantity }))
    });
    setShowEditModal(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDateFilter({ from: '', to: '' });
    setProductFilter('');
    setPage(1);
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName?.toLowerCase().includes(search.toLowerCase());

    const saleDate = new Date(sale.date);
    const from = dateFilter.from ? new Date(dateFilter.from) : null;
    const to = dateFilter.to ? new Date(dateFilter.to) : null;
    const matchesDate = (!from || saleDate >= from) && (!to || saleDate <= to);

    const matchesProduct =
      !productFilter ||
      sale.items.some(item => item.productId === productFilter);

    return matchesSearch && matchesDate && matchesProduct;
  });

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const currentSales = filteredSales.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <ToastContainer position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Sales Records</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>+ Add Sale</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleExportToExcel}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Export to Excel
        </button>

        <button
          onClick={handleClearFilters}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Clear Filters
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          className="border p-2 flex-1"
          placeholder="Search by customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border p-2"
          value={dateFilter.from}
          onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
        />
        <input
          type="date"
          className="border p-2"
          value={dateFilter.to}
          onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
        />
        <select
          className="border p-2"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
        >
          <option value="">All Products</option>
          {productsList.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Add and Edit Forms */}
      {showForm && (
        <SaleForm
          form={saleForm}
          setForm={setSaleForm}
          productsList={productsList}
          onCancel={() => setShowForm(false)}
          onSave={handleSaveSale}
          handleItemChange={handleItemChange}
          handleAddItem={handleAddItem}
          total={calculateTotal(saleForm.items)}
        />
      )}

      {showEditModal && editingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xl w-full">
            <SaleForm
              form={editingSale}
              setForm={setEditingSale}
              productsList={productsList}
              onCancel={() => setShowEditModal(false)}
              onSave={handleUpdateSale}
              handleItemChange={handleItemChange}
              handleAddItem={() => setEditingSale({ ...editingSale, items: [...editingSale.items, { productId: '', quantity: 1 }] })}
              total={calculateTotal(editingSale.items)}
              isEditing
            />
          </div>
        </div>
      )}

      {/* Sales Table */}
      <table className="w-full table-auto mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Items</th>
          </tr>
        </thead>
        <tbody>
          {currentSales.map((sale) => (
            <tr key={sale._id}>
              <td className="border p-2">{sale._id}</td>
              <td className="border p-2">{new Date(sale.date).toLocaleDateString()}</td>
              <td className="border p-2">KES {sale.total}</td>
              <td className="border p-2">{sale.customerName || 'N/A'}</td>
              <td className="border p-2">
                {sale.items.map((item, idx) => {
                  const product = productsList.find(p => p._id === item.productId);
                  return (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      {product?.thumbnailUrl && (
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{product?.name || 'Unknown Product'}</div>
                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                      </div>
                    </div>
                  );
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-blue-500 text-white' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const SaleForm = ({ form, setForm, productsList, onCancel, onSave, handleItemChange, handleAddItem, total, isEditing }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">{isEditing ? 'Edit Sale' : 'New Sale'}</h3>
    <input
      className="border p-2 mb-2 w-full"
      placeholder="Customer Name"
      value={form.customerName}
      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
    />
    {form.items.map((item, i) => (
      <div key={i} className="flex gap-2 mb-2">
        <select
          className="border p-2 w-2/3"
          value={item.productId}
          onChange={(e) => handleItemChange(form, setForm, i, 'productId', e.target.value)}
        >
          <option value="">-- Select Product --</option>
          {productsList.map(p => (
            <option key={p._id} value={p._id}>{p.name} (KES {p.price})</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          className="border p-2 w-1/3"
          value={item.quantity}
          onChange={(e) => handleItemChange(form, setForm, i, 'quantity', e.target.value)}
        />
      </div>
    ))}
    <button onClick={handleAddItem} className="text-blue-600 text-sm mb-2">+ Add Item</button>
    <div className="text-right mb-2 font-semibold">Total: KES {total}</div>
    <div className="flex gap-2">
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onSave}>Save</button>
      <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onCancel}>Cancel</button>
    </div>
  </div>
);

export default SalesPage;
