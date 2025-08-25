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
                <button onClick={() => onEdit(game)} className="admin-action-button" title="Editar juego">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(game.id)} className="admin-action-button delete" title="Eliminar juego">
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
                className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
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
                return <TriviaGame questions={payload.questions} onComplete={handleCompletion} />;
            case 'memory':
                if (!payload.cards) return <div>Error: Faltan datos para el juego de memoria.</div>;
                return <MemoryGame cards={payload.cards} onComplete={handleCompletion} />;
            case 'sorting':
                 if (!payload.items || !payload.bins || !payload.duration) return <div>Error: Faltan datos para el juego de clasificar.</div>;
                return <SortingGame items={payload.items} bins={payload.bins} duration={payload.duration} onComplete={handleCompletion} />;
            case 'hangman':
                if (!payload.words) return <div>Error: Faltan datos para el juego del ahorcado.</div>;
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
                return <div>Tipo de juego no reconocido.</div>
        }
    }
    
    return (
        <div className="fixed inset-0 bg-slate-800/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in-up p-2 sm:p-4">
            <div className="relative w-full h-full sm:w-[95vw] sm:max-w-4xl sm:h-[95vh] bg-slate-100 rounded-lg shadow-2xl flex flex-col">
                <header className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-text-main">{game.title}</h2>
                    <button onClick={onClose} className="text-2xl leading-none px-2 text-slate-500 hover:bg-slate-200 rounded-full">&times;</button>
                </header>
                <main className="flex-1 p-2 sm:p-6 overflow-y-auto">
                    {renderGame()}
                </main>
            </div>
        </div>
    );
};

const GameModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (game: Omit<Game, 'id'> & { id?: number }) => void;
    game: Game | null;
}> = ({ isOpen, onClose, onSave, game }) => {
    const [formData, setFormData] = useState<Omit<Game, 'id' | 'payload'> & { payloadJSON: string; id?: number }>({
        title: '', category: '', image: '', type: 'trivia', payloadJSON: '{\n  "points": 50,\n  "questions": []\n}'
    });

    useEffect(() => {
        if (game) {
            setFormData({
                id: game.id,
                title: game.title,
                category: game.category,
                image: game.image,
                type: game.type,
                payloadJSON: JSON.stringify(game.payload, null, 2)
            });
        } else {
            setFormData({
                title: '', category: '', image: '', type: 'trivia', payloadJSON: '{\n  "points": 50,\n  "questions": []\n}'
            });
        }
    }, [game, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = JSON.parse(formData.payloadJSON);
            const { payloadJSON, ...rest } = formData;
            onSave({ ...rest, payload });
        } catch (error) {
            alert('Error en el formato JSON del payload. Por favor, revísalo.');
        }
    };
    
    const handleTypeChange = (type: Game['type']) => {
        let defaultPayload = {};
        switch(type) {
            case 'trivia': defaultPayload = { points: 50, questions: [{ question: "", options: ["",""], correctAnswer: 0 }] }; break;
            case 'memory': defaultPayload = { points: 60, cards: [{ id: "1", content: "♻️", type: "icon"}] }; break;
            case 'sorting': defaultPayload = { points: 100, duration: 45, bins: ["plastico", "papel"], items: [{ id: "s1", name: "Botella", image: "🍾", correctBin: "plastico" }] }; break;
            case 'hangman': defaultPayload = { points: 70, words: [{ word: "RECICLAR", hint: "Convertir residuos en nuevos productos." }] }; break;
            case 'chain': defaultPayload = { points: 150, duration: 90, bins: ["plastico", "papel"], items: [{ id: "s1", name: "Botella", image: "🍾", correctBin: "plastico" }] }; break;
            case 'catcher': defaultPayload = { points: 120, lives: 3, fallingItems: [{ id: "c1", image: "🍾", type: "recyclable", points: 10 }] }; break;
            case 'repair': defaultPayload = { points: 100, timePerItem: 10, repairableItems: [{ id: "r1", name: "Silla Rota", image: "🪑", toolOptions: ["🔨", "💧"], correctTool: "🔨" }] }; break;
        }
        setFormData({ ...formData, type, payloadJSON: JSON.stringify(defaultPayload, null, 2)});
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">{game ? 'Editar Juego' : 'Crear Nuevo Juego'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 modal-form">
                        <div><label htmlFor="title">Título</label><input type="text" id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                        <div><label htmlFor="category">Categoría</label><input type="text" id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required /></div>
                        <div><label htmlFor="image">URL de la Imagen</label><input type="text" id="image" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required /></div>
                        <div>
                            <label htmlFor="type">Tipo de Juego</label>
                            <select id="type" value={formData.type} onChange={e => handleTypeChange(e.target.value as Game['type'])}>
                                <option value="trivia">Trivia</option>
                                <option value="memory">Memoria</option>
                                <option value="sorting">Clasificador</option>
                                <option value="hangman">Ahorcado</option>
                                <option value="chain">Cadena de Reciclaje</option>
                                <option value="catcher">Atrapa Residuos</option>
                                <option value="repair">¡Repáralo!</option>
                            </select>
                        </div>
                        <div><label htmlFor="payload">Payload (JSON)</label><textarea id="payload" value={formData.payloadJSON} onChange={e => setFormData({...formData, payloadJSON: e.target.value})} rows={10} required className="font-mono text-xs" /></div>
                        <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const JuegosPage: React.FC<{user: User | null, onUserAction: (action: GamificationAction, payload?: any) => void; isAdminMode: boolean}> = ({user, onUserAction, isAdminMode}) => {
    const [games, setGames] = useState(initialGames);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [activeGame, setActiveGame] = useState<Game | null>(null);
    
     useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.fade-in-section');
        elements.forEach((el) => observer.observe(el));

        return () => elements.forEach((el) => observer.unobserve(el));
    }, [games]);

    const handleOpenModal = (game: Game | null = null) => {
        setEditingGame(game);
        setIsModalOpen(true);
    };

    const handleSaveGame = (game: Omit<Game, 'id'> & { id?: number }) => {
        if (game.id) {
            setGames(games.map(g => g.id === game.id ? { ...g, ...game } as Game : g));
        } else {
            const newGame = { ...game, id: Date.now() } as Game;
            setGames([...games, newGame]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteGame = (gameId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este juego?')) {
            setGames(games.filter(g => g.id !== gameId));
        }
    };
    
    const handleGameComplete = (points: number) => {
        onUserAction('complete_game', { points });
        setActiveGame(null); // Close the game player
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <GameModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGame} game={editingGame} />
            {activeGame && <GamePlayer game={activeGame} onClose={() => setActiveGame(null)} onGameComplete={handleGameComplete} />}

            <div className="text-center mb-12 fade-in-section">
                <h1 className="text-4xl font-extrabold text-text-main">Aprendé Jugando</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Poné a prueba tus conocimientos y habilidades sobre reciclaje con nuestros juegos interactivos.</p>
                {user?.isAdmin && isAdminMode && (
                    <div className="mt-6">
                        <button onClick={() => handleOpenModal()} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
                            + Crear Nuevo Juego
                        </button>
                    </div>
                )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {games.map((game, index) => (
                    <div key={game.id} style={{ animationDelay: `${index * 50}ms`}}>
                        <GameCard 
                            game={game} 
                            user={user} 
                            isAdminMode={isAdminMode} 
                            onPlay={setActiveGame}
                            onEdit={handleOpenModal} 
                            onDelete={handleDeleteGame} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JuegosPage;