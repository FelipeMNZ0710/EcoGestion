import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import ProfileAvatar from '../components/ProfileAvatar';
import AchievementsModal from '../components/AchievementsModal';


const SocialButton: React.FC<{ platform: 'twitter' | 'instagram' | 'linkedin', url?: string, children: React.ReactNode }> = ({ platform, url, children }) => {
    if (!url) return null;
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={`social-btn ${platform}`}>
            {children}
        </a>
    );
};


const PerfilPage: React.FC<{ user: User | null, updateUser: (user: User) => void }> = ({ user, updateUser }) => {
    const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<User | null>(user);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditedUser(user);
        if (!user) {
            setIsEditing(false);
        }
    }, [user]);

    if (!user || !editedUser) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)] text-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Inicia sesión para ver tu perfil</h1>
                    <p className="text-text-secondary mt-2">Tu progreso y logros se guardarán aquí.</p>
                </div>
            </div>
        );
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'bannerUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedUser(prev => prev ? { ...prev, [field]: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSave = () => {
        if (editedUser) {
            updateUser(editedUser);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };
    
    // Calculations
    const kgRecycled = Math.floor(user.points / 10);
    const unlockedAchievements = user.achievements.filter(a => a.unlocked).length;
    const totalAchievements = user.achievements.length;
    const progress = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0;
    const latestUnlocked = user.achievements.filter(a => a.unlocked).slice(-4).reverse();

    // Mock Data
    const activityData = [
        { icon: '🎮', text: `Completaste el juego "Súper Trivia del Reciclaje".`, time: 'hace 2 horas' },
        { icon: '🏆', text: `Desbloqueaste el logro "Eco-Estudiante".`, time: 'hace 3 horas' },
        { icon: '✅', text: 'Completaste el cuestionario de Plásticos.', time: 'hace 3 horas' },
        { icon: '📍', text: 'Hiciste check-in en "Plaza San Martín".', time: 'ayer' },
    ];

    return (
        <>
            <AchievementsModal isOpen={isAchievementsModalOpen} onClose={() => setIsAchievementsModalOpen(false)} user={user} />
            <div className="bg-slate-100 min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <aside className="lg:col-span-1 animate-fade-in-up">
                            <div className="profile-card mx-auto lg:mx-0 w-full max-w-[380px] lg:max-w-none">
                                <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'bannerUrl')} accept="image/*" className="hidden" />
                                <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'profilePictureUrl')} accept="image/*" className="hidden" />
                                
                                <div className="profile-card-banner" style={{backgroundImage: `url(${editedUser.bannerUrl || 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=800&auto=format&fit=crop'})`}}>
                                    {isEditing && (
                                        <label onClick={() => bannerInputRef.current?.click()} className="edit-overlay">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </label>
                                    )}
                                </div>
                                <div className="profile-image-wrapper">
                                    {editedUser.profilePictureUrl ? (
                                        <img src={editedUser.profilePictureUrl} alt="Foto de perfil" className="profile-image-custom" />
                                    ) : (
                                        <div className="profile-avatar-default"><ProfileAvatar /></div>
                                    )}
                                    {isEditing && (
                                        <label onClick={() => avatarInputRef.current?.click()} className="edit-overlay">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </label>
                                    )}
                                </div>
                                <div className="profile-info">
                                    <div className="profile-name">{isEditing ? <input type="text" name="name" value={editedUser.name} onChange={handleInputChange} className="form-input-inline" /> : editedUser.name}</div>
                                    <div className="profile-title">{isEditing ? <input type="text" name="title" value={editedUser.title} onChange={handleInputChange} className="form-input-inline" /> : editedUser.title}</div>
                                    <div className="profile-bio">{isEditing ? <textarea name="bio" value={editedUser.bio} onChange={handleInputChange} className="form-input-inline" rows={3}></textarea> : editedUser.bio}</div>
                                    
                                    {!isEditing && (
                                        <div className="social-links">
                                            <SocialButton platform="twitter" url={editedUser.socials?.twitter}><svg viewBox="0 0 24 24"><path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path></svg></SocialButton>
                                            <SocialButton platform="instagram" url={editedUser.socials?.instagram}><svg viewBox="0 0 24 24"><path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98z"></path></svg></SocialButton>
                                            <SocialButton platform="linkedin" url={editedUser.socials?.linkedin}><svg viewBox="0 0 24 24"><path d="M22.23 0H1.77C.8 0 0 .8 0 1.77v20.46C0 23.2.8 24 1.77 24h20.46c.98 0 1.77-.8 1.77-1.77V1.77C24 .8 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76h-.03c-1.22 0-2-.83-2-1.87 0-1.06.8-1.87 2.05-1.87 1.24 0 2 .8 2.02 1.87 0 1.04-.78 1.87-2.05 1.87zM20.34 20.1h-3.63v-5.8c0-1.45-.52-2.45-1.83-2.45-1 0-1.6.67-1.87 1.32-.1.23-.11.55-.11.88v6.05H9.28s.05-9.82 0-10.84h3.63v1.54a3.6 3.6 0 0 1 3.26-1.8c2.39 0 4.18 1.56 4.18 4.89v6.21z"></path></svg></SocialButton>
                                        </div>
                                    )}
                                </div>
                                {!isEditing && <button onClick={() => setIsEditing(true)} className="cta-button mx-6 mb-6">Editar Perfil</button>}
                                
                                {isEditing && (
                                    <div className="edit-actions">
                                        <button onClick={handleCancel} className="btn btn-cancel">Cancelar</button>
                                        <button onClick={handleSave} className="btn btn-save">Guardar Cambios</button>
                                    </div>
                                )}
                            </div>
                        </aside>

                        <main className="lg:col-span-2 space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="modern-card p-6 text-center"><div className="text-4xl mb-2">✨</div><div className="text-4xl font-bold text-primary">{user.points.toLocaleString('es-AR')}</div><div className="text-sm text-text-secondary uppercase tracking-wider mt-1">EcoPuntos</div></div>
                                <div className="modern-card p-6 text-center"><div className="text-4xl mb-2">♻️</div><div className="text-4xl font-bold text-primary">{kgRecycled.toLocaleString('es-AR')}</div><div className="text-sm text-text-secondary uppercase tracking-wider mt-1">Kilos Reciclados</div></div>
                                <button onClick={() => setIsAchievementsModalOpen(true)} className="modern-card p-6 text-center"><div className="text-4xl mb-2">🏆</div><div className="text-4xl font-bold text-primary">{unlockedAchievements} / {totalAchievements}</div><div className="text-sm text-text-secondary uppercase tracking-wider mt-1">Logros</div></button>
                            </div>

                            <div className="modern-card p-6">
                                <h3 className="text-xl font-bold text-text-main mb-4">Progreso de Logros</h3>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4"><div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                                <h4 className="font-semibold text-text-main mb-3">Últimos Desbloqueados:</h4>
                                <ul className="space-y-3">
                                    {latestUnlocked.map(ach => (<li key={ach.id} className="flex items-center"><div className="text-2xl mr-4 w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full">{ach.icon}</div><div><p className="font-semibold text-text-main">{ach.name}</p><p className="text-sm text-text-secondary">{ach.description}</p></div></li>))}
                                    {latestUnlocked.length === 0 && <p className="text-text-secondary text-sm">¡Sigue participando para desbloquear tu primer logro!</p>}
                                </ul>
                            </div>

                             <div className="modern-card p-6">
                                <h3 className="text-xl font-bold text-text-main mb-4">Actividad Reciente</h3>
                                <div className="activity-feed">
                                    {activityData.map((activity, index) => (<div key={index} className="feed-item"><div className="feed-icon">{activity.icon}</div><div className="ml-4"><p className="text-text-main text-sm">{activity.text}</p><p className="text-xs text-text-secondary">{activity.time}</p></div></div>))}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PerfilPage;