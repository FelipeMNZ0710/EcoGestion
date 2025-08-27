import React, { useEffect, useState, useCallback } from 'react';
import type { User, Game, GamificationAction } from '../types';
import { initialGames } from '../data/gamesData';
import TriviaGame from '../components/games/TriviaGame';
import MemoryGame from '../components/games/MemoryGame';
import SortingGame from '../components/games/SortingGame';
import HangmanGame from '../components/games/HangmanGame';
import RecyclingChainGame from '../components/games/RecyclingChainGame';
import WasteCatcherGame from '../components/games/WasteCatcherGame';
import RepairItGame from '../components/games/RepairItGame';


const GameCard: React.FC<{ 
    game: Game; 
    user: User | null;
    isAdminMode: boolean;
    onPlay: (game: Game) => void;
    onEdit: (game: Game) => void;
    onDelete: (gameId: number) => void;
}> = ({ game, user, isAdminMode, onPlay, onEdit, onDelete }) => (
    <div className="modern-card p-0 overflow-hidden fade-in-section relative flex flex-col">
        {user?.isAdmin && isAdminMode && (
            <div className="card-admin-controls">
                <button onClick={() => onEdit(game)} className="admin-action-button !bg-slate-700 !text-white" title="Editar juego">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(game.id)} className="admin-action-button !bg-slate-700 !text-white delete" title="Eliminar juego">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        )}
        <img src={game.image} alt={game.title} className="w-full h-40 object-cover" />
        <div className="p-4 flex flex-col flex-grow">
            <p className="text-sm text-secondary font-semibold mb-1">{game.category}</p>
            <h3 className="font-bold text-lg text-text-main mb-3 flex-grow">{game.title}</h3>
            <button 
                onClick={() => onPlay(game)}
                className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                disabled={!user}
            >
                {user ? 'Jugar' : 'Inicia Sesión'}
            </button>
        </div>
    </div>
);

// FIX: Completed the GamePlayer component, added a return statement, and filled out the switch logic. This fixes the type error.
const GamePlayer: React.FC<{
    game: Game;
    onClose: () => void;
    onGameComplete: (points: number) => void;
}> = ({ game, onClose, onGameComplete }) => {
    
    const handleCompletion = useCallback(() => {
        onGameComplete(game.payload.points);
    }, [onGameComplete, game.payload.points]);
    
    const renderGame = () => {
        const { payload } = game;
        switch(game.type) {
            case 'trivia':
                if (!payload.questions) return <div>Error: Faltan datos para el juego de trivia.</div>;
                return <TriviaGame questions={payload.questions} onComplete={handleCompletion} />;
            case 'memory':
                if (!payload.cards) return <div>Error: Faltan datos para el juego de memoria.</div>;
                return <MemoryGame cards={payload.cards} onComplete={handleCompletion} />;
            case 'sorting':
                 if (!payload.items || !payload.bins || !payload.duration) return <div>Error: Faltan datos para el juego de clasificación.</div>;
                 return <SortingGame items={payload.items} bins={payload.bins} duration={payload.duration} onComplete={handleCompletion} />;
            case 'hangman':
                if (!payload.words) return <div>Error: Faltan datos para el juego de ahorcado.</div>;
                return <HangmanGame words={payload.words} onComplete={handleCompletion} />;
            case 'chain':
                if (!payload.items || !payload.bins || !payload.duration) return <div>Error: Faltan datos para el juego de cadena.</div>;
                return <RecyclingChainGame items={payload.items} bins={payload.bins} duration={payload.duration} onComplete={handleCompletion} />;
            case 'catcher':
                if (!payload.fallingItems || !payload.lives) return <div>Error: Faltan datos para el juego de atrapar.</div>;
                return <WasteCatcherGame items={payload.fallingItems} lives={payload.lives} onComplete={handleCompletion} />;
            case 'repair':
                if (!payload.repairableItems || !payload.timePerItem) return <div>Error: Faltan datos para el juego de reparar.</div>;
                return <RepairItGame items={payload.repairableItems} timePerItem={payload.timePerItem} onComplete={handleCompletion} />;
            default:
                return <div>Juego no reconocido.</div>
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col relative">
            <header className="p-4 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-text-main">{game.title}</h2>
                <button onClick={onClose} className="text-3xl leading-none px-2 rounded-full text-text-secondary hover:text-text-main transition-colors">&times;</button>
            </header>
            <div className="flex-1 p-2 sm:p-4 overflow-y-auto bg-slate-100 text-text-main">
                {renderGame()}
            </div>
        </div>
    );
};

// FIX: Added the main page component and default export to fix the import error.
const JuegosPage: React.FC<{ user: User | null; onUserAction: (action: GamificationAction, payload?: any) => void; isAdminMode: boolean; }> = ({ user, onUserAction, isAdminMode }) => {
    const [games, setGames] = useState(initialGames);
    const [activeGame, setActiveGame] = useState<Game | null>(null);
    const [editingGame, setEditingGame] = useState<Game | null>(null);

    const handleGameComplete = (points: number) => {
        onUserAction('complete_game', { points });
        setTimeout(() => {
            setActiveGame(null);
        }, 3000); // Close modal after 3 seconds
    };
    
    const handleDeleteGame = (gameId: number) => {
        if (window.confirm("¿Seguro que quieres eliminar este juego?")) {
            setGames(prev => prev.filter(g => g.id !== gameId));
        }
    };

    return (
        <>
            <div className="bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-text-main">Juegos Educativos</h1>
                        <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">¡Aprende sobre reciclaje de la forma más divertida y gana EcoPuntos!</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {games.map(game => (
                            <GameCard 
                                key={game.id} 
                                game={game}
                                user={user}
                                isAdminMode={isAdminMode}
                                onPlay={setActiveGame}
                                onEdit={() => {}} // Placeholder for edit functionality
                                onDelete={handleDeleteGame}
                            />
                        ))}
                    </div>
                </div>
            </div>
            {activeGame && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-2xl h-[90vh] max-h-[600px] bg-surface rounded-2xl shadow-2xl overflow-hidden">
                       <GamePlayer 
                            game={activeGame}
                            onClose={() => setActiveGame(null)}
                            onGameComplete={handleGameComplete}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default JuegosPage;
