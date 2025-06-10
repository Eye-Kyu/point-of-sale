import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';

const AdminDashboard = () => {
    const [totalSales, setTotalSales] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [recentSales, setRecentSales] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all sales
                const res = await api.get('/sales');
                const sales = res.data;

                setTotalSales(sales.length);

                // Calculate total revenue
                const revenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
                setTotalRevenue(revenue);

                // Get last 5 sales
                setRecentSales(sales.slice(-5).reverse());
            } catch (error) {
                toast.error('Failed to load dashboard data');
                console.error(error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="p-6 bg-yellow-200">

            <h1 className="text-3xl font-bold text-blue-400 mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-200 p-4 rounded shadow">
                    <h2 className="text-xl font-semibold">Total Sales</h2>
                    <p className="text-2xl">{totalSales}</p>
                </div>

                <div className="bg-green-200 p-4 rounded shadow">
                    <h2 className="text-xl font-semibold">Total Revenue</h2>
                    <p className="text-2xl">KES {totalRevenue}</p>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">Sale ID</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Total Amount</th>
                            <th className="border p-2">Cashier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentSales.map((sale) => (
                            <tr key={sale._id}>
                                <td className="border p-2">{sale._id.slice(-6)}</td>
                                <td className="border p-2">{new Date(sale.createdAt).toLocaleString()}</td>
                                <td className="border p-2">KES {sale.totalAmount}</td>
                                <td className="border p-2">{sale.cashier?.name || 'Unknown'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ToastContainer />
        </div>
    );
};

export default AdminDashboard;
