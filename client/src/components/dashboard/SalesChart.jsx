import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mt-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Weekly Sales</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
