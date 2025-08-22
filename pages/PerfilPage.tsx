import React from 'react';
import type { User, Achievement } from '../types';

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    return (
        <div className={`text-center p-4 transition-all duration-300 ${achievement.unlocked ? '' : 'opacity-50 grayscale'}`}>
            <div className={`text-5xl transition-transform duration-300 ${achievement.unlocked ? 'transform group-hover:scale-110' : ''}`}>
                {achievement.icon}
            </div>
            <h3 className="font-bold mt-2 text-text-main text-sm">{achievement.name}</h3>
            <p className="text-xs text-text-secondary">{achievement.description}</p>
        </div>
    );
};

const PerfilPage: React.FC<{ user: User | null }> = ({ user }) => {

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-2xl font-bold text-text-main">Inicia sesión para ver tu perfil</h1>
                <p className="text-text-secondary mt-2">Tu progreso y logros se guardarán aquí.</p>
            </div>
        );
    }
    
    // Example: 100 points = 1 tree saved, 10 points = 1kg recycled
    const treesSaved = Math.floor(user.points / 100);
    const kgRecycled = Math.floor(user.points / 10);
    const unlockedAchievements = user.achievements.filter(a => a.unlocked).length;
    const totalAchievements = user.achievements.length;

    return (
        <div className="bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* User Info Header */}
                <header className="bg-white modern-card p-6 flex flex-col sm:flex-row items-center gap-6 mb-8 animate-fade-in-up">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary text-white text-4xl font-bold rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main">{user.name}</h1>
                        <p className="text-text-secondary">{user.email}</p>
                    </div>
                     <div className="text-center sm:text-right">
                        <p className="text-lg font-semibold text-text-secondary">EcoPuntos</p>
                        <p className="text-5xl font-bold text-primary">{user.points.toLocaleString('es-AR')}</p>
                    </div>
                </header>

                {/* Stats Section */}
                <section className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="modern-card p-6 text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        <h2 className="text-lg font-semibold text-text-secondary">Tu Impacto (Estimado)</h2>
                         <p className="text-3xl font-bold text-secondary mt-2">
                           <span className="text-4xl mr-2">🌳</span> {treesSaved}
                        </p>
                         <p className="text-sm text-text-secondary">árboles salvados</p>
                    </div>
                     <div className="modern-card p-6 text-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                        <h2 className="text-lg font-semibold text-text-secondary">Material Reciclado</h2>
                        <p className="text-3xl font-bold text-secondary mt-2">
                           <span className="text-4xl mr-2">♻️</span> {kgRecycled}
                        </p>
                        <p className="text-sm text-text-secondary">kilogramos</p>
                    </div>
                     <div className="modern-card p-6 text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                        <h2 className="text-lg font-semibold text-text-secondary">Logros Obtenidos</h2>
                        <p className="text-3xl font-bold text-secondary mt-2">
                           <span className="text-4xl mr-2">🏆</span> {unlockedAchievements} / {totalAchievements}
                        </p>
                        <p className="text-sm text-text-secondary">insignias</p>
                    </div>
                </section>

                {/* Achievements Section */}
                <section className="modern-card p-6 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                    <h2 className="text-2xl font-bold text-text-main mb-4">Mi Colección de Logros</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {user.achievements.map(ach => (
                            <AchievementBadge key={ach.id} achievement={ach} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PerfilPage;