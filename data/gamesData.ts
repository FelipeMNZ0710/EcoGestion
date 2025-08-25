import type { Game } from '../types';

export const initialGames: Game[] = [
    // 1. Arcade: Recycling Chain
    {
        id: 1,
        title: 'Cadena de Reciclaje',
        category: 'Habilidad Arcade',
        image: 'https://images.unsplash.com/photo-1597193449495-e239e2a39a2f?q=80&w=800',
        type: 'chain',
        payload: {
            points: 150,
            duration: 90,
            bins: ['plastico', 'papel', 'vidrio', 'metales'],
            items: [
                { id: 's1', name: 'Botella de Agua', image: '🍾', correctBin: 'plastico' },
                { id: 's2', name: 'Diario Viejo', image: '📰', correctBin: 'papel' },
                { id: 's3', name: 'Frasco', image: '🫙', correctBin: 'vidrio' },
                { id: 's4', name: 'Lata de Atún', image: '🥫', correctBin: 'metales' },
                { id: 's5', name: 'Caja de Cartón', image: '📦', correctBin: 'papel' },
                { id: 's6', name: 'Lata de Gaseosa', image: '🥤', correctBin: 'metales' },
                { id: 's7', name: 'Botella de Vino', image: '🍷', correctBin: 'vidrio' },
                { id: 's8', name: 'Revista', image: '📖', correctBin: 'papel' },
                { id: 's9', name: 'Envase Shampoo', image: '🧴', correctBin: 'plastico' },
            ]
        }
    },
    // 2. Arcade: Waste Catcher
    {
        id: 2,
        title: 'Atrapa el Reciclable',
        category: 'Habilidad Arcade',
        image: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?q=80&w=800',
        type: 'catcher',
        payload: {
            points: 120,
            lives: 3,
            fallingItems: [
                { id: 'c1', image: '🍾', type: 'recyclable', points: 10 },
                { id: 'c2', image: '🍎', type: 'trash', points: -5 },
                { id: 'c3', image: '📦', type: 'recyclable', points: 10 },
                { id: 'c4', image: '🥫', type: 'recyclable', points: 15 },
                { id: 'c5', image: '뼈', type: 'trash', points: -5 },
                { id: 'c6', image: '📰', type: 'recyclable', points: 10 },
                { id: 'c7', image: '🫙', type: 'recyclable', points: 10 },
                { id: 'c8', image: ' diaper ', type: 'trash', points: -10 },
            ]
        }
    },
    // 3. Arcade: Repair It!
    {
        id: 3,
        title: '¡Repáralo!',
        category: 'Lógica Rápida',
        image: 'https://images.unsplash.com/photo-1593333994577-626a2a246a16?q=80&w=800',
        type: 'repair',
        payload: {
            points: 100,
            timePerItem: 10,
            repairableItems: [
                { id: 'r1', name: 'Silla Rota', image: '🪑', toolOptions: ['🔨', '💧', '🧵'], correctTool: '🔨' },
                { id: 'r2', name: 'Ropa Rota', image: '👕', toolOptions: ['🔧', '🧵', ' gluing '], correctTool: '🧵' },
                { id: 'r3', name: 'Taza Rota', image: '☕', toolOptions: [' gluing ', '🔨', '🔩'], correctTool: ' gluing ' },
                { id: 'r4', name: 'Libro Despegado', image: '📖', toolOptions: [' watering can ', ' gluing ', '🔧'], correctTool: ' gluing ' },
                { id: 'r5', name: 'Tornillo Suelto', image: '🔩', toolOptions: ['🔨', '🔧', '🧵'], correctTool: '🔧' },
            ]
        }
    },
    // 4. Consolidated Hangman Game
    { 
        id: 4, 
        title: 'Ahorcado Ecológico', 
        category: 'Adivina la Palabra', 
        image: 'https://images.unsplash.com/photo-1550291652-6ea9114a4a41?q=80&w=800',
        type: 'hangman',
        payload: {
            points: 100,
            words: [
                { word: 'RECICLAR', hint: 'Proceso para convertir residuos en nuevos productos.' },
                { word: 'COMPOSTAJE', hint: 'Descomposición de materia orgánica para crear abono.' },
                { word: 'SOSTENIBLE', hint: 'Que se puede mantener sin agotar recursos.' },
                { word: 'REUTILIZAR', hint: 'Volver a usar un objeto para el mismo u otro fin.' },
                { word: 'ORGANICO', hint: 'Residuo de origen biológico, como restos de comida.' },
                { word: 'PLASTICO', hint: 'Material derivado del petróleo, común en botellas.' },
                { word: 'VIDRIO', hint: 'Material 100% reciclable que no pierde calidad.' },
                { word: 'ALUMINIO', hint: 'Metal ligero muy usado en latas de bebida.' },
            ]
        }
    },
    // 5. Consolidated Trivia Game
    { 
        id: 5, 
        title: 'Súper Trivia del Reciclaje', 
        category: 'Conocimiento', 
        image: 'https://images.unsplash.com/photo-1604187351543-05ac3e6e7399?q=80&w=800',
        type: 'trivia',
        payload: {
            points: 100,
            questions: [
                { question: '¿Cuál de las 3 "R" es la más importante y por qué?', options: ['Reciclar, porque convierte basura en algo nuevo', 'Reutilizar, porque da una segunda vida a las cosas', 'Reducir, porque evita generar el residuo desde el inicio'], correctAnswer: 2 },
                { question: '¿Qué material se puede reciclar infinitas veces sin perder calidad?', options: ['Plástico', 'Papel', 'Vidrio'], correctAnswer: 2 },
                { question: '¿Los tickets de supermercado (papel térmico) son reciclables?', options: ['Sí, van con el papel normal', 'No, contienen químicos que impiden su reciclaje', 'Solo si no están arrugados'], correctAnswer: 1 },
            ]
        }
    },
    // 6. Memory Game - Mixed Materials
    { 
        id: 6, 
        title: 'Memoria de Materiales', 
        category: 'Memoria', 
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800',
        type: 'memory',
        payload: {
            points: 80,
            cards: [
                { id: '1', content: '🍾', type: 'icon' }, { id: '2', content: '📦', type: 'icon' },
                { id: '3', content: '🥫', type: 'icon' }, { id: '4', content: '🫙', type: 'icon' },
                { id: '5', content: '📰', type: 'icon' }, { id: '6', content: '🧴', type: 'icon' },
                { id: '7', content: '🔩', type: 'icon' }, { id: '8', content: '🍺', type: 'icon' },
            ]
        }
    },
    // 7. Memory Game - Organic vs. Trash
    { 
        id: 7, 
        title: 'Memoria: ¿Compost o Basura?', 
        category: 'Memoria', 
        image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=800',
        type: 'memory',
        payload: {
            points: 60,
            cards: [
                { id: '1', content: '🍎', type: 'icon' }, { id: '2', content: '🍌', type: 'icon' },
                { id: '3', content: '🔋', type: 'icon' }, { id: '4', content: '🪥', type: 'icon' },
                { id: '5', content: '☕', type: 'icon' }, { id: '6', content: '🍂', type: 'icon' },
            ]
        }
    },
    // 8. Sorting Game - Basic
    { 
        id: 8, 
        title: 'Clasificador Rápido', 
        category: 'Habilidad', 
        image: 'https://images.unsplash.com/photo-1582029132869-755a953a7a2f?q=80&w=800',
        type: 'sorting',
        payload: {
            points: 100,
            duration: 60,
            bins: ['plastico', 'papel', 'vidrio'],
            items: [
                { id: 's1', name: 'Botella de Agua', image: '🍾', correctBin: 'plastico' },
                { id: 's2', name: 'Diario Viejo', image: '📰', correctBin: 'papel' },
                { id: 's3', name: 'Frasco', image: '🫙', correctBin: 'vidrio' },
                { id: 's4', name: 'Caja de Cartón', image: '📦', correctBin: 'papel' },
                { id: 's5', name: 'Botella de Gaseosa', image: '🍾', correctBin: 'plastico' },
                { id: 's6', name: 'Botella de Vino', image: '🍷', correctBin: 'vidrio' },
            ]
        }
    },
    // 9. Sorting Game - Compost
    { 
        id: 9, 
        title: 'Maestro del Compost', 
        category: 'Habilidad', 
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800',
        type: 'sorting',
        payload: {
            points: 80,
            duration: 45,
            bins: ['organico', 'papel'],
            items: [
                { id: 's14', name: 'Cáscara de Banana', image: '🍌', correctBin: 'organico' },
                { id: 's15', name: 'Servilleta Usada', image: '🧻', correctBin: 'organico' },
                { id: 's16', name: 'Caja Limpia', image: '📦', correctBin: 'papel' },
                { id: 's17', name: 'Restos de Manzana', image: '🍎', correctBin: 'organico' },
                { id: 's18', name: 'Saquito de Té', image: '☕', correctBin: 'organico' },
                { id: 's19', name: 'Hojas Secas', image: '🍂', correctBin: 'organico' },
            ]
        }
    },
];