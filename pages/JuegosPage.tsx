import React, { useEffect } from 'react';

const GameCard = ({ title, category, image }: { title: string, category: string, image: string }) => (
    <div className="neo-card p-0 overflow-hidden fade-in-section">
        <img src={image} alt={title} className="w-full h-40 object-cover" />
        <div className="p-4">
            <p className="text-sm text-secondary font-semibold mb-1">{category}</p>
            <h3 className="font-bold text-lg text-text-main mb-3">{title}</h3>
            <button className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-green-800 transition-colors">
                Jugar
            </button>
        </div>
    </div>
);

const JuegosPage: React.FC = () => {
    const games = [
        { title: 'Clasificador de Residuos', category: 'Habilidad', image: 'https://images.unsplash.com/photo-1599827552899-62506655c64e?q=80&w=2070&auto=format&fit=crop' },
        { title: 'Memoria Ecológica', category: 'Memoria', image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2070&auto=format&fit=crop' },
        { title: 'Trivia del Reciclaje', category: 'Conocimiento', image: 'https://images.unsplash.com/photo-1604187351543-05ac3e6e7399?q=80&w=2070&auto=format&fit=crop' },
        { title: 'Aventura del Compost', category: 'Simulación', image: 'https://images.unsplash.com/photo-1593113646773-535c85a0e4c0?q=80&w=2070&auto=format&fit=crop' },
    ];
    
     useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.fade-in-section');
        elements.forEach((el) => observer.observe(el));

        return () => elements.forEach((el) => observer.unobserve(el));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 fade-in-section">
                <h1 className="text-4xl font-extrabold text-text-main">Aprendé Jugando</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Poné a prueba tus conocimientos y habilidades sobre reciclaje con nuestros juegos interactivos.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {games.map((game, index) => (
                    <div key={game.title} style={{ animationDelay: `${index * 100}ms`}}>
                        <GameCard {...game} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JuegosPage;