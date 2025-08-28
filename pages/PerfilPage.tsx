import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import ProfileAvatar from '../components/ProfileAvatar';
import AchievementsModal from '../components/AchievementsModal';

// --- Helper Functions & Data ---
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

const PieChart: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    let cumulative = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <svg viewBox="-1 -1 2 2" className="activity-pie-chart-svg">
            {data.map(d => {
                const percent = d.value / total;
                const [startX, startY] = getCoordinatesForPercent(cumulative);
                cumulative += percent;
                const [endX, endY] = getCoordinatesForPercent(cumulative);
                const largeArcFlag = percent > 0.5 ? 1 : 0;
                
                const pathData = [
                    `M ${startX} ${startY}`, // Move
                    `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
                    `L 0 0`, // Line to center
                ].join(' ');

                return <path key={d.label} d={pathData} fill={d.color} className="pie-chart-slice" />;
            })}
        </svg>
    );
};


// --- Main Component ---
const PerfilPage: React.FC<{ user: User | null, updateUser: (user: User) => void }> = ({ user, updateUser }) => {
    const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<User | null>(user);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditedUser(user);
        if (!user) setIsEditing(false);
    }, [user]);

    if (!user || !editedUser) {
        return (
            <div className="flex items-center justify-center pt-20 h-screen text-center">
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
        if (editedUser) updateUser(editedUser);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };
    
    const { name: levelName, icon: levelIcon } = getUserLevel(user.points);
    const { nextLevel, progress, pointsToNext } = getNextLevelInfo(user.points);
    const kgRecycled = Math.floor(user.points / 10);
    const unlockedAchievementsCount = user.achievements.filter(a => a.unlocked).length;
    const latestUnlocked = user.achievements.filter(a => a.unlocked).slice(-4).reverse();
    
    // Mock Data for Pie Chart and Activity
    const pointsBreakdown = [
        { label: 'Puntos Verdes', value: user.stats.pointsVisited * 25 + user.stats.reportsMade * 15, color: '#34D399' },
        { label: 'Juegos', value: user.stats.gamesPlayed * 110, color: '#60A5FA' }, // Average points
        { label: 'Comunidad', value: user.stats.messagesSent * 5, color: '#F87171' },
        { label: 'Guías', value: user.stats.quizzesCompleted * 50, color: '#FBBF24' },
    ];
    const activityData = [
        { icon: '🎮', text: `Completaste "Súper Trivia"`, points: 100, time: 'hace 2 horas' },
        { icon: '📍', text: 'Check-in en "Plaza San Martín"', points: 25, time: 'ayer' },
        { icon: '✅', text: 'Completaste el quiz de Plásticos', points: 50, time: 'hace 2 días' },
        { icon: '💬', text: 'Enviaste 5 mensajes en #general', points: 25, time: 'hace 3 días' },
    ];


    return (
        <>
            <AchievementsModal isOpen={isAchievementsModalOpen} onClose={() => setIsAchievementsModalOpen(false)} user={user} />
            <div className="bg-background pt-20 min-h-screen">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                    
                    {/* --- Profile Header --- */}
                    <div className="profile-header-card animate-fade-in-up">
                        <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'bannerUrl')} accept="image/*" className="hidden" />
                        <div className="profile-banner" style={{backgroundImage: `url(${editedUser.bannerUrl || 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=800&auto=format&fit=crop'})`}}>
                            {isEditing && <label onClick={() => bannerInputRef.current?.click()} className="edit-overlay rounded-t-lg"><span>Cambiar Banner</span></label>}
                        </div>
                         <div className="profile-banner-overlay"></div>
                        
                        <div className="relative p-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                            <div className="profile-avatar-wrapper flex-shrink-0">
                                <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'profilePictureUrl')} accept="image/*" className="hidden" />
                                {editedUser.profilePictureUrl ? <img src={editedUser.profilePictureUrl} alt="Foto de perfil" className="profile-avatar" /> : <div className="profile-avatar bg-surface"><ProfileAvatar /></div>}
                                <div className="profile-level-badge" title={levelName}>{levelIcon}</div>
                                {isEditing && <label onClick={() => avatarInputRef.current?.click()} className="edit-overlay rounded-full"><span>Cambiar Foto</span></label>}
                            </div>
                            <div className="flex-grow text-center sm:text-left">
                                <h1 className="text-3xl font-bold font-display text-text-main">{user.name}</h1>
                                <p className="text-primary font-semibold">{levelName}</p>
                            </div>
                            {!isEditing && <button onClick={() => setIsEditing(true)} className="cta-button !py-2 !px-4">Editar Perfil</button>}
                        </div>
                    </div>

                    {/* --- Stats Bar --- */}
                    <div className="stats-bar animate-fade-in-up" style={{animationDelay: '100ms'}}>
                        <div className="stat-card"><div className="stat-icon bg-primary/20 text-primary">✨</div><div><div className="stat-value">{user.points.toLocaleString('es-AR')}</div><div className="stat-label">EcoPuntos</div></div></div>
                        <div className="stat-card"><div className="stat-icon bg-blue-500/20 text-blue-400">♻️</div><div><div className="stat-value">{kgRecycled.toLocaleString('es-AR')}</div><div className="stat-label">Kilos Reciclados</div></div></div>
                        <div className="stat-card"><div className="stat-icon bg-amber-500/20 text-amber-400">🏆</div><div><div className="stat-value">{unlockedAchievementsCount}</div><div className="stat-label">Logros</div></div></div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* --- Progress & Achievements --- */}
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

                        {/* --- Activity Breakdown & Feed --- */}
                        <div className="space-y-8">
                             <div className="modern-card p-6 animate-fade-in-up" style={{animationDelay: '400ms'}}>
                                <h3 className="text-xl font-bold text-text-main mb-4">Análisis de Puntos</h3>
                                <div className="activity-pie-chart-container">
                                    <PieChart data={pointsBreakdown} />
                                    <div className="pie-chart-legend flex-grow">
                                        <ul>
                                            {pointsBreakdown.map(d => <li key={d.label}><span className="legend-dot" style={{backgroundColor: d.color}}></span>{d.label} ({d.value} pts)</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
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