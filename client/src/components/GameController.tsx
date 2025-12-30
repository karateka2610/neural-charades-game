import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, Smartphone } from 'lucide-react';
import { useGyroscope } from '../hooks/useGyroscope';

interface Props {
    words: string[];
    topic: string;
    onExit: () => void;
}

type GamePhase = 'PERMISSION' | 'INSTRUCTIONS' | 'PLAYING' | 'FINISHED';
type CardStatus = 'NEUTRAL' | 'CORRECT' | 'PASS';

const GameController = ({ words, topic, onExit }: Props) => {
    const { orientation, permission, requestAccess } = useGyroscope();
    const [phase, setPhase] = useState<GamePhase>('PERMISSION');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [cardStatus, setCardStatus] = useState<CardStatus>('NEUTRAL');
    const [lastActionTime, setLastActionTime] = useState(0);

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

    const [timeLeft, setTimeLeft] = useState(60);

    // Timer Logic
    useEffect(() => {
        if (phase !== 'PLAYING') return;
        if (timeLeft <= 0) {
            setPhase('FINISHED');
            return;
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

        const { gamma } = orientation;

        if (gamma === null) return;

        const absGamma = Math.abs(gamma);

        // Lógica para Modo Paisaje (Landscape)
        // Neutro (Frente): Gamma ~ 90 o -90 (Vertical)
        // Arriba (Techo): Gamma tiende a 0 (Plano hacia arriba) -> PASAR
        // Abajo (Suelo): Gamma tiende a 180 (Plano hacia abajo) -> CORRECTO

        // Zona de activación: < 30 grados (Techo) o > 150 grados (Suelo)
        // Zona neutra implícita: entre 30 y 150 (Vertical)

        if (absGamma < 35) {
            handleAnswer('PASS');
        } else if (absGamma > 145) {
            handleAnswer('CORRECT');
        }
    }, [phase, orientation, cardStatus, lastActionTime]);


    const handleAnswer = useCallback((status: 'CORRECT' | 'PASS') => {
        setCardStatus(status);
        if (status === 'CORRECT') setScore(s => s + 1);

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
    }, [currentIndex, words.length]);

    // Background Color Logic
    const getBackgroundColor = () => {
        if (cardStatus === 'CORRECT') return 'bg-green-600';
        if (cardStatus === 'PASS') return 'bg-red-600';
        return 'bg-blue-600';
    };

    // Particles/Visuals could be added here or as a wrapper
    // For now simple reliable CSS colors

    return (
        <div className={`w-full h-full transition-colors duration-300 ${getBackgroundColor()} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>

            {/* PERMISSION SCREEN */}
            {phase === 'PERMISSION' && (
                <div className="text-center z-10 max-w-sm">
                    <Smartphone size={64} className="mx-auto mb-6 text-white" />
                    <h2 className="text-2xl font-bold mb-4 font-game">HABILITAR GIROSCOPIO</h2>
                    <p className="mb-8 opacity-80">Necesitamos sensores de movimiento para detectar tus gestos.</p>
                    <button
                        onClick={handlePermissionRequest}
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
                    onClick={() => setPhase('PLAYING')}
                >
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
                            <h1 className="text-7xl md:text-8xl font-game uppercase leading-none tracking-tighter break-words max-w-full">
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
                </div>
            )}

            {/* SUMMARY */}
            {phase === 'FINISHED' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/20"
                >
                    <h2 className="text-3xl font-game mb-2">JUEGO TERMINADO</h2>
                    <p className="text-neutral-300 mb-6">{topic}</p>

                    <div className="text-8xl font-game mb-8 text-cyan-400 drop-shadow-lg">
                        {score}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={onExit} className="bg-neutral-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-neutral-700 transition">
                            <Home />
                            Menú
                        </button>
                        <button onClick={() => {
                            setCurrentIndex(0);
                            setScore(0);
                            setTimeLeft(60); // Reset Timer
                            setPhase('INSTRUCTIONS');
                        }} className="bg-cyan-500 text-black p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-cyan-400 transition">
                            <RotateCcw />
                            Repetir
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default GameController;
