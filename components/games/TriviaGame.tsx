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
    
    const finalScore = useMemo(() => {
        return score;
    }, [score]);

    const passed = (finalScore / questions.length) >= PASS_PERCENTAGE;

    const restartGame = useCallback(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setScore(0);
        setIsFinished(false);
    }, []);

    const handleAnswer = (answerIndex: number) => {
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
            if (((score + (selectedAnswer === questions[currentQuestionIndex].correctAnswer ? 1 : 0)) / questions.length) >= PASS_PERCENTAGE) {
                 setTimeout(onComplete, 2000);
            }
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="relative max-w-xl mx-auto p-4 h-full flex flex-col justify-center text-text-main bg-surface rounded-lg">
            <button onClick={onClose} className="absolute top-2 right-2 text-3xl leading-none px-2 text-text-secondary hover:text-text-main rounded-full transition-colors z-10">&times;</button>
            {!isFinished ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Trivia de Reciclaje</h2>
                        <span className="text-sm font-semibold text-text-secondary">Pregunta {currentQuestionIndex + 1}/{questions.length}</span>
                    </div>
                    <p className="text-lg mb-6 min-h-[5rem]">{currentQuestion.question}</p>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            let buttonClass = "w-full text-left p-3 border-2 rounded-lg transition-all duration-200 text-sm font-medium ";
                            if (showFeedback) {
                                if (index === currentQuestion.correctAnswer) {
                                    buttonClass += "bg-emerald-500/20 border-emerald-500 text-text-main";
                                } else if (index === selectedAnswer) {
                                    buttonClass += "bg-red-500/20 border-red-500 text-text-main";
                                } else {
                                    buttonClass += "border-slate-700 opacity-60";
                                }
                            } else {
                               buttonClass += "border-slate-700 hover:border-primary hover:bg-primary/10";
                            }
                            return <button key={index} onClick={() => handleAnswer(index)} disabled={showFeedback} className={buttonClass}>{option}</button>;
                        })}
                    </div>
                    {showFeedback && (
                        <button onClick={handleNext} className="mt-6 w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors animate-fade-in-up">
                            {currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                        </button>
                    )}
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-center p-8 flex-col animate-fade-in-up">
                    {passed ? (
                        <>
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-text-main">¡Felicitaciones!</h2>
                            <p className="text-text-secondary mt-2">Superaste la trivia con {finalScore}/{questions.length} respuestas correctas y ganaste EcoPuntos.</p>
                        </>
                    ) : (
                         <>
                            <div className="text-6xl mb-4">🤔</div>
                            <h2 className="text-2xl font-bold text-text-main">¡Casi lo logras!</h2>
                            <p className="text-text-secondary mt-2">Obtuviste {finalScore} de {questions.length}. Necesitas al menos {Math.ceil(questions.length * PASS_PERCENTAGE)} para ganar.</p>
                            <button onClick={restartGame} className="mt-6 bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors">
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