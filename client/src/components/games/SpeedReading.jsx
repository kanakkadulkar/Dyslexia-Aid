import React, { useState, useEffect } from 'react';

const SpeedReading = () => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [speed, setSpeed] = useState(300); // words per minute
  const [score, setScore] = useState(0);

  const texts = [
    "The quick brown fox jumps over the lazy dog. This simple sentence contains every letter in the English alphabet.",
    "Reading quickly while maintaining comprehension is a valuable skill. Practice helps improve both speed and understanding.",
    // Add more practice texts
  ];

  useEffect(() => {
    setText(texts[Math.floor(Math.random() * texts.length)]);
  }, []);

  const startReading = () => {
    setIsReading(true);
    setWordIndex(0);
    const words = text.split(' ');
    
    const interval = setInterval(() => {
      setWordIndex(prev => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          setIsReading(false);
          setScore(prev => prev + 1);
          return 0;
        }
        return prev + 1;
      });
    }, (60 / speed) * 1000);

    return () => clearInterval(interval);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Speed Reading</h1>
        
        <div className="text-center mb-8">
          <p className="text-lg mb-4">Score: {score}</p>
          <p className="text-lg mb-4">Speed: {speed} WPM</p>
          
          <div className="mb-8">
            <input
              type="range"
              min="100"
              max="500"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {isReading ? (
            <div className="text-4xl font-bold h-20 flex items-center justify-center">
              {text.split(' ')[wordIndex]}
            </div>
          ) : (
            <button
              onClick={startReading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Start Reading
            </button>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-bold mb-2">Full Text:</h2>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
};

export default SpeedReading; 