import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HandwritingUpload = () => {
  const [handwriting, setHandwriting] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sampleText = `Please write the following text on a paper:
    "The rainbow appeared after the storm, 
    bringing hope and joy to everyone who saw it."`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handwriting) {
      alert('Please select a handwriting image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('handwriting', handwriting);

    try {
      const token = localStorage.getItem('token');
      const result = await axios.post('/api/analysis/complete-assessment', formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' },
      });

      if (result.data.requiresSubscription) {
        const subscribe = window.confirm(
          `Your analysis shows a ${Math.round(result.data.probability * 100)}% 
           probability of dyslexia. Would you like to subscribe to view the full report?`
        );
        if (subscribe) {
          navigate('/subscribe');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-400 px-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Handwriting Sample</h1>
        
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <p className="text-gray-700 whitespace-pre-line">{sampleText}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-700">
              Upload your handwriting:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHandwriting(e.target.files[0])}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold 
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
                      transition duration-300`}
          >
            {loading ? 'Processing...' : 'Submit and Analyze'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HandwritingUpload; 