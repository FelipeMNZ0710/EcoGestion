import React, { useState, useEffect } from 'react';
import type { User } from '../types';

type Material = 'papel' | 'plastico' | 'vidrio' | 'metales';

interface MaterialContent {
    yes: string[];
    no: string[];
    tip: string;
}

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
    const accentColor = isYes ? 'text-emerald-500' : 'text-red-500';
    const icon = isYes
        ? <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

    return (
        <div className="modern-card p-6">
             <div className="flex items-center mb-4">
                {icon}
                <h3 className={`text-2xl font-bold ml-2 ${accentColor}`}>{title}</h3>
            </div>
            <ul className="space-y-2 text-left text-text-secondary">
                {items.map(item => (
                    <li key={item} className="flex items-start">
                        <span className="flex-shrink-0 mr-2 mt-1 text-primary">{isYes ? '✓' : '✗'}</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ProTip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-8 p-4 bg-amber-100/60 border-l-4 border-accent text-amber-900 rounded-r-lg">
        <p><strong className="font-bold">Pro Tip:</strong> {children}</p>
    </div>
);

const initialContent: Record<Material, MaterialContent> = {
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

const EditContentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    content: MaterialContent;
    onSave: (newContent: MaterialContent) => void;
    categoryName: string;
}> = ({ isOpen, onClose, content, onSave, categoryName }) => {
    const [currentContent, setCurrentContent] = useState(content);

    useEffect(() => {
        setCurrentContent(content);
    }, [content]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...currentContent,
            yes: currentContent.yes.filter(item => item.trim() !== ''),
            no: currentContent.no.filter(item => item.trim() !== '')
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">Editar Contenido de "{categoryName}"</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 modal-form">
                        <div>
                            <label htmlFor="yes-items">SÍ se recicla (un item por línea)</label>
                            <textarea id="yes-items" rows={5} value={currentContent.yes.join('\n')} onChange={e => setCurrentContent({...currentContent, yes: e.target.value.split('\n')})} />
                        </div>
                         <div>
                            <label htmlFor="no-items">NO se recicla (un item por línea)</label>
                            <textarea id="no-items" rows={5} value={currentContent.no.join('\n')} onChange={e => setCurrentContent({...currentContent, no: e.target.value.split('\n')})} />
                        </div>
                        <div>
                            <label htmlFor="pro-tip">Pro Tip</label>
                            <input type="text" id="pro-tip" value={currentContent.tip} onChange={e => setCurrentContent({...currentContent, tip: e.target.value})}/>
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

const ComoReciclarPage: React.FC<{user: User | null}> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<Material>('papel');
    const [recyclingContent, setRecyclingContent] = useState(initialContent);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    
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

    const handleSaveContent = (newContent: MaterialContent) => {
        setRecyclingContent(prev => ({...prev, [activeTab]: newContent}));
        setEditModalOpen(false);
    }
    
    const activeContent = recyclingContent[activeTab];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <EditContentModal 
                isOpen={isEditModalOpen} 
                onClose={() => setEditModalOpen(false)} 
                content={activeContent}
                onSave={handleSaveContent}
                categoryName={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            />
            <div className="text-center mb-12 fade-in-section">
                <h1 className="text-4xl font-extrabold text-text-main">Guía Completa de Reciclaje</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Aprendé a separar correctamente cada tipo de material para maximizar el impacto de tu esfuerzo.</p>
            </div>

            <div className="relative border-b border-slate-200 flex justify-center mb-8 fade-in-section" style={{animationDelay: '0.2s'}}>
                {user?.isAdmin && (
                    <button onClick={() => setEditModalOpen(true)} className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-semibold rounded-full bg-emerald-100 text-primary hover:bg-emerald-200 transition-colors">
                        Editar
                    </button>
                )}
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