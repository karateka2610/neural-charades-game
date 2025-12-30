import { motion } from 'framer-motion';
import { BrainCircuit, Play, Sparkles } from 'lucide-react';
import { PRESETS } from '../data/PRESETS';

interface Props {
    onStart: (words?: string[], topic?: string) => void;
}

const MainMenu = ({ onStart }: Props) => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-neutral-900 p-6 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8 mt-10"
            >
                <div className="flex justify-center mb-4">
                    <BrainCircuit size={64} className="text-cyan-400" />
                </div>
                <h1 className="text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 font-game">
                    NEURAL<br />CHARADES
                </h1>
                <p className="text-neutral-400 mt-2 font-light tracking-wide">
                    Juego de Fiesta con IA
                </p>
            </motion.div>

            <div className="w-full max-w-md space-y-4 mb-10">
                <div className="text-neutral-500 text-sm uppercase tracking-wider font-bold mb-2 text-center">
                    Modos Rápidos
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESETS.map((preset, index) => (
                        <motion.button
                            key={preset.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onStart(preset.words, preset.name)}
                            className="bg-neutral-800/80 hover:bg-neutral-700/80 p-4 rounded-xl flex items-center justify-between border border-neutral-700 transition-colors group"
                        >
                            <span className="flex items-center gap-3 text-lg font-medium text-white">
                                <span className="text-2xl">{preset.icon}</span>
                                {preset.name}
                            </span>
                            <Play size={20} className="text-neutral-500 group-hover:text-cyan-400 transition-colors" />
                        </motion.button>
                    ))}
                </div>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-neutral-900 text-neutral-500">O crea el tuyo</span>
                    </div>
                </div>

                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStart()}
                    className="w-full relative px-8 py-5 bg-white text-black rounded-2xl font-bold text-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 opacity-0 hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                        <Sparkles size={24} className="text-purple-600" />
                        CREAR CON IA
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default MainMenu;
