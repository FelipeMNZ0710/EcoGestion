import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { User, GamificationAction, CommunityMessage, ReplyInfo, Reaction } from '../types';

// FIX: The file botAvatar.ts is not a module. Replaced import with a local constant.
const botAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnpNOCAxMi41YzAtLjgzLjY3LTEuNSAxLjUtMS41czEuNS42NyAxLjUgMS41UzEwLjMzIDE0IDkuNSAxNCA4IDEzLjMzIDggMTIuNXptNi41IDEuNWMtLjgzIDAtMS41LS42Ny0xLjUtMS41cy42Ny0xLjUgMS41LTEuNSAxLjUuNjcgMS41IDEuNS0uNjcgMS41LTEuNSAxLjV6TTEyIDE4Yy0yLjI4IDAtNC4yMi0xLjY2LTUtNGgxMGMtLjc4IDIuMzQtMi43MiA0LTUgNHoiLz48L3N2Zz4=';

// --- Types ---
interface Channel {
    id: string;
    name: string;
    description: string;
    adminOnlyWrite?: boolean;
}

type MessagesState = Record<string, CommunityMessage[]>;
type RenderableChatItem = { type: 'message_group'; group: CommunityMessage[] } | { type: 'date_divider'; date: Date };

// --- Helper Functions ---
const formatUserName = (name: string): string => name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
const getUserInitials = (name: string): string => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const userColors = ['bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 'bg-amber-200 text-amber-800', 'bg-yellow-200 text-yellow-800', 'bg-lime-200 text-lime-800', 'bg-green-200 text-green-800', 'bg-emerald-200 text-emerald-800', 'bg-teal-200 text-teal-800', 'bg-cyan-200 text-cyan-800', 'bg-sky-200 text-sky-800', 'bg-blue-200 text-blue-800', 'bg-indigo-200 text-indigo-800', 'bg-violet-200 text-violet-800', 'bg-purple-200 text-purple-800', 'bg-fuchsia-200 text-fuchsia-800', 'bg-pink-200 text-pink-800', 'bg-rose-200 text-rose-800'];
const getRandomColor = () => userColors[Math.floor(Math.random() * userColors.length)];
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];


// --- Initial Data ---
const initialChannels: Channel[] = [
    { id: 'general', name: 'general', description: 'Discusiones generales sobre reciclaje y sostenibilidad en Formosa.' },
    { id: 'anuncios', name: 'anuncios', description: 'Anuncios importantes del equipo de EcoGestión.', adminOnlyWrite: true },
    { id: 'dudas', name: 'dudas', description: '¿No sabés dónde va algo? ¡Preguntá acá!' },
    { id: 'proyectos', name: 'proyectos', description: 'Compartí tus ideas y proyectos de reciclaje.' },
    { id: 'compostaje', name: 'compostaje', description: 'Todo sobre el arte de compostar en casa.' },
];

const channelCategories: Record<string, string[]> = {
    'GENERAL': ['general', 'anuncios'],
    'TEMAS': ['dudas', 'proyectos', 'compostaje'],
};

const allUsersList = ["Silvera Matías", "Cabrera Dylan Ezequiel", "Franco Sian, Leandro Francisco", "Mendoza José Francisco Rafael", "Cristaldo Facundo", "Pereyra Roman, Ramiro Nicolás", "Gonzalez, Agostina", "Martínez, Javier Nicolás", "Vega Ezequiel Tomás Alejandro", "Ayala Santiago Tomás", "Short Lautaro", "Rodríguez Gonzalo Luis", "Galban Rojas Leonel Rolando", "Fariña Eric Andres", "Garcia Diego Gabriel", "González Viviana Elisa Soledad", "Recalde Alejandro Ezequiel", "Escalante, Elvio Facundo", "Rossi Fabiana", "Villlalba Franco Javier", "Bogado Augusto Gonzalo", "Laprida Fernando Agustin", "Benítez Gonzalo", "Colman Máximo Javier Alexis", "Ruiz Díaz Mateo Benjamin", "Zigaran Lucas", "Veron Máximo", "Falcón Santiago", "Zagaña Torancio, Alfonso", "Agüero Princich Matias Nicolás", "Augusto Fabricio Dario Nicolas", "Giuricich Facundo Gaston", "Miño Presentado Santiago Cristian", "Garrido Amín", "JARZINSKI KIARA", "RUIZ DIAZ DARIO EZEQUIEL", "CRUZ DIEGO JOSE", "AYALA LAUTARO", "BENITEZ FRANCO BENITEZ", "CRUZ YERALDO CÁCERES", "RUIZ DIAZ RUBEN ALEJANDRO", "RAMIREZ LUANA ABIGAIL", "BRITEZ SELENA", "BERNARD STELLA", "GAONA AXEL", "ACOSTA MARIA LAURA", "PÉREZ ANAHI JAQUELINE", "ROLÓN SERGIO AGUSTÍN", "VALLEJOS IGNACIO ALEJANDRO", "YBARS GIMÉNEZ ALAN MAURICIO", "FERNÁNDEZ ROBLEDO ZAMORA FELIX", "MONZÓN BRIAN NAHUEL", "DUARTE KEILA SERENA", "BENÍTEZ CRISTIAN RAMÓN", "CABRERA LAUTARO", "PERTILE SANTINO", "PERLO MARCOS EMMANUEL", "BENITEZ GÓMEZ LAUTARO SERGIO", "LEZCANO MAXIMILIANO", "OLMEDO VANESA AYELÉN", "GONZALEZ CANDIA, SEBASTIÁN NAHUEL", "BRITEZ DAMIÁN", "GONZALEZ LEANDRO GABRIEL", "ALVAREZ LUANA", "SANCHEZ GONZALO JOSE", "ACOSTA FERNANDO EXEQUIEL", "ALVARENGA FRANCO", "SANTIAGO GASTÓN ALMIRÓN", "ZALAZAR ABEL", "ARMOA AARON ANGEL", "MARTINEZ ALEXANDER FACUNDO", "VILLALBA LAUTARO DAVID", "IGURI NOELIA SOLEDAD", "MANSINI JOSÉ LIONEL", "ALMIRÓN AIELET ÁMBAR", "AMARILLA JULIO CÉSAR", "Miguel Mateo Badaracco", "Ana Gómez", "Carlos Ruiz"];

interface CommunityUser {
    initials: string;
    color: string;
    avatarUrl?: string;
}

const initialUsers: Record<string, CommunityUser> = {
    'Admin Recicla': { initials: 'AR', color: 'bg-primary/20 text-primary', avatarUrl: botAvatarUrl },
    'Felipe Monzón': { initials: 'FM', color: 'bg-teal-200 text-teal-800' },
};

allUsersList.forEach(name => {
    const formatted = formatUserName(name.replace(/\d+/g, '').trim());
    if (!initialUsers[formatted]) {
        initialUsers[formatted] = {
            initials: getUserInitials(formatted),
            color: getRandomColor()
        };
    }
});

const parseRelativeTime = (timeStr: string): Date => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (!timeMatch) return new Date();
    let [ , hoursStr, minutesStr, period ] = timeMatch;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

    const targetDate = timeStr.toLowerCase().includes('ayer') ? yesterday : today;
    targetDate.setHours(hours, minutes, 0, 0);
    return targetDate;
};

const processInitialMessages = (): MessagesState => {
    const processed: MessagesState = {};
    const mockMessages: Record<string, any[]> = {
        general: [
            { id: 1, user: 'Ana Gómez', time: 'Ayer a las 04:30 PM', text: '¡Buen día! ¿Alguien sabe si los envases de tetrabrik van con el cartón o los plásticos?' },
            { id: 2, user: 'Admin Recicla', time: 'Ayer a las 04:32 PM', text: 'Hola Ana! Van con el cartón, pero asegurate de enjuagarlos y aplastarlos bien. 👍', reactions: {'👍': ['Carlos Ruiz', 'Jarzinski Kiara']} },
            { id: 3, user: 'Felipe Monzón', time: 'Hoy a las 11:15 AM', text: 'Confirmado, es como dice el admin. La clave es que estén limpios y secos.', replyingTo: { messageId: 2, user: 'Admin Recicla', text: 'Hola Ana! Van con el cartón...' } },
            { id: 4, user: 'Rossi Fabiana', time: 'Hoy a las 11:18 AM', text: 'Exacto! Una vez me rechazaron un montón de cartón porque una botella de yogurt estaba mal enjuagada y lo manchó todo. 😞' },
            { id: 5, user: 'Vega Ezequiel Tomás Alejandro', time: 'Hoy a las 12:05 PM', text: 'Uhh que mal. Buen dato para tener en cuenta.'}
        ],
        anuncios: [
            { id: 6, user: 'Admin Recicla', time: 'Ayer a las 9:00 AM', text: '¡Bienvenidos al canal de anuncios! Aquí publicaremos todas las novedades importantes sobre la iniciativa EcoGestión. Este es un canal de solo lectura para los miembros.' },
            { id: 7, user: 'Admin Recicla', time: 'Hoy a las 10:00 AM', text: '📢 **¡Nuevo Punto Verde!** 📢\nNos complace anunciar la inauguración de un nuevo Punto Verde en el Barrio San Miguel, frente al Supermercado El Económico. Ya está operativo para recibir Plásticos y Pilas. ¡A reciclar!' },
        ],
        dudas: [
            { id: 8, user: 'Gonzalez, Agostina', time: 'Ayer a las 08:10 PM', text: 'Hola gente, tengo una duda existencial... ¿el telgopor (EPS) se recicla o no? Porque en algunos lados dicen que sí y en otros que no.'},
            { id: 9, user: 'Mendoza José Francisco Rafael', time: 'Ayer a las 08:12 PM', text: 'Uf, el eterno dilema. Técnicamente es reciclable, pero es 95% aire y muy liviano, entonces el proceso es caro y complicado. La mayoría de los municipios no lo aceptan.' },
            { id: 10, user: 'Admin Recicla', time: 'Ayer a las 08:15 PM', text: 'Hola Agostina! José tiene razón. Por ahora, en Formosa **no** estamos procesando telgopor en los Puntos Verdes. Lo mejor es evitarlo lo más posible. Si tenés bandejitas, tratá de limpiarlas y reutilizarlas en casa.' },
            { id: 11, user: 'Gonzalez, Agostina', time: 'Ayer a las 08:16 PM', text: '¡Gracias por la aclaración a ambos! 🙏' },
            { id: 12, user: 'Benítez Gonzalo', time: 'Hoy a las 09:30 AM', text: 'Consulta, ¿qué hago con los tickets de supermercado? ¿Van con el papel?' },
            { id: 13, user: 'Felipe Monzón', time: 'Hoy a las 09:32 AM', text: 'Ojo con eso! La mayoría de los tickets son de papel térmico, que tiene químicos y no se puede reciclar. Van a la basura común.' },
        ],
        proyectos: [
            { id: 14, user: 'Jarzinski Kiara', time: 'Ayer a las 06:00 PM', text: 'Miren el huerto vertical que armé en el balcón con botellas de plástico PET. ¡Súper fácil y ahora tengo perejil fresco! 🌿', imageUrl: 'https://images.unsplash.com/photo-1596706042369-12a1ba3390d4?q=80&w=400&auto=format&fit=crop' },
            { id: 15, user: 'Vallejos Ignacio Alejandro', time: 'Ayer a las 06:05 PM', text: '¡Qué genia! Quedó increíble. Me das la idea para hacer uno. ¿Usaste botellas de 2L?', reactions: {'❤️': ['Rossi Fabiana', 'Felipe Monzón']} },
            { id: 16, user: 'Jarzinski Kiara', time: 'Ayer a las 06:07 PM', text: 'Sí! Las de gaseosa de 2.25L son perfectas. Las corté con un cutter y las colgué con alambre.', replyingTo: { messageId: 15, user: 'Vallejos Ignacio Alejandro', text: '¡Qué genia! Quedó increíble...' } },
        ],
        compostaje: [
            { id: 17, user: 'Martínez, Javier Nicolás', time: 'Hoy a las 08:45 AM', text: 'Buenas! Soy nuevo en esto del compost. ¿Puedo tirar cáscaras de naranja y limón?' },
            { id: 18, user: 'Cristaldo Facundo', time: 'Hoy a las 08:50 AM', text: 'Hola Javier! Con los cítricos hay que tener cuidado. En grandes cantidades pueden acidificar mucho el compost y tardan en descomponerse. Yo tiro, pero muy poquito y bien cortado.' },
            { id: 19, user: 'Martínez, Javier Nicolás', time: 'Hoy a las 08:51 AM', text: 'Buen dato, gracias! ¿Y restos de cebolla y ajo?' },
            { id: 20, user: 'Cristaldo Facundo', time: 'Hoy a las 08:55 AM', text: 'Lo mismo, en pequeñas cantidades no pasa nada. El problema es que pueden ahuyentar a las lombrices si tenés vermicompostera.' },
            { id: 21, user: 'Admin Recicla', time: 'Hoy a las 09:00 AM', text: 'Exacto lo que dice Facundo. La clave en el compost es el **equilibrio**. No hay que abusar de ningún ingrediente. ¡Bienvenidos al mundo del compost, Javier!' },
        ]
    };
    
    Object.keys(initialChannels).forEach(key => {
        const channelId = initialChannels[key].id;
        processed[channelId] = (mockMessages[channelId] || []).map((msg) => {
            const user = initialUsers[msg.user] || { initials: '?', color: 'bg-gray-200' };
            const fullMessage: CommunityMessage = {
                ...msg,
                timestamp: parseRelativeTime(msg.time),
                avatarUrl: user.avatarUrl,
                avatarInitials: user.initials,
                avatarColor: user.color,
            };
            return fullMessage;
        });
    });

    return processed;
};

const initialMessages = processInitialMessages();
const allUserNames = Object.keys(initialUsers);
const members = allUserNames.map(name => ({ name, online: Math.random() > 0.3 }));

// --- Sub-Components ---
const DateDivider: React.FC<{ date: Date }> = ({ date }) => (
    <div className="discord-date-divider"><span>{new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date)}</span></div>
);

const MessageItem: React.FC<{
    message: CommunityMessage; isGroupStart: boolean; user: User | null; isAdmin: boolean;
    setReplyingTo: (msg: CommunityMessage | null) => void; setEditingMessage: (msg: CommunityMessage | null) => void;
    handleDeleteMessage: (id: number) => void; handleReaction: (id: number, emoji: string) => void;
    handleEditMessage: (id: number, newText: string) => void; editingMessage: CommunityMessage | null;
}> = ({ message, isGroupStart, user, isAdmin, setReplyingTo, setEditingMessage, handleDeleteMessage, handleReaction, handleEditMessage, editingMessage }) => {
    const [hovered, setHovered] = useState(false);
    const [editedText, setEditedText] = useState(message.text);
    
    const isEditing = editingMessage?.id === message.id;
    const canInteract = user?.name === message.user || isAdmin;

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editedText.trim()) {
            handleEditMessage(message.id, editedText.trim());
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit(e);
        } else if (e.key === 'Escape') {
            setEditingMessage(null);
            setEditedText(message.text);
        }
    };
    
    return (
        <div className={`discord-message-item ${isGroupStart ? 'mt-4' : ''}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {isGroupStart && (
                <div className="discord-message-avatar">
                    {message.avatarUrl ? <img src={message.avatarUrl} alt={message.user} className="w-10 h-10 rounded-full object-cover" />
                    : <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${message.avatarColor}`}>{message.avatarInitials}</div>}
                </div>
            )}
            
            <div className="flex flex-col">
                {message.replyingTo && (
                    <div className="discord-reply-container">
                        <div className="discord-reply-line"></div>
                        <span className="discord-reply-user mr-1">{message.replyingTo.user}</span>
                        <span className="discord-reply-content">{message.replyingTo.text}</span>
                    </div>
                )}

                {isGroupStart && (
                    <div className="flex items-baseline space-x-2">
                        <span className="font-semibold text-[color:var(--header-primary)]">{message.user}</span>
                        <span className="text-xs text-[color:var(--text-muted)]">{new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(message.timestamp)}</span>
                    </div>
                )}
                
                {isEditing ? (
                    <form onSubmit={handleSaveEdit}>
                        <textarea value={editedText} onChange={e => setEditedText(e.target.value)} onKeyDown={handleKeyDown} className="discord-chat-textarea bg-slate-700 rounded-md p-2 w-full mt-1" autoFocus />
                        <div className="text-xs mt-1">presiona <kbd className="font-sans text-xs bg-slate-800 p-0.5 rounded">Escape</kbd> para cancelar • <kbd className="font-sans text-xs bg-slate-800 p-0.5 rounded">Enter</kbd> para guardar</div>
                    </form>
                ) : (
                    <p className="text-[color:var(--text-normal)] whitespace-pre-wrap">{message.text} {message.edited && <span className="text-xs text-[color:var(--text-muted)]">(editado)</span>}</p>
                )}

                {message.imageUrl && !isEditing && <img src={message.imageUrl} alt="Imagen adjunta" className="mt-2 max-w-xs rounded-lg" />}

                {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="discord-reactions-bar">
                        {Object.entries(message.reactions).map(([emoji, users]) => (
                            <button key={emoji} onClick={() => handleReaction(message.id, emoji)} className={`reaction-pill ${user && users.includes(user.name) ? 'reacted-by-user' : ''}`}>
                                <span className="emoji">{emoji}</span> <span className="count">{users.length}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {hovered && user && (
                <div className="discord-message-toolbar">
                    <button className="discord-toolbar-button" onClick={() => setReplyingTo(message)} title="Responder">💬</button>
                    <button className="discord-toolbar-button" title="Reaccionar">😀</button>
                    {canInteract && <button className="discord-toolbar-button" onClick={() => { setEditingMessage(message); setEditedText(message.text); }} title="Editar">✏️</button>}
                    {canInteract && <button className="discord-toolbar-button" onClick={() => handleDeleteMessage(message.id)} title="Eliminar">🗑️</button>}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
interface ComunidadPageProps {
  user: User | null;
  onUserAction: (action: GamificationAction, payload?: any) => void;
}

const ComunidadPage: React.FC<ComunidadPageProps> = ({ user, onUserAction }) => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [messages, setMessages] = useState<MessagesState>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState<CommunityMessage | null>(null);
    const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
    const [isTyping, setIsTyping] = useState<Record<string, string[]>>({});
    const [unreadChannels, setUnreadChannels] = useState(new Set<string>());
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const ADMIN_USERS = ['Felipe Monzón', 'Admin Recicla'];
    const isAdmin = user ? ADMIN_USERS.includes(user.name) : false;

    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages, activeChannel, isTyping]);
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [newMessage]);

    const handleSendMessage = useCallback((text: string, imageUrl?: string) => {
        if ((!text.trim() && !imageUrl) || !user) return;

        const newUserMessage: CommunityMessage = {
            id: Date.now(),
            user: user.name,
            text: text.trim(),
            imageUrl,
            timestamp: new Date(),
            avatarUrl: initialUsers[user.name]?.avatarUrl,
            avatarInitials: initialUsers[user.name]?.initials || getUserInitials(user.name),
            avatarColor: initialUsers[user.name]?.color || getRandomColor(),
            replyingTo: replyingTo ? { messageId: replyingTo.id, user: replyingTo.user, text: replyingTo.text } : undefined,
        };
        setMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), newUserMessage] }));
        setReplyingTo(null);
        onUserAction('send_message');
    }, [user, activeChannel, onUserAction, replyingTo]);
    
    const handleReaction = (messageId: number, emoji: string) => {
        if (!user) return;
        setMessages(prev => {
            const channelMessages = prev[activeChannel] || [];
            const newMessages = channelMessages.map(msg => {
                if (msg.id === messageId) {
                    const newReactions: Reaction = { ...(msg.reactions || {}) };
                    const usersWhoReacted = newReactions[emoji] || [];
                    if (usersWhoReacted.includes(user.name)) {
                        newReactions[emoji] = usersWhoReacted.filter(name => name !== user.name);
                        if (newReactions[emoji].length === 0) delete newReactions[emoji];
                    } else {
                        newReactions[emoji] = [...usersWhoReacted, user.name];
                    }
                    return { ...msg, reactions: newReactions };
                }
                return msg;
            });
            return { ...prev, [activeChannel]: newMessages };
        });
    };

    const handleEditMessage = (messageId: number, newText: string) => {
        setMessages(prev => ({
            ...prev,
            [activeChannel]: prev[activeChannel].map(m =>
                m.id === messageId ? { ...m, text: newText, edited: true } : m
            )
        }));
        setEditingMessage(null);
    };

    const handleDeleteMessage = (messageId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
            setMessages(prev => ({
                ...prev,
                [activeChannel]: prev[activeChannel].filter(m => m.id !== messageId)
            }));
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const renderableChatItems = useMemo(() => {
        const channelMessages = messages[activeChannel] || [];
        if (channelMessages.length === 0) return [];
        
        const items: RenderableChatItem[] = [];
        let lastMessage: CommunityMessage | null = null;
    
        channelMessages.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const lastMessageDate = lastMessage ? new Date(lastMessage.timestamp) : null;
    
            if (!lastMessageDate || messageDate.toDateString() !== lastMessageDate.toDateString()) {
                items.push({ type: 'date_divider', date: messageDate });
            }
    
            const fiveMinutes = 5 * 60 * 1000;
            if (
                lastMessage &&
                items.length > 0 &&
                items[items.length - 1].type === 'message_group' &&
                message.user === lastMessage.user &&
                messageDate.getTime() - lastMessageDate!.getTime() < fiveMinutes &&
                !message.replyingTo && !lastMessage.replyingTo
            ) {
                (items[items.length - 1] as { type: 'message_group'; group: CommunityMessage[] }).group.push(message);
            } else {
                items.push({ type: 'message_group', group: [message] });
            }
            
            lastMessage = message;
        });
        
        return items;
    }, [messages, activeChannel]);
    
    const activeChannelInfo = initialChannels.find(c => c.id === activeChannel);
    const canWrite = user && (!activeChannelInfo?.adminOnlyWrite || isAdmin);
    const typingUsers = isTyping[activeChannel] || [];

    return (
        <div className="discord-theme flex h-screen">
            {/* Channels Sidebar */}
            <aside className="w-60 bg-[color:var(--bg-secondary)] flex flex-col flex-shrink-0">
                <header className="p-4 h-32 flex items-end shadow-md"><h1 className="font-bold text-white text-lg">Canales</h1></header>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {Object.entries(channelCategories).map(([categoryName, channelIds]) => (
                        <div key={categoryName}>
                            <button onClick={() => setCollapsedCategories(p => ({...p, [categoryName]: !p[categoryName]}))} className="discord-category-header">
                                <span>{categoryName}</span>
                                <svg className={`category-arrow ${collapsedCategories[categoryName] ? 'collapsed' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {!collapsedCategories[categoryName] && channelIds.map(channelId => {
                                const channel = initialChannels.find(c => c.id === channelId);
                                if (!channel) return null;
                                const hasUnread = unreadChannels.has(channel.id);
                                return <a key={channel.id} href="#" onClick={(e) => { e.preventDefault(); setActiveChannel(channel.id); setUnreadChannels(p => { const newSet = new Set(p); newSet.delete(channel.id); return newSet; }); }} className={`relative flex items-center space-x-2 w-full text-left px-2 py-1.5 rounded transition-colors channel-link text-[color:var(--text-muted)] ${activeChannel === channel.id ? 'active' : ''} ${hasUnread ? 'has-unread !text-white font-semibold' : ''}`}>
                                    <span className="unread-badge"></span><span className="text-xl">#</span><span>{channel.name}</span>
                                </a>;
                            })}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[color:var(--bg-primary)]">
                <header className="flex items-end justify-between p-4 h-32 border-b border-black/20 shadow-sm flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center space-x-2 text-[color:var(--header-primary)]"><span className="text-2xl text-[color:var(--channel-icon)]">#</span><span>{activeChannelInfo?.name}</span></h1>
                        <p className="text-sm text-[color:var(--header-secondary)] ml-8">{activeChannelInfo?.description}</p>
                    </div>
                </header>
                 <div className="flex-1 flex min-h-0">
                    <main className="flex-1 flex flex-col min-h-0">
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto discord-chat-messages px-4">
                            <div className="h-4" />
                            {renderableChatItems.map((item, index) => {
                                if (item.type === 'date_divider') {
                                    return <DateDivider key={`divider-${index}`} date={item.date} />;
                                }
                                const group = item.group;
                                return (
                                    <div key={group[0].id} className="discord-message-group">
                                        {group.map((message, msgIndex) => (
                                            <MessageItem
                                                key={message.id}
                                                message={message}
                                                isGroupStart={msgIndex === 0}
                                                user={user}
                                                isAdmin={isAdmin}
                                                setReplyingTo={setReplyingTo}
                                                setEditingMessage={setEditingMessage}
                                                handleDeleteMessage={handleDeleteMessage}
                                                handleReaction={handleReaction}
                                                handleEditMessage={handleEditMessage}
                                                editingMessage={editingMessage}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                             <div className="h-4" />
                        </div>
                        <footer className="px-4 pb-4 pt-2 flex-shrink-0">
                             <div className="typing-indicator">
                                {typingUsers.length > 0 &&
                                    <span>
                                        <strong>{typingUsers.join(', ')}</strong> está{typingUsers.length > 1 ? 'n' : ''} escribiendo...
                                        <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                                    </span>
                                }
                            </div>
                             {canWrite ? (
                                <div className="discord-chat-input-wrapper">
                                    {replyingTo && (
                                        <div className="reply-bar">
                                            <span>Respondiendo a <strong>{replyingTo.user}</strong></span>
                                            <button onClick={() => setReplyingTo(null)} className="text-xl">&times;</button>
                                        </div>
                                    )}
                                    <textarea 
                                        ref={textareaRef} 
                                        placeholder={`Enviar mensaje a #${activeChannelInfo?.name}`} 
                                        className="discord-chat-textarea pt-2"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={1}
                                    />
                                </div>
                            ) : (
                                <div className="text-center text-sm text-[color:var(--text-muted)] bg-[color:var(--input-bg)] p-3 rounded-lg">{user ? 'Solo los administradores pueden enviar mensajes.' : 'Debes iniciar sesión para enviar mensajes.'}</div>
                            )}
                        </footer>
                    </main>

                    {/* Members Sidebar */}
                    <aside className="w-60 discord-sidebar-members flex-shrink-0 p-2 flex flex-col">
                         <h2 className="p-2 text-[color:var(--header-secondary)] text-xs font-bold uppercase flex-shrink-0">Miembros — {members.length}</h2>
                        <div className="flex-1 overflow-y-auto pr-1">
                            {members.map(member => {
                                const memberInfo = initialUsers[member.name] || { initials: '??', color: getRandomColor() };
                                const isUserAdmin = ADMIN_USERS.includes(member.name);
                                return (
                                    <div key={member.name} className="flex items-center p-2 rounded-md hover:bg-[color:var(--bg-hover)] cursor-pointer">
                                        <div className="relative mr-3">
                                            {memberInfo.avatarUrl ? (
                                                <img src={memberInfo.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${memberInfo.color}`}>
                                                    {memberInfo.initials}
                                                </div>
                                            )}
                                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-[color:var(--bg-secondary)] ${member.online ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                                        </div>
                                        <div className="flex-1 truncate">
                                            <span className="text-sm font-semibold text-[color:var(--text-normal)]">{member.name}</span>
                                            {isUserAdmin && <span className="ml-2 discord-admin-tag">ADMIN</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ComunidadPage;