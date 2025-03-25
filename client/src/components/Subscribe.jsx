import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Subscribe = () => {
    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const plans = {
        monthly: {
            name: 'Monthly Plan',
            price: '$29.99',
            features: [
                'Full Assessment Report',
                'Personalized Recommendations',
                'Progress Tracking',
                'Expert Consultation'
            ]
        },
        yearly: {
            name: 'Yearly Plan',
            price: '$299.99',
            features: [
                'All Monthly Features',
                '2 Months Free',
                'Priority Support',
                'Additional Resources'
            ]
        }
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/analysis/subscribe', 
                { plan: selectedPlan },
                { headers: { 'x-auth-token': token } }
            );
            navigate('/dashboard');
        } catch (err) {
            alert('Subscription failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                    Choose Your Plan
                </h2>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {Object.entries(plans).map(([key, plan]) => (
                        <div 
                            key={key}
                            className={`bg-white rounded-lg shadow-xl p-8 border-2 
                                ${selectedPlan === key ? 'border-blue-500' : 'border-transparent'}`}
                            onClick={() => setSelectedPlan(key)}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                            <p className="text-4xl font-bold text-blue-600 mb-6">{plan.price}</p>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold text-white
                                    ${selectedPlan === key ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}
                                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : 'Select Plan'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Subscribe;