import React, { useState, useRef, useEffect } from 'react';
import type { ContentBlock } from '../types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatInputProps {
  onSendMessage: (message: string, image?: { data: string; mimeType: string; }) => void;
  isLoading: boolean;
  injectBotMessage: (content: ContentBlock[]) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, injectBotMessage }) => {
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState<{ file: File; preview: string; } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const [micPermission, setMicPermission] = useState('prompt');
  const [hasShownMicHint, setHasShownMicHint] = useState(false);
  
  const deniedPermissionMessage = "He notado que el permiso para usar el micrófono está bloqueado. Para activarlo, generalmente puedes hacer clic en el ícono de candado 🔒 en la barra de direcciones y cambiar la configuración del micrófono a 'Permitir'.";

  useEffect(() => {
    // Check for permissions API support
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then(permissionStatus => {
        setMicPermission(permissionStatus.state);
        // Listen for changes in permission
        permissionStatus.onchange = () => {
          setMicPermission(permissionStatus.state);
        };
      }).catch(err => {
        console.error("Permission query failed:", err);
      });
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInputText(prev => prev + transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        
        let errorMessage = '';
        switch(event.error) {
            case 'not-allowed':
                errorMessage = deniedPermissionMessage;
                break;
            case 'no-speech':
                errorMessage = "No detecté ninguna voz. Por favor, intenta hablar más claro o acércate al micrófono.";
                break;
            case 'audio-capture':
                errorMessage = "No pude acceder al micrófono. Asegúrate de que no esté siendo usado por otra aplicación.";
                break;
            case 'network':
                errorMessage = "Hubo un problema de red. Por favor, revisa tu conexión a internet e intenta de nuevo.";
                break;
            case 'aborted':
                // This happens when the user stops it manually, so no message is needed.
                break;
            default:
                errorMessage = "Ocurrió un error inesperado con el reconocimiento de voz. Por favor, intenta de nuevo."
                break;
        }

        if (errorMessage) {
            injectBotMessage([{ type: 'text', text: errorMessage }]);
        }
        
        setIsListening(false);
      };
    }
  }, [injectBotMessage, deniedPermissionMessage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage({ file, preview: URL.createObjectURL(file) });
    }
  };
  
  const removeImage = () => {
      if(image) {
        URL.revokeObjectURL(image.preview);
      }
      setImage(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('El reconocimiento de voz no es compatible con este navegador.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      // onend will set isListening to false
      return;
    }
    
    if (micPermission === 'denied') {
      injectBotMessage([{
        type: 'text',
        text: deniedPermissionMessage
      }]);
      return;
    }

    if (micPermission === 'prompt' && !hasShownMicHint) {
      injectBotMessage([{
        type: 'text',
        text: "Para usar el dictado por voz, necesito tu permiso. Haz clic en el ícono del micrófono de nuevo y luego presiona 'Permitir' cuando el navegador te lo pida."
      }]);
      setHasShownMicHint(true);
      return;
    }

    // This is reached if permission is 'granted', or if it's 'prompt' and the hint has been shown.
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error("Speech recognition could not start: ", err);
      // The .onerror event will handle user feedback.
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !image) || isLoading) return;

    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onSendMessage(inputText.trim(), { data: base64String, mimeType: image.file.type });
        setInputText('');
        removeImage();
      };
      reader.readAsDataURL(image.file);
    } else {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div>
        {image && (
            <div className="relative inline-block mb-2 animate-scale-in">
                <img src={image.preview} alt="Vista previa" className="h-20 w-20 object-cover rounded-lg border-2 border-gray-300" />
                <button 
                    onClick={removeImage} 
                    className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-500 transition-colors"
                    aria-label="Quitar imagen"
                >
                    &times;
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" capture="environment" />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-primary disabled:opacity-50 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Adjuntar imagen"
                title="Adjuntar imagen"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
            <button
                type="button"
                onClick={handleMicClick}
                disabled={isLoading}
                className={`flex-shrink-0 p-2 text-gray-500 hover:text-primary disabled:opacity-50 transition-colors rounded-full hover:bg-gray-100 ${isListening ? 'mic-listening' : ''}`}
                aria-label="Usar micrófono"
                title="Usar micrófono"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 10v4m0 0l-4-4m4 4l4-4m-6-4v-7a4 4 0 018 0v7" /></svg>
            </button>
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe o adjunta una foto..."
                disabled={isLoading}
                className="flex-1 w-full px-4 py-2 text-gray-800 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                aria-label="Mensaje de chat"
            />
            <button
                type="submit"
                disabled={isLoading || (!inputText.trim() && !image)}
                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 text-white bg-primary rounded-full hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar mensaje"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
            </button>
        </form>
    </div>
  );
};

export default ChatInput;