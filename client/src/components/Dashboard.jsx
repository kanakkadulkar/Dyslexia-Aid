import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/analysis/dashboard', {
                headers: { 'x-auth-token': token },
            });
            setData(res.data);
        };
        fetchData();
    }, []);

    const downloadReport = (report) => {
        const blob = new Blob([report], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'dyslexia-report.txt';
        link.click();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
            {data && data.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <p className="text-lg mb-4">
                        Dyslexia Probability: 
                        <span className={`font-semibold ${item.isDyslexic ? 'text-red-600' : 'text-green-600'}`}>
                            {item.isDyslexic ? 'Yes' : 'No'}
                        </span>
                    </p>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-700">Eye Features:</h3>
                            <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto">{JSON.stringify(item.eyeFeatures, null, 2)}</pre>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-700">Speech Features:</h3>
                            <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto">{JSON.stringify(item.speechFeatures, null, 2)}</pre>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-700">Handwriting Features:</h3>
                            <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto">{JSON.stringify(item.handwritingFeatures, null, 2)}</pre>
                        </div>
                        <div className="flex space-x-4 mt-4">
                            <button 
                                onClick={() => downloadReport(item.report)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Download Report
                            </button>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                                Enroll in Training
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Dashboard;