
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
            setBody('');
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

const UserEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    userToEdit: User;
    onSave: (userId: string, data: { name: string, role: UserRole, points: number }) => Promise<void>;
}> = ({ isOpen, onClose, userToEdit, onSave }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('usuario');
    const [points, setPoints] = useState(0);

    useEffect(() => {
        if (userToEdit && isOpen) {
            setName(userToEdit.name);
            setRole(userToEdit.role);
            setPoints(userToEdit.points);
        }
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(userToEdit.id, { name, role, points });
    };
    
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold">Editar Usuario</h2>
                    <div className="space-y-4 modal-form mt-4">
                        <div><label>Nombre</label><input type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
                        <div><label>Rol</label><select value={role} onChange={e => setRole(e.target.value as UserRole)}><option value="usuario">Usuario</option><option value="moderador">Moderador</option><option value="dueño">Dueño</option></select></div>
                        <div><label>EcoPuntos</label><input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} required /></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    )
};


const AdminPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('messages');
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedItem, setSelectedItem] = useState<ContactMessage | Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replyData, setReplyData] = useState<{ email: string; subject: string } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
    const [achievementsUser, setAchievementsUser] = useState<User | null>(null);
    const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);

    const fetchAllData = useCallback(async (tab: AdminTab) => {
        if (!user) return;
        setIsLoading(true);
        const cacheBuster = `?t=${new Date().getTime()}&adminUserId=${user.id}`;
        let endpoint = '';
        switch(tab) {
            case 'messages': endpoint = 'messages'; break;
            case 'reports': endpoint = 'reports'; break;
            case 'users':
                if (user.role === 'dueño') endpoint = 'users';
                else { setIsLoading(false); return; }
                break;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/admin/${endpoint}${cacheBuster}`);
            if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
            const data = await response.json();

            if (tab === 'messages') setMessages(data);
            else if (tab === 'reports') setReports(data);
            else if (tab === 'users') setAllUsers(data);
        } catch (error) {
            console.error(`Error fetching ${tab}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAllData(activeTab);
    }, [activeTab, fetchAllData]);

    const handleUpdateMessageStatus = async (messageId: number, status: ContactMessage['status']) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m));
        if (selectedItem && 'id' in selectedItem && selectedItem.id === messageId) {
            setSelectedItem(prev => prev ? { ...prev, status } as ContactMessage : null);
        }
        try {
            await fetch(`http://localhost:3001/api/admin/messages/${messageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            console.error('Failed to update message status:', error);
            // Optionally revert UI change on failure
        }
    };
    
    const handleUpdateReportStatus = async (reportId: number, status: ReportStatus) => {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
        if (selectedItem && 'id' in selectedItem && selectedItem.id === reportId) {
            setSelectedItem(prev => prev ? { ...prev, status } as Report : null);
        }
        try {
            await fetch(`http://localhost:3001/api/admin/reports/${reportId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            console.error('Failed to update report status:', error);
            // Optionally revert UI change on failure
        }
    };
    
    const handleSelectItem = (item: ContactMessage | Report) => {
        setSelectedItem(item);
        if ('subject' in item && item.status === 'unread') {
            handleUpdateMessageStatus(item.id, 'read');
        }
    };
    
    const handleSendReply = async (body: string) => {
        if (!replyData || !user) throw new Error("No hay datos para enviar la respuesta.");
        try {
            const response = await fetch('http://localhost:3001/api/admin/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: replyData.email,
                    subject: replyData.subject,
                    body,
                    adminUserId: user.id
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar la respuesta.');
            }
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to send reply:', error);
            throw error; // Re-throw to be caught by the modal
        }
    };

    const handleOpenReplyModal = (email: string, subject: string) => {
        setReplyData({ email, subject });
        setIsReplyModalOpen(true);
    };

    const handleSaveUser = async (userId: string, data: { name: string; role: UserRole; points: number }) => {
        if (!user || user.role !== 'dueño') return alert('Acción no permitida.');
        if (user.id === userId && data.role !== 'dueño') return alert('No puedes cambiar tu propio rol de "dueño".');
        try {
            await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, adminUserId: user.id }),
            });
            setIsUserEditModalOpen(false);
            fetchAllData('users');
        } catch (error) {
            console.error(error);
            alert('Error al guardar el usuario.');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!user || user.role !== 'dueño') return alert('Acción no permitida.');
        if (user.id === userId) return alert('No puedes eliminar tu propia cuenta.');
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
            try {
                await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminUserId: user.id }),
                });
                fetchAllData('users');
            } catch (error) {
                console.error(error);
                alert('Error al eliminar el usuario.');
            }
        }
    };

    const handleToggleAchievement = async (achievementId: string, unlocked: boolean) => {
        if (!achievementsUser || !user || user.role !== 'dueño') return;
        try {
            await fetch(`http://localhost:3001/api/admin/users/${achievementsUser.id}/achievements`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievementId, unlocked, adminUserId: user.id })
            });
            // Re-fetch users to get updated achievement list
            const updatedUserResponse = await fetch(`http://localhost:3001/api/admin/users/${achievementsUser.id}?adminUserId=${user.id}`);
            const updatedUser = await updatedUserResponse.json();
            setAchievementsUser(updatedUser);
            setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

        } catch (error) {
            console.error("Error toggling achievement:", error);
            alert("No se pudo actualizar el logro.");
        }
    };
    
    // RENDER FUNCTIONS (renderMessageDetails, etc.)
    const renderMessageDetails = (msg: ContactMessage) => (
        <>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-text-main">{msg.subject}</h3>
                    <p className="text-sm text-text-secondary">De: {msg.name} ({msg.email})</p>
                    <p className="text-xs text-slate-400 mt-1">Recibido: {new Date(msg.submitted_at).toLocaleString('es-AR')}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${messageStatusStyles[msg.status]}`}>{msg.status}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-text-secondary whitespace-pre-wrap">{msg.message}</p>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                    <button onClick={() => handleOpenReplyModal(msg.email, `RE: ${msg.subject}`)} className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark">Responder</button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleUpdateMessageStatus(msg.id, 'read')} className="text-xs px-3 py-1 bg-slate-600 rounded-md">Marcar como leído</button>
                    <button onClick={() => handleUpdateMessageStatus(msg.id, 'archived')} className="text-xs px-3 py-1 bg-slate-600 rounded-md">Archivar</button>
                </div>
            </div>
        </>
    );
    const renderReportDetails = (rep: Report) => (
        <>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-text-main">Reporte para: {rep.locationName}</h3>
                    <p className="text-sm text-text-secondary">Reportado por: {rep.userName} ({rep.userEmail})</p>
                    <p className="text-xs text-slate-400 mt-1">Recibido: {new Date(rep.reported_at).toLocaleString('es-AR')}</p>
                </div>
                 <span className={`px-2 py-1 text-xs font-bold rounded-full border ${reportStatusStyles[rep.status]}`}>{rep.status}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <div>
                    <strong className="text-text-main">Motivo:</strong>
                    <span className="ml-2 text-text-secondary">{reasonLabels[rep.reason]}</span>
                </div>
                {rep.comment && (
                    <div>
                        <strong className="text-text-main">Comentario:</strong>
                        <p className="text-text-secondary whitespace-pre-wrap mt-1">{rep.comment}</p>
                    </div>
                )}
                {rep.imageUrl && (
                    <div>
                        <strong className="text-text-main">Imagen Adjunta:</strong>
                        <img src={rep.imageUrl} alt="Imagen del reporte" className="mt-2 rounded-lg max-w-sm" />
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => handleUpdateReportStatus(rep.id, 'pending')} className="text-xs px-3 py-1 bg-slate-600 rounded-md">Marcar como pendiente</button>
                <button onClick={() => handleUpdateReportStatus(rep.id, 'resolved')} className="text-xs px-3 py-1 bg-emerald-700 rounded-md">Marcar como resuelto</button>
                <button onClick={() => handleUpdateReportStatus(rep.id, 'dismissed')} className="text-xs px-3 py-1 bg-slate-600 rounded-md">Descartar</button>
            </div>
        </>
    );

    const renderContent = () => {
        if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
        if (activeTab === 'users') {
            if (user?.role !== 'dueño') return <div className="p-8 text-center">Acceso denegado.</div>;
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-surface">
                            <tr>
                                <th className="px-6 py-3">Nombre</th><th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Rol</th><th className="px-6 py-3">Puntos</th><th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map(u => (
                                <tr key={u.id} className="border-b border-white/10">
                                    <td className="px-6 py-4 font-medium text-text-main">{u.name}</td>
                                    <td className="px-6 py-4">{u.email}</td>
                                    <td className="px-6 py-4">{u.role}</td>
                                    <td className="px-6 py-4">{u.points}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => { setEditingUser(u); setIsUserEditModalOpen(true); }} className="text-xs p-1.5 bg-slate-600 rounded">Editar</button>
                                        <button onClick={() => { setAchievementsUser(u); setIsAchievementsModalOpen(true); }} className="text-xs p-1.5 bg-slate-600 rounded">Logros</button>
                                        <button onClick={() => handleDeleteUser(u.id)} className="text-xs p-1.5 bg-red-800 rounded">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }
        if (activeTab === 'messages') {
            return (
                <div className="overflow-y-auto max-h-[70vh]">
                    {messages.map(msg => (
                        <div key={msg.id} onClick={() => handleSelectItem(msg)} className="p-4 border-b border-white/10 cursor-pointer hover:bg-slate-800">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-text-main truncate">{msg.subject}</p>
                                <span className={`flex-shrink-0 ml-2 px-2 py-0.5 text-xs rounded-full border ${messageStatusStyles[msg.status]}`}>{msg.status}</span>
                            </div>
                            <p className="text-sm text-text-secondary truncate">{msg.name} ({msg.email})</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(msg.submitted_at).toLocaleString('es-AR')}</p>
                        </div>
                    ))}
                </div>
            );
        }
        if (activeTab === 'reports') {
            return (
                <div className="overflow-y-auto max-h-[70vh]">
                    {reports.map(rep => (
                        <div key={rep.id} onClick={() => handleSelectItem(rep)} className="p-4 border-b border-white/10 cursor-pointer hover:bg-slate-800">
                             <div className="flex justify-between items-start">
                                <p className="font-semibold text-text-main truncate">{rep.locationName}</p>
                                <span className={`flex-shrink-0 ml-2 px-2 py-0.5 text-xs rounded-full border ${reportStatusStyles[rep.status]}`}>{rep.status}</span>
                            </div>
                            <p className="text-sm text-text-secondary truncate">Motivo: {reasonLabels[rep.reason]}</p>
                            <p className="text-xs text-slate-500 mt-1">Por: {rep.userName} - {new Date(rep.reported_at).toLocaleString('es-AR')}</p>
                        </div>
                    ))}
                </div>
            );
        }
        return <div>Contenido de {activeTab}</div>;
    };


    return (
        <div className="bg-background pt-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold font-display">Panel de Administración</h1>
                    <p className="mt-4 text-lg text-text-secondary">Gestiona las interacciones de la comunidad.</p>
                </div>

                <div className="flex border-b border-white/10 mb-6">
                    <button onClick={() => setActiveTab('messages')} className={`px-4 py-2 font-semibold ${activeTab === 'messages' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Mensajes</button>
                    <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 font-semibold ${activeTab === 'reports' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Reportes</button>
                    {user?.role === 'dueño' && (
                        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-semibold ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Usuarios</button>
                    )}
                </div>

                <div className="modern-card overflow-hidden">
                    {renderContent()}
                </div>
            </div>

            {/* Modals */}
            {editingUser && <UserEditModal isOpen={isUserEditModalOpen} onClose={() => setIsUserEditModalOpen(false)} userToEdit={editingUser} onSave={handleSaveUser} />}
            {achievementsUser && <AchievementsModal isOpen={isAchievementsModalOpen} onClose={() => setIsAchievementsModalOpen(false)} user={achievementsUser} isAdminMode={user?.role === 'dueño'} onToggleAchievement={handleToggleAchievement} />}

            {selectedItem && (
                <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
                    <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                           {'subject' in selectedItem ? renderMessageDetails(selectedItem as ContactMessage) : renderReportDetails(selectedItem as Report)}
                        </div>
                    </div>
                </div>
            )}
            
            {replyData && (
                <ReplyModal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} recipientEmail={replyData.email} defaultSubject={replyData.subject} onSend={handleSendReply} />
            )}
        </div>
    );
};

export default AdminPage;
