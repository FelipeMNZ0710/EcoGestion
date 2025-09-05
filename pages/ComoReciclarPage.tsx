import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { User, Material, MaterialContent, QuizQuestion, GamificationAction, MaterialContentItem, ProcessStep, ImpactStat } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { sabiasQueData } from '../data/sabiasQueData';
import TriviaGame from '../components/games/TriviaGame';

const materialTypes: Material[] = ['papel', 'plastico', 'vidrio', 'metales'];
const materialNames: Record<Material, string> = {
    papel: 'Papel y Cartón',
    plastico: 'Plásticos',
    vidrio: 'Vidrio',
    metales: 'Metales'
};

const initialContent: Record<Material, MaterialContent> = {
    papel: {
        yes: [
            { text: 'Diarios, revistas y folletos', icon: '📰' },
            { text: 'Cajas de cartón (desarmadas)', icon: '📦' },
            { text: 'Papel de oficina, cuadernos, sobres', icon: '📝' },
            { text: 'Envases de cartón para alimentos (huevos, etc.)', icon: '🥚' },
            { text: 'Bolsas de papel', icon: '🛍️' },
        ],
        no: [
            { text: 'Papel de cocina o servilletas usadas', icon: '🧻' },
            { text: 'Papel higiénico y pañuelos', icon: '🚽' },
            { text: 'Cajas de pizza con grasa o restos de comida', icon: '🍕' },
            { text: 'Papel fotográfico y de stickers', icon: '📸' },
            { text: 'Vasos de papel encerados o plastificados', icon: '🥤' },
            { text: 'Tickets y recibos (papel térmico)', icon: '🧾' },
        ],
        tip: 'Aplastá las cajas de cartón para que ocupen menos espacio tanto en tu casa como en el contenedor.',
        commonMistakes: [
            'Intentar reciclar papel o cartón manchado con grasa o comida.',
            'No desarmar las cajas, ocupando espacio valioso en los contenedores.',
            'Tirar tickets o recibos (papel térmico) que no son reciclables.'
        ],
        recyclingProcess: [
            { step: 1, title: 'Recolección y Clasificación', description: 'Se recolecta en los Puntos Verdes y se clasifica por tipo y calidad en la planta.', icon: '🔍' },
            { step: 2, title: 'Despulpado y Limpieza', description: 'Se mezcla con agua para crear una pasta (pulpa) y se aplican procesos para eliminar tintas e impurezas.', icon: '💧' },
            { step: 3, title: 'Creación de Nuevo Papel', description: 'La pulpa limpia se seca, se prensa y se enrolla en grandes bobinas para convertirse en nuevos productos de papel y cartón.', icon: '🔄' },
        ],
        impactStats: [
            { stat: 'Árboles Salvados', value: '17', icon: '🌳' },
            { stat: 'Agua Ahorrada', value: '70%', icon: '💧' },
            { stat: 'Energía Ahorrada', value: '60%', icon: '⚡' },
        ],
        quiz: {
            points: 50,
            questions: [
                { question: '¿Se puede reciclar una caja de pizza manchada de grasa?', options: ['Sí, entera', 'Solo las partes limpias', 'No, nunca'], correctAnswer: 1 },
                { question: '¿Qué se debe hacer con las cajas de cartón grandes?', options: ['Dejarlas armadas', 'Quemarlas', 'Desarmarlas y aplastarlas'], correctAnswer: 2 },
            ]
        }
    },
    plastico: {
        yes: [
            { text: 'Botellas de bebida y aceite (PET)', icon: '🍾' },
            { text: 'Envases de limpieza y shampoo (HDPE)', icon: '🧼' },
            { text: 'Tapas de plástico', icon: '🧴' },
            { text: 'Potes de yogurt, queso y postres', icon: '🍦' },
            { text: 'Bolsas de plástico y film (limpios)', icon: '🛍️' },
        ],
        no: [
            { text: 'Envases con restos de comida o líquidos', icon: '🍔' },
            { text: 'Cubiertos, vasos y platos descartables', icon: '🍴' },
            { text: 'Juguetes de plástico', icon: '🧸' },
            { text: 'Paquetes de snacks metalizados', icon: '🥨' },
            { text: 'Cepillos de dientes y biromes', icon: '🪥' },
        ],
        tip: '¡Enjuagá siempre los envases y aplastá las botellas! Así no contaminan otros materiales y ocupan menos espacio.',
        commonMistakes: [
            'No enjuagar potes de yogurt o crema.',
            'Dejar las tapas en las botellas (se reciclan por separado, ¡juntalas en otra botella!).',
            'Intentar reciclar plásticos de un solo uso como cubiertos.'
        ],
        recyclingProcess: [
            { step: 1, title: 'Separación por Tipo', description: 'Los plásticos se clasifican por su número (PET, HDPE, etc.) ya que cada tipo tiene un proceso diferente.', icon: '🔢' },
            { step: 2, title: 'Triturado y Lavado', description: 'Se muelen en pequeñas escamas (pellets), se lavan para eliminar residuos y se secan.', icon: '🧼' },
            { step: 3, title: 'Fundición y Moldeado', description: 'Los pellets limpios se funden y se moldean para crear nuevos productos como textiles, tuberías o más envases.', icon: '🔥' },
        ],
        impactStats: [
            { stat: 'Años en Descomponerse', value: '450+', icon: '⏳' },
            { stat: 'Energía Ahorrada', value: '88%', icon: '⚡' },
            { stat: 'Productos Nuevos', value: 'Fibra Textil', icon: '👕' },
        ],
        quiz: {
            points: 50,
            questions: [
                { question: '¿Es necesario enjuagar una botella de gaseosa antes de reciclarla?', options: ['No, no importa', 'Sí, siempre', 'Solo si está muy sucia'], correctAnswer: 1 },
                { question: '¿Qué se hace con las tapitas de plástico?', options: ['Se tiran a la basura', 'Se dejan en la botella', 'Se reciclan por separado'], correctAnswer: 2 },
            ]
        }
    },
    vidrio: {
        yes: [
            { text: 'Botellas de bebidas (vino, cerveza, gaseosa)', icon: '🍷' },
            { text: 'Frascos de conservas, mermeladas, etc.', icon: '🫙' },
            { text: 'Botellas de perfume y cosmética', icon: '🌸' },
            { text: 'Frascos de café soluble', icon: '☕' },
        ],
        no: [
            { text: 'Vidrios de ventanas o espejos rotos', icon: '🖼️' },
            { text: 'Bombillas de luz y tubos fluorescentes', icon: '💡' },
            { text: 'Vasos, platos o fuentes de vidrio/cristal', icon: '🍽️' },
            { text: 'Frascos de medicamentos y ampollas', icon: '💊' },
            { text: 'Cerámica y porcelana', icon: '🏺' },
        ],
        tip: 'Quitá las tapas de metal o plástico de los frascos y botellas. No es necesario quitar las etiquetas.',
        commonMistakes: [
            'Tirar espejos o vidrios de ventanas en el contenedor de vidrio.',
            'Depositar objetos de cerámica o porcelana.',
            'No vaciar completamente el contenido de los frascos.'
        ],
        recyclingProcess: [
            { step: 1, title: 'Limpieza y Triturado', description: 'El vidrio se limpia para quitar impurezas y se tritura hasta convertirlo en pequeños trozos llamados "calcín".', icon: '💥' },
            { step: 2, title: 'Separación Magnética y Óptica', description: 'Se usan imanes y sensores para remover cualquier resto de metal o material no deseado del calcín.', icon: '✨' },
            { step: 3, title: 'Fundición y Soplado', description: 'El calcín se funde en un horno a altas temperaturas y luego se moldea y sopla para crear nuevas botellas y frascos.', icon: '🔥' },
        ],
        impactStats: [
            { stat: '100% Reciclable', value: 'Infinitas veces', icon: '🔄' },
            { stat: 'Energía Ahorrada', value: '30%', icon: '💡' },
            { stat: 'Contaminación del Aire', value: '-20%', icon: '💨' },
        ],
        quiz: {
            points: 50,
            questions: [
                { question: '¿Se puede tirar un espejo roto en el contenedor de vidrio?', options: ['Sí, es vidrio', 'No, tiene otros componentes', 'Solo si es pequeño'], correctAnswer: 1 },
                { question: '¿Las bombillas de luz se reciclan con el vidrio?', options: ['Sí', 'No', 'Solo las LED'], correctAnswer: 1 },
            ]
        }
    },
    metales: {
        yes: [
            { text: 'Latas de gaseosa o cerveza (aluminio)', icon: '🥤' },
            { text: 'Latas de conserva (acero)', icon: '🥫' },
            { text: 'Tapas de frascos y botellas', icon: '뚜껑' },
            { text: 'Aerosoles vacíos (desodorantes, etc.)', icon: '🌬️' },
            { text: 'Papel de aluminio limpio y compactado', icon: '✨' },
        ],
        no: [
            { text: 'Pilas y baterías', icon: '🔋' },
            { text: 'Envases de pintura o productos tóxicos', icon: '🎨' },
            { text: 'Aparatos electrónicos pequeños', icon: '💻' },
            { text: 'Cápsulas de café (sin vaciar y limpiar)', icon: ' cápsula ' },
            { text: 'Alambres y chatarra grande', icon: '🔗' },
        ],
        tip: 'Enjuagá las latas de conserva y si es posible, aplastalas para que ocupen menos espacio.',
        commonMistakes: [
            'Tirar pilas en el contenedor de metales (son residuos peligrosos).',
            'No vaciar completamente los aerosoles.',
            'Dejar papel de aluminio sucio con restos de comida.'
        ],
        recyclingProcess: [
            { step: 1, title: 'Separación Magnética', description: 'En la planta, grandes imanes separan fácilmente los metales ferrosos (acero) de los no ferrosos (aluminio).', icon: '🧲' },
            { step: 2, title: 'Prensado y Triturado', description: 'Los metales se prensan en grandes bloques para facilitar su transporte y luego se trituran en piezas más pequeñas.', icon: ' compacted ' },
            { step: 3, title: 'Fundición y Purificación', description: 'Se funden en hornos a altas temperaturas para eliminar impurezas y luego se vierten en moldes para crear lingotes de metal listo para usar.', icon: '🔥' },
        ],
        impactStats: [
            { stat: 'Energía Ahorrada (Aluminio)', value: '95%', icon: '⚡' },
            { stat: 'Energía Ahorrada (Acero)', value: '75%', icon: '⚡' },
            { stat: 'Emisiones Reducidas', value: '86%', icon: '☁️' },
        ],
        quiz: {
            points: 50,
            questions: [
                { question: '¿Dónde se deben desechar las pilas?', options: ['Contenedor de metales', 'Basura común', 'Puntos de recolección especiales'], correctAnswer: 2 },
                { question: 'Un desodorante en aerosol, ¿se puede reciclar?', options: ['Sí, si está vacío', 'No, es peligroso', 'Solo la tapa de plástico'], correctAnswer: 0 },
            ]
        }
    }
};

const MaterialInfoList: React.FC<{ title: string; items: MaterialContentItem[]; colorClass: string }> = ({ title, items, colorClass }) => (
    <div className="material-content-card flex-1">
        <h3 className={`text-xl font-bold mb-4 ${colorClass}`}>{title}</h3>
        <ul className="space-y-3">
            {items.map(item => <li key={item.text} className="flex items-start"><span className="text-xl mr-3">{item.icon}</span> <span className="text-text-secondary">{item.text}</span></li>)}
        </ul>
    </div>
);

const RecyclingProcess: React.FC<{ steps: ProcessStep[] }> = ({ steps }) => (
    <div className="material-content-card">
        <h2 className="text-2xl font-bold font-display text-center text-text-main mb-6">El Viaje del Reciclaje</h2>
        <div className="process-timeline">
            {steps.map(step => (
                <div key={step.step} className="process-step">
                    <div className="flex items-center mb-2">
                        <span className="text-2xl mr-4">{step.icon}</span>
                        <h4 className="font-bold text-primary text-lg">{step.title}</h4>
                    </div>
                    <p className="text-text-secondary">{step.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const ImpactStats: React.FC<{ stats: ImpactStat[] }> = ({ stats }) => (
    <div className="material-content-card">
        <h2 className="text-2xl font-bold font-display text-center text-text-main mb-6">Impacto en Números</h2>
        <div className="impact-grid">
            {stats.map(stat => (
                <div key={stat.stat} className="impact-card">
                    <div className="impact-card-icon">{stat.icon}</div>
                    <div className="impact-card-value">{stat.value}</div>
                    <div className="impact-card-stat">{stat.stat}</div>
                </div>
            ))}
        </div>
    </div>
);


const ComoReciclarPage: React.FC<{ user: User | null, onUserAction: (action: GamificationAction, payload?: any) => void, isAdminMode: boolean }> = ({ user, onUserAction }) => {
    const [activeTab, setActiveTab] = useState<Material>('papel');
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

    const [isIdentifierActive, setIsIdentifierActive] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{name: string, isRecyclable: boolean, instructions: string} | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY || '' }), []);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("No se pudo acceder a la cámara. Asegúrate de haber dado permiso en la configuración de tu navegador.");
            setIsIdentifierActive(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }, []);

    useEffect(() => {
        if (isIdentifierActive) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isIdentifierActive, startCamera, stopCamera]);

    const handleIdentify = async () => {
        if (!videoRef.current) return;
        setIsAnalyzing(true);

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64Data = dataUrl.split(',')[1];
        
        const model = 'gemini-2.5-flash';
        const prompt = "Analiza la imagen. Identifica el objeto principal y determina si es reciclable y cómo debe ser reciclado. Responde en JSON con las claves 'name', 'isRecyclable' (boolean), y 'instructions' (string).";
        
        try {
            const response = await ai.models.generateContent({
                model,
                contents: { parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                    { text: prompt }
                ]},
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            isRecyclable: { type: Type.BOOLEAN },
                            instructions: { type: Type.STRING }
                        },
                        required: ["name", "isRecyclable", "instructions"]
                    }
                }
            });
            const result = JSON.parse(response.text);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Gemini API error:", error);
            setAnalysisResult({ name: 'Error', isRecyclable: false, instructions: 'No se pudo analizar la imagen. Por favor, intenta de nuevo.' });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleQuizComplete = () => {
        onUserAction('complete_quiz', { material: activeTab, points: initialContent[activeTab].quiz.points });
        setIsQuizModalOpen(false);
    };

    const startQuiz = () => {
        if (user) {
            setQuizQuestions(initialContent[activeTab].quiz.questions);
            setIsQuizModalOpen(true);
        } else {
            alert("Debes iniciar sesión para realizar el cuestionario.");
        }
    };
    
    const content = initialContent[activeTab];
    const facts = sabiasQueData[activeTab];

    return (
        <div className="bg-background pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold font-display text-text-main sm:text-5xl">Guía Interactiva de Reciclaje</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Aprende a separar correctamente, pon a prueba tus conocimientos y usa nuestra IA para resolver cualquier duda.</p>
                </div>

                <section className="mb-16">
                    <h2 className="text-2xl font-bold font-display text-center text-text-main mb-8">Identificador de Residuos con IA</h2>
                    <div className="max-w-xl mx-auto">
                        {!isIdentifierActive ? (
                            <button onClick={() => setIsIdentifierActive(true)} className="w-full cta-button text-lg">
                                Activar Cámara para Identificar
                            </button>
                        ) : (
                            <div className="camera-view">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                                     <button onClick={handleIdentify} disabled={isAnalyzing} className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-slate-400 disabled:opacity-50">
                                        <div className="w-12 h-12 bg-white rounded-full active:bg-slate-200"></div>
                                    </button>
                                     <button onClick={() => setIsIdentifierActive(false)} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                {(isAnalyzing || analysisResult) && (
                                    <div className="ai-result-overlay">
                                        {isAnalyzing ? (
                                             <div className="text-center text-white">
                                                <svg className="animate-spin h-12 w-12 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <p className="mt-4 font-semibold">Analizando imagen...</p>
                                            </div>
                                        ) : analysisResult && (
                                            <div className="text-center text-white">
                                                <div className={`text-6xl mb-4 ai-result-icon ${analysisResult.isRecyclable ? 'text-emerald-400' : 'text-red-400'}`}>{analysisResult.isRecyclable ? '✅' : '❌'}</div>
                                                <h3 className="text-2xl font-bold ai-result-text">{analysisResult.name}</h3>
                                                <p className="mt-2 text-slate-200 ai-result-subtext">{analysisResult.instructions}</p>
                                                <button onClick={() => setAnalysisResult(null)} className="mt-6 px-4 py-2 bg-white/20 rounded-full">Analizar otro</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <div className="recycling-tabs">
                    {materialTypes.map(mat => <div key={mat} className={`recycling-tab ${activeTab === mat ? 'active' : ''}`} onClick={() => setActiveTab(mat)}>{materialNames[mat]}</div>)}
                </div>

                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        <MaterialInfoList title="Qué SÍ reciclar" items={content.yes} colorClass="text-emerald-400" />
                        <MaterialInfoList title="Qué NO reciclar" items={content.no} colorClass="text-red-400" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="material-content-card lg:col-span-1"><h3 className="text-xl font-bold text-primary mb-3">💡 Consejo Clave</h3><p className="text-text-secondary">{content.tip}</p></div>
                        <div className="material-content-card lg:col-span-1"><h3 className="text-xl font-bold text-amber-400 mb-3">🤔 Errores Comunes</h3><ul className="space-y-2 list-disc pl-5 text-text-secondary">{content.commonMistakes.map(m => <li key={m}>{m}</li>)}</ul></div>
                        <div className="material-content-card lg:col-span-1"><h3 className="text-xl font-bold text-cyan-400 mb-3">🧐 ¿Sabías que...?</h3><ul className="space-y-2 list-disc pl-5 text-text-secondary">{facts.map(f => <li key={f}>{f}</li>)}</ul></div>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-8">
                        <RecyclingProcess steps={content.recyclingProcess} />
                        <ImpactStats stats={content.impactStats} />
                    </div>

                     <div className="text-center pt-8">
                        <button onClick={startQuiz} className={`cta-button text-lg ${user?.stats.completedQuizzes.includes(activeTab) ? '!bg-slate-600' : ''}`} disabled={user?.stats.completedQuizzes.includes(activeTab)}>
                            {user?.stats.completedQuizzes.includes(activeTab) ? 'Cuestionario Completado ✓' : 'Pon a Prueba tus Conocimientos'}
                        </button>
                    </div>
                </div>
            </div>
            
            {isQuizModalOpen && (
                 <div className="modal-backdrop">
                    <div className="modal-content !max-w-2xl !max-h-[600px] !bg-slate-100 !text-slate-800">
                       <TriviaGame questions={quizQuestions} onComplete={handleQuizComplete} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComoReciclarPage;
