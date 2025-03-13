import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/questionnaire');
        } catch (err) {
            alert(`Login failed: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-blue-800 mb-10">Welcome to DyslexiAid</h1>
                    <p className="text-gray-600 text-sm">Please log in to your account</p>
                </div>
                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                        />
                    </div>
                    <div className="flex flex-col space-y-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
                        >
                            Don't have an account? Signup!
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-500">Forgot your password? <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate('/forgot-password')}>Reset here</span></p>
            </div>
        </div>
    );
};

export default Login;
