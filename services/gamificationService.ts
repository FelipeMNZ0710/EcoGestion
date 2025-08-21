import type { User, GamificationAction, Notification } from '../types';
import { allAchievements } from '../data/achievementsData';

const actionPoints: Record<GamificationAction, number> = {
    send_message: 5,
    check_in: 25,
    report_punto_verde: 15,
    daily_login: 10,
};

export const processAction = (user: User, action: GamificationAction): { updatedUser: User; notifications: Omit<Notification, 'id'>[] } => {
    if (user.isAdmin) {
        // Admins don't participate in the gamification system
        return { updatedUser: user, notifications: [] };
    }

    const updatedUser = { ...user, stats: { ...user.stats }, achievements: [...user.achievements] };
    const notifications: Omit<Notification, 'id'>[] = [];
    const pointsToAdd = actionPoints[action] || 0;
    
    // 1. Update stats and points
    updatedUser.points += pointsToAdd;
    
    switch(action) {
        case 'send_message':
            updatedUser.stats.messagesSent += 1;
            break;
        case 'check_in':
            updatedUser.stats.pointsVisited += 1;
            break;
        case 'report_punto_verde':
            updatedUser.stats.reportsMade += 1;
            break;
        case 'daily_login':
            updatedUser.stats.dailyLogins += 1;
            updatedUser.lastLogin = new Date().toISOString().split('T')[0];
            break;
    }

    if (pointsToAdd > 0) {
        notifications.push({
            type: 'points',
            title: '¡Puntos ganados!',
            message: `Ganaste ${pointsToAdd} EcoPuntos.`,
            icon: '✨'
        });
    }

    // 2. Check for new achievements
    allAchievements.forEach(achievementDef => {
        const userAchievement = updatedUser.achievements.find(a => a.id === achievementDef.id);
        if (userAchievement && !userAchievement.unlocked) {
            let isUnlocked = false;
            const { type, stat, value } = achievementDef.unlockCondition;

            if (type === 'points' && updatedUser.points >= value) {
                isUnlocked = true;
            } else if (type === 'stat' && stat && updatedUser.stats[stat] >= value) {
                isUnlocked = true;
            }

            if (isUnlocked) {
                userAchievement.unlocked = true;
                notifications.push({
                    type: 'achievement',
                    title: '¡Logro Desbloqueado!',
                    message: `Conseguiste el logro: ${achievementDef.name}`,
                    icon: achievementDef.icon
                });
            }
        }
    });

    return { updatedUser, notifications };
};
