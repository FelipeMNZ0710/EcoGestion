import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { SortableItemData, BinType } from '../../types';

interface SortingGameProps {
    items: SortableItemData[];
    bins: BinType[];
    duration: number;
    onComplete: () => void;
}

const binInfo: Record<BinType, { name: string; color: string, icon: string }> = {
    plastico: { name: 'Plásticos', color: 'bg-yellow-400', icon: '🍾' },
    papel: { name: 'Papel/Cartón', color: 'bg-blue-500', icon: '📦' },
    vidrio: { name: 'Vidrio', color: 'bg-green-500', icon: '🫙' },
    metales: { name: 'Metales', color: 'bg-red-500', icon: '🥫' },
    organico: { name: 'Orgánico', color: 'bg-orange-500', icon: '🍎' }
}

const SortingGame: React.FC<SortingGameProps> = ({ items, bins, duration, onComplete }) => {
    const [gameItems, setGameItems] = useState<SortableItemData[]>([]);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        setGameItems([...items].sort(() => Math.random() - 0.5));
    }, [items]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isFinished) {
            setIsFinished(true);
            onComplete();
        }
    }, [timeLeft, isFinished, onComplete]);

    const handleSort = (selectedBin: BinType) => {
        if (feedback) return; // Prevent multiple clicks

        const currentItem = gameItems[currentItemIndex];
        if (currentItem.correctBin === selectedBin) {
            setScore(s => s + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            setFeedback(null);
            if (currentItemIndex < gameItems.length - 1) {
                setCurrentItemIndex(i => i + 1);
            } else {
                setIsFinished(true);
                onComplete();
            }
        }, 800);
    };

    const currentItem = gameItems[currentItemIndex];

    if (isFinished) {
        return (
            <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col animate-fade-in-up">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-text-main">¡Tiempo!</h2>
                <p className="text-text-secondary mt-2">Clasificaste correctamente {score} de {gameItems.length} objetos y ganaste EcoPuntos.</p>
            </div>
        )
    }

    if (!currentItem) return <div>Cargando...</div>;

    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-2">
            <header className="w-full flex justify-between items-center text-xl font-bold">
                <div>Puntaje: <span className="text-primary">{score}</span></div>
                <div>Tiempo: <span className="text-accent">{timeLeft}s</span></div>
            </header>

            <div className="flex flex-col items-center my-4">
                <p className="text-lg mb-2">¿Dónde va este objeto?</p>
                <div 
                    className={`w-40 h-40 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center p-4 border-4 transition-colors duration-300 ${
                        feedback === 'correct' ? 'border-emerald-500' :
                        feedback === 'incorrect' ? 'border-red-500' : 'border-transparent'
                    }`}
                >
                    <span className="text-6xl">{currentItem.image}</span>
                    <span className="font-bold text-center mt-2">{currentItem.name}</span>
                </div>
            </div>

            <footer className="w-full grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
                {bins.map(bin => {
                    const info = binInfo[bin];
                    return (
                        <button 
                            key={bin}
                            onClick={() => handleSort(bin)}
                            className={`p-2 sm:p-4 rounded-lg text-white font-bold flex flex-col items-center justify-center transition-transform duration-200 hover:scale-105 ${info.color}`}
                        >
                            <span className="text-3xl">{info.icon}</span>
                            <span className="text-sm hidden sm:block">{info.name}</span>
                        </button>
                    );
                })}
            </footer>
        </div>
    );
}

export default SortingGame;
