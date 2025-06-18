import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'cashier',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/users/${userId}`);
            setUsers(users.filter((u) => u._id !== userId));
        } catch (err) {
            console.error('Failed to delete user', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData); // Protected route
            fetchUsers(); // refresh list
            setFormData({ name: '', username: '', password: '', role: 'cashier' });
            alert('User created successfully');
        } catch (err) {
            console.error('Failed to create user', err);
            alert(err.response?.data?.msg || 'Failed to create user');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Users</h2>

            {/* Create user form */}
            <form onSubmit={handleCreateUser} className="mb-6 space-y-4 border p-4 rounded shadow">
                <h3 className="text-xl font-semibold">Create New User</h3>
                <div>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="border p-2 w-full"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="border p-2 w-full"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="border p-2 w-full"
                    />
                </div>
                <div>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="border p-2 w-full"
                    >
                        <option value="cashier">Cashier</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Create User
                </button>
            </form>

            {/* Users table */}
            <table className="w-full border">
                <thead>
                    <tr>
                        <th className="border p-2">Username</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="border p-2">{user.username}</td>
                            <td className="border p-2">{user.name}</td>
                            <td className="border p-2">{user.role}</td>
                            <td className="border p-2">
                                <button
                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                    onClick={() => handleDelete(user._id)}
                                    disabled={user.role === 'admin'}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersPage;
