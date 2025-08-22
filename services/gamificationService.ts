import type { User, GamificationAction, Notification, Material } from '../types';
import { allAchievements } from '../data/achievementsData';

const actionPoints: Record<GamificationAction, number> = {
    send_message: 5,
    check_in: 25,
    report_punto_verde: 15,
    daily_login: 10,
    complete_quiz: 50,
};

export const processAction = (user: User, action: GamificationAction, payload?: any): { updatedUser: User; notifications: Omit<Notification, 'id'>[] } => {
    if (user.isAdmin) {
        // Admins don't participate in the gamification system
        return { updatedUser: user, notifications: [] };
    }

    const updatedUser = { 
        ...user, 
        stats: { ...user.stats }, 
        achievements: user.achievements.map(a => ({...a})) // Deep copy achievements
    };

    // Ensure stats properties are initialized to prevent NaN errors
    const stats = updatedUser.stats;
    stats.messagesSent = stats.messagesSent || 0;
    stats.pointsVisited = stats.pointsVisited || 0;
    stats.reportsMade = stats.reportsMade || 0;
    stats.dailyLogins = stats.dailyLogins || 0;
    stats.completedQuizzes = stats.completedQuizzes || [];
    stats.quizzesCompleted = stats.quizzesCompleted || 0;

    const notifications: Omit<Notification, 'id'>[] = [];
    let pointsToAdd = actionPoints[action] || 0;
    
    // 1. Update stats based on action
    switch(action) {
        case 'send_message':
            stats.messagesSent += 1;
            break;
        case 'check_in':
            stats.pointsVisited += 1;
            break;
        case 'report_punto_verde':
            stats.reportsMade += 1;
            break;
        case 'daily_login':
            stats.dailyLogins += 1;
            updatedUser.lastLogin = new Date().toISOString().split('T')[0];
            break;
        case 'complete_quiz':
            if (payload?.material && !stats.completedQuizzes.includes(payload.material as Material)) {
                stats.completedQuizzes.push(payload.material as Material);
                stats.quizzesCompleted = stats.completedQuizzes.length;
            } else {
                // If quiz was already completed, don't award points again
                pointsToAdd = 0;
            }
            break;
    }

    if (pointsToAdd > 0) {
        updatedUser.points += pointsToAdd;
        notifications.push({
            type: 'points',
            title: '¡Puntos ganados!',
            message: `Ganaste ${pointsToAdd} EcoPuntos por esta acción.`,
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
            } else if (type === 'stat' && stat) {
                const statValue = updatedUser.stats[stat];
                // Check for both number and array length to be future-proof
                if (typeof statValue === 'number' && statValue >= value) {
                     isUnlocked = true;
                } else if (Array.isArray(statValue) && statValue.length >= value) {
                    isUnlocked = true;
                }
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
