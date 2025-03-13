import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/signup', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/questionnaire');
        } catch (err) {
            alert(`Signup failed: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="w-full max-w-md mx-4 bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-blue-800 mb-6">Welcome to DyslexiAid</h1>
                    <p className="text-gray-600">Create an account to continue</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex flex-col space-y-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-white text-gray-700 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Have an account already? Login.
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
