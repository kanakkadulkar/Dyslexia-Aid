import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/user/data', {
          headers: { 'x-auth-token': token }
        });
        setUserData(response.data);
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Assessment History */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Assessment History</h2>
          {userData?.testHistory?.length > 0 ? (
            <div className="space-y-4">
              {userData.testHistory.map((assessment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Assessment Date: {new Date(assessment.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        Overall Probability: {Math.round(assessment.overallProbability * 100)}%
                      </p>
                    </div>
                    <PDFDownloadLink
                      document={<ReportPDF assessment={assessment} />}
                      fileName={`dyslexia-report-${new Date(assessment.date).toISOString().split('T')[0]}.pdf`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      {({ loading }) => loading ? 'Generating PDF...' : 'Download Report'}
                    </PDFDownloadLink>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No assessment history available</p>
          )}
        </div>

        {/* Training Games */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Training Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData?.gameProgress && Object.entries(userData.gameProgress).map(([game, progress]) => (
              <div key={game} className="border rounded-lg p-4">
                <h3 className="font-medium capitalize mb-2">{game.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <p className="text-gray-600 mb-4">
                  High Score: {progress.highScore || 0}
                </p>
                <button
                  onClick={() => navigate(`/games/${game.toLowerCase()}`)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full"
                >
                  Play Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;