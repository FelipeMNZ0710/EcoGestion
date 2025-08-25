import React, { useState, useEffect, useCallback } from 'react';
import type { RepairableItem } from '../../types';

interface RepairItGameProps {
    items: RepairableItem[];
    timePerItem: number;
    onComplete: () => void;
}

const RepairItGame: React.FC<RepairItGameProps> = ({ items, timePerItem, onComplete }) => {
    const [gameItems, setGameItems] = useState<RepairableItem[]>([]);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timePerItem);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const nextItem = useCallback(() => {
        setFeedback(null);
        if (currentItemIndex < gameItems.length - 1) {
            setCurrentItemIndex(i => i + 1);
            setTimeLeft(timePerItem);
        } else {
            setIsFinished(true);
            onComplete();
        }
    }, [currentItemIndex, gameItems.length, timePerItem, onComplete]);
    
    useEffect(() => {
        setGameItems([...items].sort(() => Math.random() - 0.5));
    }, [items]);

    useEffect(() => {
        if (isFinished) return;
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setFeedback('incorrect');
            setTimeout(nextItem, 1200);
        }
    }, [timeLeft, isFinished, nextItem]);

    const handleToolSelection = (tool: string) => {
        if (feedback) return;

        if (tool === gameItems[currentItemIndex].correctTool) {
            setScore(s => s + 10);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
        setTimeout(nextItem, 1200);
    };
    
    const currentItem = gameItems[currentItemIndex];
    const progress = (timeLeft / timePerItem) * 100;

    if (isFinished) {
        return (
             <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col animate-fade-in-up">
                <div className="text-6xl mb-4">🛠️</div>
                <h2 className="text-2xl font-bold text-text-main">¡Juego Terminado!</h2>
                <p className="text-text-secondary mt-2">Reparaste {score / 10} objetos y ganaste <strong className="text-primary">{score}</strong> EcoPuntos.</p>
            </div>
        );
    }
    
    if (!currentItem) return <div>Cargando...</div>;

    return (
        <div className="w-full h-full flex flex-col items-center justify-around p-2">
            <header className="w-full flex justify-between items-center text-xl font-bold">
                <div>Puntaje: <span className="text-primary">{score}</span></div>
                <div>Objetos: {currentItemIndex + 1}/{gameItems.length}</div>
            </header>
            
            <div className="w-full max-w-sm mx-auto my-4">
                <div className="h-4 w-full bg-slate-300 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all duration-1000 linear" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <p className="text-lg mb-4">¿Qué herramienta usas para arreglar esto?</p>
                <div
                    className={`w-48 h-48 bg-white rounded-full shadow-lg flex flex-col items-center justify-center p-4 border-8 transition-colors duration-300 ${
                        feedback === 'correct' ? 'border-emerald-500' :
                        feedback === 'incorrect' ? 'border-red-500' : 'border-slate-200'
                    }`}
                >
                    <span className="text-7xl">{currentItem.image}</span>
                    <span className="font-bold text-center mt-2">{currentItem.name}</span>
                </div>
            </div>

            <footer className="w-full grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
                {currentItem.toolOptions.map(tool => (
                    <button
                        key={tool}
                        onClick={() => handleToolSelection(tool)}
                        disabled={!!feedback}
                        className="p-4 bg-white rounded-lg shadow-md text-5xl flex items-center justify-center transition-transform duration-200 hover:scale-110 disabled:scale-100 disabled:opacity-50"
                    >
                        {tool}
                    </button>
                ))}
            </footer>
        </div>
    );
};

export default RepairItGame;
