import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Questionnaire from './components/Questionnaire';
import VideoRecording from './components/VideoRecording';
import HandwritingUpload from './components/HandwritingUpload';
import Dashboard from './components/Dashboard';
import Subscribe from './components/Subscribe';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import WordScramble from './components/games/WordScramble';
import MemoryMatch from './components/games/MemoryMatch';
import SpeedReading from './components/games/SpeedReading';
import PhonemeBlending from './components/games/PhonemeBlending';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/questionnaire" element={
              <ProtectedRoute>
                <Navigation />
                <Questionnaire />
              </ProtectedRoute>
            } />
            <Route path="/video-recording" element={
              <ProtectedRoute>
                <Navigation />
                <VideoRecording />
              </ProtectedRoute>
            } />
            <Route path="/handwriting" element={
              <ProtectedRoute>
                <Navigation />
                <HandwritingUpload />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigation />
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/subscribe" element={
              <ProtectedRoute>
                <Navigation />
                <Subscribe />
              </ProtectedRoute>
            } />
            <Route path="/games/word-scramble" element={
              <ProtectedRoute>
                <Navigation />
                <WordScramble />
              </ProtectedRoute>
            } />
            <Route path="/games/memory-match" element={
              <ProtectedRoute>
                <Navigation />
                <MemoryMatch />
              </ProtectedRoute>
            } />
            <Route path="/games/speed-reading" element={
              <ProtectedRoute>
                <Navigation />
                <SpeedReading />
              </ProtectedRoute>
            } />
            <Route path="/games/phoneme-blending" element={
              <ProtectedRoute>
                <Navigation />
                <PhonemeBlending />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;