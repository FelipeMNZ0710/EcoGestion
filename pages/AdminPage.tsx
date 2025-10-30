


import React, { useState, useEffect, useCallback } from 'react';
import type { User, ContactMessage, Report, ReportStatus } from '../types';

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

type AdminTab = 'messages' | 'reports';

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


const AdminPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('messages');
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedItem, setSelectedItem] = useState<ContactMessage | Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replyData, setReplyData] = useState<{ email: string; subject: string } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const cacheBuster = `?t=${new Date().getTime()}`;
            const endpoint = activeTab === 'messages' ? 'messages' : 'reports';
            
            try {
                const response = await fetch(`http://localhost:3001/api/admin/${endpoint}${cacheBuster}`);
                if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
                const data = await response.json();

                if (activeTab === 'messages') {
                    setMessages(data);
                } else {
                    setReports(data);
                }
            } catch (error) {
                console.error(`Error fetching ${activeTab}:`, error);
                if (activeTab === 'messages') setMessages([]); else setReports([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    const handleUpdateMessageStatus = async (messageId: number, status: ContactMessage['status']) => {
        try {
            await fetch(`http://localhost:3001/api/admin/messages/${messageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminUserId: user?.id }),
            });
            setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, status } : msg));
            if (selectedItem && 'subject' in selectedItem && selectedItem.id === messageId) {
                setSelectedItem(prev => prev ? { ...prev, status } as ContactMessage : null);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update message status.');
        }
    };
    
    const handleUpdateReportStatus = async (reportId: number, status: ReportStatus) => {
        try {
            await fetch(`http://localhost:3001/api/admin/reports/${reportId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminUserId: user?.id }),
            });
            setReports(prev => prev.map(rep => rep.id === reportId ? { ...rep, status } : rep));
            if (selectedItem && 'reason' in selectedItem && selectedItem.id === reportId) {
                setSelectedItem(prev => prev ? { ...prev, status } as Report : null);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update report status.');
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

        const response = await fetch('http://localhost:3001/api/admin/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: replyData.email,
                subject: replyData.subject,
                body: body,
                adminUserId: user.id
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al enviar la respuesta.');
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };
    
    const handleOpenReplyModal = (email: string, subject: string) => {
        setReplyData({ email, subject });
        setIsReplyModalOpen(true);
    };

    const renderMessageDetails = (msg: ContactMessage) => (
        <>
            <h2 className="text-xl font-bold text-text-main">{msg.subject}</h2>
            <p className="text-sm text-text-secondary">De: {msg.name} &lt;{msg.email}&gt;</p>
            <p className="text-xs text-text-secondary mt-1">Recibido: {new Date(msg.submitted_at).toLocaleString('es-AR')}</p>
            <div className="mt-4 pt-4 border-t border-white/10 text-text-secondary whitespace-pre-wrap max-h-64 overflow-y-auto">{msg.message}</div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                 <button
                    onClick={() => handleOpenReplyModal(msg.email, `Re: ${msg.subject}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 text-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                    Responder
                </button>
                <div className="flex gap-3">
                    {msg.status !== 'archived' && <button onClick={() => handleUpdateMessageStatus(msg.id, 'archived')} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500 text-sm">Archivar</button>}
                    {msg.status !== 'read' && <button onClick={() => handleUpdateMessageStatus(msg.id, 'read')} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-sm">Marcar como leído</button>}
                </div>
            </div>
        </>
    );

    const renderReportDetails = (rep: Report) => (
        <>
            <h2 className="text-xl font-bold text-text-main">Reporte de: {rep.locationName}</h2>
            <p className="text-sm text-text-secondary">Por: {rep.userName}</p>
            <p className="text-xs text-text-secondary mt-1">Fecha: {new Date(rep.reported_at).toLocaleString('es-AR')}</p>
            <p className="font-bold text-primary mt-3">{reasonLabels[rep.reason]}</p>
            {rep.comment && <div className="mt-4 pt-4 border-t border-white/10 text-text-secondary whitespace-pre-wrap max-h-48 overflow-y-auto">{rep.comment}</div>}
            {rep.imageUrl && <div className="mt-4"><a href={rep.imageUrl} target="_blank" rel="noopener noreferrer"><img src={rep.imageUrl} alt="Foto del reporte" className="max-h-48 rounded-lg"/></a></div>}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                 <button
                    disabled={!rep.userEmail}
                    onClick={() => handleOpenReplyModal(rep.userEmail, `Re: Tu reporte en ${rep.locationName}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 text-sm flex items-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed"
                    title={rep.userEmail ? 'Responder al usuario' : 'Email del usuario no disponible'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                    Responder
                </button>
                <div className="flex justify-end gap-3">
                    {rep.status !== 'resolved' && <button onClick={() => handleUpdateReportStatus(rep.id, 'resolved')} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 text-sm">Marcar como Resuelto</button>}
                    {rep.status !== 'dismissed' && <button onClick={() => handleUpdateReportStatus(rep.id, 'dismissed')} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500 text-sm">Descartar</button>}
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8 text-text-secondary">Cargando datos...</div>;
        }

        if (activeTab === 'messages') {
            if (messages.length === 0) return <div className="text-center p-8 text-text-secondary">No hay mensajes de contacto.</div>;
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface">
                            <tr>
                                <th scope="col" className="px-6 py-3">Estado</th><th scope="col" className="px-6 py-3">De</th>
                                <th scope="col" className="px-6 py-3">Asunto</th><th scope="col" className="px-6 py-3 hidden md:table-cell">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map(msg => (
                                <tr key={msg.id} className="border-b border-white/10 hover:bg-surface cursor-pointer" onClick={() => handleSelectItem(msg)}>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-bold rounded-full border ${messageStatusStyles[msg.status]}`}>{msg.status === 'unread' ? 'Nuevo' : msg.status === 'read' ? 'Leído' : 'Archivado' }</span></td>
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{msg.name}</td>
                                    <td className="px-6 py-4">{msg.subject}</td>
                                    <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">{new Date(msg.submitted_at).toLocaleDateString('es-AR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (activeTab === 'reports') {
            if (reports.length === 0) return <div className="text-center p-8 text-text-secondary">No hay reportes de Puntos Verdes.</div>;
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                       <thead className="text-xs uppercase bg-surface">
                           <tr>
                               <th scope="col" className="px-6 py-3">Estado</th><th scope="col" className="px-6 py-3">Punto Verde</th>
                               <th scope="col" className="px-6 py-3">Reportado Por</th><th scope="col" className="px-6 py-3">Motivo</th>
                               <th scope="col" className="px-6 py-3 hidden md:table-cell">Fecha</th>
                           </tr>
                       </thead>
                       <tbody>
                           {reports.map(rep => (
                               <tr key={rep.id} className="border-b border-white/10 hover:bg-surface cursor-pointer" onClick={() => handleSelectItem(rep)}>
                                   <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-bold rounded-full border ${reportStatusStyles[rep.status]}`}>{rep.status === 'pending' ? 'Pendiente' : rep.status === 'resolved' ? 'Resuelto' : 'Descartado' }</span></td>
                                   <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{rep.locationName}</td>
                                   <td className="px-6 py-4 whitespace-nowrap">{rep.userName}</td>
                                   <td className="px-6 py-4">{reasonLabels[rep.reason]}</td>
                                   <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">{new Date(rep.reported_at).toLocaleDateString('es-AR')}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
            );
        }
    };


    return (
        <div className="bg-background pt-20 min-h-screen">
            {showSuccess && (
                <div className="fixed top-24 right-5 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up z-50">
                    Respuesta enviada exitosamente (simulado).
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold font-display text-text-main sm:text-5xl">Panel de Administración</h1>
                    <p className="mt-4 text-lg text-text-secondary">Gestiona las interacciones de la comunidad.</p>
                </div>

                <div className="flex border-b border-white/10 mb-6">
                    <button onClick={() => setActiveTab('messages')} className={`px-4 py-2 font-semibold ${activeTab === 'messages' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Mensajes de Contacto ({messages.filter(m => m.status === 'unread').length})</button>
                    <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 font-semibold ${activeTab === 'reports' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Reportes de Puntos Verdes ({reports.filter(r => r.status === 'pending').length})</button>
                </div>

                <div className="modern-card overflow-hidden">
                    {renderContent()}
                </div>
            </div>

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
                <ReplyModal
                    isOpen={isReplyModalOpen}
                    onClose={() => setIsReplyModalOpen(false)}
                    recipientEmail={replyData.email}
                    defaultSubject={replyData.subject}
                    onSend={handleSendReply}
                />
            )}
        </div>
    );
};

export default AdminPage;