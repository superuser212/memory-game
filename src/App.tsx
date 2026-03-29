import { useState, useEffect } from 'react';

// ---------------------------------------------------------
// Game Configuration
// ---------------------------------------------------------
const IMAGE_URLS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Potion',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Sword',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Shield',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Chest',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Key',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Map',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Coin'
];

interface CardData {
  id: number;
  content: string; 
  isMatched: boolean;
}

// ---------------------------------------------------------
// Audio System
// ---------------------------------------------------------
const playSound = (type: 'flip' | 'match' | 'win') => {
  const soundUrls = {
    flip: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    match: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    win: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'
  };
  
  const audio = new Audio(soundUrls[type]);
  audio.volume = 0.4;
  // Browsers block audio until the user clicks something, so we catch potential errors
  audio.play().catch(() => console.log('Audio playback prevented by browser')); 
};

export default function App() {
  // ---------------------------------------------------------
  // Game State
  // ---------------------------------------------------------
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [disabled, setDisabled] = useState(false);

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // High Score State
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);

  // ---------------------------------------------------------
  // Game Logic
  // ---------------------------------------------------------
  
  // 1. Load best scores from the browser's memory on first load
  useEffect(() => {
    const storedMoves = localStorage.getItem('memoryBestMoves');
    const storedTime = localStorage.getItem('memoryBestTime');
    if (storedMoves) setBestMoves(parseInt(storedMoves, 10));
    if (storedTime) setBestTime(parseInt(storedTime, 10));
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...IMAGE_URLS, ...IMAGE_URLS]
      .sort(() => Math.random() - 0.5)
      .map((url, index) => ({
        id: index,
        content: url,
        isMatched: false,
      }));

    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setDisabled(false);
    setTimeElapsed(0);
    setIsActive(true); 
  };

  // Start on load
  useEffect(() => {
    initializeGame();
  }, []);

  // Timer loop
  useEffect(() => {
    let timer: number;
    if (isActive && matches < IMAGE_URLS.length) {
      timer = window.setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [isActive, matches]);

  // Handle Win Condition & Save Best Scores
  const isGameWon = matches === IMAGE_URLS.length;
  
  useEffect(() => {
    if (isGameWon && matches > 0) { // Ensure it doesn't trigger on initial empty state
      playSound('win');
      setIsActive(false); // Stop the clock

      // Checking if they beat their move record?
      if (bestMoves === null || moves < bestMoves) {
        setBestMoves(moves);
        localStorage.setItem('memoryBestMoves', moves.toString());
      }
      // Checking if they beat their time record?
      if (bestTime === null || timeElapsed < bestTime) {
        setBestTime(timeElapsed);
        localStorage.setItem('memoryBestTime', timeElapsed.toString());
      }
    }
  }, [isGameWon, matches, moves, timeElapsed, bestMoves, bestTime]);

  const handleCardClick = (index: number) => {
    if (disabled || flippedIndices.length >= 2 || flippedIndices.includes(index) || cards[index].isMatched) {
      return;
    }

    playSound('flip');
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setDisabled(true);
      setMoves((prev) => prev + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;

      if (cards[firstIndex].content === cards[secondIndex].content) {
        // Match!
        setTimeout(() => playSound('match'), 200); // Slight delay sounds better
        setCards((prevCards) =>
          prevCards.map((card, i) =>
            i === firstIndex || i === secondIndex ? { ...card, isMatched: true } : card
          )
        );
        setMatches((prev) => prev + 1);
        setFlippedIndices([]);
        setDisabled(false);
      } else {
        // No Match!
        setTimeout(() => {
          setFlippedIndices([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  // ---------------------------------------------------------
  // UI Rendering & Inline Styles
  // ---------------------------------------------------------
  // Wrapped in a dark-mode, full-screen container
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1e1e2e', // Cozy dark background
      color: '#cdd6f4', // Soft text color
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#f5e0dc', marginTop: 0 }}>Pixel Memory</h1>
        
        {/* High Score Board */}
        <div style={{ 
          backgroundColor: '#313244', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex', 
          justifyContent: 'space-around',
          fontSize: '14px',
          color: '#a6e3a1' // Soft green
        }}>
          <span>Best Moves: {bestMoves === null ? '--' : bestMoves}</span>
          <span>Best Time: {bestTime === null ? '--' : `${bestTime}s`}</span>
        </div>

        {/* Current Game Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px' }}>
          <span>Moves: <strong>{moves}</strong></span>
          <span>Time: <strong>{timeElapsed}s</strong></span>
          <span>Matches: <strong>{matches} / 8</strong></span>
        </div>

        {/* The Game Board */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '12px',
          marginBottom: '30px'
        }}>
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index) || card.isMatched;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                style={{
                  aspectRatio: '1 / 1',
                  backgroundColor: isFlipped ? '#45475a' : '#313244',
                  border: isFlipped ? '2px solid #a6e3a1' : '2px solid #585b70',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isFlipped ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}
              >
                {/* Render the custom image if flipped, otherwise show the question mark */}
                {isFlipped ? (
                  <img 
                    src={card.content} 
                    alt="Card image" 
                    style={{ width: '70%', height: '70%', objectFit: 'contain' }} 
                  />
                ) : (
                  <span style={{ fontSize: '32px', opacity: 0.5 }}>❓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Win State & Controls */}
        {isGameWon && (
          <div style={{ marginBottom: '25px', color: '#a6e3a1', fontSize: '20px' }}>
            <h2>🎉 Area Cleared! 🎉</h2>
          </div>
        )}

        <button 
          onClick={initializeGame}
          style={{
            padding: '14px 28px',
            fontSize: '16px',
            backgroundColor: '#89b4fa', // Soft blue
            color: '#1e1e2e',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}
        >
          {isGameWon ? 'Play Again' : 'Restart Game'}
        </button>
      </div>
    </div>
  );
}