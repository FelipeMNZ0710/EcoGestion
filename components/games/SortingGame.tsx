import React, { useState, useEffect } from 'react';
import type { SortableItemData, BinType } from '../../types';

interface SortingGameProps {
    items: SortableItemData[];
    bins: BinType[];
    duration: number;
    onComplete: () => void;
}

const binInfo: Record<BinType, { name: string; color: string, icon: string, dropColor: string }> = {
    plastico: { name: 'Plásticos', color: 'bg-yellow-500', icon: '🍾', dropColor: 'border-yellow-500' },
    papel: { name: 'Papel', color: 'bg-blue-500', icon: '📦', dropColor: 'border-blue-500' },
    vidrio: { name: 'Vidrio', color: 'bg-green-500', icon: '🫙', dropColor: 'border-green-500' },
    metales: { name: 'Metales', color: 'bg-red-500', icon: '🥫', dropColor: 'border-red-500' },
    organico: { name: 'Orgánico', color: 'bg-orange-500', icon: '🍎', dropColor: 'border-orange-500' }
}

const SortingGame: React.FC<SortingGameProps> = ({ items, bins, duration, onComplete }) => {
    const [gameItems, setGameItems] = useState<SortableItemData[]>([]);
    const [currentItem, setCurrentItem] = useState<SortableItemData | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        setGameItems(shuffled);
        setCurrentItem(shuffled[0]);
    }, [items]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isFinished) {
            setIsFinished(true);
            setTimeout(onComplete, 1000);
        }
    }, [timeLeft, isFinished, onComplete]);

    const nextItem = () => {
        setFeedback(null);
        const currentIndex = gameItems.findIndex(i => i.id === currentItem?.id);
        if (currentIndex < gameItems.length - 1) {
            setCurrentItem(gameItems[currentIndex + 1]);
        } else {
            setIsFinished(true);
            setTimeout(onComplete, 1000);
        }
    };
    
    const handleDrop = (bin: BinType) => {
        if (!currentItem || feedback) return;
        
        if (currentItem.correctBin === bin) {
            setScore(s => s + 10);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
        
        setTimeout(nextItem, 800);
    };
    
    if (isFinished) {
         return (
            <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col animate-fade-in-up bg-surface rounded-lg">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-text-main">¡Buen Trabajo!</h2>
                <p className="text-text-secondary mt-2">Tu puntaje final es <strong className="text-primary">{score}</strong>. ¡Ganaste EcoPuntos!</p>
            </div>
        );
    }
    
    if (!currentItem) {
        return <div className="text-text-main">Cargando juego...</div>;
    }
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-2 bg-surface rounded-lg text-text-main">
            <header className="w-full flex justify-between items-center text-xl font-bold">
                <div>Puntaje: <span className="text-primary">{score}</span></div>
                <div>Tiempo: <span className="text-primary">{timeLeft}s</span></div>
            </header>

            <div 
                draggable 
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                className={`w-40 h-40 bg-surface border-4 border-slate-700 rounded-full shadow-lg flex flex-col items-center justify-center p-4 my-4 cursor-grab active:cursor-grabbing transition-all duration-300
                    ${feedback === 'correct' ? 'transform scale-0 opacity-0' : ''}
                    ${feedback === 'incorrect' ? 'border-red-500 animate-shake' : ''}
                `}
            >
                <span className="text-7xl">{currentItem.image}</span>
                <span className="font-bold text-center mt-2 text-sm">{currentItem.name}</span>
            </div>

            <footer className="w-full grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {bins.map(bin => {
                    const info = binInfo[bin];
                    return (
                        <div 
                            key={bin} 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(bin)}
                            className={`p-2 sm:p-4 rounded-lg text-white font-bold flex flex-col items-center justify-center transition-all duration-200 border-4 border-transparent ${info.color} ${isDragging ? `hover:${info.dropColor}` : ''}`}
                        >
                            <span className="text-3xl">{info.icon}</span>
                            <span className="text-sm hidden sm:block">{info.name}</span>
                        </div>
                    );
                })}
            </footer>
        </div>
    );
};

export default SortingGame;