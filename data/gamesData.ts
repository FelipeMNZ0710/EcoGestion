import type { Game } from '../types';

export const initialGames: Game[] = [
    // 1. Arcade: Recycling Chain
    {
        id: 1,
        title: 'Cadena de Reciclaje',
        category: 'Habilidad Arcade',
        image: 'https://images.unsplash.com/photo-1597193449495-e239e2a39a2f?q=80&w=800',
        type: 'chain',
        learningObjective: 'Mejora tu velocidad para identificar y clasificar múltiples tipos de residuos en una cinta transportadora.',
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
        learningObjective: 'Distingue rápidamente entre residuos reciclables y basura común mientras caen del cielo.',
        payload: {
            points: 120,
            lives: 3,
            fallingItems: [
                { id: 'c1', image: '🍾', type: 'recyclable', points: 10 },
                { id: 'c2', image: '🍎', type: 'trash', points: -5 },
                { id: 'c3', image: '📦', type: 'recyclable', points: 10 },
                { id: 'c4', image: '🥫', type: 'recyclable', points: 15 },
                { id: 'c5', image: '🦴', type: 'trash', points: -5 },
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
        learningObjective: 'Aprende sobre la importancia de reparar objetos para extender su vida útil, eligiendo la herramienta correcta.',
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
    // 4. Word: Hangman Game
    { 
        id: 4, 
        title: 'Ahorcado Ecológico', 
        category: 'Adivina la Palabra', 
        image: 'https://images.unsplash.com/photo-1550291652-6ea9114a4a41?q=80&w=800',
        type: 'hangman',
        learningObjective: 'Amplía tu vocabulario sobre sostenibilidad adivinando conceptos clave del reciclaje y el medio ambiente.',
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
    // 5. Knowledge: Trivia Game
    { 
        id: 5, 
        title: 'Súper Trivia del Reciclaje', 
        category: 'Conocimiento', 
        image: 'https://images.unsplash.com/photo-1604187351543-05ac3e6e7399?q=80&w=800',
        type: 'trivia',
        learningObjective: 'Pon a prueba tu conocimiento sobre las 3 "R", los tipos de materiales y los mitos comunes del reciclaje.',
        payload: {
            points: 100,
            questions: [
                { question: '¿Cuál de las 3 "R" es la más importante y por qué?', options: ['Reciclar, porque convierte basura en algo nuevo', 'Reutilizar, porque da una segunda vida a las cosas', 'Reducir, porque evita generar el residuo desde el inicio'], correctAnswer: 2 },
                { question: '¿Qué material se puede reciclar infinitas veces sin perder calidad?', options: ['Plástico', 'Papel', 'Vidrio'], correctAnswer: 2 },
                { question: '¿Los tickets de supermercado (papel térmico) son reciclables?', options: ['Sí, van con el papel normal', 'No, contienen químicos que impiden su reciclaje', 'Solo si no están arrugados'], correctAnswer: 1 },
            ]
        }
    },
    // 6. Memory: Mixed Materials
    {
        id: 6,
        title: 'Memoria de Símbolos',
        category: 'Memoria',
        image: 'https://images.unsplash.com/photo-1591123583272-9a8cb487f137?q=80&w=800',
        type: 'memory',
        learningObjective: 'Entrena tu memoria visual asociando pares de símbolos relacionados con la ecología y la sostenibilidad.',
        payload: {
            points: 80,
            cards: [
                { id: 'm1', content: '♻️', type: 'icon' },
                { id: 'm2', content: '🌱', type: 'icon' },
                { id: 'm3', content: '💧', type: 'icon' },
                { id: 'm4', content: '🌍', type: 'icon' },
                { id: 'm5', content: '💡', type: 'icon' },
                { id: 'm6', content: '🌳', type: 'icon' },
            ]
        }
    },
    // 7. Sorting: Quick Sort
    {
        id: 7,
        title: 'Clasificación Rápida',
        category: 'Clasificación',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800',
        type: 'sorting',
        learningObjective: 'Domina la separación de residuos básicos (plástico, papel y orgánico) bajo la presión del tiempo.',
        payload: {
            points: 120,
            duration: 60,
            bins: ['plastico', 'organico', 'papel'],
            items: [
                { id: 'sort1', name: 'Botella de Gaseosa', image: '🍾', correctBin: 'plastico' },
                { id: 'sort2', name: 'Cáscara de Banana', image: '🍌', correctBin: 'organico' },
                { id: 'sort3', name: 'Caja de Cereal', image: '📦', correctBin: 'papel' },
                { id: 'sort4', name: 'Pote de Yogurt', image: '🍦', correctBin: 'plastico' },
                { id: 'sort5', name: 'Servilleta Usada', image: '🧻', correctBin: 'organico' },
                { id: 'sort6', name: 'Sobre de Papel', image: '✉️', correctBin: 'papel' },
            ]
        }
    },
    // 8. Knowledge: True or False
    {
        id: 8,
        title: 'Trivia: Verdadero o Falso',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=800',
        type: 'trivia',
        learningObjective: 'Desafía tus conocimientos sobre reciclaje y desmiente mitos comunes con preguntas de verdadero o falso.',
        payload: {
            points: 100,
            questions: [
                { question: 'Verdadero o Falso: Las pilas se pueden tirar en la basura común.', options: ['Verdadero', 'Falso'], correctAnswer: 1 },
                { question: 'Verdadero o Falso: El aceite de cocina usado se puede tirar por el desagüe.', options: ['Verdadero', 'Falso'], correctAnswer: 1 },
                { question: 'Verdadero o Falso: Todos los plásticos son igualmente reciclables.', options: ['Verdadero', 'Falso'], correctAnswer: 1 },
            ]
        }
    },
    // 9. Memory: Organic Pairs
    {
        id: 9,
        title: 'Memoria de Pares Orgánicos',
        category: 'Memoria',
        image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=800',
        type: 'memory',
        learningObjective: 'Identifica y memoriza diferentes tipos de residuos orgánicos que son perfectos para el compostaje.',
        payload: {
            points: 80,
            cards: [
                { id: 'mem1', content: '🍎', type: 'icon' },
                { id: 'mem2', content: '🍌', type: 'icon' },
                { id: 'mem3', content: '🥕', type: 'icon' },
                { id: 'mem4', content: '🥚', type: 'icon' },
                { id: 'mem5', content: '🌿', type: 'icon' },
                { id: 'mem6', content: '☕', type: 'icon' },
            ]
        }
    },
    // 10. Arcade: Landfill Adventure
    {
        id: 10,
        title: 'Aventura en el Vertedero',
        category: 'Habilidad Arcade',
        image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800',
        type: 'catcher',
        learningObjective: 'Evita que los residuos peligrosos contaminen el suelo mientras atrapas los materiales reciclables.',
        payload: {
            points: 150,
            lives: 5,
            fallingItems: [
                { id: 'c9', image: '📰', type: 'recyclable', points: 10 },
                { id: 'c10', image: '🔋', type: 'trash', points: -10 },
                { id: 'c11', image: '🛍️', type: 'recyclable', points: 5 },
                { id: 'c12', image: '🍖', type: 'trash', points: -5 },
                { id: 'c13', image: '🫙', type: 'recyclable', points: 15 },
            ]
        }
    },
    // 11. Word: Green Words
    {
        id: 11,
        title: 'Palabras Verdes',
        category: 'Adivina la Palabra',
        image: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=800',
        type: 'hangman',
        learningObjective: 'Aprende y refuerza el significado de conceptos clave que definen un futuro más verde y sostenible.',
        payload: {
            points: 100,
            words: [
                { word: 'ENERGIA', hint: 'Se ahorra al reciclar.' },
                { word: 'CONTAMINACION', hint: 'Se reduce al separar residuos.' },
                { word: 'NATURALEZA', hint: 'La protegemos al reciclar.' },
                { word: 'FUTURO', hint: 'Lo cuidamos con acciones sostenibles.' },
            ]
        }
    },
    // 12. Knowledge: Materials Trivia
    {
        id: 12,
        title: 'Trivia de Materiales',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1599378249363-233f283d8234?q=80&w=800',
        type: 'trivia',
        learningObjective: 'Conoce en qué contenedor va cada tipo de residuo y aprende a identificar los símbolos de reciclaje.',
        payload: {
            points: 100,
            questions: [
                { question: '¿De qué color suele ser el contenedor para el vidrio?', options: ['Azul', 'Amarillo', 'Verde'], correctAnswer: 2 },
                { question: '¿Las latas de aerosol vacías van en el contenedor de...?', options: ['Plásticos', 'Metales', 'Basura común'], correctAnswer: 1 },
                { question: 'El símbolo PET (un 1 en un triángulo) se encuentra comúnmente en...', options: ['Botellas de bebida', 'Envases de shampoo', 'Bolsas de supermercado'], correctAnswer: 0 },
            ]
        }
    },
    // 13. Sorting: Beat the Clock
    {
        id: 13,
        title: 'Clasifica a Contrarreloj',
        category: 'Clasificación',
        image: 'https://images.unsplash.com/photo-1582408921715-18e7806367c2?q=80&w=800',
        type: 'sorting',
        learningObjective: 'Pon a prueba tu agilidad mental clasificando vidrio y metales antes de que se acabe el tiempo.',
        payload: {
            points: 150,
            duration: 45,
            bins: ['vidrio', 'metales'],
            items: [
                { id: 'sort7', name: 'Botella de Cerveza', image: '🍺', correctBin: 'vidrio' },
                { id: 'sort8', name: 'Lata de Gaseosa', image: '🥤', correctBin: 'metales' },
                { id: 'sort9', name: 'Frasco de Mermelada', image: '🫙', correctBin: 'vidrio' },
                { id: 'sort10', name: 'Lata de Conservas', image: '🥫', correctBin: 'metales' },
                { id: 'sort11', name: 'Botella de Perfume', image: '🌸', correctBin: 'vidrio' },
            ]
        }
    },
    // 14. Memory: Tools Memory
    {
        id: 14,
        title: 'Memoria de Herramientas',
        category: 'Memoria',
        image: 'https://images.unsplash.com/photo-1505798577795-20b127d1d974?q=80&w=800',
        type: 'memory',
        learningObjective: 'Asocia las herramientas de reparación con su función, reforzando la idea de "reutilizar y reparar".',
        payload: {
            points: 80,
            cards: [
                { id: 'mem7', content: '🔨', type: 'icon' },
                { id: 'mem8', content: '🔧', type: 'icon' },
                { id: 'mem9', content: '🧵', type: 'icon' },
                { id: 'mem10', content: ' gluing ', type: 'icon' },
                { id: 'mem11', content: '🔩', type: 'icon' },
                { id: 'mem12', content: '🪚', type: 'icon' },
            ]
        }
    },
    // 15. Knowledge: Did you know...?
    {
        id: 15,
        title: '¿Sabías Qué...?',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1580687442759-3d6481a54a49?q=80&w=800',
        type: 'trivia',
        learningObjective: 'Aprende datos de impacto sorprendentes sobre el ahorro de energía y recursos que se logra al reciclar.',
        payload: {
            points: 100,
            questions: [
                { question: 'Reciclar una lata de aluminio ahorra energía para hacer funcionar un TV por...', options: ['10 minutos', '1 hora', '3 horas'], correctAnswer: 2 },
                { question: '¿Cuántos árboles salva una tonelada de papel reciclado?', options: ['5', '17', '50'], correctAnswer: 1 },
                { question: 'El plástico puede tardar hasta... en descomponerse.', options: ['50 años', '200 años', '1000 años'], correctAnswer: 2 },
            ]
        }
    },
    // 16. Arcade: Sustainable Factory
    {
        id: 16,
        title: 'Fábrica Sostenible',
        category: 'Habilidad Arcade',
        image: 'https://images.unsplash.com/photo-1555529399-659f4a4b816?q=80&w=800',
        type: 'chain',
        learningObjective: 'Gestiona una línea de producción sostenible, separando papel y plástico para crear nuevos productos.',
        payload: {
            points: 150,
            duration: 90,
            bins: ['papel', 'plastico'],
            items: [
                { id: 's10', name: 'Pote de Crema', image: '🧴', correctBin: 'plastico' },
                { id: 's11', name: 'Caja de Zapatos', image: '📦', correctBin: 'papel' },
                { id: 's12', name: 'Botella de Jugo', image: '🍾', correctBin: 'plastico' },
                { id: 's13', name: 'Tubo de Cartón', image: '🧻', correctBin: 'papel' },
                { id: 's14', name: 'Bolsa de Plástico', image: '🛍️', correctBin: 'plastico' },
                { id: 's15', name: 'Hoja de Papel', image: '📄', correctBin: 'papel' },
            ]
        }
    },
    // 17. Sorting: Hazard vs. Safe
    {
        id: 17,
        title: 'Peligro vs. Seguro',
        category: 'Clasificación',
        image: 'https://images.unsplash.com/photo-1576794026823-c6b7d5930e84?q=80&w=800',
        type: 'sorting',
        learningObjective: 'Aprende a diferenciar entre residuos orgánicos seguros y residuos peligrosos que requieren un trato especial.',
        payload: {
            points: 100,
            duration: 60,
            bins: ['metales', 'organico'], // 'metales' = hazard, 'organico' = safe
            items: [
                { id: 'sort12', name: 'Pila', image: '🔋', correctBin: 'metales' },
                { id: 'sort13', name: 'Foco Quemado', image: '💡', correctBin: 'metales' },
                { id: 'sort14', name: 'Manzana Mordida', image: '🍎', correctBin: 'organico' },
                { id: 'sort15', name: 'Lata de Pintura', image: '🎨', correctBin: 'metales' },
                { id: 'sort16', name: 'Hueso de Pollo', image: '🍗', correctBin: 'organico' },
            ]
        }
    },
    // 18. Arcade: Coastal Cleanup
    {
        id: 18,
        title: 'Limpieza Costera',
        category: 'Habilidad Arcade',
        image: 'https://images.unsplash.com/photo-1566412329402-9a3c2691b0f0?q=80&w=800',
        type: 'catcher',
        learningObjective: 'Comprende el impacto de la basura en los ecosistemas acuáticos, rescatando la vida marina de los residuos.',
        payload: {
            points: 120,
            lives: 3,
            fallingItems: [
                { id: 'c14', image: '🍾', type: 'recyclable', points: 10 },
                { id: 'c15', image: '🐟', type: 'trash', points: -10 },
                { id: 'c16', image: '🥫', type: 'recyclable', points: 10 },
                { id: 'c17', image: '🛍️', type: 'recyclable', points: 15 },
                { id: 'c18', image: '🐢', type: 'trash', points: -10 },
            ]
        }
    },
    // 19. Memory: Animal Pairs
    {
        id: 19,
        title: 'Memoria Animal',
        category: 'Memoria',
        image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=800',
        type: 'memory',
        learningObjective: 'Asocia animales con sus hábitats, reforzando la importancia de proteger los ecosistemas naturales.',
        payload: {
            points: 80,
            cards: [
                { id: 'mem13', content: '🐢', type: 'icon' },
                { id: 'mem14', content: '🐋', type: 'icon' },
                { id: 'mem15', content: '🐒', type: 'icon' },
                { id: 'mem16', content: '🦅', type: 'icon' },
                { id: 'mem17', content: '🌳', type: 'icon' },
                { id: 'mem18', content: '🌊', type: 'icon' },
            ]
        }
    },
    // 20. Knowledge: Final Trivia
    {
        id: 20,
        title: 'Trivia Final',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800',
        type: 'trivia',
        learningObjective: 'Consolida tu conocimiento con preguntas avanzadas sobre economía circular y el impacto global de los residuos.',
        payload: {
            points: 150,
            questions: [
                { question: '¿Qué significa "economía circular"?', options: ['Un tipo de moneda', 'Un modelo de usar y tirar', 'Un modelo que reutiliza y recicla para minimizar residuos'], correctAnswer: 2 },
                { question: '¿Cuál es el principal problema de las colillas de cigarrillo?', options: ['Su mal olor', 'Están hechas de un plástico no biodegradable', 'Manchan el suelo'], correctAnswer: 1 },
                { question: '¿Qué es el "supra-reciclaje" (upcycling)?', options: ['Reciclar en la montaña', 'Convertir residuos en algo de mayor valor', 'Un tipo de ciclismo'], correctAnswer: 1 },
            ]
        }
    },
    // 21. NEW: Compost Master
    {
        id: 21,
        title: 'Maestro del Compost',
        category: 'Clasificación',
        image: 'https://images.unsplash.com/photo-1604245743899-b7b2a65a3297?q=80&w=800',
        type: 'sorting',
        learningObjective: 'Aprende qué residuos orgánicos son aptos para el compostaje y cuáles deben evitarse.',
        payload: {
            points: 100,
            duration: 60,
            bins: ['organico', 'plastico'], // plastico = "no compostable"
            items: [
                { id: 'compost1', name: 'Cáscara de Huevo', image: '🥚', correctBin: 'organico' },
                { id: 'compost2', name: 'Restos de Carne', image: '🥩', correctBin: 'plastico' },
                { id: 'compost3', name: 'Saquito de Té', image: '☕', correctBin: 'organico' },
                { id: 'compost4', name: 'Huesos', image: '🦴', correctBin: 'plastico' },
                { id: 'compost5', name: 'Hojas Secas', image: '🍂', correctBin: 'organico' },
            ]
        }
    },
    // 22. NEW: Water Guardian
    {
        id: 22,
        title: 'Guardián del Agua',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1551090059-808620251916?q=80&w=800',
        type: 'trivia',
        learningObjective: 'Descubre datos impactantes sobre el consumo de agua y cómo nuestras acciones diarias pueden conservarla.',
        payload: {
            points: 100,
            questions: [
                { question: '¿Qué acción ahorra más agua?', options: ['Cerrar la canilla al cepillarse los dientes', 'Duchas de 5 minutos', 'Lavar el auto con balde en vez de manguera'], correctAnswer: 2 },
                { question: 'Un grifo que gotea puede desperdiciar hasta...', options: ['10 litros por día', '50 litros por día', '200 litros por día'], correctAnswer: 2 },
                { question: 'La mayor parte del agua dulce del planeta está en...', options: ['Ríos y lagos', 'Glaciares y casquetes polares', 'Aguas subterráneas'], correctAnswer: 1 },
            ]
        }
    },
    // 23. NEW: Energy Detective
    {
        id: 23,
        title: 'Detective Energético',
        category: 'Memoria',
        image: 'https://images.unsplash.com/photo-1588224467936-a7a5a8857416?q=80&w=800',
        type: 'memory',
        learningObjective: 'Identifica los electrodomésticos que más energía consumen (vampiros energéticos) para aprender a ahorrar.',
        payload: {
            points: 80,
            cards: [
                { id: 'energy1', content: '🔌', type: 'icon' },
                { id: 'energy2', content: '💡', type: 'icon' },
                { id: 'energy3', content: '❄️', type: 'icon' },
                { id: 'energy4', content: '🖥️', type: 'icon' },
                { id: 'energy5', content: '📺', type: 'icon' },
                { id: 'energy6', content: '🔋', type: 'icon' },
            ]
        }
    },
    // 24. NEW: Carbon Footprint Challenge
    {
        id: 24,
        title: 'Reto: Huella de Carbono',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800',
        type: 'trivia',
        learningObjective: 'Elige las acciones más sostenibles en situaciones cotidianas para reducir tu huella de carbono.',
        payload: {
            points: 120,
            questions: [
                { question: 'Para ir a un lugar a 2km, ¿qué es más ecológico?', options: ['Ir en auto', 'Ir en bicicleta', 'Ir en colectivo'], correctAnswer: 1 },
                { question: '¿Qué tipo de dieta tiene, en general, una menor huella de carbono?', options: ['Basada en plantas', 'Basada en carnes rojas', 'Basada en pollo'], correctAnswer: 0 },
                { question: 'Para reducir el consumo de energía en casa, es mejor...', options: ['Dejar las luces prendidas para no gastar el interruptor', 'Usar lámparas LED de bajo consumo', 'Usar muchas lámparas de baja potencia'], correctAnswer: 1 },
            ]
        }
    },
     // 25. NEW: Ocean Guardian
    {
        id: 25,
        title: 'Guardián del Océano',
        category: 'Habilidad Arcade',
        image: 'https://images.unsplash.com/photo-1509817523-5355934571b7?q=80&w=800',
        type: 'catcher',
        learningObjective: 'Enseña el impacto de la basura en la vida marina. ¡Atrapa los reciclables y salva a los animales!',
        payload: {
            points: 150,
            lives: 3,
            fallingItems: [
                { id: 'c19', image: '🍾', type: 'recyclable', points: 10 },
                { id: 'c20', image: '🐢', type: 'trash', points: -15 },
                { id: 'c21', image: '🥫', type: 'recyclable', points: 10 },
                { id: 'c22', image: '🐟', type: 'trash', points: -10 },
                { id: 'c23', image: '🛍️', type: 'recyclable', points: 5 },
                { id: 'c24', image: '🐬', type: 'trash', points: -15 },
            ]
        }
    },
    // 26. NEW: Dynamic Duo
    {
        id: 26,
        title: 'Dúo Dinámico',
        category: 'Lógica Rápida',
        image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800',
        type: 'repair',
        learningObjective: 'Asocia un residuo con el producto en el que se puede convertir para entender el ciclo del reciclaje.',
        payload: {
            points: 120,
            timePerItem: 8,
            repairableItems: [
                { id: 'd1', name: 'Botellas PET', image: '🍾', toolOptions: ['👕', '🧱', '📰'], correctTool: '👕' },
                { id: 'd2', name: 'Periódicos', image: '📰', toolOptions: ['🥫', '📦', '👕'], correctTool: '📦' },
                { id: 'd3', name: 'Latas de Aluminio', image: '🥫', toolOptions: ['🚲', '🍌', '🫙'], correctTool: '🚲' },
                { id: 'd4', name: 'Frascos de Vidrio', image: '🫙', toolOptions: ['👕', '🍷', '📰'], correctTool: '🍷' },
                { id: 'd5', name: 'Restos Orgánicos', image: '🍎', toolOptions: ['🌱', '🥫', '📦'], correctTool: '🌱' },
            ]
        }
    },
    // 27. NEW: Spot the Intruder
    {
        id: 27,
        title: 'Identifica el Intruso',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1604187351543-05ac3e6e7399?q=80&w=800',
        type: 'trivia',
        learningObjective: 'Agudiza tu atención para identificar qué residuo NO pertenece a un contenedor específico.',
        payload: {
            points: 100,
            questions: [
                { question: 'Contenedor AZUL (Papel): ¿Cuál es el intruso?', options: ['Revista vieja', 'Caja de cartón', 'Vaso de café usado'], correctAnswer: 2 },
                { question: 'Contenedor AMARILLO (Plástico): ¿Cuál es el intruso?', options: ['Botella de agua', 'Cepillo de dientes', 'Pote de yogurt'], correctAnswer: 1 },
                { question: 'Contenedor VERDE (Vidrio): ¿Cuál es el intruso?', options: ['Frasco de mermelada', 'Espejo roto', 'Botella de vino'], correctAnswer: 1 },
                { question: 'Contenedor GRIS (Metales): ¿Cuál es el intruso?', options: ['Lata de gaseosa', 'Pilas', 'Lata de conservas'], correctAnswer: 1 },
            ]
        }
    },
    // 28. NEW: Material Memory
    {
        id: 28,
        title: 'Memoria de Materiales',
        category: 'Memoria',
        image: 'https://images.unsplash.com/photo-1591123583272-9a8cb487f137?q=80&w=800',
        type: 'memory',
        learningObjective: 'Asocia diferentes objetos con el símbolo de su material correspondiente (color del contenedor).',
        payload: {
            points: 80,
            cards: [
                { id: 'mat1', content: '🍾', type: 'icon' },
                { id: 'mat2', content: '📰', type: 'icon' },
                { id: 'mat3', content: '🫙', type: 'icon' },
                { id: 'mat4', content: '🥫', type: 'icon' },
                { id: 'mat5', content: '🍎', type: 'icon' },
                { id: 'mat6', content: '🔋', type: 'icon' },
            ]
        }
    },
    // 29. NEW: Guess the Fact
    {
        id: 29,
        title: 'Adivina el Dato',
        category: 'Adivina la Palabra',
        image: 'https://images.unsplash.com/photo-1550291652-6ea9114a4a41?q=80&w=800',
        type: 'hangman',
        learningObjective: 'Aprende datos impactantes sobre el reciclaje completando las palabras clave que faltan.',
        payload: {
            points: 100,
            words: [
                { word: 'ARBOLES', hint: 'Reciclar una tonelada de papel salva 17 de estos.' },
                { word: 'ENERGIA', hint: 'Reciclar vidrio ahorra suficiente de esto para encender una bombilla por 4 horas.' },
                { word: 'AGUA', hint: 'Un litro de aceite de cocina usado contamina 1.000 litros de esto.' },
                { word: 'INFINITAS', hint: 'El vidrio se puede reciclar un número de veces...' },
            ]
        }
    },
];