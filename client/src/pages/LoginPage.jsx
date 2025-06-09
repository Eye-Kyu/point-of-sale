import { useState, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { setToken, setUser } = useContext(AuthContext);
    const [form, setForm] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await api.post('/auth/login', form); // ✅ using axiosInstance
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            res.data.user.role === 'admin' ? navigate('/admin') : navigate('/pos');
        } catch (err) {
            alert('Login failed');
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                placeholder="Username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
            />
            <input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default LoginPage;
