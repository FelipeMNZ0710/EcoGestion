import React, { useState, useEffect } from 'react';
import type { MemoryCardData } from '../../types';

interface MemoryGameProps {
    cards: MemoryCardData[];
    onComplete: () => void;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ cards, onComplete }) => {
    const [gameCards, setGameCards] = useState<{ id: number; content: string; type: 'icon' | 'image'; matchId: string; isFlipped: boolean; isMatched: boolean; }[]>([]);
    const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const setupGame = () => {
            const pairedCards = cards.flatMap((card, i) => [
                { ...card, id: i * 2, matchId: card.id },
                { ...card, id: i * 2 + 1, matchId: card.id }
            ]);
            
            const shuffled = pairedCards
                .sort(() => Math.random() - 0.5)
                .map(card => ({ ...card, isFlipped: false, isMatched: false }));
            setGameCards(shuffled);
            setFlippedIndexes([]);
            setMoves(0);
            setSeconds(0);
            setIsFinished(false);
        };
        setupGame();
    }, [cards]);
    
     useEffect(() => {
        if (!isFinished) {
            const timer = setInterval(() => setSeconds(s => s + 1), 1000);
            return () => clearInterval(timer);
        }
    }, [isFinished]);
    
    useEffect(() => {
        if (flippedIndexes.length === 2) {
            setIsChecking(true);
            const [firstIndex, secondIndex] = flippedIndexes;
            const firstCard = gameCards[firstIndex];
            const secondCard = gameCards[secondIndex];

            if (firstCard.matchId === secondCard.matchId) {
                setTimeout(() => {
                    setGameCards(prev => prev.map((card, index) => 
                        index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card
                    ));
                    setFlippedIndexes([]);
                    setIsChecking(false);
                }, 600);
            } else {
                setTimeout(() => {
                    setGameCards(prev => prev.map((card, index) => 
                        index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card
                    ));
                    setFlippedIndexes([]);
                    setIsChecking(false);
                }, 1200);
            }
        }
    }, [flippedIndexes, gameCards]);
    
    useEffect(() => {
        if (gameCards.length > 0 && gameCards.every(card => card.isMatched)) {
            setIsFinished(true);
            setTimeout(onComplete, 2000);
        }
    }, [gameCards, onComplete]);

    const handleCardClick = (index: number) => {
        if (isChecking || gameCards[index].isFlipped || gameCards[index].isMatched) {
            return;
        }
        
        if(flippedIndexes.length === 0) {
            setMoves(prev => prev + 1);
        }

        setFlippedIndexes(prev => [...prev, index]);
        setGameCards(prev => prev.map((card, i) => 
            i === index ? { ...card, isFlipped: true } : card
        ));
    };

    if (isFinished) {
        return (
             <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col bg-surface rounded-lg" style={{ animation: 'game-pop-in 0.5s' }}>
                <div className="text-7xl mb-4">🧠</div>
                <h2 className="text-3xl font-bold text-text-main">¡Memoria Prodigiosa!</h2>
                <div className="flex gap-6 mt-4 text-lg text-text-secondary">
                    <span>Movimientos: <strong className="text-primary">{moves}</strong></span>
                    <span>Tiempo: <strong className="text-primary">{seconds}s</strong></span>
                </div>
                <p className="font-bold text-primary text-xl mt-4">¡Ganaste EcoPuntos!</p>
            </div>
        )
    }

    const gridCols = gameCards.length > 12 ? 'grid-cols-4 md:grid-cols-6' : 'grid-cols-3 md:grid-cols-4';

    return (
        <div className="w-full h-full flex flex-col items-center bg-surface rounded-lg p-4">
            <div className="w-full flex justify-between items-center mb-4 text-lg font-bold text-text-main px-2">
                <span>Movimientos: {moves}</span>
                <span>Tiempo: {seconds}s</span>
            </div>
            <div className={`grid ${gridCols} gap-2 sm:gap-4 justify-center flex-1 items-center`}>
                {gameCards.map((card, index) => (
                    <div key={card.id} className="w-full aspect-square [perspective:1000px]" onClick={() => handleCardClick(index)}>
                        <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-d] ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}`}>
                            {/* Card Back */}
                            <div className="absolute w-full h-full [backface-visibility:hidden] bg-primary rounded-lg flex items-center justify-center text-white text-4xl cursor-pointer shadow-lg bg-gradient-to-br from-primary to-emerald-600">
                                ♻️
                            </div>
                            {/* Card Front */}
                             <div className={`absolute w-full h-full [backface-visibility:hidden] bg-slate-700 rounded-lg flex items-center justify-center text-4xl [transform:rotateY(180deg)] 
                                ${card.isMatched ? 'opacity-50' : ''}
                                ${flippedIndexes.includes(index) && flippedIndexes.length === 2 && !card.isMatched ? 'animate-game-shake' : ''}
                                ${card.isMatched && (flippedIndexes.includes(index) || (Date.now() - 1000 < Date.now())) ? 'animate-game-glow-correct' : ''}
                             `}>
                                {card.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemoryGame;