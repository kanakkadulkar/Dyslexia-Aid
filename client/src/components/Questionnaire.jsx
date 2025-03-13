import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Questionnaire = () => {
    const [responses, setResponses] = useState({
        q1: '',
        q2: '',
        q3: '',
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/analysis/questionnaire', { responses }, {
                headers: { 'x-auth-token': token },
            });
            navigate('/upload');
        } catch (err) {
            alert('Submission failed: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Medical Questionnaire</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Do you have trouble reading? (Yes/No)
                        </label>
                        <input
                            type="text"
                            value={responses.q1}
                            onChange={(e) => setResponses({ ...responses, q1: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Do you confuse similar-looking letters? (Yes/No)
                        </label>
                        <input
                            type="text"
                            value={responses.q2}
                            onChange={(e) => setResponses({ ...responses, q2: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Do you struggle with spelling? (Yes/No)
                        </label>
                        <input
                            type="text"
                            value={responses.q3}
                            onChange={(e) => setResponses({ ...responses, q3: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Questionnaire;