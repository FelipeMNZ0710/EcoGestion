const gamesData = [
    // Existing Games
    {
        id: 1,
        title: 'Súper Trivia de Reciclaje',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400',
        type: 'trivia',
        learningObjective: 'Pon a prueba tus conocimientos generales sobre reciclaje con preguntas de opción múltiple.',
        payload: {
            points: 50,
            questions: [
                { question: '¿De qué color es el contenedor para plásticos?', options: ['Azul', 'Verde', 'Amarillo'], correctAnswer: 2 },
                { question: '¿Se puede reciclar una caja de pizza con grasa?', options: ['Sí, siempre', 'Solo las partes limpias', 'No, nunca'], correctAnswer: 1 },
                { question: '¿Cuántas veces se puede reciclar el vidrio?', options: ['Una vez', 'Diez veces', 'Infinitas veces'], correctAnswer: 2 },
            ]
        },
        rating: 4.5
    },
    {
        id: 2,
        title: 'Memoria Ecológica',
        category: 'Memoria',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=400',
        type: 'memory',
        learningObjective: 'Encuentra los pares de objetos reciclables y agiliza tu mente.',
        payload: {
            points: 60,
            cards: [
                { id: '1', content: ' BOTELLA ', type: 'icon' }, { id: '2', content: ' CAJA ', type: 'icon' }, { id: '3', content: ' FRASCO ', type: 'icon' },
                { id: '4', content: ' LATA ', type: 'icon' }, { id: '5', content: ' DIARIO ', type: 'icon' }, { id: '6', content: ' TETRA ', type: 'icon' },
            ]
        },
        rating: 4.7
    },
    {
        id: 3,
        title: 'Clasificación Rápida',
        category: 'Habilidad',
        image: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?q=80&w=400',
        type: 'sorting',
        learningObjective: 'Arrastra cada residuo a su contenedor correcto antes de que se acabe el tiempo.',
        payload: {
            points: 75,
            items: [
                { id: 's1', name: 'Botella', image: ' BOTELLA ', correctBin: 'plastico' },
                { id: 's2', name: 'Periódico', image: ' DIARIO ', correctBin: 'papel' },
                { id: 's3', name: 'Frasco', image: ' FRASCO ', correctBin: 'vidrio' },
                { id: 's4', name: 'Lata atún', image: ' LATA ', correctBin: 'metales' },
                { id: 's5', name: 'Cáscara', image: ' PLATANO ', correctBin: 'organico' },
            ],
            bins: ['plastico', 'papel', 'vidrio', 'metales', 'organico'],
            duration: 60
        },
        rating: 4.8
    },
    {
        id: 4,
        title: 'Ahorcado Sostenible',
        category: 'Palabras',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400',
        type: 'hangman',
        learningObjective: 'Adivina la palabra relacionada con el medio ambiente antes de que el planeta se contamine.',
        payload: {
            points: 40,
            words: [
                { word: 'COMPOSTAJE', hint: 'Proceso de descomposición de materia orgánica.' },
                { word: 'REUTILIZAR', hint: 'Darle una segunda vida a un objeto.' },
                { word: 'SOSTENIBLE', hint: 'Desarrollo que satisface las necesidades del presente.' },
            ]
        },
        rating: 4.3
    },
    {
        id: 5,
        title: 'Cadena de Reciclaje',
        category: 'Estrategia',
        image: 'https://images.unsplash.com/photo-1590212151086-e0ad63f46f34?q=80&w=400',
        type: 'chain',
        learningObjective: 'Organiza los pasos del proceso de reciclaje en el orden correcto.',
        payload: {
            points: 80,
            items: [],
            bins: [],
            duration: 90
        },
        rating: 4.6
    },
    {
        id: 6,
        title: 'Atrapa el Reciclable',
        category: 'Reflejos',
        image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=400',
        type: 'catcher',
        learningObjective: 'Mueve el contenedor para atrapar solo los objetos reciclables y esquivar la basura.',
        payload: {
            points: 70,
            fallingItems: [],
            lives: 3
        },
        rating: 4.7
    },
    {
        id: 7,
        title: '¡Repáralo!',
        category: 'Lógica',
        image: 'https://images.unsplash.com/photo-1473677321689-d9d1152d2f75?q=80&w=400',
        type: 'repair',
        learningObjective: 'Elige la herramienta correcta para reparar objetos rotos y darles una segunda vida.',
        payload: {
            points: 65,
            repairableItems: [],
            timePerItem: 15
        },
        rating: 4.5
    },
    // New Games
    {
        id: 8,
        title: 'Eco-Quiz Rápido',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1582494259399-5226e3523c91?q=80&w=400',
        type: 'eco-quiz',
        learningObjective: 'Responde la mayor cantidad de preguntas de verdadero o falso en 60 segundos.',
        payload: { points: 50, questions: [] },
        rating: 4.2
    },
    {
        id: 9,
        title: 'Encuentra el Intruso',
        category: 'Lógica',
        image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=400',
        type: 'find-the-intruder',
        learningObjective: 'De cuatro objetos, tres son del mismo material reciclable. ¿Cuál no pertenece?',
        payload: { points: 60 },
        rating: 4.4
    },
    {
        id: 10,
        title: 'Camino del Reciclaje',
        category: 'Estrategia',
        image: 'https://images.unsplash.com/photo-150906351-4955321855c3?q=80&w=400',
        type: 'recycling-path',
        learningObjective: 'Responde preguntas para avanzar por un laberinto y llegar a la planta de reciclaje.',
        payload: { points: 70 },
        rating: 4.0
    },
    {
        id: 11,
        title: 'Limpia el Río',
        category: 'Habilidad',
        image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d95?q=80&w=400',
        type: 'river-cleaner',
        learningObjective: 'Haz clic en la basura para sacarla del río, pero ten cuidado de no tocar a los peces.',
        payload: { points: 60 },
        rating: 4.6
    },
    {
        id: 12,
        title: 'Secuencia de Compost',
        category: 'Lógica',
        image: 'https://images.unsplash.com/photo-1604262228942-005239b1a293?q=80&w=400',
        type: 'compost-sequence',
        learningObjective: 'Ordena los pasos para crear una compostera casera de forma correcta.',
        payload: { points: 75 },
        rating: 4.5
    },
    {
        id: 13,
        title: '¿Mito o Realidad?',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1565785835976-3921b3334d4e?q=80&w=400',
        type: 'myth-busters',
        learningObjective: 'Desafía tus conocimientos sobre reciclaje. ¿Puedes distinguir los mitos de las verdades?',
        payload: { points: 55 },
        rating: 4.7
    },
    {
        id: 14,
        title: 'Conecta el Concepto',
        category: 'Lógica',
        image: 'https://images.unsplash.com/photo-1497091071254-cc9b2ba7c48a?q=80&w=400',
        type: 'concept-connector',
        learningObjective: 'Une con una línea los conceptos de sostenibilidad con sus definiciones correctas.',
        payload: { points: 65 },
        rating: 4.3
    },
    {
        id: 15,
        title: 'Ahorro de Agua',
        category: 'Estrategia',
        image: 'https://images.unsplash.com/photo-1550940393-27c13e8b4185?q=80&w=400',
        type: 'water-saver',
        learningObjective: 'Toma decisiones diarias en una casa virtual para minimizar el consumo de agua.',
        payload: { points: 80 },
        rating: 4.8
    },
    {
        id: 16,
        title: 'Palabra Secreta',
        category: 'Palabras',
        image: 'https://images.unsplash.com/photo-1524312251015-d72a0d15f3b1?q=80&w=400',
        type: 'eco-wordle',
        learningObjective: 'Adivina la palabra ecológica del día en seis intentos o menos. ¡Un nuevo desafío cada día!',
        payload: { points: 50 },
        rating: 4.6
    },
    {
        id: 17,
        title: 'Constructor Sostenible',
        category: 'Lógica',
        image: 'https://images.unsplash.com/photo-1481439775953-6597c5c7d0d6?q=80&w=400',
        type: 'sustainable-builder',
        learningObjective: 'Construye una casa virtual eligiendo los materiales más ecológicos para cada parte.',
        payload: { points: 70 },
        rating: 4.1
    },
    {
        id: 18,
        title: 'Impacto Energético',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400',
        type: 'energy-impact',
        learningObjective: 'Compara dos actividades y elige cuál consume menos energía. ¡Aprende a ser más eficiente!',
        payload: { points: 60 },
        rating: 4.4
    },
    {
        id: 19,
        title: 'Sonidos de la Naturaleza',
        category: 'Conocimiento',
        image: 'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=80&w=400',
        type: 'nature-sounds',
        learningObjective: 'Escucha un sonido y adivina a qué animal o fenómeno natural pertenece. ¡Agudiza tu oído!',
        payload: { points: 50 },
        rating: 4.5
    },
    {
        id: 20,
        title: 'Encuentra las Diferencias',
        category: 'Habilidad',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400',
        type: 'spot-the-difference',
        learningObjective: 'Observa dos escenas y encuentra las 5 diferencias que hacen a una más sostenible que la otra.',
        payload: { points: 65 },
        rating: 4.7
    }
];

module.exports = gamesData;
