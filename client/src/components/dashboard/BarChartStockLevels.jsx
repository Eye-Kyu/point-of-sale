import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarChartStockLevels({ data }) {
    if (!data?.length) return <p className="text-gray-500">No stock data available.</p>;

    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">Product Stock Levels</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#00C49F" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
