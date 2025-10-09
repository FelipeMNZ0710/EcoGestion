import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { User, GamificationAction, CommunityMessage } from '../types';

// --- Types ---
interface Channel {
    id: number;
    name: string;
    description: string;
    admin_only_write?: boolean;
}
interface Member {
    id: string; // Keep as string to match User.id
    name: string;
    profile_picture_url: string | null;
    is_admin: boolean;
}

type MessagesState = Record<number, CommunityMessage[]>;
type RenderableChatItem = { type: 'message_group'; group: CommunityMessage[] } | { type: 'date_divider'; date: Date };

// --- Helper Functions ---
const getUserInitials = (name: string): string => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const userColors = ['bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 'bg-amber-200 text-amber-800', 'bg-yellow-200 text-yellow-800', 'bg-lime-200 text-lime-800', 'bg-green-200 text-green-800', 'bg-emerald-200 text-emerald-800', 'bg-teal-200 text-teal-800', 'bg-cyan-200 text-cyan-800', 'bg-sky-200 text-sky-800', 'bg-blue-200 text-blue-800', 'bg-indigo-200 text-indigo-800', 'bg-violet-200 text-violet-800', 'bg-purple-200 text-purple-800', 'bg-fuchsia-200 text-fuchsia-800', 'bg-pink-200 text-pink-800', 'bg-rose-200 text-rose-800'];
const colorCache: Record<string, string> = {};
const getConsistentColor = (name: string) => {
    if (colorCache[name]) return colorCache[name];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = userColors[Math.abs(hash % userColors.length)];
    colorCache[name] = color;
    return color;
};

// --- Sub-Components ---
const DateDivider: React.FC<{ date: Date }> = ({ date }) => (
    <div className="discord-date-divider"><span>{new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date)}</span></div>
);

const MessageItem: React.FC<{
    message: CommunityMessage; isGroupStart: boolean; user: User | null; isAdmin: boolean;
    setReplyingTo: (msg: CommunityMessage | null) => void;
    setEditingMessage: (msg: CommunityMessage | null) => void;
    onDelete: (messageId: number) => void;
    onToggleReaction: (messageId: number, emoji: string) => void;
}> = ({ message, isGroupStart, user, isAdmin, setReplyingTo, setEditingMessage, onDelete, onToggleReaction }) => {
    const [hovered, setHovered] = useState(false);
    const canInteract = user?.id === message.user_id || isAdmin;
    
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
                        <span className="text-xs text-[color:var(--text-muted)]">{new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.timestamp))}</span>
                    </div>
                )}
                
                <p className="text-[color:var(--text-normal)] whitespace-pre-wrap">{message.text}{!!message.edited && <span className="text-xs text-[color:var(--text-muted)] ml-1">(editado)</span>}</p>

                {message.imageUrl && <img src={message.imageUrl} alt="Imagen adjunta" className="mt-2 max-w-xs rounded-lg" />}
                
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                     <div className="discord-reactions-bar">
                        {/* FIX: Cast 'users' to string[] as TypeScript infers it as 'unknown' from Object.entries. */}
                        {Object.entries(message.reactions).map(([emoji, users]) => (
                            <button key={emoji} onClick={() => onToggleReaction(message.id, emoji)}
                                className={`reaction-pill ${(users as string[]).includes(user?.name ?? '') ? 'reacted-by-user' : ''}`}>
                                <span className="emoji">{emoji}</span>
                                <span className="count">{(users as string[]).length}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {hovered && user && (
                <div className="discord-message-toolbar">
                    <button className="discord-toolbar-button" onClick={() => onToggleReaction(message.id, '👍')} title="Reaccionar">👍</button>
                    <button className="discord-toolbar-button" onClick={() => setReplyingTo(message)} title="Responder">💬</button>
                    {user?.id === message.user_id && <button onClick={() => setEditingMessage(message)} className="discord-toolbar-button" title="Editar">✏️</button>}
                    {canInteract && <button onClick={() => onDelete(message.id)} className="discord-toolbar-button" title="Eliminar">🗑️</button>}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
const ComunidadPage: React.FC<{ user: User | null; onUserAction: (action: GamificationAction, payload?: any) => void; }> = ({ user, onUserAction }) => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
    const [messages, setMessages] = useState<MessagesState>({});
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
    const [editingMessage, setEditingMessage] = useState<CommunityMessage | null>(null);
    const [editedText, setEditedText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const isAdmin = user?.role === 'dueño' || user?.role === 'moderador';

    const fetchMessages = useCallback(async (channelId: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/community/messages/${channelId}`);
            const data = await res.json();
            const processedMessages: CommunityMessage[] = data.map((msg: any) => ({
                ...msg,
                id: msg.id,
                user_id: msg.user_id.toString(),
                avatarInitials: getUserInitials(msg.user),
                avatarColor: getConsistentColor(msg.user),
                timestamp: new Date(msg.timestamp),
            }));
            setMessages(prev => ({ ...prev, [channelId]: processedMessages }));
        } catch (error) {
            console.error(`Error fetching messages for channel ${channelId}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [channelsRes, membersRes] = await Promise.all([
                    fetch('http://localhost:3001/api/community/channels'),
                    fetch('http://localhost:3001/api/community/members')
                ]);
                const channelsData = await channelsRes.json();
                const membersData = await membersRes.json();
                setChannels(channelsData);
                setMembers(membersData);
                if (channelsData.length > 0) setActiveChannelId(channelsData[0].id);
            } catch (error) {
                console.error("Error fetching initial community data:", error);
            }
        };
        fetchInitialData();
    }, []);
    
    useEffect(() => {
        if (activeChannelId !== null) fetchMessages(activeChannelId);
    }, [activeChannelId, fetchMessages]);

    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) setTimeout(() => { chatContainer.scrollTop = chatContainer.scrollHeight }, 100);
    }, [messages, activeChannelId, isLoading]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [newMessage, editedText]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || activeChannelId === null) return;

        try {
            const response = await fetch('http://localhost:3001/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelId: activeChannelId, userId: user.id, content: newMessage.trim(),
                    replyingToId: replyingTo?.id
                }),
            });
            if (response.ok) {
                setNewMessage(''); setReplyingTo(null); onUserAction('send_message');
                await fetchMessages(activeChannelId);
            } else throw new Error('Failed to send message');
        } catch (error) { console.error("Error sending message:", error); }
    };
    
    const handleEditMessage = async () => {
        if (!editedText.trim() || !editingMessage || !user) return;
        try {
            const response = await fetch(`http://localhost:3001/api/community/messages/${editingMessage.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editedText, userId: user.id, userRole: user.role })
            });
            if (response.ok) {
                setEditingMessage(null); setEditedText('');
                await fetchMessages(activeChannelId!);
            } else throw new Error('Failed to edit message');
        } catch (error) { console.error("Error editing message:", error); }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!user || !window.confirm("¿Seguro que quieres eliminar este mensaje?")) return;
        try {
            const response = await fetch(`http://localhost:3001/api/community/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, userRole: user.role })
            });
            if (response.ok) await fetchMessages(activeChannelId!); else throw new Error('Failed to delete message');
        } catch (error) { console.error("Error deleting message:", error); }
    };

    const handleToggleReaction = async (messageId: number, emoji: string) => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:3001/api/community/messages/${messageId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, userName: user.name, emoji })
            });
            if (response.ok) await fetchMessages(activeChannelId!); else throw new Error('Failed to react');
        } catch (error) { console.error("Error reacting to message:", error); }
    };

    useEffect(() => { if (editingMessage) setEditedText(editingMessage.text); }, [editingMessage]);

    const renderableChatItems = useMemo(() => {
        const channelMessages = activeChannelId ? messages[activeChannelId] || [] : [];
        if (channelMessages.length === 0) return [];
        const items: RenderableChatItem[] = [];
        let lastMessage: CommunityMessage | null = null;
        channelMessages.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const lastMessageDate = lastMessage ? new Date(lastMessage.timestamp) : null;
            if (!lastMessageDate || messageDate.toDateString() !== lastMessageDate.toDateString()) {
                items.push({ type: 'date_divider', date: messageDate });
            }
            if (lastMessage && items.length > 0 && items[items.length - 1].type === 'message_group' &&
                message.user === lastMessage.user && !message.replyingTo && !lastMessage.replyingTo &&
                messageDate.getTime() - lastMessageDate!.getTime() < 5 * 60 * 1000
            ) {
                (items[items.length - 1] as any).group.push(message);
            } else {
                items.push({ type: 'message_group', group: [message] });
            }
            lastMessage = message;
        });
        return items;
    }, [messages, activeChannelId]);
    
    const activeChannelInfo = channels.find(c => c.id === activeChannelId);
    const canWrite = user && (!activeChannelInfo?.admin_only_write || isAdmin);

    return (
        <div className="discord-theme flex h-screen pt-20">
            <aside className="w-60 bg-[color:var(--bg-secondary)] flex flex-col flex-shrink-0">
                <header className="p-4 h-12 flex items-center shadow-md"><h1 className="font-bold text-white text-lg">Canales</h1></header>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {channels.map(channel => (
                        <a key={channel.id} href="#" onClick={(e) => { e.preventDefault(); setActiveChannelId(channel.id); }} className={`relative flex items-center space-x-2 w-full text-left px-2 py-1.5 rounded transition-colors channel-link text-[color:var(--text-muted)] ${activeChannelId === channel.id ? 'active' : ''}`}>
                            <span className="text-xl">#</span><span>{channel.name}</span>
                        </a>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-[color:var(--bg-primary)]">
                <header className="flex items-center justify-between p-4 h-12 border-b border-black/20 shadow-sm flex-shrink-0">
                    <div><h1 className="text-xl font-bold flex items-center space-x-2 text-[color:var(--header-primary)]"><span className="text-2xl text-[color:var(--channel-icon)]">#</span><span>{activeChannelInfo?.name}</span></h1></div>
                </header>
                 <div className="flex-1 flex min-h-0">
                    <main className="flex-1 flex flex-col min-h-0">
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto discord-chat-messages px-4">
                            {isLoading ? <div className="flex justify-center items-center h-full text-text-muted">Cargando mensajes...</div> :
                                <>
                                    <div className="h-4" />
                                    {renderableChatItems.map((item, index) => {
                                        if (item.type === 'date_divider') return <DateDivider key={`divider-${index}`} date={item.date} />;
                                        const group = item.group;
                                        return (
                                            <div key={group[0].id} className="discord-message-group">
                                                {group.map((message, msgIndex) => {
                                                    if (editingMessage?.id === message.id) {
                                                        return (
                                                            <div key={message.id} className="px-16 py-2">
                                                                <textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="discord-chat-textarea w-full bg-[color:var(--input-bg)] rounded-md p-2" rows={3}/>
                                                                <div className="text-xs mt-1">presiona <strong className="text-primary">Enter</strong> para guardar, <strong className="text-primary">Esc</strong> para cancelar</div>
                                                                <button onClick={handleEditMessage} className="text-xs px-2 py-1 bg-primary rounded mt-1">Guardar</button>
                                                                <button onClick={() => setEditingMessage(null)} className="text-xs px-2 py-1 ml-2">Cancelar</button>
                                                            </div>
                                                        );
                                                    }
                                                    return (<MessageItem key={message.id} message={message} isGroupStart={msgIndex === 0} user={user} isAdmin={isAdmin} setReplyingTo={setReplyingTo} setEditingMessage={setEditingMessage} onDelete={handleDeleteMessage} onToggleReaction={handleToggleReaction} />);
                                                })}
                                            </div>
                                        );
                                    })}
                                    <div className="h-4" />
                                </>
                            }
                        </div>
                        <footer className="px-4 pb-4 pt-2 flex-shrink-0">
                             {canWrite ? (
                                <div className="discord-chat-input-wrapper">
                                    {replyingTo && (
                                        <div className="reply-bar">
                                            <span>Respondiendo a <strong>{replyingTo.user}</strong></span>
                                            <button onClick={() => setReplyingTo(null)} className="text-xl">&times;</button>
                                        </div>
                                    )}
                                    <textarea ref={textareaRef} placeholder={`Enviar mensaje a #${activeChannelInfo?.name}`} className="discord-chat-textarea pt-2"
                                        value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} rows={1}
                                    />
                                </div>
                            ) : (
                                <div className="text-center text-sm text-[color:var(--text-muted)] bg-[color:var(--input-bg)] p-3 rounded-lg">{user ? 'Solo los administradores pueden enviar mensajes.' : 'Debes iniciar sesión para enviar mensajes.'}</div>
                            )}
                        </footer>
                    </main>

                    <aside className="w-60 discord-sidebar-members flex-shrink-0 p-2 flex flex-col">
                         <h2 className="p-2 text-[color:var(--header-secondary)] text-xs font-bold uppercase flex-shrink-0">Miembros — {members.length}</h2>
                        <div className="flex-1 overflow-y-auto pr-1">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center p-2 rounded-md hover:bg-[color:var(--bg-hover)] cursor-pointer">
                                    <div className="relative mr-3">
                                        {member.profile_picture_url ? (
                                            <img src={member.profile_picture_url} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getConsistentColor(member.name)}`}>
                                                {getUserInitials(member.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <span className="text-sm font-semibold text-[color:var(--text-normal)]">{member.name}</span>
                                        {member.is_admin && <span className="ml-2 discord-admin-tag">ADMIN</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ComunidadPage;