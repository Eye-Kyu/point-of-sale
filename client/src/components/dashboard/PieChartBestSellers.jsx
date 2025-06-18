import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0'];

export default function PieChartBestsellers({ data }) {
    if (!data?.length) return <p className="text-gray-500">No bestseller data.</p>;

    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">Top 5 Bestsellers</h2>
            <PieChart width={400} height={250}>
                <Pie
                    data={data}
                    dataKey="qty"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
}
