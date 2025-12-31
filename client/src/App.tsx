import { useState } from 'react';
import MainMenu from './components/MainMenu';
import DeckCreation from './components/DeckCreation';
import GameController from './components/GameController';
import ParticleBackground from './components/ParticleBackground';

export type GameState = 'MENU' | 'CREATE_DECK' | 'PLAYING';

function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentDeck, setCurrentDeck] = useState<string[]>([]);
  const [deckTopic, setDeckTopic] = useState<string>('');
  const [gameDuration, setGameDuration] = useState<number>(60);

  const startGame = (words: string[], topic: string) => {
    setCurrentDeck(words);
    setDeckTopic(topic);
    setGameState('PLAYING');
  };

  return (
    <div className="w-screen h-screen bg-neutral-900 text-white select-none relative overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 w-full h-full">
        {gameState === 'MENU' && (
          <MainMenu
            onStart={(words, topic) => {
              if (words && topic) {
                startGame(words, topic);
              } else {
                setGameState('CREATE_DECK');
              }
            }}
            gameDuration={gameDuration}
            setGameDuration={setGameDuration}
          />
        )}
        {gameState === 'CREATE_DECK' && (
          <DeckCreation
            onBack={() => setGameState('MENU')}
            onGameStart={startGame}
          />
        )}
        {gameState === 'PLAYING' && (
          <GameController
            words={currentDeck}
            topic={deckTopic}
            onExit={() => setGameState('MENU')}
            initialTime={gameDuration}
          />
        )}
      </div>
    </div>
  );
}

export default App;
