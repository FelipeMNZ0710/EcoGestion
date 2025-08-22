import React, { useEffect, useState, useRef } from 'react';
import type { Page, User } from '../types';

interface ImpactStats {
    recycledKg: number;
    participants: number;
    points: number;
}

const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver((observedEntries) => {
      observedEntries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, options);

    return () => observer.current?.disconnect();
  }, [options]);

  const observe = (element: Element) => {
    observer.current?.observe(element);
  };

  const unobserve = (element: Element) => {
    observer.current?.unobserve(element);
  };

  return { observe, unobserve };
};

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLParagraphElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let start = 0;
                    const end = value;
                    if (start === end) return;

                    const duration = 2000;
                    const increment = end / (duration / 16); 

                    const counter = () => {
                        start += increment;
                        if (start < end) {
                           setCount(Math.ceil(start));
                           requestAnimationFrame(counter);
                        } else {
                           setCount(end);
                        }
                    };
                    requestAnimationFrame(counter);
                }
            },
            { threshold: 0.5 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [value]);
    
    const formattedCount = Math.ceil(count).toLocaleString('es-AR');

    return <p ref={ref} className="text-5xl font-extrabold text-white">{value > 1000 && count > 1000 ? '+' : ''}{formattedCount}</p>
}

const FeatureCard = ({ icon, title, text }: { icon: JSX.Element, title: string, text: string }) => (
  <div className="modern-card p-6 text-center fade-in-section">
    <div className="flex justify-center items-center mb-4 h-12 w-12 rounded-full bg-emerald-100 text-primary mx-auto">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-text-main">{title}</h3>
    <p className="text-text-secondary">{text}</p>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <details className="border-b border-slate-200 py-4 group fade-in-section">
        <summary className="flex justify-between items-center font-semibold cursor-pointer text-text-main list-none">
            <span className="text-lg">{question}</span>
            <span className="faq-arrow text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </span>
        </summary>
        <div className="faq-content-wrapper">
          <div className="faq-content pt-3">
              <p className="text-text-secondary">
                  {answer}
              </p>
          </div>
        </div>
    </details>
);

const StatsEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    stats: ImpactStats;
    onSave: (newStats: ImpactStats) => void;
}> = ({ isOpen, onClose, stats, onSave }) => {
    const [currentStats, setCurrentStats] = useState(stats);

    useEffect(() => {
        setCurrentStats(stats);
    }, [stats]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(currentStats);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">Editar Estadísticas de Impacto</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 modal-form">
                        <div>
                            <label htmlFor="recycledKg">KGs de material reciclado</label>
                            <input type="number" id="recycledKg" value={currentStats.recycledKg} onChange={e => setCurrentStats({...currentStats, recycledKg: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label htmlFor="participants">Participantes activos</label>
                            <input type="number" id="participants" value={currentStats.participants} onChange={e => setCurrentStats({...currentStats, participants: Number(e.target.value)})}/>
                        </div>
                        <div>
                            <label htmlFor="points">Puntos Verdes distribuidos</label>
                            <input type="number" id="points" value={currentStats.points} onChange={e => setCurrentStats({...currentStats, points: Number(e.target.value)})}/>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const HomePage: React.FC<{setCurrentPage: (page: Page) => void, user: User | null}> = ({setCurrentPage, user}) => {
  const { observe } = useIntersectionObserver({ threshold: 0.1 });
  const [impactStats, setImpactStats] = useState<ImpactStats>({ recycledKg: 10000, participants: 5000, points: 45 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in-section');
    elements.forEach(el => observe(el));
  }, [observe]);
  
  const handleSaveStats = (newStats: ImpactStats) => {
      setImpactStats(newStats);
      setIsModalOpen(false);
  }

  return (
    <div className="w-full">
      <StatsEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} stats={impactStats} onSave={handleSaveStats} />
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] text-white overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 hero-aurora"></div>
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop')" }}></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Juntos por una Formosa más Limpia</h1>
          <p className="text-lg md:text-xl max-w-3xl mb-8 drop-shadow-md animate-fade-in-up" style={{ animationDelay: '0.4s' }}>Descubrí cómo, dónde y por qué reciclar. Sumate al cambio y transformá tu comunidad con nosotros.</p>
          <button onClick={() => setCurrentPage('puntos-verdes')} className="bg-secondary hover:bg-lime-600 text-slate-900 font-bold py-3 px-8 rounded-full text-lg transition-transform duration-300 hover:scale-105 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            Buscar Puntos Verdes Ahora
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-section">
            <h2 className="text-3xl font-bold text-text-main">Todo lo que necesitás para reciclar</h2>
            <p className="mt-4 text-lg text-text-secondary">Herramientas y guías para hacer del reciclaje un hábito simple.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Guía de Reciclaje"
                text="Aprendé a separar tus residuos correctamente con nuestra guía detallada."
            />
            <FeatureCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                title="Mapa de Puntos Verdes"
                text="Encontrá el centro de acopio más cercano a tu ubicación en segundos."
            />
            <FeatureCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" /></svg>}
                title="Asistente Virtual"
                text="Resolvé todas tus dudas al instante con nuestro chatbot experto en reciclaje."
            />
          </div>
        </div>
      </section>

        {/* Impact Section */}
        <section className="py-20 bg-slate-800 text-white admin-controls-container">
            {user?.isAdmin && (
                <button onClick={() => setIsModalOpen(true)} className="absolute top-4 right-4 px-3 py-2 text-sm font-semibold rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                    Editar
                </button>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="fade-in-section">
                    <h2 className="text-3xl font-bold mb-10">Nuestro Impacto Colectivo</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="fade-in-section" style={{ animationDelay: '0.2s' }}>
                        <AnimatedNumber value={impactStats.recycledKg} />
                        <p className="mt-2 text-lg text-slate-300">de KGs de material reciclado al mes</p>
                    </div>
                    <div className="fade-in-section" style={{ animationDelay: '0.4s' }}>
                         <AnimatedNumber value={impactStats.participants} />
                        <p className="mt-2 text-lg text-slate-300">participando activamente</p>
                    </div>
                    <div className="fade-in-section" style={{ animationDelay: '0.6s' }}>
                        <AnimatedNumber value={impactStats.points} />
                        <p className="mt-2 text-lg text-slate-300">Puntos Verdes distribuidos</p>
                    </div>
                </div>
            </div>
        </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-section">
            <h2 className="text-3xl font-bold text-text-main">Preguntas Frecuentes</h2>
            <p className="mt-4 text-lg text-text-secondary">Respuestas rápidas a las dudas más comunes.</p>
          </div>
          <div className="space-y-2">
            <FAQItem question="¿Por qué es importante enjuagar los envases?" answer="Enjuagar los envases de plástico, vidrio o metal ayuda a prevenir malos olores y la contaminación de otros materiales reciclables, asegurando que el lote completo pueda ser procesado correctamente." />
            <FAQItem question="¿Qué hago con las pilas y baterías?" answer="Las pilas y baterías no deben arrojarse a la basura común. Contienen materiales tóxicos. Buscá un punto de recolección especial en nuestra sección de Puntos Verdes para desecharlas de forma segura." />
            <FAQItem question="¿El cartón de pizza se puede reciclar?" answer="Depende. Si la caja está manchada con grasa o restos de comida, esa parte no se puede reciclar y debe ir a la basura. Si hay partes limpias, podés cortarlas y reciclarlas con el papel y cartón." />
            <FAQItem question="¿Es necesario quitar las etiquetas de las botellas?" answer="No es estrictamente necesario. Durante el proceso de reciclaje industrial, las etiquetas de papel o plástico se separan de los envases. Sin embargo, quitar las que son fáciles de remover nunca está de más." />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;