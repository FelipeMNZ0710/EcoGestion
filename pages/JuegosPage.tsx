import React, { useEffect, useState } from 'react';
import type { User } from '../types';

interface Game {
    id: number;
    title: string;
    category: string;
    image: string;
}

const initialGames: Game[] = [
    { id: 1, title: 'Clasificador de Residuos', category: 'Habilidad', image: 'https://images.unsplash.com/photo-1599827552899-62506655c64e?q=80&w=2070&auto=format=fit=crop' },
    { id: 2, title: 'Memoria Ecológica', category: 'Memoria', image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2070&auto=format=fit=crop' },
    { id: 3, title: 'Trivia del Reciclaje', category: 'Conocimiento', image: 'https://images.unsplash.com/photo-1604187351543-05ac3e6e7399?q=80&w=2070&auto=format=fit=crop' },
    { id: 4, title: 'Aventura del Compost', category: 'Simulación', image: 'https://images.unsplash.com/photo-1593113646773-535c85a0e4c0?q=80&w=2070&auto=format=fit=crop' },
];

const GameCard: React.FC<{ 
    game: Game; 
    user: User | null;
    onEdit: (game: Game) => void;
    onDelete: (gameId: number) => void;
}> = ({ game, user, onEdit, onDelete }) => (
    <div className="modern-card p-0 overflow-hidden fade-in-section relative">
        {user?.isAdmin && (
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
        <div className="p-4">
            <p className="text-sm text-secondary font-semibold mb-1">{game.category}</p>
            <h3 className="font-bold text-lg text-text-main mb-3">{game.title}</h3>
            <button className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-dark transition-colors">
                Jugar
            </button>
        </div>
    </div>
);

const GameModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (game: Omit<Game, 'id'> & { id?: number }) => void;
    game: Game | null;
}> = ({ isOpen, onClose, onSave, game }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        if (game) {
            setTitle(game.title);
            setCategory(game.category);
            setImage(game.image);
        } else {
            setTitle('');
            setCategory('');
            setImage('');
        }
    }, [game, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: game?.id, title, category, image });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">{game ? 'Editar Juego' : 'Crear Nuevo Juego'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 modal-form">
                        <div>
                            <label htmlFor="title">Título</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="category">Categoría</label>
                            <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="image">URL de la Imagen</label>
                            <input type="text" id="image" value={image} onChange={e => setImage(e.target.value)} required />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const JuegosPage: React.FC<{user: User | null}> = ({user}) => {
    const [games, setGames] = useState(initialGames);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    
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
        if (game.id) { // Editing existing game
            setGames(games.map(g => g.id === game.id ? { ...g, ...game } : g));
        } else { // Creating new game
            const newGame = { ...game, id: Date.now() };
            setGames([...games, newGame]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteGame = (gameId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este juego?')) {
            setGames(games.filter(g => g.id !== gameId));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <GameModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGame} game={editingGame} />
            <div className="text-center mb-12 fade-in-section">
                <h1 className="text-4xl font-extrabold text-text-main">Aprendé Jugando</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Poné a prueba tus conocimientos y habilidades sobre reciclaje con nuestros juegos interactivos.</p>
                {user?.isAdmin && (
                    <div className="mt-4">
                        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                            Crear Nuevo Juego
                        </button>
                    </div>
                )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {games.map((game, index) => (
                    <div key={game.id} style={{ animationDelay: `${index * 100}ms`}}>
                        <GameCard game={game} user={user} onEdit={handleOpenModal} onDelete={handleDeleteGame} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JuegosPage;