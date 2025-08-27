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
    const [isFinished, setIsFinished] = useState(false);

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
            setIsFinished(false);
        };
        setupGame();
    }, [cards]);
    
    useEffect(() => {
        if (flippedIndexes.length === 2) {
            const [firstIndex, secondIndex] = flippedIndexes;
            const firstCard = gameCards[firstIndex];
            const secondCard = gameCards[secondIndex];

            if (firstCard.matchId === secondCard.matchId) {
                // Match
                setGameCards(prev => prev.map((card, index) => 
                    index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card
                ));
                 setFlippedIndexes([]);
            } else {
                 // No Match
                setTimeout(() => {
                    setGameCards(prev => prev.map((card, index) => 
                        index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card
                    ));
                    setFlippedIndexes([]);
                }, 1000);
            }
        }
    }, [flippedIndexes, gameCards]);
    
    useEffect(() => {
        if (gameCards.length > 0 && gameCards.every(card => card.isMatched)) {
            setIsFinished(true);
            setTimeout(onComplete, 1000);
        }
    }, [gameCards, onComplete]);

    const handleCardClick = (index: number) => {
        if (flippedIndexes.length >= 2 || gameCards[index].isFlipped || gameCards[index].isMatched) {
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
             <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col animate-fade-in-up bg-surface rounded-lg">
                <div className="text-6xl mb-4">🧠</div>
                <h2 className="text-2xl font-bold text-text-main">¡Memoria Prodigiosa!</h2>
                <p className="text-text-secondary mt-2">Completaste el juego en {moves} intentos y ganaste EcoPuntos.</p>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col items-center bg-surface rounded-lg p-4">
            <div className="mb-4 text-lg font-bold text-text-main">Intentos: {moves}</div>
            <div className={`grid gap-2 sm:gap-4 justify-center ${gameCards.length > 12 ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4'}`}>
                {gameCards.map((card, index) => (
                    <div key={card.id} className="w-20 h-20 sm:w-24 sm:h-24 [perspective:1000px]" onClick={() => handleCardClick(index)}>
                        <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}`}>
                            {/* Card Back */}
                            <div className="absolute w-full h-full [backface-visibility:hidden] bg-primary rounded-lg flex items-center justify-center text-white text-4xl cursor-pointer">
                                ♻️
                            </div>
                            {/* Card Front */}
                             <div className="absolute w-full h-full [backface-visibility:hidden] bg-slate-700 rounded-lg flex items-center justify-center text-4xl [transform:rotateY(180deg)]">
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
