export interface NewsArticle {
    id: number;
    image: string;
    category: string;
    title: string;
    date: string;
    featured: boolean;
}

export const initialNews: NewsArticle[] = [
    { 
        id: 1,
        featured: true, 
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop",
        category: "Iniciativas",
        title: "Lanzamos nuevo programa de reciclaje en escuelas primarias",
        date: "15 de Julio, 2024"
    },
    { 
        id: 2,
        featured: false,
        image: "https://images.unsplash.com/photo-1605170425218-9df782293e27?q=80&w=2070&auto=format&fit=crop",
        category: "Consejos",
        title: "5 formas creativas de reutilizar frascos de vidrio en casa",
        date: "12 de Julio, 2024"
    },
    { 
        id: 3,
        featured: false,
        image: "https://images.unsplash.com/photo-1588289223825-c6b7d5930e84?q=80&w=2070&auto=format&fit=crop",
        category: "Eventos",
        title: "Resumen de la jornada de limpieza en la costanera",
        date: "10 de Julio, 2024"
    },
];
