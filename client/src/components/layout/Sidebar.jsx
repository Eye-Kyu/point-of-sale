// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const linkClasses = ({ isActive }) =>
        `block p-3 rounded ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`;

    return (
        <aside className="w-64 bg-white border-r p-4">
            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
            <nav className="space-y-2">
                <NavLink to="/admin" end className={linkClasses}>Dashboard</NavLink>
                <NavLink to="/admin/sales" className={linkClasses}>Sales</NavLink>
                <NavLink to="/admin/products" className={linkClasses}>Products</NavLink>
                <NavLink to="/admin/users" className={linkClasses}>Users</NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
