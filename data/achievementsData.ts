import type { Achievement } from '../types';

export const allAchievements: Omit<Achievement, 'unlocked'>[] = [
    { 
        id: '1', 
        name: 'Primeros Pasos', 
        description: 'Visitaste tu primer Punto Verde.', 
        icon: '👣',
        unlockCondition: { type: 'stat', stat: 'pointsVisited', value: 1 }
    },
    { 
        id: '2', 
        name: 'Miembro Activo', 
        description: 'Enviaste 10 mensajes en la comunidad.', 
        icon: '💬',
        unlockCondition: { type: 'stat', stat: 'messagesSent', value: 10 }
    },
    { 
        id: '3', 
        name: 'Guardián del Plástico', 
        description: 'Alcanzaste 500 EcoPuntos.', 
        icon: '🧴',
        unlockCondition: { type: 'points', value: 500 }
    },
    { 
        id: '4', 
        name: 'Maestro Compostador', 
        description: 'Iniciaste sesión 5 días seguidos.', 
        icon: '🌱',
        unlockCondition: { type: 'stat', stat: 'dailyLogins', value: 5 }
    },
    {
        id: '5',
        name: 'Voz de la Comunidad',
        description: 'Enviaste tu primer mensaje.',
        icon: '🗣️',
        unlockCondition: { type: 'stat', stat: 'messagesSent', value: 1 }
    },
    {
        id: '6',
        name: 'Ojo de Águila',
        description: 'Hiciste tu primer reporte de contenedor.',
        icon: '👀',
        unlockCondition: { type: 'stat', stat: 'reportsMade', value: 1 }
    },
    {
        id: '7',
        name: 'Explorador Urbano',
        description: 'Visitaste 3 Puntos Verdes diferentes.',
        icon: '🗺️',
        unlockCondition: { type: 'stat', stat: 'pointsVisited', value: 3 }
    },
    {
        id: '8',
        name: 'Colaborador Constante',
        description: 'Hiciste 5 reportes de contenedores.',
        icon: '🛠️',
        unlockCondition: { type: 'stat', stat: 'reportsMade', value: 5 }
    },
    {
        id: '9',
        name: 'Eco-Aprendiz',
        description: 'Alcanzaste 100 EcoPuntos.',
        icon: '🎓',
        unlockCondition: { type: 'points', value: 100 }
    },
    {
        id: '10',
        name: 'Hábito Verde',
        description: 'Iniciaste sesión durante una semana.',
        icon: '📅',
        unlockCondition: { type: 'stat', stat: 'dailyLogins', value: 7 }
    },
    {
        id: '11',
        name: 'Pilar de la Comunidad',
        description: 'Enviaste 50 mensajes.',
        icon: '🏛️',
        unlockCondition: { type: 'stat', stat: 'messagesSent', value: 50 }
    },
    {
        id: '12',
        name: 'Campeón del Reciclaje',
        description: 'Alcanzaste 1000 EcoPuntos.',
        icon: '🏆',
        unlockCondition: { type: 'points', value: 1000 }
    }
];
