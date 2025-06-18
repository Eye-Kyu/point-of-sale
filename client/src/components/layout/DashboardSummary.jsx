import { useEffect, useState } from 'react';
import axios from 'axios';
import SalesChart from '../dashboard/SalesChart';
import PieChartBestsellers from '../dashboard/PieChartBestsellers';
import BarChartStockLevels from '../dashboard/BarChartStockLevels';

export default function DashboardSummary() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('day'); // 'day', 'week', 'month'

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/dashboard/summary?range=${range}`)
            .then(res => {
                setSummary(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch dashboard summary", err);
                setLoading(false);
            });
    }, [range]);

    const exportCSV = () => {
        if (!summary?.chartData?.length) return;

        const headers = ['Date', 'Sales'];
        const rows = summary.chartData.map(item => [item.date, item.total.toFixed(2)]);
        const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `sales-${range}.csv`);
        link.click();
    };

    if (loading) return <p>Loading summary...</p>;
    if (!summary) return <p>Failed to load summary.</p>;

    const todaySales = typeof summary.todaySales === 'number' ? summary.todaySales.toFixed(2) : '0.00';
    const weekSales = typeof summary.weekSales === 'number' ? summary.weekSales.toFixed(2) : '0.00';
    const totalStock = typeof summary.totalStock === 'number' ? summary.totalStock : 'N/A';
    const bestSeller = summary.bestSeller || 'N/A';

    return (
        <div className="space-y-8">
            {/* 🔽 Filter + Export */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Dashboard Summary</h2>
                <div className="flex items-center space-x-2">
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="day">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    <button
                        onClick={exportCSV}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard title="Today's Sales" value={`KES ${todaySales}`} />
                <SummaryCard title="This Week" value={`KES ${weekSales}`} />
                <SummaryCard title="Stock Left" value={`${totalStock} units`} />
                <SummaryCard title="Top Product" value={bestSeller} />
            </div>

            {/* Sales Line Chart */}
            <SalesChart data={summary.chartData || []} />

            {/* Pie & Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PieChartBestsellers data={summary.topProducts || []} />
                <BarChartStockLevels data={summary.stockLevels || []} />
            </div>

            {/* Low stock alert section */}
            {summary.lowStockItems?.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">⚠️ Low Stock Alert</h3>
                    <ul className="list-disc list-inside text-sm">
                        {summary.lowStockItems.map(item => (
                            <li key={item._id}>{item.name} — {item.stock} units left</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ title, value }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{value}</h3>
        </div>
    );
}
