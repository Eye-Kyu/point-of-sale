import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const POSPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product) => {
        if (product.stock < 1) {
            toast.warning('Out of stock');
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item._id === product._id);
            if (existing) {
                if (existing.quantity < product.stock) {
                    return prev.map((item) =>
                        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                } else {
                    toast.info('Stock limit reached');
                    return prev;
                }
            } else {
                return [...prev, { ...product, quantity: 1 }];
            }
        });
    };

    const updateQuantity = (id, delta) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item._id !== id));
    };

    const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handlePrintReceipt = () => {
        const printContent = document.getElementById('receipt');
        const printWindow = window.open('', '', 'width=600,height=400');
        printWindow.document.write('<html><head><title>Receipt</title></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const handleConfirmPayment = async () => {
        try {
            const sale = {
                items: cart.map(({ _id, quantity }) => ({ product: _id, quantity })),
                totalAmount,
                paymentMethod,
                ...(paymentMethod === 'mpesa' && { phoneNumber })
            };

            await api.post('/sales', sale);

            toast.success('Sale completed successfully');
            handlePrintReceipt();
            setCart([]);
            setShowModal(false);
        } catch (err) {
            toast.error('Failed to complete sale');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Point of Sale</h1>

            <input
                type="text"
                placeholder="Search products..."
                className="p-2 border w-full mb-4 rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
                <p>Loading products...</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product._id}
                            className={`border p-2 rounded shadow hover:shadow-lg transition duration-300 relative ${product.stock < 1 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            onClick={() => addToCart(product)}
                        >
                            {product.image && (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-32 object-cover rounded mb-2"
                                />
                            )}
                            <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                            <p className="text-xs">KES {product.price}</p>
                            {product.stock < 1 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                                    Out of Stock
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Cart Drawer */}
            <div className="mt-6 border-t pt-4">
                <h2 className="text-xl font-semibold mb-2">Cart</h2>
                {cart.length === 0 ? (
                    <p>No items in cart.</p>
                ) : (
                    <div className="space-y-2">
                        {cart.map((item) => (
                            <div
                                key={item._id}
                                className="flex justify-between items-center border p-2 rounded"
                            >
                                <div>
                                    <h4 className="font-semibold">{item.name}</h4>
                                    <p className="text-sm text-gray-600">KES {item.price} × {item.quantity}</p>
                                    <div className="flex gap-2 mt-1">
                                        <button onClick={() => updateQuantity(item._id, -1)} className="px-2 py-1 bg-gray-200 rounded">−</button>
                                        <button onClick={() => updateQuantity(item._id, 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item._id)} className="text-red-500 text-sm">Remove</button>
                            </div>
                        ))}
                        <div className="text-right font-bold text-lg">Total: KES {totalAmount}</div>
                        <div className="text-right mt-2">
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow">
                        <h2 className="text-xl font-bold mb-4">Payment</h2>
                        <label className="block font-medium mb-1">Payment Method:</label>
                        <select
                            className="w-full border p-2 mb-4"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="cash">Cash</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="card">Card</option>
                        </select>

                        {paymentMethod === 'mpesa' && (
                            <div className="mb-4">
                                <label className="block font-medium mb-1">Phone Number:</label>
                                <input
                                    type="tel"
                                    className="w-full border p-2"
                                    placeholder="07XXXXXXXX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowModal(false)} className="text-gray-600">Cancel</button>
                            <button
                                onClick={handleConfirmPayment}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt (Hidden for printing) */}
            <div id="receipt" className="hidden">
                <h2>Receipt</h2>
                <ul>
                    {cart.map((item) => (
                        <li key={item._id}>
                            {item.name} x{item.quantity} = {item.price * item.quantity}
                        </li>
                    ))}
                </ul>
                <p>Total: KES {totalAmount}</p>
                <p>Payment: {paymentMethod.toUpperCase()}</p>
                {paymentMethod === 'mpesa' && <p>Phone: {phoneNumber}</p>}
            </div>

            <ToastContainer />
        </div>
    );
};

export default POSPage;
