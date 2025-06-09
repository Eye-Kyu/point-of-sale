// src/pages/SalesTest.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

const SalesTest = () => {
    const [sales, setSales] = useState([]);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await api.get('/sales');
                setSales(res.data);
                toast.success('Sales fetched successfully');
            } catch (error) {
                console.error('Error fetching sales:', error);
                toast.error('Failed to fetch sales');
            }
        };

        fetchSales();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Sales Records</h2>
            {sales.length === 0 ? (
                <p>No sales found.</p>
            ) : (
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Total Amount</th>
                            <th className="border p-2">Payment Method</th>
                            <th className="border p-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale._id}>
                                <td className="border p-2">{sale._id}</td>
                                <td className="border p-2">{sale.totalAmount}</td>
                                <td className="border p-2">{sale.paymentMethod}</td>
                                <td className="border p-2">
                                    {new Date(sale.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SalesTest;
