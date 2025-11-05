import React, { useState, useEffect, useCallback } from 'react';
import type { User, ContactMessage, Report, ReportStatus, UserRole, Achievement } from '../types';
import AchievementsModal from '../components/AchievementsModal';

const messageStatusStyles: Record<ContactMessage['status'], string> = {
    unread: 'bg-blue-500/20 text-blue-300 border-blue-500',
    read: 'bg-slate-700 text-slate-400 border-slate-600',
    archived: 'bg-slate-800 text-slate-500 border-slate-700 line-through',
};

const reportStatusStyles: Record<ReportStatus, string> = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500',
    resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500',
    dismissed: 'bg-slate-700 text-slate-400 border-slate-600 line-through',
};

const reasonLabels: Record<Report['reason'], string> = {
    full: 'Contenedor Lleno',
    dirty: 'Lugar Sucio',
    damaged: 'Dañado',
    other: 'Otro Motivo',
};

type AdminTab = 'messages' | 'reports' | 'users';

const ReplyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    recipientEmail: string;
    defaultSubject: string;
    onSend: (body: string) => Promise<void>;
}> = ({ isOpen, onClose, recipientEmail, defaultSubject, onSend }) => {
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setBody(`\n\n---\nEquipo de EcoGestión`);
            setError('');
            setIsSending(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) {
            setError('El cuerpo del mensaje no puede estar vacío.');
            return;
        }
        setError('');
        setIsSending(true);
        try {
            await onSend(body);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold font-display text-text-main mb-4">Responder por Email</h2>
                    <div className="space-y-4 modal-form">
                        <div>
                            <label className="form-label">Para:</label>
                            <input type="text" value={recipientEmail} readOnly className="form-input bg-slate-800 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="form-label">Asunto:</label>
                            <input type="text" value={defaultSubject} readOnly className="form-input bg-slate-800 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="form-label">Respuesta:</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                rows={8}
                                placeholder="Escribe tu respuesta aquí..."
                                className="form-input"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500">Cancelar</button>
                        <button type="submit" disabled={isSending} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-slate-500 flex items-center">
                            {isSending && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isSending ? 'Enviando...' : 'Enviar Respuesta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (updatedUser: Partial<User>) => void;
}> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, role: user.role, points: user.points });
        }
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'points' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 modal-form">
                    <h2 className="text-xl font-bold font-display text-text-main mb-4">Editar Usuario: {user.name}</h2>
                    <div className="space-y-4">
                        <div><label>Nombre</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} /></div>
                        <div><label>Rol</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="usuario">Usuario</option>
                                <option value="moderador">Moderador</option>
                                <option value="dueño">Dueño</option>
                            </select>
                        </div>
                        <div><label>EcoPuntos</label><input type="number" name="points" value={formData.points || 0} onChange={handleChange} /></div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary rounded-md text-white">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const MessagesPanel: React.FC<{ messages: ContactMessage[], onUpdateStatus: (id: number, status: ContactMessage['status']) => void, onReply: (message: ContactMessage) => void, onDelete: (id: number) => void }> = ({ messages, onUpdateStatus, onReply, onDelete }) => (
    <div className="space-y-4">
        {messages.map(msg => (
            <details key={msg.id} className="modern-card p-4">
                <summary className="flex justify-between items-center cursor-pointer">
                    <div className="flex-1">
                        <p className="font-bold text-text-main">{msg.subject}</p>
                        <p className="text-sm text-text-secondary">{msg.name} ({msg.email})</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${messageStatusStyles[msg.status]}`}>{msg.status}</span>
                        <span className="text-sm text-text-secondary">{new Date(msg.submitted_at).toLocaleDateString()}</span>
                    </div>
                </summary>
                <div className="mt-4 pt-4 border-t border-white/10 text-text-secondary">
                    <p>{msg.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => onReply(msg)} className="px-3 py-1 text-sm bg-primary rounded-md text-white">Responder</button>
                        {msg.status !== 'read' && <button onClick={() => onUpdateStatus(msg.id, 'read')} className="px-3 py-1 text-sm bg-slate-600 rounded-md">Marcar como Leído</button>}
                        {msg.status !== 'archived' && <button onClick={() => onUpdateStatus(msg.id, 'archived')} className="px-3 py-1 text-sm bg-slate-700 rounded-md">Archivar</button>}
                        <button onClick={() => onDelete(msg.id)} className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-md">Eliminar</button>
                    </div>
                </div>
            </details>
        ))}
    </div>
);

const ReportsPanel: React.FC<{ reports: Report[], onUpdateStatus: (id: number, status: ReportStatus) => void, onDelete: (id: number) => void }> = ({ reports, onUpdateStatus, onDelete }) => (
     <div className="space-y-4">
        {reports.map(rep => (
            <details key={rep.id} className="modern-card p-4">
                <summary className="flex justify-between items-center cursor-pointer">
                    <div>
                        <p className="font-bold text-text-main">{reasonLabels[rep.reason]} en <span className="text-primary">{rep.locationName}</span></p>
                        <p className="text-sm text-text-secondary">Reportado por: {rep.userName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${reportStatusStyles[rep.status]}`}>{rep.status}</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-white/10 text-text-secondary space-y-3">
                    {rep.comment && <p><strong>Comentario:</strong> {rep.comment}</p>}
                    {rep.imageUrl && <div><p><strong>Imagen Adjunta:</strong></p><img src={rep.imageUrl} alt="Reporte" className="max-w-xs rounded-lg mt-2"/></div>}
                    <div className="flex flex-wrap gap-2">
                        {rep.status !== 'resolved' && <button onClick={() => onUpdateStatus(rep.id, 'resolved')} className="px-3 py-1 text-sm bg-emerald-500/20 text-emerald-300 rounded-md">Marcar como Resuelto</button>}
                        {rep.status !== 'dismissed' && <button onClick={() => onUpdateStatus(rep.id, 'dismissed')} className="px-3 py-1 text-sm bg-slate-600 rounded-md">Desestimar</button>}
                        <button onClick={() => onDelete(rep.id)} className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-md">Eliminar</button>
                    </div>
                </div>
            </details>
        ))}
    </div>
);

const UsersPanel: React.FC<{ users: User[], onEdit: (user: User) => void, onDelete: (id: string) => void, onManageAchievements: (user: User) => void }> = ({ users, onEdit, onDelete, onManageAchievements }) => (
    <div className="modern-card overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-surface text-xs text-text-secondary uppercase">
                <tr>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">EcoPuntos</th>
                    <th className="p-4">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {users.map(u => (
                    <tr key={u.id} className="border-b border-white/10 hover:bg-surface">
                        <td className="p-4 font-medium text-text-main">{u.name}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.role}</td>
                        <td className="p-4">{u.points}</td>
                        <td className="p-4 flex flex-wrap gap-2">
                            <button onClick={() => onEdit(u)} className="text-sm text-blue-400 hover:underline">Editar</button>
                            <button onClick={() => onManageAchievements(u)} className="text-sm text-amber-400 hover:underline">Logros</button>
                            <button onClick={() => onDelete(u.id)} className="text-sm text-red-400 hover:underline">Eliminar</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

interface AdminPageProps {
  user: User | null;
  updateUser: (user: User) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ user, updateUser }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('messages');
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [replyingTo, setReplyingTo] = useState<ContactMessage | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);

    const fetchData = useCallback(async (tab: AdminTab) => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/${tab}?adminUserId=${user.id}`);
            if (!response.ok) throw new Error(`Error ${response.status}: No se pudo obtener los datos.`);
            const data = await response.json();
            if (tab === 'messages') setMessages(data);
            if (tab === 'reports') setReports(data);
            if (tab === 'users') setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, fetchData]);

    const handleUpdateStatus = async (type: 'messages' | 'reports', id: number, status: string) => {
        try {
            const response = await fetch(`/api/admin/${type}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminUserId: user?.id }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            const updatedItem = await response.json();
            
            if (type === 'messages') {
                setMessages(prev => prev.map(msg => msg.id === id ? updatedItem : msg));
            } else if (type === 'reports') {
                setReports(prev => prev.map(rep => rep.id === id ? updatedItem : rep));
            }
        } catch (err) { console.error(`Error actualizando estado para ${type}:`, err); }
    };
    
    const handleDelete = async (type: 'messages' | 'reports' | 'users', id: number | string) => {
        const typeName = type === 'messages' ? 'mensaje' : type === 'reports' ? 'reporte' : 'usuario';
        if (!window.confirm(`¿Seguro que quieres eliminar este ${typeName}? Esta acción no se puede deshacer.`)) return;
        try {
            const response = await fetch(`/api/admin/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUserId: user?.id }),
            });
            if (!response.ok) throw new Error(`Failed to delete ${typeName}`);

            if (type === 'messages') {
                setMessages(prev => prev.filter(msg => msg.id !== id));
            } else if (type === 'reports') {
                setReports(prev => prev.filter(rep => rep.id !== id));
            } else if (type === 'users') {
                setUsers(prev => prev.filter(u => u.id !== id));
            }
        } catch (err) { console.error(`Error eliminando ${type}:`, err); }
    };
    
    const handleSendReply = async (body: string) => {
        if (!replyingTo || !user) return;
        await fetch('/api/admin/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: replyingTo.email, subject: `Re: ${replyingTo.subject}`, body, adminUserId: user.id })
        });
        await handleUpdateStatus('messages', replyingTo.id, 'read');
    };

    const handleUpdateUser = async (updatedFields: Partial<User>) => {
        if (!editingUser || !user) return;
        try {
            const response = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatedFields, adminUserId: user.id })
            });
            if (!response.ok) throw new Error('Failed to update user');
            const updatedUserFromServer = await response.json();
            setUsers(prev => prev.map(u => u.id === updatedUserFromServer.id ? updatedUserFromServer : u));
            if(updatedUserFromServer.id === user.id) {
                updateUser(updatedUserFromServer);
            }
        } catch (err) { 
            console.error('Error al actualizar usuario:', err); 
            alert('No se pudo actualizar el usuario.');
        }
    };
    
    const handleToggleAchievement = async (achievementId: string, unlocked: boolean) => {
        if (!editingUser || !user) return;
        const targetUserId = editingUser.id;
    
        try {
            const response = await fetch(`/api/admin/users/${targetUserId}/achievements`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievementId, unlocked, adminUserId: user.id }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error: No se pudo guardar el cambio en el servidor.');
            }
    
            const updatedUserFromServer = await response.json();
    
            // 1. Actualizar la lista de usuarios en el panel de administración
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === updatedUserFromServer.id ? updatedUserFromServer : u
            ));
    
            // 2. Actualizar el estado del usuario que se está editando en el modal
            setEditingUser(updatedUserFromServer);
    
            // 3. Si el usuario editado es el mismo que el administrador actual,
            //    actualizar el estado global de la aplicación.
            if (updatedUserFromServer.id === user.id) {
                updateUser(updatedUserFromServer);
            }
    
        } catch (error) {
            console.error("Error al actualizar el logro:", error);
            alert((error as Error).message);
            // En caso de error, se recargan los datos para mantener la consistencia
            fetchData('users');
        }
    };


    const renderContent = () => {
        if (isLoading) return <div className="text-center p-8 text-text-secondary">Cargando...</div>;
        if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

        switch (activeTab) {
            case 'messages': return <MessagesPanel messages={messages} onUpdateStatus={(id, status) => handleUpdateStatus('messages', id, status)} onReply={setReplyingTo} onDelete={(id) => handleDelete('messages', id)} />;
            case 'reports': return <ReportsPanel reports={reports} onUpdateStatus={(id, status) => handleUpdateStatus('reports', id, status)} onDelete={(id) => handleDelete('reports', id)} />;
            case 'users': return <UsersPanel users={users} onEdit={setEditingUser} onDelete={(id) => handleDelete('users', id)} onManageAchievements={(u) => { setEditingUser(u); setIsAchievementsModalOpen(true); }} />;
            default: return null;
        }
    };

    return (
        <>
            <ReplyModal isOpen={!!replyingTo} onClose={() => setReplyingTo(null)} recipientEmail={replyingTo?.email || ''} defaultSubject={`Re: ${replyingTo?.subject}`} onSend={handleSendReply} />
            <EditUserModal isOpen={!!editingUser && !isAchievementsModalOpen} onClose={() => setEditingUser(null)} user={editingUser} onSave={handleUpdateUser} />
            <AchievementsModal isOpen={isAchievementsModalOpen} onClose={() => { setIsAchievementsModalOpen(false); setEditingUser(null); }} user={editingUser} isAdminMode={user?.role === 'dueño'} onToggleAchievement={handleToggleAchievement} />
            
            <div className="bg-background pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold font-display text-text-main">Panel de Administración</h1>
                        <p className="mt-2 text-text-secondary">Bienvenido, {user?.name}.</p>
                    </div>

                    <div className="flex justify-center border-b border-white/10 mb-8">
                        {(['messages', 'reports', 'users'] as AdminTab[]).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 font-semibold transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-main'}`}>
                                {tab === 'messages' ? 'Mensajes' : tab === 'reports' ? 'Reportes' : 'Usuarios'}
                            </button>
                        ))}
                    </div>

                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default AdminPage;