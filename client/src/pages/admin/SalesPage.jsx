import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance'; // your axios instance with interceptors

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await api.get('/sales');
                setSales(res.data);
            } catch (err) {
                setError('Failed to load sales');
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, []);

    if (loading) return <p>Loading sales...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Sales Records</h2>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">Sale ID</th>
                        <th className="border border-gray-300 p-2">Date</th>
                        <th className="border border-gray-300 p-2">Total Amount</th>
                        <th className="border border-gray-300 p-2">Customer</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale._id}>
                            <td className="border border-gray-300 p-2">{sale._id}</td>
                            <td className="border border-gray-300 p-2">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="border border-gray-300 p-2">KES {sale.total}</td>
                            <td className="border border-gray-300 p-2">{sale.customerName || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SalesPage;
