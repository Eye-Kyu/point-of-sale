import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';

const UsersPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users'); // Endpoint must exist in backend
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

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Users</h2>
            <table className="w-full border">
                <thead>
                    <tr>
                        <th className="border p-2">Username</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="border p-2">{user.username}</td>
                            <td className="border p-2">{user.email}</td>
                            <td className="border p-2">{user.role}</td>
                            <td className="border p-2">
                                <button
                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                    onClick={() => handleDelete(user._id)}
                                    disabled={user.role === 'admin'} // prevent deleting admins
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
