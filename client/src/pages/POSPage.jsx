import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axiosInstance';

const POSPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data);
            } catch (err) {
                toast.error('Failed to load products');
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) setCart(JSON.parse(storedCart));
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const handleAddToCart = (product) => {
        const existing = cart.find((item) => item.product._id === product._id);
        if (existing) {
            const updated = cart.map((item) =>
                item.product._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            setCart(updated);
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
        toast.success(`${product.name} added to cart`);
    };

    const handleQuantityChange = (productId, delta) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.product._id === productId
                        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

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
                items: cart.map(({ product, quantity }) => ({
                    product: product._id,
                    quantity
                })),
                totalAmount: cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
                paymentMethod,
            };

            await api.post('/sales', sale); // auth handled in axiosInstance

            toast.success('Sale completed successfully');
            handlePrintReceipt();
            setCart([]);
            setShowModal(false);
        } catch (err) {
            toast.error('Failed to complete sale');
            console.error(err);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">POS Page</h1>

            {/* 🛍️ Product List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {products.map((product) => (
                    <button
                        key={product._id}
                        className="bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700"
                        onClick={() => handleAddToCart(product)}
                    >
                        {product.name} - KES {product.price}
                    </button>
                ))}
            </div>

            {/* 🛒 Cart Table */}
            <table className="w-full border mb-6">
                <thead>
                    <tr>
                        <th className="border p-2">Item</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map(({ product, quantity }) => (
                        <tr key={product._id}>
                            <td className="border p-2">{product.name}</td>
                            <td className="border p-2">{product.price}</td>
                            <td className="border p-2 flex justify-center items-center gap-2">
                                <button onClick={() => handleQuantityChange(product._id, -1)}>-</button>
                                {quantity}
                                <button onClick={() => handleQuantityChange(product._id, 1)}>+</button>
                            </td>
                            <td className="border p-2">{product.price * quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 🧾 Total & Checkout */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">
                    Total: KES {cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)}
                </p>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={cart.length === 0}
                >
                    Checkout
                </button>
            </div>

            {/* 💳 Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Payment</h2>

                        <label className="block mb-2 font-medium">Payment Method:</label>
                        <select
                            className="w-full border px-3 py-2 mb-4"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="cash">Cash</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="card">Card</option>
                        </select>

                        {paymentMethod === 'mpesa' && (
                            <div className="mb-4">
                                <label className="block mb-1 font-medium">Customer Phone:</label>
                                <input
                                    type="tel"
                                    className="w-full border px-3 py-2"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="07XXXXXXXX"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowModal(false)} className="text-gray-600">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🧾 Hidden Receipt */}
            <div id="receipt" className="hidden">
                <h2>Receipt</h2>
                <ul>
                    {cart.map(({ product, quantity }) => (
                        <li key={product._id}>
                            {product.name} x{quantity} = {product.price * quantity}
                        </li>
                    ))}
                </ul>
                <p>
                    Total: KES {cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)}
                </p>
                <p>Payment: {paymentMethod.toUpperCase()}</p>
                {paymentMethod === 'mpesa' && <p>Phone: {phoneNumber}</p>}
            </div>

            <ToastContainer />
        </div>
    );
};

export default POSPage;
