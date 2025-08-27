import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { User, Material, MaterialContent, QuizQuestion, GamificationAction, MaterialContentItem } from '../types';
import { GoogleGenAI } from "@google/genai";
import { sabiasQueData } from '../data/sabiasQueData';
import TriviaGame from '../components/games/TriviaGame';

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
            // FIX: Completed the object for this item which was causing a type error.
            { text: 'Bolsas de plástico (limpias y secas)', icon: '🛍️' },
        ],
        no: [
            { text: 'Envases con restos de comida', icon: '🍔' },
            { text: 'Cubiertos y sorbetes de plástico', icon: '🍴' },
            { text: 'Juguetes de plástico', icon: '🧸' },
            { text: 'Paquetes de snacks metalizados', icon: '🥨' },
            { text: 'Cepillos de dientes', icon: '🪥' },
        ],
        tip: '¡Enjuagá siempre los envases y aplastá las botellas! Así no contaminan otros materiales y ocupan menos espacio.',
        commonMistakes: [
            'No enjuagar potes de yogurt o crema.',
            'Dejar las tapas en las botellas (se reciclan por separado, ¡juntalas en otra botella!).',
            'Intentar reciclar plásticos de un solo uso como cubiertos.'
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
            { text: 'Botellas de bebidas (vino, cerveza)', icon: '🍷' },
            { text: 'Frascos de conservas (mermelada, etc.)', icon: '🫙' },
            { text: 'Botellas de perfume', icon: '🌸' },
            { text: 'Frascos de café', icon: '☕' },
        ],
        no: [
            { text: 'Vidrios de ventanas o espejos rotos', icon: '🖼️' },
            { text: 'Bombillas de luz', icon: '💡' },
            { text: 'Vasos o platos de vidrio/cristal rotos', icon: '🍽️' },
            { text: 'Frascos de medicamentos', icon: '💊' },
        ],
        tip: 'Quitá las tapas de metal o plástico de los frascos y botellas. No es necesario quitar las etiquetas.',
        commonMistakes: [
            'Tirar espejos o vidrios de ventanas en el contenedor de vidrio.',
            'Depositar objetos de cerámica o porcelana.',
            'No vaciar completamente el contenido de los frascos.'
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
            { text: 'Tapas de frascos', icon: '뚜껑' },
            { text: 'Desodorantes en aerosol (vacíos)', icon: '🌬️' },
            { text: 'Papel de aluminio (limpio)', icon: '✨' },
        ],
        no: [
            { text: 'Pilas y baterías', icon: '🔋' },
            { text: 'Envases de pintura', icon: '🎨' },
            { text: 'Aparatos electrónicos', icon: '💻' },
            { text: 'Cápsulas de café (sin vaciar)', icon: ' cápsula ' },
        ],
        tip: 'Enjuagá las latas de conserva y si es posible, aplastalas para que ocupen menos espacio.',
        commonMistakes: [
            'Tirar pilas en el contenedor de metales (son residuos peligrosos).',
            'No vaciar completamente los aerosoles.',
            'Dejar papel de aluminio sucio con restos de comida.'
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

// Added component and default export to fix errors
const ComoReciclarPage: React.FC<{ user: User | null, onUserAction: (action: GamificationAction, payload?: any) => void, isAdminMode: boolean }> = ({ user, onUserAction, isAdminMode }) => {
    return (
        <div className="bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-text-main">Guía de Reciclaje</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Aprende a separar correctamente tus residuos y conviértete en un experto del reciclaje.</p>
                </div>
            </div>
        </div>
    );
};

export default ComoReciclarPage;
