import type { NewsArticle } from '../types';

export const initialNews: NewsArticle[] = [
    { 
        id: 1,
        featured: true, 
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop",
        category: "Iniciativas",
        title: "Lanzamos nuevo programa de reciclaje en escuelas primarias de Formosa",
        date: "2024-07-15",
        excerpt: "En colaboración con la Municipalidad, EcoGestión inicia un ambicioso programa educativo para fomentar la separación de residuos desde temprana edad en más de 20 instituciones.",
        content: [
            { type: 'text', text: "EcoGestión se enorgullece en anunciar el lanzamiento oficial del programa 'Pequeños Gigantes del Reciclaje', una iniciativa diseñada para llevar la educación ambiental directamente a las aulas de las escuelas primarias de nuestra ciudad. El programa, desarrollado en estrecha colaboración con la Secretaría de Medio Ambiente de la Municipalidad de Formosa, busca inculcar hábitos de reciclaje sostenibles en los más jóvenes." },
            { type: 'text', text: "A lo largo de los próximos seis meses, nuestro equipo visitará más de 20 instituciones educativas, realizando talleres interactivos, juegos y demostraciones prácticas sobre cómo separar correctamente los residuos en casa y en la escuela. Cada escuela participante recibirá contenedores de reciclaje diferenciados y material didáctico para continuar con la labor educativa." },
            { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1200&auto=format&fit=crop', mimeType: 'image/jpeg' },
            { type: 'text', text: "'Creemos que la educación es la herramienta más poderosa para generar un cambio cultural a largo plazo', comentó Sergio Rolón, director de EcoGestión. 'Si los niños aprenden hoy la importancia de cuidar nuestro planeta, se convertirán en adultos responsables que liderarán el camino hacia un futuro más verde para Formosa'." }
        ]
    },
    { 
        id: 2,
        featured: false,
        image: "https://images.unsplash.com/photo-1605170425218-9df782293e27?q=80&w=2070&auto=format&fit=crop",
        category: "Consejos",
        title: "5 formas creativas de reutilizar frascos de vidrio en casa",
        date: "2024-07-12",
        excerpt: "Antes de llevar tus frascos al punto verde, ¡dales una segunda vida! Te mostramos algunas ideas prácticas y decorativas para aprovechar al máximo este versátil material.",
        content: [
            { type: 'text', text: "El vidrio es un material noble y 100% reciclable, pero antes de que inicie su viaje hacia una nueva botella, podemos darle múltiples usos en nuestro hogar. La reutilización es un pilar fundamental de la sostenibilidad. Aquí te dejamos 5 ideas sencillas:" },
            { type: 'list', items: [
                "**Almacenamiento en la cocina:** Son perfectos para guardar legumbres, arroz, especias o incluso tus propias conservas caseras. ¡Adiós a los paquetes de plástico!",
                "**Portalápices y organizadores:** Decora un frasco a tu gusto y úsalo para mantener ordenados tus lápices, pinceles de maquillaje o herramientas pequeñas.",
                "**Macetas para plantas pequeñas:** Son ideales para suculentas, cactus o para germinar semillas. Un toque verde y sostenible para cualquier rincón.",
                "**Portavelas o farolillos:** Coloca una vela pequeña dentro para crear un ambiente cálido y acogedor. Puedes decorarlos con cuerda o pintura para un look más rústico.",
                "**Kits de regalo:** Rellena un frasco con ingredientes para hacer galletas, sales de baño caseras o dulces. ¡Un regalo original y con conciencia ecológica!"
            ]}
        ]
    },
    { 
        id: 3,
        featured: false,
        image: "https://images.unsplash.com/photo-1588289223825-c6b7d5930e84?q=80&w=2070&auto=format&fit=crop",
        category: "Eventos",
        title: "Éxito total en la jornada de limpieza en la Costanera",
        date: "2024-07-10",
        excerpt: "Más de 150 voluntarios se unieron el pasado sábado para participar en la limpieza de la ribera, recolectando más de 500 kg de residuos en una mañana de acción comunitaria.",
        content: [
            { type: 'text', text: "El pasado sábado, la comunidad de Formosa demostró una vez más su compromiso con el medio ambiente. Más de 150 voluntarios, equipados con guantes y bolsas, se dieron cita en la Costanera para participar en la 'Jornada de Limpieza Ribereña', organizada por EcoGestión." },
            { type: 'text', text: "Durante más de tres horas, familias, grupos de amigos y ciudadanos comprometidos recorrieron la orilla del río, recolectando una cantidad impresionante de residuos. En total, se lograron juntar más de 500 kilogramos de basura, de los cuales una gran parte eran plásticos de un solo uso, botellas y latas." },
            { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1618477247222-acbdbb515c48?q=80&w=1200&auto=format&fit=crop', mimeType: 'image/jpeg' },
            { type: 'text', text: "Agradecemos profundamente a cada persona que dedicó su mañana a esta causa. Estas acciones no solo limpian nuestros espacios naturales, sino que también generan una conciencia invaluable sobre el impacto de nuestros hábitos de consumo." }
        ]
    },
    {
        id: 4,
        featured: false,
        image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop",
        category: "Tecnología",
        title: "Nuestra nueva app móvil te ayuda a reciclar desde tu bolsillo",
        date: "2024-07-08",
        excerpt: "Presentamos la aplicación de EcoGestión, diseñada para poner toda la información sobre reciclaje al alcance de tu mano, con notificaciones y seguimiento de tu impacto.",
        content: [
            { type: 'text', text: "La tecnología es una gran aliada para la sostenibilidad. Por eso, estamos emocionados de presentar la nueva aplicación móvil de EcoGestión, ya disponible para su descarga. Nuestro objetivo es hacer que reciclar sea más fácil e intuitivo que nunca." },
            { type: 'list', items: [
                "**Mapa Interactivo:** Encuentra Puntos Verdes en tiempo real.",
                "**Guía de Reciclaje:** Consulta qué puedes reciclar y cómo hacerlo correctamente.",
                "**Escáner con IA:** ¿Dudas sobre un envase? Usa la cámara de tu celular para identificarlo.",
                "**Perfil Personal:** Sigue tu progreso, gana puntos y desbloquea logros."
            ]},
            { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop', mimeType: 'image/jpeg' },
            { type: 'text', text: "'Queremos que cada ciudadano tenga un experto en reciclaje en su bolsillo. Con esta app, eliminamos las barreras y hacemos que la información sea accesible para todos', afirma el equipo de desarrollo." }
        ]
    },
    {
        id: 5,
        featured: false,
        image: "https://images.unsplash.com/photo-1567445657303-35a41b248a3c?q=80&w=1200&auto=format&fit=crop",
        category: "Comunidad",
        title: "El 'Mercado de Trueque Verde' fomenta la reutilización y el comercio local",
        date: "2024-07-05",
        excerpt: "El primer Mercado de Trueque Verde fue un éxito, donde los vecinos intercambiaron objetos en buen estado, dándoles una segunda vida y fortaleciendo los lazos comunitarios.",
        content: [
            { type: 'text', text: "Con el lema 'Lo que no usas, a otro le sirve', el pasado fin de semana se celebró el primer Mercado de Trueque Verde en la Plaza San Martín. El evento, que superó todas las expectativas de convocatoria, reunió a cientos de vecinos que intercambiaron ropa, libros, herramientas y juguetes en perfecto estado." },
            { type: 'text', text: "La iniciativa busca promover la reutilización como una alternativa al consumo desmedido y a la generación de residuos. 'Es increíble la cantidad de cosas valiosas que tenemos en casa y no usamos. El trueque no solo es ecológico, sino que también nos conecta como comunidad', comentó una de las participantes. Dado el éxito, se planea realizar el mercado el primer sábado de cada mes." }
        ]
    },
    {
        id: 6,
        featured: false,
        image: "https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1200&auto=format&fit=crop",
        category: "Innovación",
        title: "Compostaje comunitario: El proyecto piloto que transforma residuos orgánicos",
        date: "2024-07-02",
        excerpt: "Inicia en el barrio Don Bosco un proyecto piloto de compostaje comunitario. Los vecinos podrán llevar sus residuos orgánicos a un centro para producir abono para las plazas.",
        content: [
            { type: 'text', text: "Los residuos orgánicos representan casi el 50% de la basura que generamos en nuestros hogares. Para darles un tratamiento adecuado, EcoGestión ha lanzado un proyecto piloto de compostaje comunitario en el barrio Don Bosco. Se instalaron tres composteras de gran tamaño en un espacio cedido por el centro vecinal." },
            { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1604245743899-b7b2a65a3297?q=80&w=1200&auto=format&fit=crop', mimeType: 'image/jpeg' },
            { type: 'text', text: "Los vecinos de la zona que se inscriban en el programa recibirán una capacitación y un recipiente para separar sus orgánicos. El compost resultante se utilizará para enriquecer la tierra de las plazas y espacios verdes del barrio, cerrando el ciclo de la materia orgánica de forma local y sostenible." }
        ]
    },
    {
        id: 7,
        featured: false,
        image: "https://images.unsplash.com/photo-1558221623-23191394b917?q=80&w=1200&auto=format&fit=crop",
        category: "Educación",
        title: "Guía para un picnic sin residuos: Disfrutá de la naturaleza sin dejar rastro",
        date: "2024-06-28",
        excerpt: "Con la llegada del buen tiempo, los picnics son el plan perfecto. Te damos consejos prácticos para organizar una salida al aire libre generando la menor cantidad de basura posible.",
        content: [
            { type: 'text', text: "Disfrutar de nuestros parques y espacios verdes es un placer, y podemos hacerlo de una manera que respete el entorno. Organizar un picnic de bajo impacto es más fácil de lo que parece. Aquí tienes algunos consejos:" },
            { type: 'list', items: [
                "**Lleva vajilla reutilizable:** Utiliza platos, cubiertos y vasos de tu casa en lugar de descartables.",
                "**Usa servilletas de tela:** Son más absorbentes y se pueden lavar y reutilizar infinidad de veces.",
                "**Prepara la comida en casa:** Lleva los alimentos en recipientes reutilizables para evitar envases y envoltorios.",
                "**Bebidas en botellas grandes:** Compra una botella grande de bebida para compartir en lugar de varias individuales.",
                "**No olvides una bolsa para residuos:** Lleva siempre una bolsa para juntar lo poco que generes y, si es posible, una extra para recoger basura que otros hayan dejado."
            ]}
        ]
    }
];