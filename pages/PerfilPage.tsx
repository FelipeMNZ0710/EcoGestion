import React, { useState, useEffect, useRef } from 'react';
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

const ImageCropModal: React.FC<{
    imageSrc: string;
    aspectRatio: number; // width / height
    onClose: () => void;
    onConfirm: (croppedImage: string) => void;
}> = ({ imageSrc, aspectRatio, onClose, onConfirm }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 / aspectRatio });

    const handleConfirmCrop = () => {
        if (!imgRef.current) return;
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        
        const outputWidth = aspectRatio > 1 ? 1200 : 400;
        const outputHeight = outputWidth / aspectRatio;
        
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const cropX = (crop.x / 100) * img.width * scaleX;
        const cropY = (crop.y / 100) * img.height * scaleY;
        const cropWidth = (crop.width / 100) * img.width * scaleX;
        const cropHeight = (crop.height / 100) * img.height * scaleY;

        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
        onConfirm(canvas.toDataURL('image/jpeg', 0.9));
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="crop-modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-4">
                    <h3 className="text-lg font-bold text-center">Ajusta tu Imagen</h3>
                    <div className="crop-container my-4">
                        <img ref={imgRef} src={imageSrc} alt="Previsualización para recortar" />
                        <div className="crop-area" style={{ 
                            left: `${crop.x}%`, top: `${crop.y}%`, 
                            width: `${crop.width}%`, height: `${crop.height}%`,
                        }}>
                             <div className="crop-handle crop-handle-nw"></div>
                             <div className="crop-handle crop-handle-ne"></div>
                             <div className="crop-handle crop-handle-sw"></div>
                             <div className="crop-handle crop-handle-se"></div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                         <button onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500">Cancelar</button>
                         <button onClick={handleConfirmCrop} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar</button>
                    </div>
                </div>
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

const PerfilPage: React.FC<{ user: User | null, updateUser: (user: User) => void, setCurrentPage: (page: Page) => void }> = ({ user, updateUser, setCurrentPage }) => {
    const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [croppingState, setCroppingState] = useState<{
        isOpen: boolean; imageSrc: string | null; aspect: number; type: 'avatar' | 'banner';
    }>({ isOpen: false, imageSrc: null, aspect: 1, type: 'avatar' });
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            setCroppingState({ isOpen: false, imageSrc: null, aspect: 1, type: 'avatar' });

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
                body: JSON.stringify({ achievementId, unlocked, adminUserId: user.id })
            });
            if (!response.ok) throw new Error('Falló la actualización de logros');
            const updatedUserFromServer = await response.json();
            updateUser(updatedUserFromServer);
        } catch (error) {
            console.error("Error toggling achievement:", error);
            alert("No se pudo actualizar el logro.");
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setCroppingState({
                isOpen: true,
                imageSrc: e.target?.result as string,
                aspect: type === 'avatar' ? 1 : 1200 / 400,
                type: type
            });
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Reset input
    };

    const onCropConfirm = (croppedImage: string) => {
        if (croppingState.type === 'avatar') {
            handleUpdateUser({ profilePictureUrl: croppedImage });
        } else {
            handleUpdateUser({ bannerUrl: croppedImage });
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
            
            {croppingState.isOpen && croppingState.imageSrc && (
                <ImageCropModal 
                    imageSrc={croppingState.imageSrc}
                    aspectRatio={croppingState.aspect}
                    onClose={() => setCroppingState(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={onCropConfirm}
                />
            )}

            <div className="bg-background pt-20 min-h-screen">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                    
                    <div className="profile-header-card animate-fade-in-up">
                        <div className="profile-banner" style={{backgroundImage: `url(${user.bannerUrl || 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=800&auto=format&fit=crop'})`}}>
                            {/* FIX: Replaced truthiness check on void return type with a function block. */}
                             <div className="edit-overlay" onClick={() => { fileInputRef.current?.setAttribute('data-type', 'banner'); fileInputRef.current?.click(); }} title="Cambiar banner">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        </div>
                        <div className="profile-banner-overlay"></div>
                        <div className="relative p-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                            <div className="profile-avatar-wrapper flex-shrink-0">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileChange(e, e.target.getAttribute('data-type') as 'avatar' | 'banner')}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                />
                                {user.profilePictureUrl ? <img src={user.profilePictureUrl} alt="Foto de perfil" className="profile-avatar" /> : <div className="profile-avatar bg-surface"><ProfileAvatar /></div>}
                                <div className="profile-level-badge" title={levelName}>{levelIcon}</div>
                                {/* FIX: Replaced truthiness check on void return type with a function block. */}
                                <div className="edit-overlay rounded-full" onClick={() => { fileInputRef.current?.setAttribute('data-type', 'avatar'); fileInputRef.current?.click(); }} title="Cambiar foto de perfil">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold font-display text-text-main">{user.name}</h1>
                                <p className="text-primary font-semibold">{user.title || levelName}</p>
                                <p className="text-sm text-text-secondary mt-2 max-w-md">{user.bio || '¡Un miembro activo de la comunidad EcoGestión!'}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <button onClick={() => setIsEditModalOpen(true)} className="cta-button !py-2 !px-4">Editar Perfil</button>
                                {isAdminMode && (
                                    <button onClick={() => setCurrentPage('admin')} className="mt-2 w-full text-center py-2 px-4 bg-slate-700 text-slate-200 text-sm rounded-md hover:bg-slate-600">
                                        Panel Admin
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modern-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-text-main">Nivel: {levelName}</span>
                            {nextLevel && <span className="text-sm text-text-secondary">Siguiente Nivel: {nextLevel.name}</span>}
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4">
                            <div className="bg-primary h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        {nextLevel && <p className="text-sm text-text-secondary mt-2 text-right">Faltan {pointsToNext.toLocaleString('es-AR')} puntos</p>}
                    </div>

                    <div className="stats-bar animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="stat-card">
                            <div className="stat-icon bg-primary/20 text-primary">✨</div>
                            <div>
                                <div className="stat-value">{user.points.toLocaleString('es-AR')}</div>
                                <div className="stat-label">EcoPuntos</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon bg-emerald-500/20 text-emerald-400">♻️</div>
                            <div>
                                <div className="stat-value">{user.kgRecycled.toLocaleString('es-AR')}</div>
                                <div className="stat-label">Kilos Reciclados</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon bg-amber-500/20 text-amber-400">🏆</div>
                            <div>
                                <div className="stat-value">{unlockedAchievementsCount} / {user.achievements.length}</div>
                                <div className="stat-label">Logros</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="modern-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold font-display text-text-main">Últimos Logros</h3>
                                <button onClick={() => setIsAchievementsModalOpen(true)} className="text-sm text-primary hover:underline">Ver Todos</button>
                            </div>
                             <div className="achievement-showcase-grid">
                                {latestUnlocked.length > 0 ? latestUnlocked.map(ach => (
                                    <div key={ach.id} className="achievement-showcase-item" title={ach.description}>
                                        <span className="text-3xl mr-3">{ach.icon}</span>
                                        <span className="font-semibold text-sm">{ach.name}</span>
                                    </div>
                                )) : <p className="text-text-secondary text-sm col-span-2">¡Sigue participando para desbloquear tu primer logro!</p>}
                            </div>
                        </div>
                        <div className="modern-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                             <h3 className="text-xl font-bold font-display text-text-main mb-4">Actividad Reciente</h3>
                             <div className="space-y-2">
                                {activityData.map((activity, index) => (
                                    <div key={index} className="activity-feed-item">
                                        <div className="activity-icon">{activity.icon}</div>
                                        <div className="flex-grow text-sm">{activity.text}</div>
                                        <div className="activity-points text-sm">+{activity.points} pts</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default PerfilPage;
