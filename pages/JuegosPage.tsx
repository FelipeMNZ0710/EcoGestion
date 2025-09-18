
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Game, GamificationAction, GameType } from '../types';
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
        {isAdminMode && (
            <div className="card-admin-controls">
                <button onClick={(e) => { e.stopPropagation(); onEdit(game); }} className="admin-action-button" title="Editar juego">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(game.id); }} className="admin-action-button delete" title="Eliminar juego">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        )}
        <img src={game.image} alt={game.title} className="w-full h-40 object-cover" />
        <div className="p-4 flex flex-col flex-grow">
            <p className="text-sm text-secondary font-semibold mb-1">{game.category}</p>
            <h3 className="font-bold text-lg text-text-main mb-2">{game.title}</h3>
            <p className="text-xs text-text-secondary mb-4 flex-grow">{game.learningObjective}</p>
            <button 
                onClick={() => onPlay(game)}
                className="w-full mt-auto bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                disabled={!user}
            >
                {user ? 'Jugar' : 'Inicia Sesión'}
            </button>
        </div>
    </div>
);

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
                return <TriviaGame questions={payload.questions} onComplete={handleCompletion} onClose={onClose} />;
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
        <div className="w-full h-full flex flex-col relative bg-surface">
            <header className="p-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
                <h2 className="text-xl font-bold text-text-main">{game.title}</h2>
                <button onClick={onClose} className="text-3xl leading-none px-2 rounded-full text-text-secondary hover:text-text-main transition-colors">&times;</button>
            </header>
            <div className="flex-1 p-2 sm:p-4 overflow-y-auto bg-background">
                {renderGame()}
            </div>
        </div>
    );
};

const GameEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (game: Omit<Game, 'id'> & { id?: number }) => void;
    game: Game | null;
}> = ({ isOpen, onClose, onSave, game }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [type, setType] = useState<GameType>('trivia');
    const [learningObjective, setLearningObjective] = useState('');
    const [payload, setPayload] = useState('{}');

    useEffect(() => {
        if (game) {
            setTitle(game.title);
            setCategory(game.category);
            setImage(game.image);
            setType(game.type);
            setLearningObjective(game.learningObjective);
            setPayload(JSON.stringify(game.payload, null, 2));
        } else {
            setTitle('');
            setCategory('');
            setImage('');
            setType('trivia');
            setLearningObjective('');
            setPayload('{\n  "points": 100,\n  "questions": []\n}');
        }
    }, [game, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsedPayload = JSON.parse(payload);
            onSave({ id: game?.id, title, category, image, type, learningObjective, payload: parsedPayload });
        } catch (error) {
            alert("Error: El JSON en 'Payload' no es válido.");
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">{game ? 'Editar Juego' : 'Crear Nuevo Juego'}</h2>
                    <div className="space-y-4 modal-form">
                        <div><label>Título</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Categoría</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} required /></div>
                            <div><label>Tipo de Juego</label>
                                <select value={type} onChange={e => setType(e.target.value as GameType)}>
                                    <option value="trivia">Trivia</option><option value="memory">Memoria</option><option value="sorting">Clasificación</option>
                                    <option value="hangman">Ahorcado</option><option value="chain">Cadena</option><option value="catcher">Atrapar</option><option value="repair">Reparar</option>
                                </select>
                            </div>
                        </div>
                        <div><label>URL de la Imagen</label><input type="text" value={image} onChange={e => setImage(e.target.value)} required /></div>
                        <div><label>Objetivo de Aprendizaje</label><input type="text" value={learningObjective} onChange={e => setLearningObjective(e.target.value)} required /></div>
                        <div><label>Payload (Configuración del juego en JSON)</label><textarea value={payload} onChange={e => setPayload(e.target.value)} rows={10} className="font-mono text-sm"></textarea></div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-6"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar Juego</button></div>
                </form>
            </div>
        </div>
    );
};


const JuegosPage: React.FC<{ user: User | null; onUserAction: (action: GamificationAction, payload?: any) => void; isAdminMode: boolean; }> = ({ user, onUserAction, isAdminMode }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeGame, setActiveGame] = useState<Game | null>(null);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');
    
    const fetchGames = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/games', { cache: 'no-store' });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setGames(data);
        } catch (error) {
            console.error("Failed to fetch games:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    const gameCategories = useMemo(() => ['Todos', ...Array.from(new Set(games.map(g => g.category)))], [games]);

    const filteredGames = useMemo(() => {
        if (activeCategory === 'Todos') {
            return games;
        }
        return games.filter(g => g.category === activeCategory);
    }, [games, activeCategory]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.fade-in-section');
        elements.forEach((el) => {
            el.classList.remove('is-visible');
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [filteredGames]);

    const handleGameComplete = (points: number) => {
        onUserAction('complete_game', { points });
        setTimeout(() => {
            setActiveGame(null);
        }, 3000);
    };

    const handleOpenEditModal = (game: Game | null) => {
        setEditingGame(game);
        setIsEditModalOpen(true);
    };

    const handleSaveGame = async (gameToSave: Omit<Game, 'id' | 'learningObjective'> & { id?: number, learningObjective: string }) => {
        const method = gameToSave.id ? 'PUT' : 'POST';
        const url = gameToSave.id ? `http://localhost:3001/api/games/${gameToSave.id}` : 'http://localhost:3001/api/games';
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameToSave)
            });
            if (!response.ok) throw new Error('Failed to save game');
            setIsEditModalOpen(false);
            await fetchGames();
        } catch (error) {
            console.error('Error saving game:', error);
            alert("Error al guardar el juego.");
        }
    };
    
    const handleDeleteGame = async (gameId: number) => {
        if (window.confirm("¿Seguro que quieres eliminar este juego?")) {
            try {
                const response = await fetch(`http://localhost:3001/api/games/${gameId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete game');
                await fetchGames();
            } catch (error) {
                console.error('Error deleting game:', error);
                alert("Error al eliminar el juego.");
            }
        }
    };

    return (
        <>
            <GameEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveGame} game={editingGame} />
            <div className="bg-background pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-12 animate-fade-in-up">
                        <h1 className="text-4xl font-extrabold font-display text-text-main sm:text-5xl">Sala de Juegos Educativos</h1>
                        <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">¡Aprende sobre reciclaje de la forma más divertida y gana EcoPuntos!</p>
                        {isAdminMode && (
                             <div className="mt-6">
                                <button onClick={() => handleOpenEditModal(null)} className="cta-button">
                                    + Crear Nuevo Juego
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-8 flex flex-wrap justify-center gap-2">
                        {gameCategories.map(category => (
                            <button 
                                key={category} 
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                    activeCategory === category 
                                    ? 'bg-primary text-white' 
                                    : 'bg-surface text-text-secondary hover:bg-slate-700'
                                }`}
                            >{category}</button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="text-center py-20 text-text-secondary">Cargando juegos...</div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredGames.map(game => (
                                <GameCard 
                                    key={game.id} 
                                    game={game}
                                    user={user}
                                    isAdminMode={isAdminMode}
                                    onPlay={setActiveGame}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleDeleteGame}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {activeGame && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-2xl h-[95vh] max-h-[700px] bg-surface rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
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
