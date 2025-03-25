import React, { useState, useEffect } from 'react';

const WordScramble = () => {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');

  const words = [
    'dyslexia', 'reading', 'writing', 'learning', 'practice',
    'focus', 'improve', 'success', 'progress', 'achieve'
  ];

  const scrambleWord = (word) => {
    return word
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  };

  const newWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
    setUserInput('');
    setMessage('');
  };

  useEffect(() => {
    newWord();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.toLowerCase() === currentWord) {
      setScore(score + 1);
      setMessage('Correct! 🎉');
      setTimeout(newWord, 1500);
    } else {
      setMessage('Try again!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Word Scramble</h1>
        
        <div className="text-center mb-8">
          <p className="text-lg mb-2">Score: {score}</p>
          <p className="text-2xl font-bold mb-4">
            Unscramble: <span className="text-blue-600">{scrambledWord}</span>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your answer"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
          
          {message && (
            <p className={`mt-4 text-lg ${message.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordScramble; 