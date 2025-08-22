import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { User, Material, MaterialContent, QuizQuestion, GamificationAction, MaterialContentItem } from '../types';
import { GoogleGenAI } from "@google/genai";
import { sabiasQueData } from '../data/sabiasQueData';

const materialTypes: Material[] = ['papel', 'plastico', 'vidrio', 'metales'];

const initialContent: Record<Material, MaterialContent> = {
    papel: {
        yes: [
            { text: 'Diarios y revistas', icon: '📰' },
            { text: 'Cajas de cartón (desarmadas)', icon: '📦' },
            { text: 'Papel de oficina y cuadernos', icon: '📝' },
            { text: 'Folletos y sobres', icon: '✉️' },
            { text: 'Guías telefónicas', icon: '📖' },
        ],
        no: [
            { text: 'Papel de cocina o servilletas usadas', icon: '🧻' },
            { text: 'Papel higiénico', icon: '🚽' },
            { text: 'Cajas de pizza con grasa', icon: '🍕' },
            { text: 'Papel fotográfico', icon: '📸' },
            { text: 'Vasos de papel encerados', icon: '🥤' },
        ],
        tip: 'Aplastá las cajas de cartón para que ocupen menos espacio tanto en tu casa como en el contenedor.',
        commonMistakes: [
            'Intentar reciclar papel o cartón manchado con grasa o comida.',
            'No desarmar las cajas, ocupando espacio valioso en los contenedores.',
            'Tirar tickets o recibos (papel térmico) que no son reciclables.'
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
            { text: 'Botellas de bebida (PET)', icon: '🍾' },
            { text: 'Envases de productos de limpieza (HDPE)', icon: '🧼' },
            { text: 'Tapas de plástico', icon: '🧴' },
            { text: 'Potes de yogurt y postres', icon: '🍦' },
            { text: 'Bolsas de plástico (agrupadas)', icon: '🛍️' },
        ],
        no: [
            { text: 'Paquetes de snacks metalizados', icon: '🍿' },
            { text: 'Juguetes de plástico', icon: '🧸' },
            { text: 'Cubiertos descartables', icon: '🍴' },
            { text: 'Cepillos de dientes', icon: '🪥' },
            { text: 'Plásticos de un solo uso muy sucios', icon: '🚯' },
        ],
        tip: 'Asegurate de enjuagar bien las botellas y envases. ¡Una botella con líquido puede arruinar mucho papel y cartón!',
        commonMistakes: [
            'No enjuagar los envases, lo que genera malos olores y contamina otros materiales.',
            'Tirar envoltorios metalizados (como de papas fritas) pensando que son plástico.',
            'Dejar las tapas en las botellas (se reciclan por separado).'
        ],
        quiz: {
            points: 50,
            questions: [
                { question: '¿Qué significa el número 1 (PET) en un envase de plástico?', options: ['No es reciclable', 'Es para un solo uso', 'Es un tipo de plástico muy reciclable'], correctAnswer: 2 },
                { question: '¿Es necesario enjuagar los potes de yogurt antes de reciclarlos?', options: ['Sí, siempre', 'No, no es necesario', 'Solo si huelen mal'], correctAnswer: 0 },
            ]
        }
    },
    vidrio: {
        yes: [
            { text: 'Botellas de vino, cerveza y gaseosa', icon: '🍷' },
            { text: 'Frascos de conservas y mermeladas', icon: '🫙' },
            { text: 'Envases de perfumes', icon: '💨' },
            { text: 'Cualquier frasco de vidrio sin tapa', icon: '🫙' },
        ],
        no: [
            { text: 'Espejos rotos', icon: '🪞' },
            { text: 'Focos de luz', icon: '💡' },
            { text: 'Vasos o platos de vidrio rotos', icon: '🍽️' },
            { text: 'Ventanas', icon: '🖼️' },
            { text: 'Tubos fluorescentes', icon: '🧪' },
        ],
        tip: 'Retirá las tapas de metal o plástico de los frascos de vidrio. ¡Esas tapas se reciclan por separado!',
        commonMistakes: [
            'Tirar focos, espejos o vasos rotos, que tienen una composición diferente y no se reciclan igual.',
            'Dejar las tapas puestas en los frascos.',
            'Tirar el vidrio roto sin protección (debe envolverse para evitar accidentes).'
        ],
        quiz: {
            points: 50,
            questions: [
                { question: '¿Se puede reciclar un espejo roto junto con las botellas de vidrio?', options: ['Sí, es vidrio', 'No, tienen distinta composición', 'Solo si es pequeño'], correctAnswer: 1 },
                { question: '¿Qué material de vidrio NO se debe tirar en el contenedor verde?', options: ['Botellas de vino', 'Frascos de mermelada', 'Focos de luz'], correctAnswer: 2 },
            ]
        }
    },
    metales: {
        yes: [
            { text: 'Latas de gaseosa y cerveza (aluminio)', icon: '🥫' },
            { text: 'Latas de conservas (acero)', icon: '🥫' },
            { text: 'Tapas de frascos', icon: '🔩' },
            { text: 'Desodorantes en aerosol (vacíos)', icon: '💨' },
            { text: 'Papel de aluminio limpio', icon: '🌯' },
        ],
        no: [
            { text: 'Pilas y baterías', icon: '🔋' },
            { text: 'Envases de pintura', icon: '🎨' },
            { text: 'Chatarra electrónica', icon: '📱' },
            { text: 'Latas con restos de comida o líquidos', icon: '🥫' },
        ],
        tip: 'Comprimí las latas de aluminio para reducir su volumen. ¡Ayuda a transportar más cantidad en cada viaje!',
        commonMistakes: [
            'Tirar pilas o baterías junto con los metales, ya que son residuos peligrosos.',
            'Reciclar aerosoles que no estén completamente vacíos.',
            'Dejar restos de comida dentro de las latas de conserva.'
        ],
        quiz: {
            points: 50,
            questions: [
                { question: '¿Qué es CRUCIAL antes de reciclar una lata de aerosol?', options: ['Quitarle la tapa', 'Que esté completamente vacía', 'Lavar la lata por fuera'], correctAnswer: 1 },
                { question: '¿Dónde se deben desechar las pilas?', options: ['Con los metales', 'En la basura común', 'En puntos de recolección especiales'], correctAnswer: 2 },
            ]
        }
    },
};

const materialIcons: Record<Material, JSX.Element> = {
    papel: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    plastico: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 20l-2-2m2-2l2-2m-2 2l-2 2m2-2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L19 11.828a2 2 0 000-2.828L12.172 2.586a2 2 0 00-2.828 0L3 9.172a2 2 0 000 2.828z" /></svg>,
    vidrio: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    metales: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode, icon: JSX.Element }> = ({ active, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 font-semibold text-lg border-b-4 transition-all duration-300 flex items-center ${active ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-main'}`}
    >
        {icon}
        {children}
    </button>
);

const MaterialCard: React.FC<{ type: 'yes' | 'no'; title: string; items: MaterialContentItem[] }> = ({ type, title, items }) => {
    const isYes = type === 'yes';
    const accentColor = isYes ? 'text-emerald-500' : 'text-red-500';
    const icon = isYes
        ? <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

    return (
        <div className="modern-card p-6">
             <div className="flex items-center mb-4">
                {icon}
                <h3 className={`text-2xl font-bold ml-2 ${accentColor}`}>{title}</h3>
            </div>
            <ul className="space-y-3 text-left text-text-secondary">
                {items.map(item => (
                    <li key={item.text} className="flex items-center text-lg">
                        <span className="text-2xl flex-shrink-0 mr-3">{item.icon}</span>
                        <span>{item.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ProTip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-8 p-5 bg-amber-100/60 border-l-4 border-accent text-amber-900 rounded-r-lg flex items-center gap-4">
        <span className="text-3xl">💡</span>
        <p className="text-lg"><strong className="font-bold">Pro Tip:</strong> {children}</p>
    </div>
);

const SabiasQueCard: React.FC<{ fact: string }> = ({ fact }) => (
    <div className="mt-8 p-5 bg-sky-100/60 border-l-4 border-sky-500 text-sky-900 rounded-r-lg flex items-center gap-4">
        <span className="text-3xl">🧠</span>
        <p className="text-lg"><strong className="font-bold">¿Sabías que...?</strong> {fact}</p>
    </div>
);

const CommonMistakesCard: React.FC<{ mistakes: string[] }> = ({ mistakes }) => (
    <div className="mt-8 p-6 bg-red-50 border-l-4 border-red-500 text-red-900 rounded-r-lg">
        <div className="flex items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h3 className="text-xl font-bold">Errores Comunes a Evitar</h3>
        </div>
        <ul className="space-y-2 text-left list-disc pl-5 text-lg">
            {mistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
        </ul>
    </div>
);

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
    }, [content, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...currentContent,
            yes: currentContent.yes.filter(item => item.text.trim() !== ''),
            no: currentContent.no.filter(item => item.text.trim() !== ''),
            commonMistakes: currentContent.commonMistakes.filter(item => item.trim() !== '')
        });
    };
    
    const handleListChange = (type: 'yes' | 'no', value: string) => {
        const items = value.split('\n').map(line => {
            const [icon, ...textParts] = line.split(' ');
            const text = textParts.join(' ').trim();
            return { icon: icon.trim(), text: text };
        });
        setCurrentContent(prev => ({ ...prev, [type]: items }));
    };

    const handleQuizChange = (qIndex: number, field: keyof QuizQuestion, value: any) => {
        const newQuestions = [...currentContent.quiz.questions];
        if (field === 'options') {
            (newQuestions[qIndex] as any)[field] = value.split('\n').map((s: string) => s.trim());
        } else if (field === 'correctAnswer') {
            (newQuestions[qIndex] as any)[field] = Number(value) - 1;
        } else {
            (newQuestions[qIndex] as any)[field] = value;
        }
        setCurrentContent(prev => ({ ...prev, quiz: { ...prev.quiz, questions: newQuestions } }));
    };

    const addQuestion = () => {
        const newQuestion: QuizQuestion = { question: '', options: ['', '', ''], correctAnswer: 0 };
        setCurrentContent(prev => ({ ...prev, quiz: { ...prev.quiz, questions: [...prev.quiz.questions, newQuestion] } }));
    };

    const removeQuestion = (index: number) => {
        const newQuestions = currentContent.quiz.questions.filter((_, i) => i !== index);
        setCurrentContent(prev => ({ ...prev, quiz: { ...prev.quiz, questions: newQuestions } }));
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">Editar Contenido de "{categoryName}"</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 modal-form">
                        <div>
                            <label htmlFor="yes-items">SÍ se recicla (formato: emoji texto)</label>
                            <textarea id="yes-items" rows={5} value={currentContent.yes.map(i => `${i.icon} ${i.text}`).join('\n')} onChange={e => handleListChange('yes', e.target.value)} />
                        </div>
                         <div>
                            <label htmlFor="no-items">NO se recicla (formato: emoji texto)</label>
                            <textarea id="no-items" rows={5} value={currentContent.no.map(i => `${i.icon} ${i.text}`).join('\n')} onChange={e => handleListChange('no', e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="pro-tip">Pro Tip</label>
                            <input type="text" id="pro-tip" value={currentContent.tip} onChange={e => setCurrentContent({...currentContent, tip: e.target.value})}/>
                        </div>
                        <div>
                            <label htmlFor="common-mistakes">Errores Comunes (uno por línea)</label>
                            <textarea id="common-mistakes" rows={3} value={currentContent.commonMistakes.join('\n')} onChange={e => setCurrentContent({...currentContent, commonMistakes: e.target.value.split('\n')})} />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-bold text-text-main mb-2">Editor del Cuestionario</h3>
                            {currentContent.quiz.questions.map((q, index) => (
                                <div key={index} className="p-3 border rounded-md mb-3 bg-slate-50 relative">
                                    <button type="button" onClick={() => removeQuestion(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                                    <label>Pregunta {index + 1}</label>
                                    <input type="text" value={q.question} onChange={e => handleQuizChange(index, 'question', e.target.value)} className="mb-2"/>
                                    <label>Opciones (una por línea, mínimo 2)</label>
                                    <textarea rows={3} value={q.options.join('\n')} onChange={e => handleQuizChange(index, 'options', e.target.value)} className="mb-2"/>
                                    <label>Respuesta Correcta (número de opción)</label>
                                    <input type="number" value={q.correctAnswer + 1} onChange={e => handleQuizChange(index, 'correctAnswer', e.target.value)} min="1" max={q.options.length} />
                                </div>
                            ))}
                             <button type="button" onClick={addQuestion} className="w-full text-sm py-2 bg-slate-200 rounded-md hover:bg-slate-300">Añadir Pregunta</button>
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

const RecyclingQuiz: React.FC<{
    quiz: MaterialContent['quiz'];
    onClose: () => void;
    onComplete: (score: number, total: number) => void;
}> = ({ quiz, onClose, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    const PASS_PERCENTAGE = 0.75;
    
    const currentScore = useMemo(() => {
        if (!isFinished) return score;
        // Calculate final score when quiz finishes to avoid state lag
        const finalQuestion = quiz.questions[quiz.questions.length - 1];
        const lastAnswerCorrect = selectedAnswer === finalQuestion.correctAnswer;
        return lastAnswerCorrect ? score + 1 : score;
    }, [isFinished, score, selectedAnswer, quiz.questions]);

    const passed = (currentScore / quiz.questions.length) >= PASS_PERCENTAGE;

    const handleAnswer = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        setShowFeedback(true);
        if (answerIndex === quiz.questions[currentQuestionIndex].correctAnswer) {
            setScore(s => s + 1);
        }
    };
    
    const handleNext = () => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            setIsFinished(true);
            onComplete(score, quiz.questions.length);
        }
    };

    const currentQuestion = quiz.questions[currentQuestionIndex];

    if (isFinished) {
         return (
            <div className="modal-backdrop">
                <div className="modal-content text-center p-8">
                    {passed ? (
                        <>
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-text-main">¡Felicitaciones!</h2>
                            <p className="text-text-secondary mt-2">Aprobaste y ganaste <strong className="text-primary">{quiz.points} EcoPuntos</strong>.</p>
                        </>
                    ) : (
                         <>
                            <div className="text-6xl mb-4">🤔</div>
                            <h2 className="text-2xl font-bold text-text-main">¡Casi lo logras!</h2>
                            <p className="text-text-secondary mt-2">Obtuviste {score} de {quiz.questions.length}. Necesitas al menos {Math.ceil(quiz.questions.length * PASS_PERCENTAGE)} para ganar puntos. ¡Repasá la guía y volvé a intentarlo!</p>
                        </>
                    )}
                    <button onClick={onClose} className="mt-6 w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-dark transition-colors">Cerrar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-content p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-main">Cuestionario Rápido</h2>
                    <span className="text-sm font-semibold text-text-secondary">Pregunta {currentQuestionIndex + 1}/{quiz.questions.length}</span>
                </div>
                <p className="text-lg text-text-main mb-6">{currentQuestion.question}</p>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        let buttonClass = "w-full text-left p-3 border-2 rounded-lg transition-all duration-200 text-sm font-medium ";
                        if (showFeedback) {
                            if (index === currentQuestion.correctAnswer) {
                                buttonClass += "bg-emerald-100 border-emerald-500 text-emerald-800";
                            } else if (index === selectedAnswer) {
                                buttonClass += "bg-red-100 border-red-500 text-red-800";
                            } else {
                                buttonClass += "border-slate-300 opacity-60";
                            }
                        } else {
                           buttonClass += "border-slate-300 hover:border-primary hover:bg-primary/10";
                        }
                        return <button key={index} onClick={() => handleAnswer(index)} disabled={showFeedback} className={buttonClass}>{option}</button>;
                    })}
                </div>
                {showFeedback && (
                    <button onClick={handleNext} className="mt-6 w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-dark transition-colors animate-fade-in-up">
                        {currentQuestionIndex < quiz.questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                    </button>
                )}
            </div>
        </div>
    );
};

const ProgressTracker: React.FC<{ user: User | null }> = ({ user }) => {
    const completedQuizzes = user?.stats?.completedQuizzes || [];
    const progress = (completedQuizzes.length / materialTypes.length) * 100;
    
    return (
        <div className="modern-card p-4 mb-8 fade-in-section">
            <h2 className="text-lg font-bold text-text-main mb-3">Tu Progreso de Aprendizaje</h2>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                <div className="bg-secondary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between">
                {materialTypes.map(material => (
                    <div key={material} className="text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center transition-colors font-bold ${completedQuizzes.includes(material) ? 'bg-secondary text-slate-800' : 'bg-slate-200 text-slate-500'}`}>
                           {completedQuizzes.includes(material) ? '✓' : ''}
                        </div>
                        <p className="text-xs mt-1 capitalize text-text-secondary">{material}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const AiIdentifierModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("No se pudo acceder a la cámara. Asegúrate de haber dado permiso en tu navegador.");
            }
        };

        startCamera();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const handleCaptureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsAnalyzing(true);
        setResult(null);
        setError(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
        
        try {
            if (!process.env.API_KEY) throw new Error("API key not found");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const imagePart = { inlineData: { data: base64Image, mimeType: 'image/jpeg' } };
            const textPart = { text: "Identifica el objeto en esta imagen y explica brevemente cómo reciclarlo en Argentina. Si no es reciclable, explica por qué. Responde de forma concisa." };

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, textPart] },
            });
            
            setResult(response.text);

        } catch (apiError) {
            console.error("Gemini API error:", apiError);
            setError("No se pudo analizar la imagen. Inténtalo de nuevo.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">Identificador de Residuos con IA</h2>
                    {error && <div className="p-3 bg-red-100 text-red-800 rounded-md mb-4">{error}</div>}
                    <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video mb-4">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                                <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Analizando...
                            </div>
                        )}
                    </div>
                    {result && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <h3 className="font-bold text-emerald-800">Resultado del Análisis:</h3>
                            <p className="text-text-main whitespace-pre-wrap">{result}</p>
                        </div>
                    )}
                    <div className="flex gap-3 mt-4">
                        <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cerrar</button>
                        <button onClick={handleCaptureAndAnalyze} disabled={isAnalyzing || !!error} className="flex-1 px-4 py-3 bg-secondary text-slate-900 rounded-md hover:bg-lime-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                            {isAnalyzing ? "..." : "Analizar Foto"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ComoReciclarPage: React.FC<{user: User | null; onUserAction: (action: GamificationAction, payload?: any) => void; isAdminMode: boolean;}> = ({ user, onUserAction, isAdminMode }) => {
    const [activeTab, setActiveTab] = useState<Material>('papel');
    const [recyclingContent, setRecyclingContent] = useState(initialContent);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isQuizVisible, setIsQuizVisible] = useState(false);
    const [isIdentifierOpen, setIsIdentifierOpen] = useState(false);
    
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

    const handleQuizComplete = (score: number, total: number) => {
        if ((score / total) >= 0.75) {
            onUserAction('complete_quiz', { material: activeTab });
        }
    };
    
    const activeContent = recyclingContent[activeTab];
    const isQuizCompleted = user?.stats?.completedQuizzes?.includes(activeTab);

    const randomFact = useMemo(() => {
        const facts = sabiasQueData[activeTab];
        return facts[Math.floor(Math.random() * facts.length)];
    }, [activeTab]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {isQuizVisible && (
                <RecyclingQuiz 
                    quiz={activeContent.quiz}
                    onClose={() => setIsQuizVisible(false)}
                    onComplete={handleQuizComplete}
                />
            )}
            {user?.isAdmin && <EditContentModal 
                isOpen={isEditModalOpen} 
                onClose={() => setEditModalOpen(false)} 
                content={activeContent}
                onSave={handleSaveContent}
                categoryName={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            />}
            {isIdentifierOpen && <AiIdentifierModal onClose={() => setIsIdentifierOpen(false)} />}

            <div className="text-center mb-12 fade-in-section">
                <h1 className="text-4xl font-extrabold text-text-main">Guía Completa de Reciclaje</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Aprendé a separar correctamente cada tipo de material para maximizar el impacto de tu esfuerzo.</p>
                <button
                    onClick={() => setIsIdentifierOpen(true)}
                    className="mt-6 inline-flex items-center gap-2 bg-secondary hover:bg-lime-600 text-slate-900 font-bold py-3 px-6 rounded-full text-lg transition-transform duration-300 hover:scale-105 shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Identificar Residuo con IA
                </button>
            </div>
            
            {user && <ProgressTracker user={user} />}

            <div className="relative border-b border-slate-200 flex justify-center mb-8 fade-in-section" style={{animationDelay: '0.2s'}}>
                {user?.isAdmin && isAdminMode && (
                    <button onClick={() => setEditModalOpen(true)} className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-semibold rounded-full bg-emerald-100 text-primary hover:bg-emerald-200 transition-colors">
                        Editar Contenido
                    </button>
                )}
                <div className="flex flex-wrap justify-center">
                    <TabButton active={activeTab === 'papel'} onClick={() => setActiveTab('papel')} icon={materialIcons.papel}>Papel y Cartón</TabButton>
                    <TabButton active={activeTab === 'plastico'} onClick={() => setActiveTab('plastico')} icon={materialIcons.plastico}>Plásticos</TabButton>
                    <TabButton active={activeTab === 'vidrio'} onClick={() => setActiveTab('vidrio')} icon={materialIcons.vidrio}>Vidrios</TabButton>
                    <TabButton active={activeTab === 'metales'} onClick={() => setActiveTab('metales')} icon={materialIcons.metales}>Metales</TabButton>
                </div>
            </div>
            
            <div key={activeTab} className="animate-fade-in-up">
                <div className="grid md:grid-cols-2 gap-8">
                    <MaterialCard type="yes" title="SÍ se recicla" items={activeContent.yes} />
                    <MaterialCard type="no" title="NO se recicla" items={activeContent.no} />
                </div>
                <ProTip>{activeContent.tip}</ProTip>
                <SabiasQueCard fact={randomFact} />
                <CommonMistakesCard mistakes={activeContent.commonMistakes} />

                 <div className="mt-10 text-center modern-card p-6">
                    {user ? (
                        <>
                            <h3 className="text-2xl font-bold text-text-main mb-4">¿Listo para probar lo que aprendiste?</h3>
                            <button 
                                onClick={() => setIsQuizVisible(true)}
                                disabled={isQuizCompleted}
                                className="px-8 py-3 font-bold text-lg rounded-full transition-transform duration-300 hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                                style={isQuizCompleted ? { backgroundColor: '#84cc16', color: '#1e293b' } : { backgroundColor: '#f59e0b', color: '#1e293b' }}
                            >
                                {isQuizCompleted ? 'Cuestionario Completado ✓' : `Poné a prueba tu conocimiento y ganá ${activeContent.quiz.points} puntos!`}
                            </button>
                        </>
                    ) : (
                        <p className="text-lg text-text-secondary">
                            <a href="#" className="font-bold text-primary hover:underline">Inicia sesión</a> o <a href="#" className="font-bold text-primary hover:underline">registrate</a> para jugar, guardar tu progreso y ganar EcoPuntos.
                        </p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ComoReciclarPage;