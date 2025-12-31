import { useState } from 'react';
import MainMenu from './components/MainMenu';
import DeckCreation from './components/DeckCreation';
import GameController from './components/GameController';
import ParticleBackground from './components/ParticleBackground';

export type GameState = 'MENU' | 'CREATE_DECK' | 'PLAYING';

export interface Team {
  id: 1 | 2;
  name: string;
  score: number;
  color: string;
  bgColor: string;
}

function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentDeck, setCurrentDeck] = useState<string[]>([]);
  const [deckTopic, setDeckTopic] = useState<string>('');
  const [gameDuration, setGameDuration] = useState<number>(60);
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  // Team State
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Equipo 1', score: 0, color: 'text-cyan-400', bgColor: 'bg-cyan-500' },
    { id: 2, name: 'Equipo 2', score: 0, color: 'text-red-400', bgColor: 'bg-red-500' }
  ]);
  const [currentTeamTurn, setCurrentTeamTurn] = useState<1 | 2>(1);

  const startGame = (words: string[], topic: string) => {
    setCurrentDeck(words);
    setDeckTopic(topic);
    setGameState('PLAYING');
  };

  const handleGameEnd = (score: number) => {
    // Update score for current team
    setTeams(prev => prev.map(t =>
      t.id === currentTeamTurn ? { ...t, score: t.score + score } : t
    ));

    // Switch turn
    setCurrentTeamTurn(prev => prev === 1 ? 2 : 1);
    setGameState('MENU');
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
            playerNames={playerNames}
            setPlayerNames={setPlayerNames}
            teams={teams}
            currentTeamTurn={currentTeamTurn}
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
            onGameEnd={handleGameEnd}
            initialTime={gameDuration}
            playerNames={playerNames}
            currentTeam={teams.find(t => t.id === currentTeamTurn)!}
          />
        )}
      </div>
    </div>
  );
}

export default App;
