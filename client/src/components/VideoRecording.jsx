import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VideoRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      // Get video stream
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Get audio stream separately
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set video stream to video element
      videoRef.current.srcObject = videoStream;

      // Create MediaRecorder for video
      const videoRecorder = new MediaRecorder(videoStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      mediaRecorderRef.current = videoRecorder;

      // Create MediaRecorder for audio
      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm'
      });
      audioRecorderRef.current = audioRecorder;

      const videoChunks = [];
      const audioChunks = [];

      videoRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunks.push(e.data);
        }
      };

      audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      videoRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        setRecordedBlob(videoBlob);
      };

      audioRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setRecordedBlob(prev => ({
          video: prev,
          audio: audioBlob
        }));
      };

      // Start countdown
      setCountdown(3);
      let count = 3;
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(countdownInterval);
          videoRecorder.start();
          audioRecorder.start();
          setIsRecording(true);
        }
      }, 1000);

    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Error accessing camera or microphone. Please ensure you have granted the necessary permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && audioRecorderRef.current) {
      mediaRecorderRef.current.stop();
      audioRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!recordedBlob?.video || !recordedBlob?.audio) {
      alert('Please record both video and audio first');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('video', recordedBlob.video, 'video.webm');
      formData.append('audio', recordedBlob.audio, 'audio.webm');
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/analysis/save-video', formData, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        }
      });
      
      if (response.data.success) {
        navigate('/handwriting');
      } else {
        throw new Error(response.data.msg || 'Failed to save video');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Failed to save video: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Video Recording</h2>
          <p className="mt-2 text-gray-600">
            Please read the following text clearly while looking at the camera:
          </p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <p className="text-lg font-medium text-gray-800">
              "The quick brown fox jumps over the lazy dog. This simple sentence contains every letter of the English alphabet at least once."
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="aspect-w-16 aspect-h-9 mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="flex justify-center space-x-4">
            {!isRecording && !recordedBlob && (
              <button
                onClick={startRecording}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {countdown > 0 ? `Starting in ${countdown}...` : 'Start Recording'}
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Stop Recording
              </button>
            )}

            {recordedBlob && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-8 py-3 rounded-lg font-semibold transition-colors`}
              >
                {loading ? 'Uploading...' : 'Continue to Handwriting'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecording; 