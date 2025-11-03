import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SortableItemData, BinType } from '../../types';

interface RecyclingChainGameProps {
    items: SortableItemData[];
    bins: BinType[];
    duration: number;
    onComplete: (score: number) => void;
    userHighScore: number;
}

const binInfo: Record<BinType, { name: string; color: string; icon: string; dropColor: string }> = {
    plastico: { name: 'Plásticos', color: 'bg-yellow-500', icon: '🍾', dropColor: 'border-yellow-500' },
    papel: { name: 'Papel', color: 'bg-blue-500', icon: '📦', dropColor: 'border-blue-500' },
    vidrio: { name: 'Vidrio', color: 'bg-green-500', icon: '🫙', dropColor: 'border-green-500' },
    metales: { name: 'Metales', color: 'bg-red-500', icon: '🥫', dropColor: 'border-red-500' },
    organico: { name: 'Orgánico', color: 'bg-orange-500', icon: '🍎', dropColor: 'border-orange-500' }
};

const RecyclingChainGame: React.FC<RecyclingChainGameProps> = ({ items, bins, duration, onComplete, userHighScore }) => {
    const [gameItems, setGameItems] = useState<{ item: SortableItemData; id: number; position: number }[]>([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isFinished, setIsFinished] = useState(false);
    const [isDragging, setIsDragging] = useState<number | null>(null);
    const [dragOverBin, setDragOverBin] = useState<BinType | null>(null);

    const gameAreaRef = useRef<HTMLDivElement>(null);
    const nextItemId = useRef(0);

    const spawnItem = useCallback(() => {
        if (isFinished) return;
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const newItem = {
            item: randomItem,
            id: nextItemId.current++,
            position: -64, // Start off-screen
        };
        setGameItems(prev => [...prev, newItem]);
    }, [items, isFinished]);

    useEffect(() => {
        spawnItem();
        const spawnInterval = setInterval(spawnItem, 4000 - (score / 10)); // Spawns faster as score increases
        return () => clearInterval(spawnInterval);
    }, [spawnItem, isFinished, score]);

    useEffect(() => {
        if (isFinished) return;
        const gameLoop = setInterval(() => {
            const gameAreaWidth = gameAreaRef.current?.offsetWidth || 800;
            const speed = 1 + (score / 200);
            setGameItems(prev =>
                prev.map(i => ({ ...i, position: i.position + speed })).filter(i => i.position < gameAreaWidth + 50)
            );
        }, 16);
        return () => clearInterval(gameLoop);
    }, [isFinished, score]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft <= 0 && !isFinished) {
            setIsFinished(true);
            onComplete(score);
        }
    }, [timeLeft, isFinished, onComplete, score]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: number) => {
        setIsDragging(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(new Image(), 0, 0); // Hide default drag preview
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
        setDragOverBin(null);
    };

    const isNewHighScore = score > userHighScore;

    if (isFinished) {
        return (
            <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col" style={{ animation: 'game-pop-in 0.5s' }}>
                <div className="text-7xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-text-main">¡Se acabó el tiempo!</h2>
                {isNewHighScore && <p className="font-bold text-amber-400 text-xl mt-4 animate-bounce">¡Nuevo Récord!</p>}
                 <p className="text-text-secondary mt-2 text-lg">Tu puntaje final: <strong className="text-primary text-2xl">{score}</strong>.</p>
                 <p className="text-text-secondary text-sm">Tu récord anterior: {userHighScore}</p>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-between text-text-main">
            <header className="w-full flex justify-between items-center text-lg sm:text-xl font-bold px-2">
                <div>Puntaje: <span className="text-primary">{score}</span></div>
                {combo > 1 && <div className="text-primary text-2xl font-black animate-bounce">COMBO x{combo}!</div>}
                <div>Tiempo: <span className={`transition-colors ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>{timeLeft}s</span></div>
            </header>

            <div ref={gameAreaRef} className="relative w-full h-48 my-4 bg-slate-800 rounded-lg overflow-hidden border-y-4 border-slate-900">
                <div 
                    className="absolute inset-0"
                    style={{ 
                        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)',
                        backgroundSize: '100px 100px',
                        animation: 'game-conveyor-scroll 2s linear infinite',
                    }}
                ></div>
                
                {gameItems.map(({ item, id, position }) => (
                    <div
                        key={id}
                        draggable
                        onDragStart={e => handleDragStart(e, id)}
                        onDragEnd={() => setIsDragging(null)}
                        className={`absolute top-1/2 -translate-y-1/2 w-20 h-20 bg-background rounded-md shadow-lg flex flex-col items-center justify-center p-1 cursor-grab active:cursor-grabbing text-slate-800 transition-transform ${isDragging === id ? 'scale-110 rotate-6' : ''}`}
                        style={{ left: `${position}px` }}
                    >
                        <span className="text-4xl pointer-events-none">{item.image}</span>
                        <span className="text-xs font-semibold text-text-main pointer-events-none">{item.name}</span>
                    </div>
                ))}
            </div>

            <footer className={`w-full grid grid-cols-2 md:grid-cols-${Math.min(bins.length, 5)} gap-2 sm:gap-4`}>
                {bins.map(bin => {
                    const info = binInfo[bin];
                    return (
                        <div
                            key={bin}
                            onDragOver={(e) => { e.preventDefault(); setDragOverBin(bin); }}
                            onDragLeave={() => setDragOverBin(null)}
                            onDrop={(e) => handleDrop(e, bin)}
                            className={`p-2 py-4 sm:p-4 rounded-lg text-white font-bold flex flex-col items-center justify-end h-32 sm:h-40 transition-all duration-200 border-4 ${dragOverBin === bin ? info.dropColor : 'border-transparent'} ${info.color}`}
                        >
                            <span className="text-4xl sm:text-5xl">{info.icon}</span>
                            <span className="text-sm sm:text-base mt-2">{info.name}</span>
                        </div>
                    );
                })}
            </footer>
        </div>
    );
};

export default RecyclingChainGame;