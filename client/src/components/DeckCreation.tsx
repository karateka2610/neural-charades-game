import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Wand2 } from 'lucide-react';

interface Props {
    onBack: () => void;
    onGameStart: (words: string[], topic: string) => void;
}

const DeckCreation = ({ onBack, onGameStart }: Props) => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setError('');

        try {
            // Usamos ruta relativa. En dev, Vite proxy lo maneja. En prod, el mismo origen sirve ambos.
            const response = await axios.post('/api/generate-deck', { topic });

            if (response.data.words && Array.isArray(response.data.words)) {
                onGameStart(response.data.words, topic);
            } else {
                setError('Invalid response from AI');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate deck. Server might be down.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900 p-6 relative">
            <button
                onClick={onBack}
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-neutral-800 transition-colors"
            >
                <ArrowLeft className="text-white" />
            </button>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-3xl font-bold mb-2 font-game tracking-wide leading-tight">ELIGE UN TEMA</h2>
                    <p className="text-neutral-400 mb-8">¿De qué te gustaría jugar?</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="ej. Películas de los 90, Física Cuántica..."
                                className="w-full bg-neutral-800 border-2 border-neutral-700 focus:border-cyan-400 rounded-xl px-4 py-4 text-lg text-white placeholder-neutral-500 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !topic.trim()}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-neutral-700 disabled:text-neutral-500 text-black font-bold text-lg py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex justify-center items-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Wand2 size={20} />
                                    GENERAR Y JUGAR
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default DeckCreation;
