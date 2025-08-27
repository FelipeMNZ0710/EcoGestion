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
            <div className="bg-background min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
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
                                    <div className="profile-title">{isEditing ? <input type="text" name="title" value={editedUser.title || ''} onChange={handleInputChange} className="form-input-inline" /> : editedUser.title}</div>
                                    <div className="profile-bio">{isEditing ? <textarea name="bio" value={editedUser.bio || ''} onChange={handleInputChange} className="form-input-inline" rows={3}></textarea> : editedUser.bio}</div>
                                    
                                    {!isEditing && (
                                        <div className="social-links">
                                            <SocialButton platform="twitter" url={editedUser.socials?.twitter}><svg viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg></SocialButton>
                                            <SocialButton platform="instagram" url={editedUser.socials?.instagram}><svg viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.314.935 20.644.523 19.854.218 19.09.083 18.22.015 16.947 0 15.667 0 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.06 1.17-.249 1.805-.413 2.227a3.48 3.48 0 0 1-.896 1.382c-.42.419-.82.679-1.38.896-.423.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.585-.015-4.85-.07c-1.17-.06-1.805-.249-2.227-.413a3.493 3.493 0 0 1-1.382-.896c-.42-.42-.679-.82-.896-1.38a3.37 3.37 0 0 1-.413-2.227c-.057-1.266-.07-1.646-.07-4.85s.015-3.585.07-4.85c.06-1.17.249-1.805.413-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413C8.415 2.18 8.797 2.16 12 2.16zm0 5.48c-3.12 0-5.64 2.52-5.64 5.64s2.52 5.64 5.64 5.64 5.64-2.52 5.64-5.64-2.52-5.64-5.64-5.64zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845a1.44 1.44 0 1 1 0 2.88 1.44 1.44 0 0 1 0-2.88z"/></svg></SocialButton>
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
                                <div className="w-full bg-surface rounded-full h-2.5 mb-4"><div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                                <h4 className="font-semibold text-text-main mb-3">Últimos Desbloqueados:</h4>
                                <ul className="space-y-3">
                                    {latestUnlocked.map(ach => (<li key={ach.id} className="flex items-center"><div className="text-2xl mr-4 w-8 h-8 flex items-center justify-center bg-emerald-500/20 text-emerald-300 rounded-full">{ach.icon}</div><div><p className="font-semibold text-text-main">{ach.name}</p><p className="text-sm text-text-secondary">{ach.description}</p></div></li>))}
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
