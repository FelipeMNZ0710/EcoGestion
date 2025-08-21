import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, GamificationAction } from '../types';

// --- Types ---
interface Reaction {
    [emoji: string]: string[]; // emoji -> array of user names
}

interface Message {
    id: number;
    user: string;
    avatarInitials: string;
    avatarColor: string;
    time: string;
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

// --- Helper Functions ---
const formatUserName = (name: string): string => {
    return name.split(' ')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
               .join(' ');
};

const getUserInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const userColors = [
    'bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 'bg-amber-200 text-amber-800',
    'bg-yellow-200 text-yellow-800', 'bg-lime-200 text-lime-800', 'bg-green-200 text-green-800',
    'bg-emerald-200 text-emerald-800', 'bg-teal-200 text-teal-800', 'bg-cyan-200 text-cyan-800',
    'bg-sky-200 text-sky-800', 'bg-blue-200 text-blue-800', 'bg-indigo-200 text-indigo-800',
    'bg-violet-200 text-violet-800', 'bg-purple-200 text-purple-800', 'bg-fuchsia-200 text-fuchsia-800',
    'bg-pink-200 text-pink-800', 'bg-rose-200 text-rose-800'
];

const getRandomColor = () => userColors[Math.floor(Math.random() * userColors.length)];

// --- Initial Data ---
const initialChannels: Channel[] = [
    { id: 'general', name: 'general', description: 'Discusiones generales sobre reciclaje y sostenibilidad en Formosa.' },
    { id: 'anuncios', name: 'anuncios', description: 'Anuncios importantes del equipo de Formosa Recicla.', adminOnlyWrite: true },
    { id: 'dudas', name: 'dudas', description: '¿No sabés dónde va algo? ¡Preguntá acá!' },
    { id: 'proyectos', name: 'proyectos', description: 'Compartí tus ideas y proyectos de reciclaje.' },
    { id: 'compostaje', name: 'compostaje', description: 'Todo sobre el arte de compostar en casa.' },
];

const firstUserBatch = [
    "Silvera Matías", "Cabrera Dylan Ezequiel", "Franco Sian, Leandro Francisco", "Mendoza José Francisco Rafael",
    "Cristaldo Facundo", "Pereyra Roman, Ramiro Nicolás", "Gonzalez, Agostina", "Martínez, Javier Nicolás",
    "Vega Ezequiel Tomás Alejandro", "Ayala Santiago Tomás", "Short Lautaro", "Rodríguez Gonzalo Luis",
    "Galban Rojas Leonel Rolando", "Fariña Eric Andres", "Garcia Diego Gabriel", "González Viviana Elisa Soledad",
    "Recalde Alejandro Ezequiel", "Escalante, Elvio Facundo", "Rossi Fabiana", "Villlalba Franco Javier",
    "Bogado Augusto Gonzalo", "Laprida Fernando Agustin", "Benítez Gonzalo", "Colman Máximo Javier Alexis",
    "Ruiz Díaz Mateo Benjamin", "Zigaran Lucas", "Veron Máximo", "Falcón Santiago", "Zagaña Torancio, Alfonso",
    "Agüero Princich Matias Nicolás", "Augusto Fabricio Dario Nicolas", "Giuricich Facundo Gaston",
    "Miño Presentado Santiago Cristian", "Garrido Amín"
].map(name => formatUserName(name));

const secondUserBatchRaw = [
    "JARZINSKI KIARA 46470947", "36 RUIZ DIAZ DARIO EZEQUIEL 41415017", "37 CRUZ DIEGO JOSE 36207523", "38 AYALA LAUTARO 46393807",
    "39 BENITEZ FRANCO BENITEZ 43115030", "40 CRUZ YERALDO CÁCERES 46521850", "41 RUIZ DIAZ RUBEN ALEJANDRO 43888374",
    "42 RAMIREZ LUANA ABIGAIL 46610504", "43 BRITEZ SELENA 46469092", "44 BERNARD STELLA 46153403", "45 GAONA AXEL 46468168",
    "46 ACOSTA MARIA LAURA 45169537", "47 PÉREZ ANAHI JAQUELINE 46610210", "48 ROLÓN SERGIO AGUSTÍN 45170081",
    "49 VALLEJOS IGNACIO ALEJANDRO 44465658", "51 YBARS GIMÉNEZ ALAN MAURICIO 46781271",
    "52 FERNÁNDEZ ROBLEDO ZAMORA FELIX 46470124", "53 MONZÓN BRIAN NAHUEL 46470199", "54 DUARTE KEILA SERENA 42759704",
    "55 BENÍTEZ CRISTIAN RAMÓN 35898255", "56 CABRERA LAUTARO 44465962", "57 PERTILE SANTINO 45746199",
    "58 PERLO MARCOS EMMANUEL 46393659", "59 BENITEZ GÓMEZ LAUTARO SERGIO 46679222", "60 LEZCANO MAXIMILIANO 46523129",
    "61 OLMEDO VANESA AYELÉN 46396142", "62 GONZALEZ CANDIA, SEBASTIÁN NAHUEL 46679239", "63 BRITEZ DAMIÁN 46322199",
    "64 GONZALEZ LEANDRO GABRIEL 43115988", "65 ALVAREZ LUANA 44092594", "66 SANCHEZ GONZALO JOSE 45903370",
    "67 ACOSTA FERNANDO EXEQUIEL 46608718", "68 ALVARENGA FRANCO 42636365", "69 SANTIAGO GASTÓN ALMIRÓN 46524379",
    "70 ZALAZAR ABEL 40628014", "71 ARMOA AARON ANGEL 44983728", "72 MARTINEZ ALEXANDER FACUNDO 43453017",
    "73 VILLALBA LAUTARO DAVID 46321694", "74 IGURI NOELIA SOLEDAD 36206845", "75 MANSINI JOSÉ LIONEL 46863994",
    "76 ALMIRÓN AIELET ÁMBAR 47102940", "77 AMARILLA JULIO CÉSAR", "Miguel Mateo Badaracco"
];
const secondUserBatch = secondUserBatchRaw.map(line =>
    formatUserName(line.replace(/^\d*\s*/, '').replace(/\s*\d+$/, '').trim())
);

const initialUsers: Record<string, { initials: string; color: string }> = {
    'Admin Recicla': { initials: 'AR', color: 'bg-primary/20 text-primary' },
    'Felipe': { initials: 'F', color: 'bg-teal-200 text-teal-800' },
    'Ana Gómez': { initials: 'AG', color: 'bg-blue-200 text-blue-800' },
    'Carlos Ruiz': { initials: 'CR', color: 'bg-yellow-200 text-yellow-800' },
    'Laura Paez': { initials: 'LP', color: 'bg-pink-200 text-pink-800' },
    'Marcos Solis': { initials: 'MS', color: 'bg-indigo-200 text-indigo-800' },
    'Juana Diaz': { initials: 'JD', color: 'bg-orange-200 text-orange-800' },
    'Pedro Ortiz': { initials: 'PO', color: 'bg-purple-200 text-purple-800' },
};

[...firstUserBatch, ...secondUserBatch].forEach(name => {
    if (!initialUsers[name]) {
        initialUsers[name] = {
            initials: getUserInitials(name),
            color: getRandomColor()
        };
    }
});

const messagesData: Record<string, Omit<Message, 'avatarInitials' | 'avatarColor' | 'id'>[]> = {
    general: [
        { user: 'Ana Gómez', time: '10:30 AM', text: '¡Buen día! ¿Alguien sabe si los envases de tetrabrik van con el cartón o los plásticos?' },
        { user: 'Admin Recicla', time: '10:32 AM', text: 'Hola Ana! Van con el cartón, pero asegurate de enjuagarlos y aplastarlos bien. 👍', reactions: {'👍': ['Carlos Ruiz', 'Jarzinski Kiara']} },
        { user: 'Carlos Ruiz', time: '11:15 AM', text: 'Confirmado, es como dice el admin. La clave es que estén limpios y secos.' },
        { user: 'Jarzinski Kiara', time: '11:45 AM', text: 'Gente, ¿las cajas de huevos de cartón se reciclan con el papel?' },
        { user: 'Benitez Franco Benitez', time: '11:47 AM', text: '¡Sí, Kiara! Van con el papel y cartón. Si tenés compostera, también son geniales para eso.' },
        { user: 'Admin Recicla', time: '11:50 AM', text: 'Exacto, Franco! Bien ahí. Son material \'seco\' o \'marrón\' excelente para el compost.', reactions: {'❤️': ['Ramirez Luana Abigail']} },
        { user: 'Ramirez Luana Abigail', time: '12:30 PM', text: '¡Mi primera semana separando todo! Se siente bien, aunque todavía me cuesta un poco con algunos plásticos.' },
        { user: 'Silvera Matías', time: '12:32 PM', text: '¡Vamos Luana! Es cuestión de costumbre. Al principio es así, después sale solo.'},
        { user: 'Rolón Sergio Agustín', time: '01:10 PM', text: 'Consulta, ¿alguien sabe si el evento de limpieza de la costanera de este finde se hace igual si llueve?' },
        { user: 'Admin Recicla', time: '01:15 PM', text: 'Hola @\'Rolón Sergio Agustín\', por ahora sigue en pie. Si hay cambios avisaremos en el canal de #anuncios y en redes. ¡Gracias por el interés!'},
        { user: 'Miguel Mateo Badaracco', time: '01:25 PM', text: 'Hola a todos, soy nuevo por acá! Me sumo a la movida del reciclaje. Un gusto.' },
        { user: 'Felipe', time: '01:26 PM', text: 'Bienvenido @\'Miguel Mateo Badaracco\'! Cualquier consulta, chiflá nomás. Mirate el canal de #dudas que hay info útil.'}
    ],
    anuncios: [
        { user: 'Admin Recicla', time: 'Ayer a las 9:00 AM', text: '¡Bienvenidos al canal de anuncios! Aquí publicaremos todas las novedades importantes sobre la iniciativa Formosa Recicla. Este es un canal de solo lectura para los miembros.' },
        { user: 'Admin Recicla', time: 'Hoy a las 08:30 AM', text: 'Recordatorio: Mañana sábado estaremos en la Plaza San Martín de 10 a 13 hs recibiendo residuos electrónicos (RAEE). ¡No los tiren a la basura común! Traigan sus celulares viejos, cables, cargadores, etc.' },
        { user: 'Rolón Sergio Agustín', time: 'Hoy a las 02:00 PM', text: 'ATENCIÓN: Se suma un nuevo Punto Verde en el B° San Miguel, en la intersección de Av. Italia y Av. Napoleón Uriburu. Ya está operativo para recibir Plásticos, Vidrio y Papel/Cartón.'}
    ],
    dudas: [
        { user: 'Laura Paez', time: '02:40 PM', text: 'Tengo una duda, ¿las lamparitas de bajo consumo dónde se tiran?' },
        { user: 'Admin Recicla', time: '02:42 PM', text: '¡Excelente pregunta, @\'Laura Paez\'! Esas lamparitas contienen mercurio y no van a la basura común. Hay que llevarlas a puntos de recolección de residuos peligrosos. Pronto actualizaremos el mapa con esos puntos.' },
        { user: 'Pérez Anahi Jaqueline', time: '03:15 PM', text: 'Una pregunta, ¿los potes de helado de telgopor (EPS) se pueden tirar en algún lado?' },
        { user: 'Admin Recicla', time: '03:18 PM', text: 'Hola @\'Pérez Anahi Jaqueline\', lamentablemente el telgopor es muy difícil de reciclar por ahora y no lo recibimos en los Puntos Verdes. Lo mejor es evitar su consumo si es posible.' },
        { user: 'Vallejos Ignacio Alejandro', time: '04:05 PM', text: '¿Y las radiografías viejas? ¿Qué hago con eso? Tengo un montón.' },
        { user: 'Admin Recicla', time: '04:07 PM', text: 'Buena pregunta, @\'Vallejos Ignacio Alejandro\'. Las radiografías contienen plata y plásticos que no se reciclan de forma convencional. Hay programas específicos que las recuperan. Estamos gestionando un punto de acopio, ¡avisaremos por acá!' },
        { user: 'Almirón Aielet Ámbar', time: '04:30 PM', text: 'Hola! Los envoltorios de las golosinas (como alfajores o galletitas) en qué categoría entran?' },
        { user: 'Rolón Sergio Agustín', time: '04:32 PM', text: 'Hola @\'Almirón Aielet Ámbar\', esos son plásticos de un solo uso, generalmente metalizados. Por ahora no son reciclables en los puntos verdes, pero son perfectos para hacer ecoladrillos. Podés preguntar en #proyectos si alguien está juntando.' },
    ],
    proyectos: [
        { user: 'Marcos Solis', time: '09:00 AM', text: 'Estoy pensando en armar una compostera comunitaria en el barrio. ¿Alguien se prende?', reactions: {'😮': ['Alvarez Luana', 'Benítez Gonzalo']} },
        { user: 'Alvarez Luana', time: '09:35 AM', text: '¡Qué buena iniciativa, @\'Marcos Solis\'! Yo estoy haciendo ecoladrillos con los plásticos de un solo uso. Si alguien junta, me avisa y los paso a buscar.' },
        { user: 'Benítez Gonzalo', time: '10:02 AM', text: '@\'Alvarez Luana\', yo junto un montón de paquetes de fideos y galletitas. Te los guardo. ¿Sirven?' },
        { user: 'Alvarez Luana', time: '10:05 AM', text: '¡Sí, esos son perfectos! Gracias @\'Benítez Gonzalo\'.' },
        { user: 'Marcos Solis', time: '10:20 AM', text: 'Sigo con la idea de la compostera. Ya hablé con un par de vecinos del barrio La Paz, parece que hay interés. Necesitaríamos un buen lugar.'},
        { user: 'Miguel Mateo Badaracco', time: '10:25 AM', text: 'Yo me prendo con la compostera! Tengo un patio grande, si sirve de algo.'}
    ],
    compostaje: [
        { user: 'Juana Diaz', time: 'Ayer a las 5:20 PM', text: 'Mi compost tiene olor feo, ¿qué puedo estar haciendo mal?' },
        { user: 'Garrido Amín', time: 'Ayer a las 5:30 PM', text: 'Hola @\'Juana Diaz\'! A mí me pasaba lo mismo. Probablemente le falten \'secos\'. Agregale hojas secas, cartón en pedacitos o aserrín. Eso equilibra la humedad y le da aire.' },
        { user: 'Falcón Santiago', time: 'Ayer a las 5:32 PM', text: 'Totalmente. La proporción es clave. Más o menos dos partes de seco por una de húmedo (restos de cocina).' },
        { user: 'Admin Recicla', time: 'Hoy a las 09:10 AM', text: 'Excelentes consejos, gente. El mal olor casi siempre es exceso de humedad y falta de oxígeno. Revolverlo más seguido también ayuda mucho a que se airee.' },
        { user: 'Zalazar Abel', time: 'Hoy a las 11:00 AM', text: '¿Se le puede poner cáscara de cítricos al compost?' },
        { user: 'Garrido Amín', time: 'Hoy a las 11:02 AM', text: 'Poder se puede, pero tardan mucho en descomponerse y en grandes cantidades pueden acidificar mucho la mezcla. Yo le pongo, pero poquitas y bien cortadas.'},
    ]
};

const processInitialMessages = (data: typeof messagesData): MessagesState => {
    let messageIdCounter = 0;
    const processed: MessagesState = {};
    Object.keys(data).map(channel => {
        processed[channel] = data[channel].map(msg => ({
            ...msg,
            id: messageIdCounter++,
            avatarInitials: initialUsers[msg.user]?.initials || '?',
            avatarColor: initialUsers[msg.user]?.color || 'bg-gray-200 text-gray-800'
        }));
    });
    return processed;
};

const initialMessages = processInitialMessages(messagesData);
const allUserNames = Object.keys(initialUsers);
const members = allUserNames.map(name => ({ name, online: Math.random() > 0.3 }));

// --- Modal Component Definition ---
const ChannelModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    submitText: string;
    channelName: string;
    setChannelName: (name: string) => void;
    channelDesc: string;
    setChannelDesc: (desc: string) => void;
    isAdminOnly: boolean;
    setIsAdminOnly: (isAdminOnly: boolean) => void;
}> = ({ isOpen, onClose, onSubmit, title, submitText, channelName, setChannelName, channelDesc, setChannelDesc, isAdminOnly, setIsAdminOnly }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in-up" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <form onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="channel-name" className="block text-sm font-medium text-gray-700">Nombre del Canal</label>
                            <input
                                type="text"
                                id="channel-name"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="channel-desc" className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea
                                id="channel-desc"
                                value={channelDesc}
                                onChange={(e) => setChannelDesc(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
                            ></textarea>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="admin-only"
                                type="checkbox"
                                checked={isAdminOnly}
                                onChange={(e) => setIsAdminOnly(e.target.checked)}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="admin-only" className="ml-2 block text-sm text-gray-900">
                                Canal de sólo lectura (sólo admins pueden escribir)
                            </label>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-green-800">{submitText}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Mention Suggestion Box ---
interface MentionBoxProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    activeIndex: number;
    type: 'user' | 'channel';
}

const MentionBox: React.FC<MentionBoxProps> = ({ suggestions, onSelect, activeIndex, type }) => {
    return (
        <div className="absolute bottom-full mb-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
            {suggestions.map((suggestion, index) => (
                <button
                    key={suggestion}
                    onClick={() => onSelect(suggestion)}
                    className={`w-full text-left px-3 py-2 flex items-center space-x-2 ${index === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                    {type === 'user' ? (
                        <>
                           <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${initialUsers[suggestion]?.color || 'bg-gray-200 text-gray-800'}`}>
                                {initialUsers[suggestion]?.initials || '?'}
                            </div>
                            <span>{suggestion}</span>
                        </>
                    ) : (
                        <span># {suggestion}</span>
                    )}
                </button>
            ))}
        </div>
    );
};


// --- Main Component ---
interface ComunidadPageProps {
  user: User | null;
  onUserAction: (action: GamificationAction) => void;
}

const ComunidadPage: React.FC<ComunidadPageProps> = ({ user, onUserAction }) => {
    const [channels, setChannels] = useState<Channel[]>(initialChannels);
    const [activeChannel, setActiveChannel] = useState('general');
    const [messages, setMessages] = useState<MessagesState>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [imageToSend, setImageToSend] = useState<{ file: File; preview: string } | null>(null);

    // UI State
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [activeMessageMenu, setActiveMessageMenu] = useState<number | null>(null);
    const [activeReactionPicker, setActiveReactionPicker] = useState<number | null>(null);
    const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '🤔'];

    // Admin state
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [channelToEdit, setChannelToEdit] = useState<Channel | null>(null);
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [newChannelAdminOnly, setNewChannelAdminOnly] = useState(false);
    
    // Mention state
    const [mentionState, setMentionState] = useState<{type: 'user' | 'channel', query: string, suggestions: string[], activeIndex: number, startPos: number} | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const ADMIN_USERS = ['Felipe', 'Rolón Sergio Agustín'];
    const isAdmin = user ? ADMIN_USERS.includes(user.name) : false;

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, activeChannel]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMessageMenu(null);
                setActiveReactionPicker(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!inputText.trim() && !imageToSend) || !user) return;

        const processAndSend = (imageUrl?: string) => {
             const newUserMessage: Message = {
                id: Date.now(),
                user: user.name,
                text: inputText.trim(),
                time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                avatarInitials: initialUsers[user.name]?.initials || getUserInitials(user.name),
                avatarColor: initialUsers[user.name]?.color || 'bg-teal-200 text-teal-800',
                imageUrl: imageUrl,
                reactions: {}
            };
            setMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), newUserMessage] }));
            setInputText('');
            setImageToSend(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onUserAction('send_message');
        }

        if (imageToSend) {
            const reader = new FileReader();
            reader.onloadend = () => {
                processAndSend(reader.result as string);
            };
            reader.readAsDataURL(imageToSend.file);
        } else {
            processAndSend();
        }
    };
    
     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageToSend({ file, preview: URL.createObjectURL(file) });
        }
    };
    
    const removeImage = () => {
        if(imageToSend) URL.revokeObjectURL(imageToSend.preview);
        setImageToSend(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }

    // --- Channel Management ---
    const resetChannelModal = () => {
        setNewChannelName('');
        setNewChannelDesc('');
        setNewChannelAdminOnly(false);
        setChannelToEdit(null);
        setChannelToDelete(null);
    };
    
    const handleCreateChannel = (e: React.FormEvent) => {
        e.preventDefault();
        const newChannel: Channel = {
            id: newChannelName.toLowerCase().replace(/\s+/g, '-'),
            name: newChannelName,
            description: newChannelDesc,
            adminOnlyWrite: newChannelAdminOnly
        };
        setChannels([...channels, newChannel]);
        setMessages(prev => ({...prev, [newChannel.id]: []}));
        setCreateModalOpen(false);
        resetChannelModal();
        setActiveChannel(newChannel.id);
    };

    const handleEditChannel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!channelToEdit) return;
        setChannels(channels.map(c => c.id === channelToEdit.id ? { ...c, name: newChannelName, description: newChannelDesc, adminOnlyWrite: newChannelAdminOnly } : c));
        setEditModalOpen(false);
        resetChannelModal();
    };
    
    const openEditModal = (channel: Channel) => {
        setChannelToEdit(channel);
        setNewChannelName(channel.name);
        setNewChannelDesc(channel.description);
        setNewChannelAdminOnly(channel.adminOnlyWrite || false);
        setEditModalOpen(true);
    };
    
    const handleDeleteChannel = () => {
        if (!channelToDelete || channelToDelete.id === 'general') return;
        setChannels(channels.filter(c => c.id !== channelToDelete.id));
        const newMessages = {...messages};
        delete newMessages[channelToDelete.id];
        setMessages(newMessages);

        const notification: Message = {
            id: Date.now(),
            user: 'Sistema',
            text: `El canal #${channelToDelete.name} ha sido eliminado por un administrador.`,
            time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            avatarInitials: 'S',
            avatarColor: 'bg-gray-400 text-white',
        };
        setMessages(prev => ({...prev, general: [...(prev.general || []), notification]}));
        
        setDeleteModalOpen(false);
        resetChannelModal();
        if (activeChannel === channelToDelete.id) {
            setActiveChannel('general');
        }
    };

    const handleMoveChannel = (channelId: string, direction: 'up' | 'down') => {
        const index = channels.findIndex(c => c.id === channelId);
        if ((direction === 'up' && index <= 1) || (direction === 'down' && index >= channels.length - 1)) return;
        const newChannels = [...channels];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newChannels[index], newChannels[newIndex]] = [newChannels[newIndex], newChannels[index]];
        setChannels(newChannels);
    };

    // --- Message Management ---
    const handleDeleteMessage = (messageId: number) => {
        setMessages(prev => ({
            ...prev,
            [activeChannel]: prev[activeChannel].filter(m => m.id !== messageId)
        }));
        setActiveMessageMenu(null);
    };
    
    const handleStartEditing = (message: Message) => {
        setEditingMessageId(message.id);
        setEditingText(message.text);
        setActiveMessageMenu(null);
    };
    
    const handleSaveEdit = () => {
        if (!editingMessageId) return;
        setMessages(prev => ({
            ...prev,
            [activeChannel]: prev[activeChannel].map(m =>
                m.id === editingMessageId ? { ...m, text: editingText, edited: true } : m
            )
        }));
        setEditingMessageId(null);
        setEditingText('');
    };

    const handleToggleReaction = (messageId: number, emoji: string) => {
        if (!user) return;
        setMessages(prev => {
            const channelMessages = prev[activeChannel];
            const newChannelMessages = channelMessages.map(msg => {
                if (msg.id === messageId) {
                    const newReactions = { ...(msg.reactions || {}) };
                    const reactors = newReactions[emoji] || [];
                    
                    if (reactors.includes(user.name)) {
                        newReactions[emoji] = reactors.filter(name => name !== user.name);
                        if (newReactions[emoji].length === 0) delete newReactions[emoji];
                    } else {
                        newReactions[emoji] = [...reactors, user.name];
                    }
                    return { ...msg, reactions: newReactions };
                }
                return msg;
            });
            return { ...prev, [activeChannel]: newChannelMessages };
        });
    };

    // --- Mention Logic ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        const cursorPosition = e.target.selectionStart || 0;
        setInputText(text);

        const atMatch = text.substring(0, cursorPosition).match(/@(\w*)$/);
        const hashMatch = text.substring(0, cursorPosition).match(/#(\w*)$/);

        if (atMatch) {
            const query = atMatch[1].toLowerCase();
            setMentionState({
                type: 'user',
                query,
                suggestions: allUserNames.filter(u => u.toLowerCase().includes(query)),
                activeIndex: 0,
                startPos: atMatch.index || 0,
            });
        } else if (hashMatch) {
            const query = hashMatch[1].toLowerCase();
            setMentionState({
                type: 'channel',
                query,
                suggestions: channels.map(c => c.name).filter(c => c.toLowerCase().includes(query)),
                activeIndex: 0,
                startPos: hashMatch.index || 0,
            });
        } else {
            setMentionState(null);
        }
    };
    
    const handleSelectMention = (suggestion: string) => {
        if (!mentionState) return;

        const mentionText = mentionState.type === 'user' ? `@'${suggestion}' ` : `#${suggestion} `;
        const newText = 
            inputText.substring(0, mentionState.startPos) + 
            mentionText + 
            inputText.substring(mentionState.startPos + mentionState.query.length + 1);

        setInputText(newText);
        setMentionState(null);
        inputRef.current?.focus();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!mentionState) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setMentionState(prev => prev ? {...prev, activeIndex: (prev.activeIndex + 1) % prev.suggestions.length } : null);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setMentionState(prev => prev ? {...prev, activeIndex: (prev.activeIndex - 1 + prev.suggestions.length) % prev.suggestions.length } : null);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            handleSelectMention(mentionState.suggestions[mentionState.activeIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setMentionState(null);
        }
    };

    const renderMessageText = (text: string) => {
        const regex = /(@'[^']+')|(#[\w-]+)/g;
        const parts = text.split(regex).filter(Boolean);

        return parts.map((part, index) => {
            if (part.startsWith("@'")) {
                const userName = part.substring(2, part.length - 1);
                const isCurrentUserMention = user && userName === user.name;
                return <strong key={index} className={`font-semibold rounded px-1 ${isCurrentUserMention ? 'bg-yellow-300 text-yellow-900' : 'bg-blue-100 text-blue-700'}`}>@{userName}</strong>;
            }
            if (part.startsWith('#')) {
                const channelName = part.substring(1);
                const channelExists = channels.some(c => c.name === channelName);
                if (channelExists) {
                    return <button key={index} onClick={() => setActiveChannel(channelName)} className="font-semibold text-blue-600 hover:underline rounded px-1 bg-blue-100">#{channelName}</button>;
                }
            }
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    const sortedMembers = useMemo(() => {
        const currentMembers = members.filter(m => m.name !== 'Monzón Felipe'); 
        if(user && !currentMembers.find(m => m.name === user.name)) {
             currentMembers.unshift({ name: user.name, online: true });
        }
        
        return currentMembers.sort((a, b) => {
            const aIsAdmin = ADMIN_USERS.includes(a.name);
            const bIsAdmin = ADMIN_USERS.includes(b.name);
            if (aIsAdmin && !bIsAdmin) return -1;
            if (!aIsAdmin && bIsAdmin) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [user, members]);

    const activeChannelInfo = channels.find(c => c.id === activeChannel);
    const canWrite = user && (!activeChannelInfo?.adminOnlyWrite || isAdmin);

    return (
        <div className="flex h-[calc(100vh-80px)] font-sans bg-gray-100 text-gray-800">
            {/* --- Modals --- */}
            <ChannelModal
                isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateChannel}
                title="Crear Nuevo Canal" submitText="Crear Canal"
                channelName={newChannelName} setChannelName={setNewChannelName}
                channelDesc={newChannelDesc} setChannelDesc={setNewChannelDesc}
                isAdminOnly={newChannelAdminOnly} setIsAdminOnly={setNewChannelAdminOnly}
            />
            <ChannelModal
                isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSubmit={handleEditChannel}
                title="Editar Canal" submitText="Guardar Cambios"
                channelName={newChannelName} setChannelName={setNewChannelName}
                channelDesc={newChannelDesc} setChannelDesc={setNewChannelDesc}
                isAdminOnly={newChannelAdminOnly} setIsAdminOnly={setNewChannelAdminOnly}
            />
            {channelToDelete && (
                <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${isDeleteModalOpen ? 'animate-fade-in-up' : ''}`} style={{ animationDuration: '0.3s' }} onClick={() => setDeleteModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-2">Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que querés eliminar el canal <strong>#{channelToDelete.name}</strong>? Esta acción no se puede deshacer.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleDeleteChannel} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Eliminar Canal</button>
                        </div>
                    </div>
                </div>
            )}


            {/* Channels Sidebar */}
            <aside className="w-64 bg-gray-800 text-gray-300 flex flex-col">
                <header className="p-4 border-b border-gray-700 font-bold text-white text-lg">Canales</header>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {channels.map((channel, index) => (
                        <div key={channel.id} className="group relative">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveChannel(channel.id); }}
                                className={`block w-full text-left px-3 py-2 rounded transition-colors ${activeChannel === channel.id ? 'bg-secondary/20 text-white font-semibold' : 'hover:bg-gray-700'}`}
                            ># {channel.name}</a>
                            {isAdmin && channel.id !== 'general' && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-gray-700 rounded">
                                    <button onClick={() => handleMoveChannel(channel.id, 'up')} disabled={index <= 1} className="p-1 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                                    <button onClick={() => handleMoveChannel(channel.id, 'down')} disabled={index >= channels.length - 1} className="p-1 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                                    <button onClick={() => openEditModal(channel)} className="p-1 hover:bg-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                                    <button onClick={() => { setChannelToDelete(channel); setDeleteModalOpen(true); }} className="p-1 hover:bg-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
                 {isAdmin && (<div className="p-2"><button onClick={() => setCreateModalOpen(true)} className="w-full text-center px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors">Añadir Canal +</button></div>)}
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold"># {channels.find(c => c.id === activeChannel)?.name}</h1>
                        <p className="text-sm text-gray-500">{channels.find(c => c.id === activeChannel)?.description}</p>
                    </div>
                </header>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(messages[activeChannel] || []).map(message => (
                         <div key={message.id} className={`group flex items-start space-x-3 ${user && message.user === user.name ? 'justify-end' : ''}`}>
                             {user && message.user !== user.name && (<div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${message.avatarColor}`}>{message.avatarInitials}</div>)}
                            <div className={`max-w-xl ${user && message.user === user.name ? 'items-end' : ''} flex flex-col`}>
                                <div className="flex items-center space-x-2">
                                    {user && message.user !== user.name && <span className="font-semibold text-sm">{message.user}</span>}
                                    <span className="text-xs text-gray-400">{message.time}</span>
                                </div>
                                
                                {editingMessageId === message.id ? (
                                    <div className="w-full">
                                        <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full px-2 py-1 border border-secondary rounded-md"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit();
                                                if (e.key === 'Escape') setEditingMessageId(null);
                                            }}
                                        />
                                        <div className="text-xs mt-1">
                                            <button onClick={handleSaveEdit} className="text-blue-500 font-semibold">Guardar</button>
                                            <span className="mx-1">&middot;</span>
                                            <button onClick={() => setEditingMessageId(null)} className="hover:underline">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`relative px-4 py-2 rounded-lg ${user && message.user === user.name ? 'bg-primary text-white rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                                        {message.text && <p className="whitespace-pre-wrap">{renderMessageText(message.text)}</p>}
                                        {message.imageUrl && <img src={message.imageUrl} alt="Imagen adjunta" className="mt-2 rounded-lg max-w-xs" />}
                                        {message.edited && <span className="text-xs opacity-70 ml-2">(editado)</span>}
                                    </div>
                                )}
                                
                                {message.reactions && Object.keys(message.reactions).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(message.reactions).map(([emoji, users]) => (
                                            <button key={emoji} onClick={() => handleToggleReaction(message.id, emoji)} className={`px-2 py-0.5 rounded-full text-sm flex items-center space-x-1 transition-colors ${user && users.includes(user.name) ? 'bg-secondary/30 border border-secondary' : 'bg-gray-200 hover:bg-gray-300 border border-transparent'}`}>
                                                <span>{emoji}</span>
                                                <span className="font-medium text-xs">{users.length}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {user && (
                                <div className="relative">
                                    <div className="hidden group-hover:flex items-center bg-white border rounded-md shadow-sm -mt-2">
                                        <button onClick={() => { setActiveReactionPicker(message.id); setActiveMessageMenu(null); }} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-l-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a.5.5 0 00.707 0l2-2a.5.5 0 00-.707-.707l-1.646 1.647-.07-.07a3.5 3.5 0 00-4.95 0l-.07.07-1.647-1.647a.5.5 0 00-.707.707l2 2a.5.5 0 00.707 0z" /></svg></button>
                                        <button onClick={() => { setActiveMessageMenu(message.id); setActiveReactionPicker(null); }} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-r-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg></button>
                                    </div>
                                    { (activeMessageMenu === message.id || activeReactionPicker === message.id) && (
                                        <div ref={menuRef} className="absolute z-10 bottom-full mb-1 right-0 bg-white rounded-md shadow-lg border text-sm w-40">
                                            {activeReactionPicker === message.id && (<div className="p-1 flex justify-around">{availableReactions.map(emoji => (<button key={emoji} onClick={() => handleToggleReaction(message.id, emoji)} className="text-xl p-1 rounded-md hover:bg-gray-200">{emoji}</button>))}</div>)}
                                            {activeMessageMenu === message.id && (<div className="p-1">{message.user === user.name && <button onClick={() => handleStartEditing(message)} className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100">Editar Mensaje</button>}{isAdmin && <button onClick={() => handleDeleteMessage(message.id)} className="w-full text-left px-2 py-1.5 rounded text-red-600 hover:bg-red-50">Eliminar Mensaje</button>}</div>)}
                                        </div>
                                    )}
                                </div>
                            )}
                         </div>
                    ))}
                </div>

                <footer className="p-4 border-t bg-white">
                    {canWrite ? (
                        <form onSubmit={handleSendMessage} className="relative">
                            {mentionState && mentionState.suggestions.length > 0 && (
                                <MentionBox
                                    suggestions={mentionState.suggestions}
                                    onSelect={handleSelectMention}
                                    activeIndex={mentionState.activeIndex}
                                    type={mentionState.type}
                                />
                            )}
                            {imageToSend && (
                                <div className="absolute bottom-full left-0 mb-2 p-1 bg-white border rounded-lg shadow-sm">
                                    <img src={imageToSend.preview} alt="Vista previa" className="h-20 w-20 object-cover rounded" />
                                    <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
                                </div>
                            )}
                             <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                placeholder={`Enviar mensaje a #${activeChannel}...`}
                                className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </form>
                    ) : (
                        <div className="text-center text-sm text-gray-500 bg-gray-200 p-3 rounded-lg">
                            {user ? 'Solo los administradores pueden enviar mensajes en este canal.' : 'Debes iniciar sesión para enviar mensajes.'}
                        </div>
                    )}
                </footer>
            </main>

            {/* Members Sidebar */}
            <aside className="w-64 bg-white border-l flex flex-col">
                <header className="p-4 border-b font-bold text-lg">Miembros</header>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {sortedMembers.map(member => (
                        <div key={member.name} className="flex items-center space-x-3 p-1">
                            <div className="relative">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${initialUsers[member.name]?.color}`}>
                                    {initialUsers[member.name]?.initials}
                                </div>
                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-white ${member.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{member.name}</p>
                                {ADMIN_USERS.includes(member.name) && (<span className="text-xs font-semibold text-amber-800">Admin</span>)}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
};

export default ComunidadPage;