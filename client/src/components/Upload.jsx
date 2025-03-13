import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [video, setVideo] = useState(null);
  const [handwriting, setHandwriting] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('video', video);
    formData.append('handwriting', handwriting);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/analysis/upload', formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <h1>Upload Samples</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Video (for eye and speech analysis):</label>
          <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} required />
        </div>
        <div>
          <label>Handwriting Sample:</label>
          <input type="file" accept="image/*" onChange={(e) => setHandwriting(e.target.files[0])} required />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Upload;