import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SortableItemData, BinType } from '../../types';

interface RecyclingChainGameProps {
    items: SortableItemData[];
    bins: BinType[];
    duration: number;
    onComplete: () => void;
}

const binInfo: Record<BinType, { name: string; color: string; icon: string; dropColor: string }> = {
    plastico: { name: 'Plásticos', color: 'bg-yellow-400', icon: '🍾', dropColor: 'border-yellow-400' },
    papel: { name: 'Papel', color: 'bg-blue-500', icon: '📦', dropColor: 'border-blue-500' },
    vidrio: { name: 'Vidrio', color: 'bg-green-500', icon: '🫙', dropColor: 'border-green-500' },
    metales: { name: 'Metales', color: 'bg-red-500', icon: '🥫', dropColor: 'border-red-500' },
    organico: { name: 'Orgánico', color: 'bg-orange-500', icon: '🍎', dropColor: 'border-orange-500' }
};

const RecyclingChainGame: React.FC<RecyclingChainGameProps> = ({ items, bins, duration, onComplete }) => {
    const [gameItems, setGameItems] = useState<{ item: SortableItemData; id: number; position: number }[]>([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isFinished, setIsFinished] = useState(false);
    const [isDragging, setIsDragging] = useState<number | null>(null);
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const nextItemId = useRef(0);

    const spawnItem = useCallback(() => {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const newItem = {
            item: randomItem,
            id: nextItemId.current++,
            position: 0,
        };
        setGameItems(prev => [...prev, newItem]);
    }, [items]);

    useEffect(() => {
        spawnItem();
        const spawnInterval = setInterval(() => {
            if (!isFinished) spawnItem();
        }, 4000); // Spawn a new item every 4 seconds

        return () => clearInterval(spawnInterval);
    }, [spawnItem, isFinished]);

    useEffect(() => {
        if (isFinished) return;

        const gameLoop = setInterval(() => {
            const gameAreaWidth = gameAreaRef.current?.offsetWidth || 800;
            const speed = 1 + (score / 100); // Speed increases with score
            setGameItems(prev =>
                prev.map(i => ({ ...i, position: i.position + speed })).filter(i => i.position < gameAreaWidth + 50)
            );
        }, 16); // ~60 FPS

        return () => clearInterval(gameLoop);
    }, [isFinished, score]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isFinished) {
            setIsFinished(true);
            onComplete();
        }
    }, [timeLeft, isFinished, onComplete]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: number) => {
        setIsDragging(itemId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, bin: BinType) => {
        e.preventDefault();
        if (isDragging === null) return;

        const draggedItem = gameItems.find(i => i.id === isDragging);
        if (draggedItem) {
            if (draggedItem.item.correctBin === bin) {
                setScore(s => s + 10 + combo * 2);
                setCombo(c => c + 1);
            } else {
                setCombo(0);
            }
            setGameItems(prev => prev.filter(i => i.id !== isDragging));
        }
        setIsDragging(null);
    };

    if (isFinished) {
        return (
            <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col animate-fade-in-up">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-text-main">¡Tiempo!</h2>
                <p className="text-text-secondary mt-2">Tu puntaje final es <strong className="text-primary">{score}</strong>. ¡Ganaste EcoPuntos!</p>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-2">
            <header className="w-full flex justify-between items-center text-xl font-bold">
                <div>Puntaje: <span className="text-primary">{score}</span></div>
                {combo > 1 && <div className="text-secondary animate-bounce">COMBO x{combo}!</div>}
                <div>Tiempo: <span className="text-accent">{timeLeft}s</span></div>
            </header>

            <div ref={gameAreaRef} className="relative w-full h-48 my-4 bg-slate-300 rounded-lg overflow-hidden">
                {/* Conveyor Belt */}
                <div className="absolute inset-0 bg-slate-600"></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-24 bg-slate-500 opacity-50"></div>
                
                {gameItems.map(({ item, id, position }) => (
                    <div
                        key={id}
                        draggable
                        onDragStart={e => handleDragStart(e, id)}
                        onDragEnd={() => setIsDragging(null)}
                        className="absolute top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-md shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing"
                        style={{ left: `${position}px` }}
                    >
                        <span className="text-4xl">{item.image}</span>
                    </div>
                ))}
            </div>

            <footer className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                {bins.map(bin => {
                    const info = binInfo[bin];
                    return (
                        <div
                            key={bin}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, bin)}
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

export default RecyclingChainGame;