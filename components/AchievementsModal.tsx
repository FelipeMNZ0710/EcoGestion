import React from 'react';
import type { User, Achievement } from '../types';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const AchievementTile: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const isUnlocked = achievement.unlocked;

    return (
        <div className={`achievement-tile ${isUnlocked ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">
                {isUnlocked ? achievement.icon : '🔒'}
            </div>
            <div className="achievement-info">
                <h4 className="achievement-name">{achievement.name}</h4>
                <p className="achievement-desc">{achievement.description}</p>
            </div>
        </div>
    );
};


const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const unlockedCount = user.achievements.filter(a => a.unlocked).length;
    const totalCount = user.achievements.length;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content !max-w-3xl !max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-text-main">Mis Logros</h2>
                        <p className="text-sm text-text-secondary">Desbloqueados: {unlockedCount} de {totalCount}</p>
                    </div>
                    <button onClick={onClose} className="text-3xl leading-none px-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">&times;</button>
                </header>
                <div className="p-6">
                    <div className="achievements-grid">
                        {user.achievements.map(ach => (
                            <AchievementTile key={ach.id} achievement={ach} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;
