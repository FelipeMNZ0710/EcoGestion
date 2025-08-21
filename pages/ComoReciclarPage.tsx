import React, { useState, useEffect } from 'react';

type Material = 'papel' | 'plastico' | 'vidrio' | 'metales';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 font-semibold text-lg border-b-4 transition-colors duration-300 ${active ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-main'}`}
    >
        {children}
    </button>
);

const MaterialCard: React.FC<{ type: 'yes' | 'no'; title: string; items: string[] }> = ({ type, title, items }) => {
    const isYes = type === 'yes';
    const borderColor = isYes ? 'border-secondary' : 'border-red-500';
    const shadowColor = isYes ? 'shadow-secondary' : 'shadow-red-500';
    const icon = isYes
        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

    return (
        <div className={`neo-card p-6 !border-2 ${borderColor}`} style={{boxShadow: `4px 4px 0 0 ${isYes ? '#66BB6A' : '#EF5350'}`}}>
            <h3 className={`text-2xl font-bold mb-4 ${isYes ? 'text-secondary' : 'text-red-500'}`}>{title}</h3>
            <ul className="space-y-2 text-left">
                {items.map(item => (
                    <li key={item} className="flex items-start">
                        <span className="flex-shrink-0 mr-2 mt-1">{icon}</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ProTip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-8 p-4 bg-accent/20 border-l-4 border-accent text-text-main rounded-r-lg">
        <p><strong className="font-bold">Pro Tip:</strong> {children}</p>
    </div>
);

const content: Record<Material, { yes: string[], no: string[], tip: string }> = {
    papel: {
        yes: ['Diarios y revistas', 'Cajas de cartón (desarmadas)', 'Papel de oficina y cuadernos', 'Folletos y sobres', 'Guías telefónicas'],
        no: ['Papel de cocina o servilletas usadas', 'Papel higiénico', 'Cajas de pizza con grasa', 'Papel fotográfico', 'Vasos de papel encerados'],
        tip: 'Aplastá las cajas de cartón para que ocupen menos espacio tanto en tu casa como en el contenedor.'
    },
    plastico: {
        yes: ['Botellas de bebida (PET)', 'Envases de productos de limpieza (HDPE)', 'Tapas de plástico', 'Potes de yogurt y postres', 'Bolsas de plástico (agrupadas)'],
        no: ['Paquetes de snacks metalizados', 'Juguetes de plástico', 'Cubiertos descartables', 'Cepillos de dientes', 'Plásticos de un solo uso muy sucios'],
        tip: 'Asegurate de enjuagar bien las botellas y envases. ¡Una botella con líquido puede arruinar mucho papel y cartón!'
    },
    vidrio: {
        yes: ['Botellas de vino, cerveza y gaseosa', 'Frascos de conservas y mermeladas', 'Envases de perfumes', 'Cualquier frasco de vidrio sin tapa'],
        no: ['Espejos rotos', 'Focos de luz', 'Vasos o platos de vidrio rotos', 'Ventanas', 'Tubos fluorescentes'],
        tip: 'Retirá las tapas de metal o plástico de los frascos de vidrio. ¡Esas tapas se reciclan por separado!'
    },
    metales: {
        yes: ['Latas de gaseosa y cerveza (aluminio)', 'Latas de conservas (acero)', 'Tapas de frascos', 'Desodorantes en aerosol (vacíos)', 'Papel de aluminio limpio'],
        no: ['Pilas y baterías (requieren tratamiento especial)', 'Envases de pintura', 'Chatarra electrónica', 'Latas con restos de comida o líquidos'],
        tip: 'Comprimí las latas de aluminio para reducir su volumen. ¡Ayuda a transportar más cantidad en cada viaje!'
    },
};

const ComoReciclarPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Material>('papel');
    const activeContent = content[activeTab];
    
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
                <h1 className="text-4xl font-extrabold text-text-main">Guía Completa de Reciclaje</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Aprendé a separar correctamente cada tipo de material para maximizar el impacto de tu esfuerzo.</p>
            </div>

            <div className="border-b border-gray-200 flex justify-center mb-8 fade-in-section" style={{animationDelay: '0.2s'}}>
                <TabButton active={activeTab === 'papel'} onClick={() => setActiveTab('papel')}>Papel y Cartón</TabButton>
                <TabButton active={activeTab === 'plastico'} onClick={() => setActiveTab('plastico')}>Plásticos</TabButton>
                <TabButton active={activeTab === 'vidrio'} onClick={() => setActiveTab('vidrio')}>Vidrios</TabButton>
                <TabButton active={activeTab === 'metales'} onClick={() => setActiveTab('metales')}>Metales</TabButton>
            </div>
            
            <div key={activeTab} className="animate-fade-in-up">
                <div className="grid md:grid-cols-2 gap-8">
                    <MaterialCard type="yes" title="SÍ se recicla" items={activeContent.yes} />
                    <MaterialCard type="no" title="NO se recicla" items={activeContent.no} />
                </div>
                <ProTip>{activeContent.tip}</ProTip>
            </div>
        </div>
    );
};

export default ComoReciclarPage;