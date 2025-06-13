import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EF4'];

export default function DashboardCharts() {
    const [topProducts, setTopProducts] = useState([]);
    const [stockLevels, setStockLevels] = useState([]);

    useEffect(() => {
        axios.get('/api/dashboard/summary')
            .then(res => {
                setTopProducts(res.data.topProducts || []);
                setStockLevels(res.data.stockLevels || []);
            })
            .catch(err => {
                console.error("Failed to fetch chart data", err);
            });
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Pie Chart */}
            <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-2">Top 5 Bestsellers</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={topProducts}
                            dataKey="qty"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                        >
                            {topProducts.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-2">Stock Levels</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stockLevels}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="stock" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
