import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { User, GamificationAction } from '../types';
import { botAvatarUrl } from '../data/botAvatar';

// --- Types ---
interface Reaction {
    [emoji: string]: string[]; // emoji -> array of user names
}

interface Message {
    id: number;
    user: string;
    avatarInitials: string;
    avatarColor: string;
    timestamp: Date;
    text: string;
    imageUrl?: string;
    edited?: boolean;
    reactions?: Reaction;
}

interface Channel {
    id: string;
    name: string;
    description: string;
    adminOnlyWrite?: boolean;
}

type MessagesState = Record<string, Message[]>;
type RenderableChatItem = { type: 'message_group'; group: Message[] } | { type: 'date_divider'; date: Date };


// --- Helper Functions ---
const formatUserName = (name: string): string => name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
const getUserInitials = (name: string): string => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const userColors = ['bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 'bg-amber-200 text-amber-800', 'bg-yellow-200 text-yellow-800', 'bg-lime-200 text-lime-800', 'bg-green-200 text-green-800', 'bg-emerald-200 text-emerald-800', 'bg-teal-200 text-teal-800', 'bg-cyan-200 text-cyan-800', 'bg-sky-200 text-sky-800', 'bg-blue-200 text-blue-800', 'bg-indigo-200 text-indigo-800', 'bg-violet-200 text-violet-800', 'bg-purple-200 text-purple-800', 'bg-fuchsia-200 text-fuchsia-800', 'bg-pink-200 text-pink-800', 'bg-rose-200 text-rose-800'];
const getRandomColor = () => userColors[Math.floor(Math.random() * userColors.length)];

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
    'Felipe': { initials: 'F', color: 'bg-teal-200 text-teal-800' },
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
            { user: 'Felipe', time: 'Hoy a las 11:15 AM', text: 'Confirmado, es como dice el admin. La clave es que estén limpios y secos.' },
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
            { user: 'Felipe', time: 'Hoy a las 09:32 AM', text: 'Ojo con eso! La mayoría de los tickets son de papel térmico, que tiene químicos y no se puede reciclar. Van a la basura común.' },
        ],
        proyectos: [
            { user: 'Jarzinski Kiara', time: 'Ayer a las 06:00 PM', text: 'Miren el huerto vertical que armé en el balcón con botellas de plástico PET. ¡Súper fácil y ahora tengo perejil fresco! 🌿', imageUrl: 'https://images.unsplash.com/photo-1596706042369-12a1ba3390d4?q=80&w=400&auto=format&fit=crop' },
            { user: 'Vallejos Ignacio Alejandro', time: 'Ayer a las 06:05 PM', text: '¡Qué genia! Quedó increíble. Me das la idea para hacer uno. ¿Usaste botellas de 2L?', reactions: {'❤️': ['Rossi Fabiana', 'Felipe']} },
            { user: 'Jarzinski Kiara', time: 'Ayer a las 06:07 PM', text: '@\'Vallejos Ignacio Alejandro\' Sí! Las de gaseosa de 2.25L son perfectas. Las corté con un cutter y las colgué con alambre.' },
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
            return {
                ...msg,
                id: Date.now() + index,
                timestamp: parseRelativeTime(msg.time),
                avatarInitials: user.initials,
                avatarColor: user.color,
            }
        });
    });

    return processed;
};

const initialMessages = processInitialMessages();
const allUserNames = Object.keys(initialUsers);
const members = allUserNames.map(name => ({ name, online: Math.random() > 0.3 }));

// --- Sub-Components ---
const CommunityChatInput: React.FC<{
    onSendMessage: (text: string, imageUrl?: string) => void;
    channelName: string;
    disabled: boolean;
}> = ({ onSendMessage, channelName, disabled }) => {
    const [inputText, setInputText] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePreview = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!inputText.trim() && !imagePreview) || disabled) return;

        onSendMessage(inputText, imagePreview || undefined);
        setInputText('');
        removePreview();
    };

    return (
        <div className="bg-[color:var(--input-bg)] p-2 rounded-lg">
            {imagePreview && (
                <div className="relative w-24 h-24 mb-2 p-2 bg-black/20 rounded-md">
                    <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover rounded" />
                    <button onClick={removePreview} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center">&times;</button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
                <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={`Enviar mensaje a #${channelName}`}
                    disabled={disabled}
                    className="flex-1 bg-transparent outline-none text-[color:var(--text-normal)] placeholder-gray-500"
                />
            </form>
        </div>
    );
};


// --- Main Component ---
interface ComunidadPageProps {
  user: User | null;
  onUserAction: (action: GamificationAction) => void;
}

const ComunidadPage: React.FC<ComunidadPageProps> = ({ user, onUserAction }) => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [messages, setMessages] = useState<MessagesState>(initialMessages);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const ADMIN_USERS = ['Felipe', 'Rolón Sergio Agustín', 'Admin Recicla'];
    const isAdmin = user ? ADMIN_USERS.includes(user.name) : false;

    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages, activeChannel]);

    const handleSendMessage = (text: string, imageUrl?: string) => {
        if ((!text.trim() && !imageUrl) || !user) return;

        const newUserMessage: Message = {
            id: Date.now(),
            user: user.name,
            text: text.trim(),
            imageUrl,
            timestamp: new Date(),
            avatarInitials: initialUsers[user.name]?.initials || getUserInitials(user.name),
            avatarColor: initialUsers[user.name]?.color || getRandomColor(),
        };
        setMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), newUserMessage] }));
        onUserAction('send_message');
    };
    
    const handleDeleteMessage = (messageId: number) => {
        setMessages(prev => ({
            ...prev,
            [activeChannel]: prev[activeChannel].filter(m => m.id !== messageId)
        }));
    };
    
    const handleStartEditing = (message: Message) => {
        setEditingMessageId(message.id);
        setEditingText(message.text);
    };
    
    const handleSaveEdit = () => {
        if (!editingMessageId) return;
        setMessages(prev => ({
            ...prev,
            [activeChannel]: prev[activeChannel].map(m =>
                m.id === editingMessageId ? { ...m, text: editingText, edited: true, timestamp: new Date() } : m
            )
        }));
        setEditingMessageId(null);
        setEditingText('');
    };

    const renderMessageContent = (message: Message) => {
      const textParts = message.text.split(/(@'[^']+'|#[\w-]+)/g).map((part, i) => {
          if (part && part.startsWith("@'")) {
              const name = part.slice(2, -1);
              return <strong key={i} className="text-text-mention bg-bg-mention font-semibold p-0.5 rounded">{`@${name}`}</strong>;
          }
          if (part && part.startsWith('#')) {
              const channel = part.slice(1);
              return <strong key={i} className="text-text-mention bg-bg-mention font-semibold p-0.5 rounded cursor-pointer" onClick={() => setActiveChannel(channel)}>{part}</strong>;
          }
          return part;
      });

      return (
        <div>
          {message.text && <div className="discord-message-content">{textParts}</div>}
          {message.imageUrl && <img src={message.imageUrl} alt="Contenido adjunto" className="mt-2 rounded-lg max-w-xs max-h-64" />}
          {message.edited && <span className="text-xs text-[color:var(--text-muted)] ml-2">(editado)</span>}
        </div>
      );
    };

    const sortedMembers = useMemo(() => {
        return members.sort((a, b) => {
            const aIsAdmin = ADMIN_USERS.includes(a.name);
            const bIsAdmin = ADMIN_USERS.includes(b.name);
            if (aIsAdmin !== bIsAdmin) return aIsAdmin ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    }, []);

    const activeChannelInfo = initialChannels.find(c => c.id === activeChannel);
    const canWrite = user && (!activeChannelInfo?.adminOnlyWrite || isAdmin);
    
    const processedChatItems = useMemo((): RenderableChatItem[] => {
        let currentMessages = messages[activeChannel] || [];
        if (searchQuery) {
            currentMessages = currentMessages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (currentMessages.length === 0) return [];
        
        const items: RenderableChatItem[] = [];
        let lastDate: Date | null = null;
        let currentGroup: Message[] = [];

        for (const message of currentMessages) {
            if (!lastDate || message.timestamp.toDateString() !== lastDate.toDateString()) {
                if (currentGroup.length > 0) items.push({ type: 'message_group', group: currentGroup });
                currentGroup = [];
                items.push({ type: 'date_divider', date: message.timestamp });
            }
            
            const lastMessageInGroup = currentGroup[currentGroup.length - 1];
            if (lastMessageInGroup && lastMessageInGroup.user === message.user && (message.timestamp.getTime() - lastMessageInGroup.timestamp.getTime()) < 5 * 60 * 1000) {
                currentGroup.push(message);
            } else {
                if (currentGroup.length > 0) items.push({ type: 'message_group', group: currentGroup });
                currentGroup = [message];
            }
            lastDate = message.timestamp;
        }
        if (currentGroup.length > 0) items.push({ type: 'message_group', group: currentGroup });

        return items;
    }, [messages, activeChannel, searchQuery]);
    
    const toggleCategory = (categoryName: string) => {
        setCollapsedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
    };

    return (
        <div className="discord-theme flex h-[calc(100vh-80px)]">
            <aside className="w-60 bg-[color:var(--bg-secondary)] flex flex-col flex-shrink-0">
                <header className="p-4 h-16 flex items-center shadow-md"><h1 className="font-bold text-white text-lg">Canales</h1></header>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {Object.entries(channelCategories).map(([categoryName, channelIds]) => {
                        const isCollapsed = collapsedCategories[categoryName];
                        return (
                            <div key={categoryName}>
                                <button onClick={() => toggleCategory(categoryName)} className="discord-category-header">
                                    <span>{categoryName}</span>
                                    <svg className={`category-arrow ${isCollapsed ? 'collapsed' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {!isCollapsed && channelIds.map(channelId => {
                                    const channel = initialChannels.find(c => c.id === channelId);
                                    if (!channel) return null;
                                    return <a key={channel.id} href="#" onClick={(e) => { e.preventDefault(); setActiveChannel(channel.id); }} className={`flex items-center space-x-2 w-full text-left px-2 py-1.5 rounded transition-colors channel-link text-[color:var(--text-muted)] ${activeChannel === channel.id ? 'active' : ''}`}>
                                        <span className="text-xl">#</span><span>{channel.name}</span>
                                    </a>;
                                })}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex items-center justify-between p-4 h-16 border-b border-black/20 shadow-sm flex-shrink-0">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold flex items-center space-x-2 truncate"><span className="text-2xl text-[color:var(--channel-icon)]">#</span><span className="truncate">{activeChannelInfo?.name}</span></h1>
                        <p className="text-sm text-[color:var(--text-muted)] ml-8 truncate">{activeChannelInfo?.description}</p>
                    </div>
                </header>
                 <div className="flex-1 flex min-h-0">
                    <main className="flex-1 flex flex-col min-h-0">
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto discord-chat-messages px-4">
                           <div className="h-4"></div>
                            {processedChatItems.map((item, index) => {
                                if (item.type === 'date_divider') {
                                    return <div key={item.date.toISOString()} className="discord-date-divider"><span>{item.date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>;
                                }
                                const { group } = item;
                                const firstMessage = group[0];
                                const userDetails = initialUsers[firstMessage.user] || { initials: getUserInitials(firstMessage.user), color: getRandomColor() };

                                return (
                                    <div key={firstMessage.id} className="discord-message-group flex space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 mt-1">
                                             {userDetails.avatarUrl ? (
                                                <img src={userDetails.avatarUrl} alt={firstMessage.user} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${firstMessage.avatarColor}`}>
                                                    {firstMessage.avatarInitials}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline space-x-2"><span className="font-semibold text-white text-base">{firstMessage.user}</span><span className="text-xs text-[color:var(--text-muted)]">{firstMessage.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                                            {group.map(message => (
                                                <div key={message.id} className="discord-message-item group">
                                                    <span className="discord-message-timestamp">{message.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {editingMessageId === message.id ? (
                                                        <div><input type="text" value={editingText} onChange={e => setEditingText(e.target.value)} onKeyDown={e => {if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingMessageId(null);}} className="w-full px-2 py-1 border border-secondary rounded-md bg-[color:var(--input-bg)]" /></div>
                                                    ) : (
                                                        <>
                                                          {renderMessageContent(message)}
                                                            <div className="absolute top-0 right-4 -translate-y-1/2 hidden group-hover:flex items-center bg-[color:var(--bg-primary)] border border-[color:var(--bg-tertiary)] rounded-md discord-message-actions">
                                                                {user && (user.name === message.user || isAdmin) && <button onClick={() => handleStartEditing(message)} className="p-1.5 text-[color:var(--text-muted)] hover:text-white"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /></svg></button>}
                                                                {isAdmin && <button onClick={() => handleDeleteMessage(message.id)} className="p-1.5 text-[color:var(--text-muted)] hover:text-red-400"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                           <div className="h-4"></div>
                        </div>
                        <footer className="px-4 pb-4 flex-shrink-0">
                             {canWrite ? (
                                <CommunityChatInput onSendMessage={handleSendMessage} channelName={activeChannelInfo?.name || 'chat'} disabled={!user} />
                            ) : (
                                <div className="text-center text-sm text-[color:var(--text-muted)] bg-[color:var(--input-bg)] p-3 rounded-lg">{user ? 'Solo los administradores pueden enviar mensajes en este canal.' : 'Debes iniciar sesión para enviar mensajes.'}</div>
                            )}
                        </footer>
                    </main>

                    <aside className="w-60 discord-sidebar-members flex-shrink-0 p-2">
                        <h2 className="p-2 text-[color:var(--header-secondary)] text-xs font-bold uppercase">Miembros — {sortedMembers.length}</h2>
                        <div className="space-y-1 mt-2">
                            {sortedMembers.map(member => {
                                const memberDetails = initialUsers[member.name];
                                return (
                                    <div key={member.name} className="flex items-center space-x-3 p-1 rounded hover:bg-[color:var(--bg-hover)] cursor-pointer">
                                        <div className="relative">
                                            {memberDetails?.avatarUrl ? (
                                                <img src={memberDetails.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${memberDetails?.color}`}>
                                                    {memberDetails?.initials}
                                                </div>
                                            )}
                                            <span className={`absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-[color:var(--bg-secondary)] ${member.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center"><p className="font-medium text-sm truncate text-white">{member.name}</p>{ADMIN_USERS.includes(member.name) && (<span className="discord-admin-tag ml-2">Admin</span>)}</div>
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