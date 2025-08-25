import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CatcherItem } from '../../types';

interface WasteCatcherGameProps {
    items: CatcherItem[];
    lives: number;
    onComplete: () => void;
}

const WasteCatcherGame: React.FC<WasteCatcherGameProps> = ({ items, lives: initialLives, onComplete }) => {
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);
    
    const [fallingItems, setFallingItems] = useState<{ item: CatcherItem; id: number; x: number; y: number }[]>([]);
    const [cartX, setCartX] = useState(50); // in percentage
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(initialLives);
    const [isFinished, setIsFinished] = useState(false);
    const nextItemId = useRef(0);

    const spawnItem = useCallback(() => {
        if (isFinished) return;
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const newItem = {
            item: randomItem,
            id: nextItemId.current++,
            x: Math.random() * 90 + 5, // percentage
            y: -10, // start above the screen
        };
        setFallingItems(prev => [...prev, newItem]);
    }, [items, isFinished]);

    useEffect(() => {
        const spawnInterval = setInterval(spawnItem, 1500);
        return () => clearInterval(spawnInterval);
    }, [spawnItem]);

    useEffect(() => {
        if (isFinished) return;

        const gameLoop = setInterval(() => {
            const gameAreaHeight = gameAreaRef.current?.offsetHeight || 600;
            setFallingItems(prev => {
                const updatedItems = prev.map(i => ({ ...i, y: i.y + 2 })); // Adjust speed here
                
                const cartRect = cartRef.current?.getBoundingClientRect();
                const gameAreaRect = gameAreaRef.current?.getBoundingClientRect();
                
                if (!cartRect || !gameAreaRect) return updatedItems;

                const remainingItems = updatedItems.filter(item => {
                    const itemElement = document.getElementById(`item-${item.id}`);
                    const itemRect = itemElement?.getBoundingClientRect();
                    
                    if (!itemRect) return true;

                    // Check for collision
                    if (
                        itemRect.bottom >= cartRect.top &&
                        itemRect.right >= cartRect.left &&
                        itemRect.left <= cartRect.right
                    ) {
                        if (item.item.type === 'recyclable') {
                            setScore(s => s + item.item.points);
                        } else {
                            setLives(l => l - 1);
                        }
                        return false; // Remove item
                    }
                    
                    // Check if item is off-screen
                    if (itemRect.top > gameAreaRect.bottom) {
                        if (item.item.type === 'recyclable') {
                             setLives(l => l - 1);
                        }
                        return false; // Remove item
                    }
                    
                    return true;
                });
                return remainingItems;
            });
        }, 16); // ~60 FPS

        return () => clearInterval(gameLoop);
    }, [isFinished]);

    useEffect(() => {
        if (lives <= 0 && !isFinished) {
            setIsFinished(true);
            onComplete();
        }
    }, [lives, isFinished, onComplete]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!gameAreaRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        let newCartX = (x / rect.width) * 100;
        newCartX = Math.max(5, Math.min(95, newCartX)); // Clamp between 5% and 95%
        setCartX(newCartX);
    };
    
    if (isFinished) {
        return (
            <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col animate-fade-in-up">
                <div className="text-6xl mb-4">♻️</div>
                <h2 className="text-2xl font-bold text-text-main">¡Juego Terminado!</h2>
                <p className="text-text-secondary mt-2">Tu puntaje final es <strong className="text-primary">{score}</strong>. ¡Ganaste EcoPuntos!</p>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col items-center p-2 relative" onMouseMove={handleMouseMove} ref={gameAreaRef}>
             <header className="w-full flex justify-between items-center text-xl font-bold z-10">
                <div>Puntaje: <span className="text-primary">{score}</span></div>
                <div>Vidas: {'❤️'.repeat(lives)}</div>
            </header>

            {fallingItems.map(item => (
                <div
                    key={item.id}
                    id={`item-${item.id}`}
                    className="absolute text-4xl"
                    style={{ left: `${item.x}%`, top: `${item.y}px`, transform: 'translateX(-50%)' }}
                >
                    {item.item.image}
                </div>
            ))}

            <div
                ref={cartRef}
                className="absolute bottom-5 w-24 h-16 bg-blue-500 rounded-t-lg border-4 border-blue-700"
                style={{ left: `${cartX}%`, transform: 'translateX(-50%)' }}
            ></div>
        </div>
    );
};

export default WasteCatcherGame;
