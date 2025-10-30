import React, { useState, useMemo, useCallback } from 'react';
import type { QuizQuestion } from '../../types';

interface TriviaGameProps {
    questions: QuizQuestion[];
    onComplete: () => void;
    onClose: () => void;
}

const TriviaGame: React.FC<TriviaGameProps> = ({ questions, onComplete, onClose }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    const PASS_PERCENTAGE = 0.7;
    const passed = (score / questions.length) >= PASS_PERCENTAGE;

    const restartGame = useCallback(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setScore(0);
        setIsFinished(false);
    }, []);

    const handleAnswer = (answerIndex: number) => {
        if (showFeedback) return;
        setSelectedAnswer(answerIndex);
        setShowFeedback(true);
        if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
            setScore(s => s + 1);
        }
    };
    
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setShowFeedback(false);
            setSelectedAnswer(null);
        } else {
            setIsFinished(true);
            if (((score) / questions.length) >= PASS_PERCENTAGE) {
                 setTimeout(onComplete, 2000);
            }
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="relative max-w-xl mx-auto p-4 sm:p-6 h-full flex flex-col justify-between text-text-main bg-surface rounded-lg">
            <button onClick={onClose} className="absolute top-2 right-2 text-3xl leading-none px-2 text-text-secondary hover:text-text-main rounded-full transition-colors z-10">&times;</button>
            {!isFinished ? (
                <>
                    <div>
                        <div className="flex justify-between items-center mb-2 text-sm text-text-secondary">
                            <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
                            <span>Puntaje: {score * 10}</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2.5 mb-4">
                            <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-6 min-h-[6rem] flex items-center">{currentQuestion.question}</h2>
                    </div>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            let buttonClass = "w-full text-left p-4 border-2 rounded-lg transition-all duration-200 font-semibold ";
                            if (showFeedback) {
                                if (index === currentQuestion.correctAnswer) {
                                    buttonClass += "bg-emerald-500/20 border-emerald-500 text-text-main animate-pulse";
                                } else if (index === selectedAnswer) {
                                    buttonClass += "bg-red-500/20 border-red-500 text-text-main animate-game-shake";
                                } else {
                                    buttonClass += "border-slate-700 opacity-50";
                                }
                            } else {
                               buttonClass += "border-slate-700 hover:border-primary hover:bg-primary/10";
                            }
                            return <button key={index} onClick={() => handleAnswer(index)} disabled={showFeedback} className={buttonClass}>{option}</button>;
                        })}
                    </div>
                    <div className="mt-6">
                        {showFeedback && (
                            <button onClick={handleNext} className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors" style={{ animation: 'fadeInUp 0.5s' }}>
                                {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver Resultados'}
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-center p-4 sm:p-8 flex-col" style={{ animation: 'game-pop-in 0.5s' }}>
                    {passed ? (
                        <>
                            <div className="text-7xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-text-main">¡Excelente Trabajo!</h2>
                            <p className="text-text-secondary mt-2 text-lg">Acertaste {score} de {questions.length} preguntas.</p>
                            <p className="font-bold text-primary text-xl mt-4">¡Ganaste {score * 10} EcoPuntos!</p>
                        </>
                    ) : (
                         <>
                            <div className="text-7xl mb-4">🤔</div>
                            <h2 className="text-3xl font-bold text-text-main">¡Casi lo logras!</h2>
                            <p className="text-text-secondary mt-2 text-lg">Obtuviste {score} de {questions.length}. Necesitas al menos {Math.ceil(questions.length * PASS_PERCENTAGE)} para ganar.</p>
                            <button onClick={restartGame} className="mt-8 bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors">
                                Volver a Intentar
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TriviaGame;