

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
    const [guidesContent, setGuidesContent] = useState<Record<Material, MaterialContent> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isIdentifierActive, setIsIdentifierActive] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{name: string, isRecyclable: boolean, instructions: string} | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY || '' }), []);

    useEffect(() => {
        const fetchGuides = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/recycling-guides');
                if (!response.ok) throw new Error('Failed to fetch recycling guides');
                const data = await response.json();
                setGuidesContent(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGuides();
    }, []);

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
        if (!videoRef.current || !videoRef.current.srcObject) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsAnalyzing(false);
            return;
        }
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64Data = dataUrl.split(',')[1];
        
        const model = 'gemini-2.5-flash';
        const prompt = "Analiza la imagen. Identifica el objeto principal y determina si es reciclable en Formosa, Argentina y cómo debe ser reciclado. Sé breve y directo. Responde en JSON con las claves 'name' (string), 'isRecyclable' (boolean), y 'instructions' (string, max 150 caracteres).";
        
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
            const resultText = response.text;
            const result = JSON.parse(resultText);
            onUserAction('identify_object');
            setAnalysisResult(result);
        } catch (error) {
            console.error("Gemini API error:", error);
            setAnalysisResult({ name: 'Error', isRecyclable: false, instructions: 'No se pudo analizar la imagen. Asegúrate de que el objeto esté bien iluminado y vuelve a intentarlo.' });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleQuizComplete = () => {
        if (!guidesContent) return;
        onUserAction('complete_quiz', { material: activeTab, points: guidesContent[activeTab].quiz.points });
        setIsQuizModalOpen(false);
    };

    const startQuiz = () => {
        if (user && guidesContent) {
            setQuizQuestions(guidesContent[activeTab].quiz.questions);
            setIsQuizModalOpen(true);
        } else {
            alert("Debes iniciar sesión para realizar el cuestionario.");
        }
    };
    
    const content = guidesContent ? guidesContent[activeTab] : null;
    const facts = sabiasQueData[activeTab];

    if (isLoading || !content) {
        return (
            <div className="pt-20 h-screen flex items-center justify-center">
                <div className="text-center text-text-secondary p-8">
                    <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Cargando Guía de Reciclaje...
                </div>
            </div>
        );
    }

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
                    <div className="modal-content !max-w-2xl !max-h-[600px] !bg-surface !text-text-main">
                       <TriviaGame 
                            questions={quizQuestions} 
                            onComplete={handleQuizComplete} 
                            onClose={() => setIsQuizModalOpen(false)}
                       />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComoReciclarPage;