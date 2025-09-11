import React, { useState, useEffect } from 'react';
import type { User, Achievement, Page } from '../types';
import ProfileAvatar from '../components/ProfileAvatar';
import AchievementsModal from '../components/AchievementsModal';

// --- Helper Components & Data ---

const ProfileEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedFields: Partial<User>) => void;
}> = ({ isOpen, onClose, user, onSave }) => {
    const [editedUser, setEditedUser] = useState(user);

    useEffect(() => {
        setEditedUser(user);
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: Number(value) }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedFields: Partial<User> = {};
        // Compare and find what changed to send only the delta
        (Object.keys(editedUser) as Array<keyof User>).forEach(key => {
            if (editedUser[key] !== user[key]) {
                 (updatedFields as any)[key] = editedUser[key];
            }
        });
        onSave(updatedFields);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold font-display text-text-main mb-4">Editar Perfil</h2>
                    <div className="space-y-4 modal-form">
                        <div><label>Nombre Completo</label><input type="text" name="name" value={editedUser.name} onChange={handleInputChange} /></div>
                        <div><label>Título (ej. Campeón del Reciclaje)</label><input type="text" name="title" value={editedUser.title || ''} onChange={handleInputChange} /></div>
                        <div><label>Biografía</label><textarea name="bio" value={editedUser.bio || ''} onChange={handleInputChange} rows={3}></textarea></div>
                        
                        {user.role === 'dueño' && (
                            <div className="pt-4 border-t border-white/20">
                                <h3 className="font-bold text-primary">Controles de Administrador</h3>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div><label>EcoPuntos</label><input type="number" name="points" value={editedUser.points} onChange={handleStatChange} /></div>
                                    <div><label>Kilos Reciclados</label><input type="number" name="kgRecycled" value={editedUser.kgRecycled} onChange={handleStatChange} /></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const userLevels = [
    { points: 0, name: 'Novato del Reciclaje', icon: '🌱' },
    { points: 250, name: 'Aprendiz Verde', icon: '🌿' },
    { points: 500, name: 'Guardián del Plástico', icon: '🧴' },
    { points: 1000, name: 'Campeón del Reciclaje', icon: '🏆' },
    { points: 2500, name: 'Héroe de la Sostenibilidad', icon: '🦸' },
    { points: 5000, name: 'Maestro del Medio Ambiente', icon: '🌳' },
    { points: 10000, name: 'Leyenda Ecológica', icon: '🌟' },
];

const getUserLevel = (points: number) => {
    return userLevels.slice().reverse().find(level => points >= level.points) || userLevels[0];
};

const getNextLevelInfo = (points: number) => {
    const nextLevel = userLevels.find(level => points < level.points);
    if (!nextLevel) {
        return { nextLevel: null, progress: 100, pointsToNext: 0 };
    }
    const currentLevel = getUserLevel(points);
    const pointsInLevel = nextLevel.points - currentLevel.points;
    const userProgressInLevel = points - currentLevel.points;
    const progress = (userProgressInLevel / pointsInLevel) * 100;
    const pointsToNext = nextLevel.points - points;
    return { nextLevel, progress, pointsToNext };
};

// --- Main Component ---
const PerfilPage: React.FC<{ user: User | null, updateUser: (user: User) => void, setCurrentPage: (page: Page) => void }> = ({ user, updateUser, setCurrentPage }) => {
    const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!user) {
        return (
            <div className="flex items-center justify-center pt-20 h-screen text-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Inicia sesión para ver tu perfil</h1>
                    <p className="text-text-secondary mt-2">Tu progreso y logros se guardarán aquí.</p>
                </div>
            </div>
        );
    }
    
    const handleUpdateUser = async (updatedFields: Partial<User>) => {
        try {
            const response = await fetch(`http://localhost:3001/api/users/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFields)
            });
            if (!response.ok) throw new Error('Falló la actualización del perfil');
            const updatedUserFromServer = await response.json();
            
            updateUser(updatedUserFromServer);
            setIsEditModalOpen(false);

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("No se pudo guardar el perfil. Intenta de nuevo.");
        }
    };
    
    const handleToggleAchievement = async (achievementId: string, unlocked: boolean) => {
        try {
            const response = await fetch(`http://localhost:3001/api/users/${user.id}/achievements`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievementId, unlocked, adminUserId: user.id }) // Send adminUserId for verification
            });
            if (!response.ok) throw new Error('Falló la actualización de logros');
            const updatedUserFromServer = await response.json();
            updateUser(updatedUserFromServer);
        } catch (error) {
            console.error("Error toggling achievement:", error);
            alert("No se pudo actualizar el logro.");
        }
    };
    
    const isAdminMode = user.role === 'dueño' || user.role === 'moderador';
    const { name: levelName, icon: levelIcon } = getUserLevel(user.points);
    const { nextLevel, progress, pointsToNext } = getNextLevelInfo(user.points);
    const unlockedAchievementsCount = user.achievements.filter(a => a.unlocked).length;
    const latestUnlocked = user.achievements.filter(a => a.unlocked).slice(-4).reverse();
    
    const activityData = [
        { icon: '🎮', text: `Completaste "Súper Trivia"`, points: 100, time: 'hace 2 horas' },
        { icon: '📍', text: 'Check-in en "Plaza San Martín"', points: 25, time: 'ayer' },
        { icon: '✅', text: 'Completaste el quiz de Plásticos', points: 50, time: 'hace 2 días' },
        { icon: '💬', text: 'Enviaste 5 mensajes en #general', points: 25, time: 'hace 3 días' },
    ];


    return (
        <>
            <AchievementsModal 
                isOpen={isAchievementsModalOpen} 
                onClose={() => setIsAchievementsModalOpen(false)} 
                user={user} 
                isAdminMode={user.role === 'dueño'}
                onToggleAchievement={handleToggleAchievement}
            />
            <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleUpdateUser} />
            
            <div className="bg-background pt-20 min-h-screen">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                    
                    <div className="profile-header-card animate-fade-in-up">
                        <div className="profile-banner" style={{backgroundImage: `url(${user.bannerUrl || 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=800&auto=format&fit=crop'})`}}></div>
                        <div className="profile-banner-overlay"></div>
                        <div className="relative p-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                            <div className="profile-avatar-wrapper flex-shrink-0">
                                {user.profilePictureUrl ? <img src={user.profilePictureUrl} alt="Foto de perfil" className="profile-avatar" /> : <div className="profile-avatar bg-surface"><ProfileAvatar /></div>}
                                <div className="profile-level-badge" title={levelName}>{levelIcon}</div>
                            </div>
                            <div className="flex-grow text-center sm:text-left">
                                <h1 className="text-3xl font-bold font-display text-text-main">{user.name}</h1>
                                <p className="text-primary font-semibold">{user.title || levelName}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {isAdminMode && (
                                    <button onClick={() => setCurrentPage('admin')} className="cta-button !py-2 !px-4 !bg-surface hover:!bg-slate-700">
                                        Panel Admin
                                    </button>
                                )}
                                <button onClick={() => setIsEditModalOpen(true)} className="cta-button !py-2 !px-4">Editar Perfil</button>
                            </div>
                        </div>
                    </div>

                    <div className="stats-bar animate-fade-in-up" style={{animationDelay: '100ms'}}>
                        <div className="stat-card"><div className="stat-icon bg-primary/20 text-primary">✨</div><div><div className="stat-value">{user.points.toLocaleString('es-AR')}</div><div className="stat-label">EcoPuntos</div></div></div>
                        <div className="stat-card"><div className="stat-icon bg-blue-500/20 text-blue-400">♻️</div><div><div className="stat-value">{user.kgRecycled.toLocaleString('es-AR')}</div><div className="stat-label">Kilos Reciclados</div></div></div>
                        <div className="stat-card"><div className="stat-icon bg-amber-500/20 text-amber-400">🏆</div><div><div className="stat-value">{unlockedAchievementsCount}</div><div className="stat-label">Logros</div></div></div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <div className="modern-card p-6 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                                <h3 className="text-xl font-bold text-text-main mb-3">Progreso al Siguiente Nivel</h3>
                                {nextLevel ? (<><div className="w-full bg-surface rounded-full h-3 mb-2"><div className="bg-primary h-3 rounded-full" style={{ width: `${progress}%` }}></div></div><p className="text-sm text-text-secondary">Faltan <span className="font-bold text-primary">{pointsToNext.toLocaleString('es-AR')}</span> puntos para ser <span className="font-bold text-primary">{nextLevel.name}</span></p></>) : <p className="text-sm text-primary font-semibold">¡Llegaste al máximo nivel! ¡Felicitaciones!</p>}
                            </div>
                             <div className="modern-card p-6 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-text-main">Escaparate de Logros</h3>
                                    <button onClick={() => setIsAchievementsModalOpen(true)} className="text-sm text-primary hover:underline">Ver Todos</button>
                                </div>
                                {latestUnlocked.length > 0 ? (
                                    <div className="achievement-showcase-grid">
                                        {latestUnlocked.map(ach => <div key={ach.id} className="achievement-showcase-item" title={`${ach.name}: ${ach.description}`}><span className="text-2xl mr-3">{ach.icon}</span> <span className="text-sm font-semibold truncate text-text-secondary">{ach.name}</span></div>)}
                                    </div>
                                ) : <p className="text-text-secondary text-sm">¡Sigue participando para desbloquear tu primer logro!</p>}
                            </div>
                        </div>
                        <div className="space-y-8">
                             <div className="modern-card p-6 animate-fade-in-up" style={{animationDelay: '500ms'}}>
                                <h3 className="text-xl font-bold text-text-main mb-2">Actividad Reciente</h3>
                                <div>
                                    {activityData.map((activity, index) => (
                                        <div key={index} className="activity-feed-item">
                                            <div className="activity-icon">{activity.icon}</div>
                                            <div className="flex-grow"><p className="text-text-main text-sm">{activity.text}</p><p className="text-xs text-text-secondary">{activity.time}</p></div>
                                            <div className="activity-points">+{activity.points} pts</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PerfilPage;