import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { HangmanWord } from '../../types';

interface HangmanGameProps {
    words: HangmanWord[];
    onComplete: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const MAX_MISTAKES = 6;

const SadPlanet: React.FC<{ mistakes: number }> = ({ mistakes }) => {
    const trashItems = [
        // Botella de plástico
        <path key="1" d="M20 25 C 20 20, 30 20, 30 25 L 30 45 L 20 45 Z M 22 28 H 28" fill="#a2d2ff" stroke="#4a5568" strokeWidth="1" />,
        // Lata
        <path key="2" d="M75 80 L 85 80 L 85 90 L 75 90 Z M 77 82 H 83" fill="#e2e8f0" stroke="#4a5568" strokeWidth="1" />,
        // Bolsa
        <path key="3"d="M80 30 C 75 35, 75 45, 80 50 S 90 55, 95 50 S 95 35, 90 30 Z M 83 30 C 83 25, 87 25, 87 30 M 87 30 C 87 25, 91 25, 91 30" fill="#fef08a" stroke="#4a5568" strokeWidth="0.5" />,
        // Cáscara de banana
        <path key="4" d="M10 70 Q 15 60, 25 75 M 12 72 Q 18 65, 25 75" fill="none" stroke="#facc15" strokeWidth="2" />,
        // Tetrabrik
        <path key="5" d="M40 85 L 50 80 L 60 85 L 50 90 Z" fill="#ffffff" stroke="#4a5568" strokeWidth="1" />,
        // Vaso de café
        <path key="6" d="M55 20 L 65 20 L 70 40 L 50 40 Z" fill="#d2b48c" stroke="#4a5568" strokeWidth="1" />,
    ];
    
    return (
        <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto mb-4">
            <defs>
                <radialGradient id="planetGradient" cx="0.4" cy="0.4" r="0.6">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#16a34a" />
                </radialGradient>
            </defs>
            {/* Planeta */}
            <circle cx="50" cy="50" r="30" fill="url(#planetGradient)" />
            {/* Continentes */}
            <path d="M45 40 Q 50 35, 55 40 T 60 55 Q 50 65, 40 55 T 45 40" fill="#22c55e" opacity="0.7"/>
            <path d="M40 60 Q 35 50, 45 48" fill="#22c55e" opacity="0.7" />
            
            {/* Ojos */}
            <circle cx="45" cy="48" r="2" fill="white" />
            <circle cx="55" cy="48" r="2" fill="white" />
            <circle cx="46" cy="48" r="1" fill="black" />
            <circle cx="56" cy="48" r="1" fill="black" />

            {/* Boca */}
            <path d={mistakes < 3 ? "M45 58 Q 50 62, 55 58" : "M45 60 Q 50 56, 55 60"} stroke="black" strokeWidth="1" fill="none" />
            
            {/* Basura */}
            <g transform={`rotate(${mistakes * 15} 50 50)`} style={{ transition: 'transform 0.5s ease' }}>
                {trashItems.slice(0, mistakes).map((item, i) => (
                    <g key={i} transform={`rotate(${i * (360 / MAX_MISTAKES)} 50 50) translate(0 -35)`} opacity="0.8">
                       {item}
                    </g>
                ))}
            </g>
        </svg>
    );
};


const HangmanGame: React.FC<HangmanGameProps> = ({ words, onComplete }) => {
    const [{ word, hint }, setCurrentWord] = useState<{word: string; hint: string}>(words[0]);
    const [guessedLetters, setGuessedLetters] = useState(new Set<string>());
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

    const incorrectGuesses = useMemo(() => {
        return [...guessedLetters].filter(letter => !word.includes(letter)).length;
    }, [guessedLetters, word]);
    
    const maskedWord = useMemo(() => {
        return word.split('').map(letter => (letter === ' ' ? ' ' : guessedLetters.has(letter) ? letter : '_')).join('');
    }, [word, guessedLetters]);

    const setupNewGame = useCallback(() => {
        const newWord = words[Math.floor(Math.random() * words.length)];
        setCurrentWord(newWord);
        setGuessedLetters(new Set());
        setGameState('playing');
    }, [words]);

    useEffect(() => {
        setupNewGame();
    }, [setupNewGame]);
    
     useEffect(() => {
        if (maskedWord === word && word !== '') {
            setGameState('won');
            setTimeout(onComplete, 1000);
        } else if (incorrectGuesses >= MAX_MISTAKES) {
            setGameState('lost');
        }
    }, [maskedWord, word, incorrectGuesses, onComplete]);

    const handleGuess = (letter: string) => {
        if (gameState !== 'playing') return;
        setGuessedLetters(prev => new Set(prev).add(letter));
    };

    if (gameState !== 'playing') {
        return (
            <div className="w-full h-full flex items-center justify-center text-center p-4 sm:p-8 flex-col animate-fade-in-up bg-surface rounded-lg">
                <div className={`text-6xl mb-4 ${gameState === 'won' ? 'animate-bounce' : ''}`}>{gameState === 'won' ? '🎉' : '😥'}</div>
                <h2 className="text-2xl font-bold text-text-main">{gameState === 'won' ? '¡Lo lograste!' : '¡Oh, no!'}</h2>
                <p className="text-text-secondary mt-2">La palabra era: <strong className="text-primary">{word}</strong></p>
                <div className="mt-4 p-4 bg-background rounded-lg text-sm text-text-secondary">
                    <strong className="text-primary">Dato Curioso:</strong> {hint}
                </div>
                <button onClick={setupNewGame} className="mt-6 bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors">
                    {gameState === 'won' ? 'Jugar de Nuevo' : 'Volver a Intentar'}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-around bg-surface rounded-lg text-text-main">
            <SadPlanet mistakes={incorrectGuesses} />
            
            <div className="text-center">
                <p className="text-sm text-text-secondary mb-2">Adivina la palabra:</p>
                <div className="flex justify-center gap-2 text-2xl sm:text-4xl font-bold tracking-widest">
                    {maskedWord.split('').map((letter, index) => (
                        <span key={index} className={`w-8 sm:w-12 h-12 sm:h-16 flex items-center justify-center border-b-4 ${letter === '_' ? 'border-slate-700' : 'border-primary'}`}>
                            {letter !== '_' ? letter : ''}
                        </span>
                    ))}
                </div>
                <p className="text-sm text-primary mt-4 h-6">Pista: {hint}</p>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1 sm:gap-2 p-2">
                {ALPHABET.map(letter => {
                    const isGuessed = guessedLetters.has(letter);
                    const isCorrect = word.includes(letter);
                    
                    return (
                        <button 
                            key={letter}
                            onClick={() => handleGuess(letter)}
                            disabled={isGuessed}
                            className={`w-9 h-9 sm:w-10 sm:h-10 font-bold rounded-md transition-all duration-200
                                ${isGuessed 
                                    ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-400 opacity-70')
                                    : 'bg-background hover:bg-primary/20 text-text-main shadow-sm'
                                }`}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default HangmanGame;