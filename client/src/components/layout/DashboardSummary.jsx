import { useEffect, useState } from 'react';
import axios from 'axios';
import SalesChart from '../dashboard/SalesChart';

export default function DashboardSummary() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/dashboard/summary')
            .then(res => {
                setSummary(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch dashboard summary", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading summary...</p>;
    if (!summary) return <p>Failed to load summary.</p>;

    const todaySales = typeof summary.todaySales === 'number' ? summary.todaySales.toFixed(2) : '0.00';
    const weekSales = typeof summary.weekSales === 'number' ? summary.weekSales.toFixed(2) : '0.00';
    const totalStock = typeof summary.totalStock === 'number' ? summary.totalStock : 'N/A';
    const bestSeller = summary.bestSeller || 'N/A';

    return (
        <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard title="Today's Sales" value={`KES ${todaySales}`} />
                <SummaryCard title="This Week" value={`KES ${weekSales}`} />
                <SummaryCard title="Stock Left" value={`${totalStock} units`} />
                <SummaryCard title="Top Product" value={bestSeller} />
            </div>

            {/* Sales chart */}
            <SalesChart data={summary.chartData || []} />

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
