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
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard title="Today's Sales" value={`KES ${todaySales}`} />
                <SummaryCard title="This Week" value={`KES ${weekSales}`} />
                <SummaryCard title="Stock Left" value={`${totalStock} units`} />
                <SummaryCard title="Top Product" value={bestSeller} />
            </div>

            {/* Sales Chart */}
            <SalesChart data={summary.chartData || []} />
        </>
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
