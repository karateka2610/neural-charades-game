import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Play, Sparkles, Clock, Users, Plus, X } from 'lucide-react';
import { PRESETS } from '../data/PRESETS';
import { useState } from 'react';

interface Props {
    onStart: (words?: string[], topic?: string) => void;
    gameDuration: number;
    setGameDuration: (duration: number) => void;
    playerNames: string[];
    setPlayerNames: (names: string[]) => void;
}

const MainMenu = ({ onStart, gameDuration, setGameDuration, playerNames, setPlayerNames }: Props) => {
    const [newName, setNewName] = useState('');

    // Función simple para barajar array (Fisher-Yates)
    const shuffleArray = (array: string[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const addPlayer = () => {
        if (newName.trim()) {
            setPlayerNames([...playerNames, newName.trim()]);
            setNewName('');
        }
    };

    const removePlayer = (index: number) => {
        const newNames = [...playerNames];
        newNames.splice(index, 1);
        setPlayerNames(newNames);
    };

    const timeOptions = [30, 60, 90, 120];

    return (
        <div className="flex flex-col items-center justify-center h-full bg-neutral-950 p-6 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8 mt-6"
            >
                <div className="flex justify-center mb-4">
                    <BrainCircuit size={48} className="text-white opacity-80" />
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-white font-game mb-2">
                    NEURAL CHARADES
                </h1>
                <p className="text-neutral-500 text-sm font-light tracking-widest uppercase">
                    Minimalist AI Party Game
                </p>
            </motion.div>

            <div className="w-full max-w-sm space-y-8 mb-10">

                {/* Players Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-neutral-500 text-xs font-bold tracking-widest uppercase">
                        <Users size={12} />
                        Jugadores (Opcional)
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                            placeholder="Nombre del jugador"
                            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <button
                            onClick={addPlayer}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {playerNames.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                                {playerNames.map((name, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="bg-cyan-900/30 border border-cyan-800/50 text-cyan-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2"
                                    >
                                        {name}
                                        <button onClick={() => removePlayer(index)} className="hover:text-white">
                                            <X size={12} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Time Selector */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-neutral-500 text-xs font-bold tracking-widest uppercase">
                        <Clock size={12} />
                        Duración (segundos)
                    </div>
                    <div className="flex gap-2 bg-neutral-900 p-1 rounded-full border border-neutral-800 w-fit">
                        {timeOptions.map((time) => (
                            <button
                                key={time}
                                onClick={() => setGameDuration(time)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${gameDuration === time
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'text-neutral-500 hover:text-white'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preset List */}
                <div className="space-y-2">
                    <div className="text-neutral-500 text-xs font-bold tracking-widest uppercase text-center mb-4">
                        Selecciona un Modo
                    </div>
                    {PRESETS.map((preset, index) => (
                        <motion.button
                            key={preset.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onStart(shuffleArray(preset.words), preset.name)}
                            className="w-full bg-transparent p-4 rounded-xl flex items-center justify-between border border-neutral-800 hover:border-neutral-600 transition-all group"
                        >
                            <span className="flex items-center gap-4 text-base font-medium text-neutral-300 group-hover:text-white transition-colors">
                                <span className="opacity-50 group-hover:opacity-100 transition-opacity text-lg">{preset.icon}</span>
                                {preset.name}
                            </span>
                            <Play size={16} className="text-neutral-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                        </motion.button>
                    ))}
                </div>

                <div className="w-full h-px bg-neutral-900 my-6" />

                <motion.button
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStart()}
                    className="w-full py-4 border border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-900/50 transition-all flex items-center justify-center gap-2 group"
                >
                    <Sparkles size={18} className="text-neutral-500 group-hover:text-yellow-200 transition-colors" />
                    <span className="font-medium tracking-wide">CREAR CON IA</span>
                </motion.button>
            </div>
        </div>
    );
};

export default MainMenu;
