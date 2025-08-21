import React, { useEffect } from 'react';

const NewsCard = ({ image, category, title, date, featured = false }: { image: string, category: string, title: string, date: string, featured?: boolean }) => {
    if (featured) {
        return (
            <div className="col-span-1 md:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden group fade-in-section">
                <div className="grid md:grid-cols-2">
                    <img src={image} alt={title} className="w-full h-64 object-cover"/>
                    <div className="p-6 flex flex-col justify-center">
                        <p className="text-sm text-secondary font-semibold mb-2">{category}</p>
                        <h3 className="text-2xl font-bold text-text-main mb-3 group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-text-secondary text-sm mb-4">{date}</p>
                        <a href="#" className="font-semibold text-primary self-start">Leer más &rarr;</a>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group fade-in-section">
            <img src={image} alt={title} className="w-full h-48 object-cover"/>
            <div className="p-4">
                <p className="text-sm text-secondary font-semibold mb-2">{category}</p>
                <h3 className="font-bold text-lg text-text-main mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-text-secondary text-xs mb-3">{date}</p>
                <a href="#" className="font-semibold text-sm text-primary">Leer más &rarr;</a>
            </div>
        </div>
    );
};

const SidebarWidget: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 fade-in-section">
        <h3 className="font-bold text-lg text-text-main border-b-2 border-gray-100 pb-2 mb-3">{title}</h3>
        {children}
    </div>
);


const NoticiasPage: React.FC = () => {
    
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
        <div className="bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12 fade-in-section">
                    <h1 className="text-4xl font-extrabold text-text-main">Noticias y Novedades</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Mantenete al día con las últimas noticias, eventos y consejos de la comunidad de Formosa Recicla.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="grid md:grid-cols-2 gap-6">
                            <NewsCard 
                                featured 
                                image="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop"
                                category="Iniciativas"
                                title="Lanzamos nuevo programa de reciclaje en escuelas primarias"
                                date="15 de Julio, 2024"
                            />
                             <NewsCard 
                                image="https://images.unsplash.com/photo-1605170425218-9df782293e27?q=80&w=2070&auto=format&fit=crop"
                                category="Consejos"
                                title="5 formas creativas de reutilizar frascos de vidrio en casa"
                                date="12 de Julio, 2024"
                            />
                             <NewsCard 
                                image="https://images.unsplash.com/photo-1588289223825-c6b7d5930e84?q=80&w=2070&auto=format&fit=crop"
                                category="Eventos"
                                title="Resumen de la jornada de limpieza en la costanera"
                                date="10 de Julio, 2024"
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <SidebarWidget title="Categorías">
                           <ul className="space-y-2 text-text-secondary">
                               <li><a href="#" className="hover:text-primary">Iniciativas (5)</a></li>
                               <li><a href="#" className="hover:text-primary">Consejos (8)</a></li>
                               <li><a href="#" className="hover:text-primary">Eventos (3)</a></li>
                               <li><a href="#" className="hover:text-primary">Comunidad (2)</a></li>
                           </ul>
                        </SidebarWidget>
                         <SidebarWidget title="Próximos Eventos">
                           <div className="space-y-3">
                               <div>
                                   <p className="font-semibold text-text-main">Taller de Compostaje Urbano</p>
                                   <p className="text-sm text-text-secondary">3 de Agosto, 2024 - Centro Cultural</p>
                               </div>
                               <div>
                                   <p className="font-semibold text-text-main">Feria de Recicladores</p>
                                   <p className="text-sm text-text-secondary">17 de Agosto, 2024 - Plaza San Martín</p>
                               </div>
                           </div>
                        </SidebarWidget>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default NoticiasPage;