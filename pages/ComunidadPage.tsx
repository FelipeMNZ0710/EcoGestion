import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { User, GamificationAction, CommunityMessage, ReplyInfo } from '../types';
import { botAvatarUrl } from '../data/botAvatar';

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
            { user: 'Ana Gómez', time: 'Ayer a las 04:30 PM', text: '¡Buen día! ¿Alguien sabe si los envases de tetrabrik van con el cartón o los plásticos?' },
            { user: 'Admin Recicla', time: 'Ayer a las 04:32 PM', text: 'Hola Ana! Van con el cartón, pero asegurate de enjuagarlos y aplastarlos bien. 👍', reactions: {'👍': ['Carlos Ruiz', 'Jarzinski Kiara']} },
            { user: 'Felipe Monzón', time: 'Hoy a las 11:15 AM', text: 'Confirmado, es como dice el admin. La clave es que estén limpios y secos.', replyingTo: { messageId: 2, user: 'Admin Recicla', text: 'Hola Ana! Van con el cartón...' } },
            { user: 'Rossi Fabiana', time: 'Hoy a las 11:18 AM', text: 'Exacto! Una vez me rechazaron un montón de cartón porque una botella de yogurt estaba mal enjuagada y lo manchó todo. 😞' },
            { user: 'Vega Ezequiel Tomás Alejandro', time: 'Hoy a las 12:05 PM', text: 'Uhh que mal. Buen dato para tener en cuenta.'}
        ],
        anuncios: [
            { user: 'Admin Recicla', time: 'Ayer a las 9:00 AM', text: '¡Bienvenidos al canal de anuncios! Aquí publicaremos todas las novedades importantes sobre la iniciativa EcoGestión. Este es un canal de solo lectura para los miembros.' },
            { user: 'Admin Recicla', time: 'Hoy a las 10:00 AM', text: '📢 **¡Nuevo Punto Verde!** 📢\nNos complace anunciar la inauguración de un nuevo Punto Verde en el Barrio San Miguel, frente al Supermercado El Económico. Ya está operativo para recibir Plásticos y Pilas. ¡A reciclar!' },
        ],
        dudas: [
            { user: 'Gonzalez, Agostina', time: 'Ayer a las 08:10 PM', text: 'Hola gente, tengo una duda existencial... ¿el telgopor (EPS) se recicla o no? Porque en algunos lados dicen que sí y en otros que no.'},
            { user: 'Mendoza José Francisco Rafael', time: 'Ayer a las 08:12 PM', text: 'Uf, el eterno dilema. Técnicamente es reciclable, pero es 95% aire y muy liviano, entonces el proceso es caro y complicado. La mayoría de los municipios no lo aceptan.' },
            { user: 'Admin Recicla', time: 'Ayer a las 08:15 PM', text: 'Hola Agostina! José tiene razón. Por ahora, en Formosa **no** estamos procesando telgopor en los Puntos Verdes. Lo mejor es evitarlo lo más posible. Si tenés bandejitas, tratá de limpiarlas y reutilizarlas en casa.' },
            { user: 'Gonzalez, Agostina', time: 'Ayer a las 08:16 PM', text: '¡Gracias por la aclaración a ambos! 🙏' },
            { user: 'Benítez Gonzalo', time: 'Hoy a las 09:30 AM', text: 'Consulta, ¿qué hago con los tickets de supermercado? ¿Van con el papel?' },
            { user: 'Felipe Monzón', time: 'Hoy a las 09:32 AM', text: 'Ojo con eso! La mayoría de los tickets son de papel térmico, que tiene químicos y no se puede reciclar. Van a la basura común.' },
        ],
        proyectos: [
            { user: 'Jarzinski Kiara', time: 'Ayer a las 06:00 PM', text: 'Miren el huerto vertical que armé en el balcón con botellas de plástico PET. ¡Súper fácil y ahora tengo perejil fresco! 🌿', imageUrl: 'https://images.unsplash.com/photo-1596706042369-12a1ba3390d4?q=80&w=400&auto=format&fit=crop' },
            { user: 'Vallejos Ignacio Alejandro', time: 'Ayer a las 06:05 PM', text: '¡Qué genia! Quedó increíble. Me das la idea para hacer uno. ¿Usaste botellas de 2L?', reactions: {'❤️': ['Rossi Fabiana', 'Felipe Monzón']} },
            { user: 'Jarzinski Kiara', time: 'Ayer a las 06:07 PM', text: 'Sí! Las de gaseosa de 2.25L son perfectas. Las corté con un cutter y las colgué con alambre.', replyingTo: { messageId: 2, user: 'Vallejos Ignacio Alejandro', text: '¡Qué genia! Quedó increíble...' } },
        ],
        compostaje: [
            { user: 'Martínez, Javier Nicolás', time: 'Hoy a las 08:45 AM', text: 'Buenas! Soy nuevo en esto del compost. ¿Puedo tirar cáscaras de naranja y limón?' },
            { user: 'Cristaldo Facundo', time: 'Hoy a las 08:50 AM', text: 'Hola Javier! Con los cítricos hay que tener cuidado. En grandes cantidades pueden acidificar mucho el compost y tardan en descomponerse. Yo tiro, pero muy poquito y bien cortado.' },
            { user: 'Martínez, Javier Nicolás', time: 'Hoy a las 08:51 AM', text: 'Buen dato, gracias! ¿Y restos de cebolla y ajo?' },
            { user: 'Cristaldo Facundo', time: 'Hoy a las 08:55 AM', text: 'Lo mismo, en pequeñas cantidades no pasa nada. El problema es que pueden ahuyentar a las lombrices si tenés vermicompostera.' },
            { user: 'Admin Recicla', time: 'Hoy a las 09:00 AM', text: 'Exacto lo que dice Facundo. La clave en el compost es el **equilibrio**. No hay que abusar de ningún ingrediente. ¡Bienvenidos al mundo del compost, Javier!' },
        ]
    };
    
    Object.keys(initialChannels).forEach(key => {
        const channelId = initialChannels[key].id;
        processed[channelId] = (mockMessages[channelId] || []).map((msg, index) => {
            const user = initialUsers[msg.user] || { initials: '?', color: 'bg-gray-200' };
            const fullMessage: CommunityMessage = {
                ...msg,
                id: Date.now() + index,
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

// --- Main Component ---
interface ComunidadPageProps {
  user: User | null;
  onUserAction: (action: GamificationAction, payload?: any) => void;
}

const ComunidadPage: React.FC<ComunidadPageProps> = ({ user, onUserAction }) => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [messages, setMessages] = useState<MessagesState>(initialMessages);
    const [editingMessage, setEditingMessage] = useState<CommunityMessage | null>(null);
    const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    const [isTyping, setIsTyping] = useState<Record<string, string[]>>({});
    const [unreadChannels, setUnreadChannels] = useState(new Set<string>());
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const ADMIN_USERS = ['Felipe Monzón', 'Rolón Sergio Agustín', 'Admin Recicla'];
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
    }, [textareaRef.current?.value]);

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
                    const newReactions = { ...(msg.reactions || {}) };
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
    
    // --- Simulation Logic ---
    useEffect(() => {
        const simulationTimer = setInterval(() => {
            const randomUser = allUserNames[Math.floor(Math.random() * allUserNames.length)];
            const randomChannel = initialChannels[Math.floor(Math.random() * initialChannels.length)].id;
            const action = Math.random();

            if (action < 0.1) { // 10% chance to send a message
                const newMessage: CommunityMessage = {
                    id: Date.now(), user: randomUser, text: "¡Qué buena idea!", timestamp: new Date(),
                    avatarUrl: initialUsers[randomUser]?.avatarUrl, avatarInitials: initialUsers[randomUser]?.initials || '??', avatarColor: initialUsers[randomUser]?.color || getRandomColor()
                };
                setMessages(prev => ({ ...prev, [randomChannel]: [...(prev[randomChannel] || []), newMessage] }));
                if (randomChannel !== activeChannel) {
                    setUnreadChannels(prev => new Set(prev).add(randomChannel));
                }
            } else if (action < 0.2) { // 10% chance to react
                const channelMessages = messages[randomChannel];
                if (channelMessages && channelMessages.length > 0) {
                    const randomMessage = channelMessages[Math.floor(Math.random() * channelMessages.length)];
                    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
                    handleReaction(randomMessage.id, randomEmoji);
                }
            } else if (action < 0.4) { // 20% chance to start typing
                 setIsTyping(prev => {
                    const channelTypers = prev[randomChannel] || [];
                    if (!channelTypers.includes(randomUser)) {
                        const newTypers = [...channelTypers, randomUser];
                        // Stop typing after a delay
                        setTimeout(() => {
                            setIsTyping(p => ({...p, [randomChannel]: (p[randomChannel] || []).filter(u => u !== randomUser) }));
                        }, 3000 + Math.random() * 3000);
                        return { ...prev, [randomChannel]: newTypers };
                    }
                    return prev;
                 });
            }
        }, 5000); // Run simulation every 5 seconds

        return () => clearInterval(simulationTimer);
    }, [activeChannel, messages]);
    
    const activeChannelInfo = initialChannels.find(c => c.id === activeChannel);
    const canWrite = user && (!activeChannelInfo?.adminOnlyWrite || isAdmin);
    const typingUsers = isTyping[activeChannel] || [];

    return (
        <div className="discord-theme flex h-[calc(100vh-80px)] mt-20">
            {/* Channels Sidebar */}
            <aside className="w-60 bg-[color:var(--bg-secondary)] flex flex-col flex-shrink-0">
                <header className="p-4 h-16 flex items-center shadow-md"><h1 className="font-bold text-white text-lg">Canales</h1></header>
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
            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex items-center justify-between p-4 h-16 border-b border-black/20 shadow-sm flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center space-x-2"><span className="text-2xl text-[color:var(--channel-icon)]">#</span><span>{activeChannelInfo?.name}</span></h1>
                        <p className="text-sm text-[color:var(--text-muted)] ml-8">{activeChannelInfo?.description}</p>
                    </div>
                </header>
                 <div className="flex-1 flex min-h-0">
                    <main className="flex-1 flex flex-col min-h-0 bg-[color:var(--bg-primary)]">
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto discord-chat-messages px-4">
                            {/* Chat messages rendered here */}
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
                                    <textarea ref={textareaRef} placeholder={`Enviar mensaje a #${activeChannelInfo?.name}`} className="discord-chat-textarea pt-2" />
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