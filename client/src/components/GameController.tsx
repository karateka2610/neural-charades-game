import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, Smartphone, Check, X, User } from 'lucide-react';
import { useGyroscope } from '../hooks/useGyroscope';

interface Props {
    words: string[];
    topic: string;
    onExit: () => void;
    initialTime: number;
    playerNames: string[];
}

type GamePhase = 'PERMISSION' | 'INSTRUCTIONS' | 'PLAYING' | 'FINISHED';
type CardStatus = 'NEUTRAL' | 'CORRECT' | 'PASS';

interface GameResult {
    word: string;
    status: 'CORRECT' | 'PASS';
}

const GameController = ({ words, topic, onExit, initialTime, playerNames }: Props) => {
    const { orientation, permission, requestAccess } = useGyroscope();
    const [phase, setPhase] = useState<GamePhase>('PERMISSION');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [results, setResults] = useState<GameResult[]>([]);
    const [cardStatus, setCardStatus] = useState<CardStatus>('NEUTRAL');
    const [lastActionTime, setLastActionTime] = useState(0);

    // Determines current actor based on round index if names exist
    // Each game session is one turn? Or rotation happens within game?
    // Let's assume the game is for ONE actor. The actor is the one holding the phone.
    // If we want rotation, we need to know WHICH game number this is? 
    // Or simpler: We display WHO should hold the phone at the start?
    // Let's pick a random player or next in sequence?
    // For simplicity: Just pick a random player name to display as "Actor" if available.
    // OR: Assume user wants to say "Turno de X". 
    // Let's pick a random one for now to keep it stateless between matches unless we lift state.
    // Actually, simple standard: Pick random name at start.
    const [currentActor, setCurrentActor] = useState('');

    useEffect(() => {
        if (playerNames.length > 0) {
            const random = playerNames[Math.floor(Math.random() * playerNames.length)];
            setCurrentActor(random);
        }
    }, [playerNames]);

    // Initial permission check
    useEffect(() => {
        if (permission === 'granted') {
            setPhase('INSTRUCTIONS');
        }
    }, [permission]);

    // Handle Manual Permission Request
    const handlePermissionRequest = async () => {
        await requestAccess();
    };

    const [timeLeft, setTimeLeft] = useState(initialTime);

    // Sound Logic (Simple Beep)
    const playBeep = (freq = 440, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine') => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // Hz
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    };

    // Timer Logic
    useEffect(() => {
        if (phase !== 'PLAYING') return;
        if (timeLeft <= 0) {
            setPhase('FINISHED');
            playBeep(200, 'sawtooth'); // Finish sound
            return;
        }

        if (timeLeft <= 10) {
            playBeep(800 + (10 - timeLeft) * 100); // Pitch goes up
        }

        const timer = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    // Game Logic Loop (Gyro)
    useEffect(() => {
        if (phase !== 'PLAYING') return;
        if (cardStatus !== 'NEUTRAL') return; // Wait for animation reset

        const now = Date.now();
        if (now - lastActionTime < 1000) return; // Debounce

        const { gamma, beta } = orientation;

        if (gamma === null || beta === null) return;

        const absGamma = Math.abs(gamma);
        const absBeta = Math.abs(beta);

        // Lógica Robusta:
        if (absGamma < 40) {
            if (absBeta < 40) {
                handleAnswer('PASS'); // Mirando al techo
            } else if (absBeta > 140) {
                handleAnswer('CORRECT'); // Mirando al suelo
            }
        }
    }, [phase, orientation, cardStatus, lastActionTime]);


    const handleAnswer = useCallback((status: 'CORRECT' | 'PASS') => {
        setCardStatus(status);
        if (status === 'CORRECT') setScore(s => s + 1);

        // Save Result
        setResults(prev => [...prev, { word: words[currentIndex], status }]);

        // Delay for animation then next card
        setTimeout(() => {
            if (currentIndex < words.length - 1) {
                setCurrentIndex(i => i + 1);
                setCardStatus('NEUTRAL');
                setLastActionTime(Date.now());
            } else {
                setPhase('FINISHED');
            }
        }, 800);
    }, [currentIndex, words]); // Removed words.length dep, added words dep for safety

    // Background Color Logic
    const getBackgroundColor = () => {
        if (cardStatus === 'CORRECT') return 'bg-green-600';
        if (cardStatus === 'PASS') return 'bg-red-600';
        return 'bg-blue-600';
    };

    // Dynamic Font Sizing
    const getFontSize = (word: string) => {
        if (word.length > 12) return 'text-5xl md:text-6xl';
        if (word.length > 8) return 'text-6xl md:text-7xl';
        return 'text-7xl md:text-8xl';
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        }
    };

    return (
        <div className={`w-full h-full transition-colors duration-300 ${getBackgroundColor()} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>

            {/* PERMISSION SCREEN */}
            {phase === 'PERMISSION' && (
                <div className="text-center z-10 max-w-sm">
                    <Smartphone size={64} className="mx-auto mb-6 text-white" />
                    <h2 className="text-2xl font-bold mb-4 font-game">HABILITAR GIROSCOPIO</h2>
                    <p className="mb-8 opacity-80">Necesitamos sensores de movimiento para detectar tus gestos.</p>
                    <button
                        onClick={() => {
                            handlePermissionRequest();
                            toggleFullScreen();
                        }}
                        className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-xl active:scale-95 transition-transform"
                    >
                        PERMITIR ACCESO
                    </button>
                    <p className="mt-8 text-xs opacity-50">Si estás en PC: Usa flechas Arriba/Abajo para simular.</p>
                </div>
            )}

            {/* INSTRUCTION SCREEN */}
            {phase === 'INSTRUCTIONS' && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center z-10"
                    onClick={() => {
                        toggleFullScreen();
                        setPhase('PLAYING');
                    }}
                >
                    {currentActor && (
                        <div className="mb-8 flex flex-col items-center gap-2">
                            <div className="bg-white/20 p-3 rounded-full">
                                <User size={32} />
                            </div>
                            <p className="text-lg font-bold uppercase tracking-widest text-cyan-300">
                                Turno de {currentActor}
                            </p>
                        </div>
                    )}

                    <h2 className="text-4xl font-game mb-4">PONLO EN TU FRENTE</h2>
                    <div className="animate-pulse mb-8">
                        <Smartphone size={80} className="mx-auto rotate-90" />
                    </div>
                    <p className="text-xl font-bold opacity-80">Inclina ABAJO si Aciertas</p>
                    <p className="text-xl font-bold opacity-80 mb-12">Inclina ARRIBA para Pasar</p>
                    <p className="text-sm border border-white/30 rounded-full px-4 py-2 inline-block">Toca la pantalla para empezar</p>
                </motion.div>
            )}

            {/* GAMEPLAY */}
            {phase === 'PLAYING' && (
                <div className="w-full h-full flex items-center justify-center z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ y: 200, opacity: 0, rotateX: -20 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            exit={{
                                y: cardStatus === 'CORRECT' ? -200 : 200,
                                opacity: 0,
                                rotateX: cardStatus === 'CORRECT' ? 20 : -20
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-white text-black rounded-3xl p-8 w-full max-w-lg aspect-[4/3] flex items-center justify-center shadow-2xl text-center"
                        >
                            <h1 className={`${getFontSize(words[currentIndex])} font-game uppercase leading-none tracking-tighter break-words max-w-full`}>
                                {words[currentIndex]}
                            </h1>
                        </motion.div>
                    </AnimatePresence>

                    {/* HUD */}
                    <div className="absolute top-6 left-6 font-game text-2xl opacity-80">
                        {currentIndex + 1} / {words.length}
                    </div>
                    {/* TIMER */}
                    <div className={`absolute top-6 font-game text-4xl drop-shadow-md transition-colors ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}s
                    </div>
                    <div className="absolute top-6 right-6 font-game text-2xl opacity-80">
                        PUNTOS: {score}
                    </div>

                    {currentActor && (
                        <div className="absolute bottom-6 font-game text-xl opacity-50 uppercase tracking-widest">
                            Actor: {currentActor}
                        </div>
                    )}
                </div>
            )}

            {/* SUMMARY */}
            {phase === 'FINISHED' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center z-10 w-full max-w-md h-[90vh]"
                >
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 w-full border border-white/20 flex flex-col h-full">
                        <h2 className="text-3xl font-game mb-2 text-center">JUEGO TERMINADO</h2>
                        <p className="text-neutral-400 text-center mb-4 uppercase tracking-wider text-sm">{topic}</p>
                        <div className="text-6xl font-game mb-6 text-cyan-400 drop-shadow-lg text-center">
                            {score} <span className="text-2xl text-white">pts</span>
                        </div>

                        {/* RESULTS LIST */}
                        <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
                            {results.map((res, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${res.status === 'CORRECT' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/10 border border-red-500/10 opacity-60'}`}>
                                    <span className="font-bold text-lg">{res.word}</span>
                                    {res.status === 'CORRECT' ? <Check className="text-green-400" /> : <X className="text-red-400" />}
                                </div>
                            ))}
                            {/* Show untracked words as skipped if time ran out? Optional */}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <button onClick={onExit} className="bg-neutral-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-neutral-700 transition">
                                <Home />
                                Menú
                            </button>
                            <button onClick={() => {
                                setCurrentIndex(0);
                                setScore(0);
                                setResults([]);
                                setTimeLeft(initialTime); // Reset Timer

                                // Rotate Actor if multiple players
                                if (playerNames.length > 0) {
                                    const nextIdx = (playerNames.indexOf(currentActor) + 1) % playerNames.length;
                                    setCurrentActor(playerNames[nextIdx]);
                                }

                                setPhase('INSTRUCTIONS');
                            }} className="bg-cyan-500 text-black p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-cyan-400 transition">
                                <RotateCcw />
                                Cambiar Turno
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default GameController;
