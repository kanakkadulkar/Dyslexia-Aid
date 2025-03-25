import React, { useState, useEffect } from 'react';

const PhonemeBlending = () => {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [phonemes, setPhonemes] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');

  const words = [
    { word: 'cat', phonemes: ['k', 'æ', 't'] },
    { word: 'dog', phonemes: ['d', 'ɒ', 'g'] },
    { word: 'fish', phonemes: ['f', 'ɪ', 'ʃ'] },
    { word: 'bird', phonemes: ['b', 'ɜː', 'd'] },
    // Add more words with their phonemes
  ];

  const newWord = () => {
    const wordObj = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(wordObj.word);
    setPhonemes(wordObj.phonemes);
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
        <h1 className="text-3xl font-bold text-center mb-8">Phoneme Blending</h1>
        
        <div className="text-center mb-8">
          <p className="text-lg mb-2">Score: {score}</p>
          <p className="text-2xl font-bold mb-4">
            Blend these sounds: {phonemes.join(' - ')}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What word do these sounds make?"
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

export default PhonemeBlending; 