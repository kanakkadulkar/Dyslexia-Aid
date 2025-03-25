import React, { useState, useEffect } from 'react';

const MemoryMatch = () => {
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const cardImages = [
    '🎨', '📚', '🎵', '🎮', '🎪', '🎭', '🎨', '📚', 
    '🎵', '🎮', '🎪', '🎭'
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = cardImages
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, content: emoji, isFlipped: false }));
    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setScore(0);
  };

  const handleClick = (id) => {
    if (disabled) return;
    if (flipped.length === 0) {
      setFlipped([id]);
    } else if (flipped.length === 1) {
      setDisabled(true);
      if (flipped[0] !== id) {
        setFlipped([flipped[0], id]);
        checkMatch([flipped[0], id]);
      } else {
        setFlipped([]);
        setDisabled(false);
      }
    }
  };

  const checkMatch = (selectedCards) => {
    setTimeout(() => {
      const [first, second] = selectedCards;
      if (cards[first].content === cards[second].content) {
        setSolved([...solved, first, second]);
        setScore(score + 1);
      }
      setFlipped([]);
      setDisabled(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Memory Match</h1>
          <p className="text-lg mb-2">Score: {score}</p>
          <button
            onClick={initializeGame}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            New Game
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleClick(card.id)}
              className={`
                aspect-square flex items-center justify-center text-4xl
                rounded-xl cursor-pointer transition-all duration-300
                ${flipped.includes(card.id) || solved.includes(card.id)
                  ? 'bg-white'
                  : 'bg-blue-500'
                }
              `}
            >
              {(flipped.includes(card.id) || solved.includes(card.id)) && card.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryMatch; 