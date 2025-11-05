import React, { useEffect, useState, useRef, useMemo, forwardRef, useCallback } from 'react';
import type { User, GamificationAction, Location, Schedule, LocationStatus, ReportReason } from '../types';
import FilterMenu, { Category as FilterCategory } from '../components/FilterMenu';
import InteractiveMap from '../components/InteractiveMap';

const allMaterials: string[] = ['Plásticos', 'Vidrio', 'Papel/Cartón', 'Pilas'];
const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const statusInfo: Record<LocationStatus, { text: string; color: string }> = {
    ok: { text: "Operativo", color: "text-emerald-300 bg-emerald-500/20" },
    reported: { text: "Reportado", color: "text-amber-300 bg-amber-500/20" },
    maintenance: { text: "En Mantenimiento", color: "text-blue-300 bg-blue-500/20" },
    serviced: { text: "Servicio Reciente", color: "text-cyan-300 bg-cyan-500/20" }
};

// --- Helper Functions ---
const checkOpen = (schedule: Schedule[]): boolean => {
    if (!schedule || schedule.length === 0) return true; // Assume 24/7 if no schedule
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    for (const s of schedule) {
        if (s.days.includes(currentDay)) {
            if (s.open === '00:00' && s.close === '23:59') return true;
            if (currentTime >= s.open && currentTime <= s.close) return true;
        }
    }
    return false;
};

// --- Sub-Components ---
const LocationCard = forwardRef<HTMLDivElement, {
    location: Location; isSelected: boolean; isFavorite: boolean;
    user: User | null; isAdminMode: boolean; onClick: () => void; onToggleFavorite: (locationId: string) => void;
    onEdit: () => void; onDelete: () => void; onHover: (id: string | null) => void;
}>(({ location, isSelected, isFavorite, user, isAdminMode, onClick, onToggleFavorite, onEdit, onDelete, onHover }, ref) => {
    const currentStatus = statusInfo[location.status];
    return (
        <div 
            ref={ref} 
            className={`modern-card overflow-hidden flex flex-col transition-all duration-200 cursor-pointer relative ${isSelected ? 'border-primary' : ''}`} 
            onClick={onClick} 
            onMouseEnter={() => onHover(location.id)}
            onMouseLeave={() => onHover(null)}
            role="button" 
            tabIndex={0} 
            aria-label={`Ver detalles de ${location.name}`}
        >
            <div className="relative">
                <img src={location.imageUrls[0]} alt={`Foto de ${location.name}`} className="w-full h-40 object-cover" />
                 {isAdminMode && (
                    <div className="card-admin-controls">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="admin-action-button" title="Editar punto"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="admin-action-button delete" title="Eliminar punto"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                )}
                 {user && (
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(location.id); }} className={`absolute top-2 left-2 z-10 p-1.5 rounded-full transition-colors ${isFavorite ? 'text-yellow-400 bg-yellow-400/20' : 'text-slate-400 bg-surface/50 hover:text-yellow-400'}`} title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </button>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${currentStatus.color} backdrop-blur-sm`}>{currentStatus.text}</span>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-text-main leading-tight">{location.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{location.address}</p>
                <div className="flex-grow mt-4">
                    <div className="flex flex-wrap gap-2">
                        {location.materials.map(material => (<span key={material} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 font-medium rounded-md">{material}</span>))}
                    </div>
                </div>
            </div>
        </div>
    );
});
LocationCard.displayName = 'LocationCard';

const LocationDetailModal: React.FC<{location: Location | null; user: User | null; onClose: () => void; onCheckIn: () => void; onReport: () => void;}> = ({ location, user, onClose, onCheckIn, onReport }) => {
    const [mainImage, setMainImage] = useState(location?.imageUrls[0] || '');
    
    useEffect(() => {
        if(location) setMainImage(location.imageUrls[0]);
    }, [location]);

    if (!location) return null;

    const isOpenNow = checkOpen(location.schedule);
    const currentStatus = statusInfo[location.status];
    const lastServicedDate = new Date(location.lastServiced).toLocaleDateString('es-AR');

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content !max-w-xl relative" onClick={e => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-1.5 hover:bg-black/75 transition-colors z-10" aria-label="Cerrar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="detail-gallery p-4">
                    <img src={mainImage} alt={location.name} className="detail-gallery-main" />
                    <div className="detail-gallery-thumbs">
                        {location.imageUrls.map(url => (
                            <img key={url} src={url} onClick={() => setMainImage(url)} className={`detail-gallery-thumb ${mainImage === url ? 'active' : ''}`} alt={`Vista de ${location.name}`} />
                        ))}
                    </div>
                </div>
                <div className="p-6 pt-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`px-2.5 py-1 text-sm font-bold rounded-full ${currentStatus.color}`}>{currentStatus.text}</span>
                            <h2 className="text-2xl font-bold font-display text-text-main mt-3">{location.name}</h2>
                            <p className="text-text-secondary mt-1">{location.address}</p>
                        </div>
                        <div className={`status-indicator ${isOpenNow ? 'open text-emerald-400' : 'closed text-red-400'}`}>
                            <div className="status-indicator-dot"></div>
                            <span>{isOpenNow ? 'Abierto Ahora' : 'Cerrado Ahora'}</span>
                        </div>
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-text-secondary">{location.description}</p>
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-4 activity-stats-grid">
                        <div className="activity-stat-item"><div className="value">{lastServicedDate}</div><div className="label">Último Servicio</div></div>
                        <div className="activity-stat-item"><div className="value">{location.reportCount ?? 0}</div><div className="label">Reportes Pend.</div></div>
                        <div className="activity-stat-item"><div className="value">{location.checkIns}</div><div className="label">Check-ins</div></div>
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-4">
                        <h3 className="font-semibold text-text-main mb-2">Materiales Aceptados</h3>
                        <div className="flex flex-wrap gap-2">{location.materials.map(m => (<span key={m} className="px-2 py-1 text-sm bg-slate-700 text-slate-300 font-medium rounded-md">{m}</span>))}</div>
                    </div>

                    {user && (
                        <div className="mt-6 flex gap-3">
                            <button onClick={onCheckIn} className="flex-1 cta-button !py-3">Hacer Check-in (+25 pts)</button>
                            <button onClick={onReport} className="flex-1 bg-amber-500/20 text-amber-300 font-bold py-3 rounded-lg hover:bg-amber-500/30 transition-colors">Reportar Problema</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReportModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (reportData: { reason: ReportReason, comment: string, imageUrl?: string }) => void; }> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState<ReportReason>('full');
    const [comment, setComment] = useState('');
    const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setReason('full');
            setComment('');
            setPhoto(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPhoto({ file, preview: URL.createObjectURL(file) });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (photo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSubmit({ reason, comment, imageUrl: reader.result as string });
                onClose();
            };
            reader.readAsDataURL(photo.file);
        } else {
            onSubmit({ reason, comment });
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold font-display text-text-main mb-4">Reportar un Problema</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Motivo del reporte</label>
                            <div className="report-reason-group">
                                {(['full', 'dirty', 'damaged', 'other'] as const).map(r => (
                                    <div key={r}>
                                        <input type="radio" id={`reason-${r}`} name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="report-reason-input" />
                                        <label htmlFor={`reason-${r}`} className="report-reason-label">{ {full: 'Contenedor lleno', dirty: 'Lugar sucio', damaged: 'Dañado', other: 'Otro'}[r] }</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div><label className="form-label">Comentarios (opcional)</label><textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Añade más detalles aquí..." className="form-input"></textarea></div>
                        <div>
                            <label className="form-label">Añadir foto (opcional)</label>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
                            {!photo ? (
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="report-photo-upload-btn"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Subir Foto</button>
                            ) : (
                                <div className="report-photo-preview"><img src={photo.preview} alt="Vista previa" /><button type="button" onClick={() => setPhoto(null)} className="report-photo-remove-btn">×</button></div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-6"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Enviar Reporte</button></div>
                </form>
            </div>
        </div>
    );
};

const LocationEditModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (location: Omit<Location, 'schedule' | 'mapData' | 'lastServiced' | 'checkIns'>) => void; location: Location | null; }> = ({ isOpen, onClose, onSave, location }) => {
    const [formState, setFormState] = useState<Omit<Location, 'schedule' | 'mapData' | 'lastServiced' | 'checkIns'>>({
        id: '', name: '', address: '', hours: '', materials: [], status: 'ok', description: '', imageUrls: []
    });

    useEffect(() => {
        if (location) {
            setFormState({ ...location, imageUrls: location.imageUrls || [] });
        } else {
            // Default state for creating a new one
            setFormState({ id: `p${Date.now()}`, name: '', address: '', hours: '24hs', materials: [], status: 'ok', description: '', imageUrls: [''] });
        }
    }, [location, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formState, imageUrls: formState.imageUrls.filter(url => url.trim() !== '') });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleMaterialChange = (material: string) => {
        setFormState(prev => {
            const newMaterials = prev.materials.includes(material)
                ? prev.materials.filter(m => m !== material)
                : [...prev.materials, material];
            return { ...prev, materials: newMaterials };
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 modal-form">
                    <h2 className="text-xl font-bold text-text-main mb-4">{location ? 'Editar Punto Verde' : 'Crear Nuevo Punto Verde'}</h2>
                    {!location && <div><label htmlFor="id">ID Único</label><input type="text" name="id" id="id" value={formState.id} onChange={handleInputChange} required /></div>}
                    <div><label htmlFor="name">Nombre</label><input type="text" name="name" id="name" value={formState.name} onChange={handleInputChange} required /></div>
                    <div><label htmlFor="address">Dirección</label><input type="text" name="address" id="address" value={formState.address} onChange={handleInputChange} required/></div>
                    <div><label htmlFor="description">Descripción</label><textarea name="description" id="description" value={formState.description} onChange={handleInputChange} rows={3}></textarea></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label htmlFor="hours">Horario (texto)</label><input type="text" name="hours" id="hours" value={formState.hours} onChange={handleInputChange} /></div>
                        <div><label htmlFor="status">Estado</label>
                            <select name="status" id="status" value={formState.status} onChange={handleInputChange}>
                                <option value="ok">Operativo</option><option value="reported">Reportado</option>
                                <option value="maintenance">En Mantenimiento</option><option value="serviced">Servicio Reciente</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label>Materiales Aceptados</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {allMaterials.map(mat => (
                                <label key={mat} className="flex items-center"><input type="checkbox" checked={formState.materials.includes(mat)} onChange={() => handleMaterialChange(mat)} className="mr-2" /> {mat}</label>
                            ))}
                        </div>
                    </div>
                    <div><label htmlFor="imageUrls">URLs de Imágenes (una por línea)</label><textarea name="imageUrls" id="imageUrls" value={formState.imageUrls.join('\n')} onChange={e => setFormState(prev => ({...prev, imageUrls: e.target.value.split('\n')}))} rows={3}></textarea></div>
                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PuntosVerdesPage: React.FC<{
    user: User | null;
    updateUser: (user: User) => void;
    onUserAction: (action: GamificationAction, payload?: any) => void;
    isAdminMode: boolean;
}> = ({ user, updateUser, onUserAction, isAdminMode }) => {
    const [puntosVerdes, setPuntosVerdes] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [detailModalLocation, setDetailModalLocation] = useState<Location | null>(null);

    const locationRefs = useRef<Record<string, HTMLDivElement | null>>({});
    
    const fetchLocations = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/locations');
            if (!response.ok) throw new Error('La respuesta de la red no fue exitosa');
            const data: Location[] = await response.json();
            setPuntosVerdes(data);
        } catch (error) {
            console.error("Falló la obtención de las ubicaciones:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const filteredLocations = useMemo(() => {
        if (activeFilter === 'Todos') return puntosVerdes;
        if (activeFilter === 'Favoritos') {
            return puntosVerdes.filter(p => user?.favoriteLocations?.includes(p.id));
        }
        return puntosVerdes.filter(p => p.materials.includes(activeFilter));
    }, [puntosVerdes, activeFilter, user]);

    const handleSelectLocationFromMap = (location: Location) => {
        setSelectedLocationId(location.id);
        const cardElement = locationRefs.current[location.id];
        cardElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleToggleFavorite = async (locationId: string) => {
        if (!user) {
            alert("Debes iniciar sesión para guardar favoritos.");
            return;
        }
        try {
            const response = await fetch(`/api/users/favorites`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, locationId: locationId })
            });
            if (!response.ok) throw new Error('Falló la actualización de favoritos');
            const updatedUserFromServer = await response.json();
            updateUser(updatedUserFromServer);
        } catch (error) {
            console.error("Error al cambiar favorito:", error);
            alert("No se pudo actualizar tus favoritos. Intenta de nuevo.");
        }
    };

    const handleCheckIn = () => {
        if (detailModalLocation) {
            onUserAction('check_in', { locationId: detailModalLocation.id });
            setPuntosVerdes(puntosVerdes.map(p => p.id === detailModalLocation.id ? {...p, checkIns: p.checkIns + 1} : p));
            setDetailModalLocation(null);
        }
    };
    
    const handleReportSubmit = async (reportData: { reason: ReportReason, comment: string, imageUrl?: string }) => {
        if (!detailModalLocation || !user) {
            alert("Se requiere un usuario y una ubicación para enviar un reporte.");
            return;
        }

        try {
            const response = await fetch('/api/locations/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationId: detailModalLocation.id,
                    userId: user.id,
                    ...reportData
                })
            });

            if (!response.ok) throw new Error('Falló el envío del reporte');
            
            const updatedLocation = await response.json();

            setPuntosVerdes(puntosVerdes.map(p => p.id === updatedLocation.id ? { ...p, status: updatedLocation.status } : p));
            onUserAction('report_punto_verde');
            setIsReportModalOpen(false);
            if(detailModalLocation.id === updatedLocation.id) {
                setDetailModalLocation(prev => prev ? { ...prev, status: updatedLocation.status } : null);
            }
        } catch (error) {
            console.error("Error al enviar el reporte:", error);
            alert("No se pudo enviar el reporte. Por favor, inténtalo de nuevo.");
        }
    };

    const handleOpenEditModal = (location: Location | null) => {
        setEditingLocation(location);
        setIsEditModalOpen(true);
    };
    
    const handleSaveLocation = async (locationData: Omit<Location, 'schedule' | 'mapData' | 'lastServiced' | 'checkIns'>) => {
        const isCreating = !editingLocation;
        const method = isCreating ? 'POST' : 'PUT';
        const url = isCreating ? '/api/locations' : `/api/locations/${locationData.id}`;
        
        // Simplistic mapData generation for new locations, assuming address is enough
        const fullLocationData = {
            ...locationData,
            schedule: [],
            mapData: isCreating ? { id: locationData.id, name: locationData.name, lat: -26.17 + (Math.random() - 0.5) * 0.1, lng: -58.17 + (Math.random() - 0.5) * 0.1, x: 0, y: 0 } : editingLocation!.mapData,
            lastServiced: new Date().toISOString(),
            checkIns: isCreating ? 0 : editingLocation!.checkIns
        };
        
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullLocationData),
            });
            if (!response.ok) throw new Error('Falló al guardar la ubicación.');
            setIsEditModalOpen(false);
            setEditingLocation(null);
            await fetchLocations();
        } catch(error) {
            console.error("Error guardando ubicación:", error);
            alert('No se pudo guardar la ubicación.');
        }
    };
    
    const handleDeleteLocation = async (locationId: string) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este Punto Verde? Esta acción no se puede deshacer.")) return;
        
        try {
            const response = await fetch(`/api/locations/${locationId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falló al eliminar la ubicación.');
            await fetchLocations();
        } catch(error) {
            console.error("Error eliminando ubicación:", error);
            alert('No se pudo eliminar la ubicación.');
        }
    };

    return (
        <>
            <LocationDetailModal location={detailModalLocation} user={user} onClose={() => setDetailModalLocation(null)} onCheckIn={handleCheckIn} onReport={() => setIsReportModalOpen(true)} />
            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSubmit={handleReportSubmit} />
            <LocationEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLocation} location={editingLocation} />

            <div className="pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold font-display text-text-main sm:text-5xl">Puntos Verdes en Formosa</h1>
                        <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Encuentra tu punto de reciclaje más cercano, filtra por material y colabora con la comunidad reportando el estado de los contenedores.</p>
                         {isAdminMode && (
                            <div className="mt-6">
                                <button onClick={() => handleOpenEditModal(null)} className="cta-button">
                                    + Crear Nuevo Punto Verde
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5">
                            <div className="lg:sticky lg:top-24">
                                <InteractiveMap 
                                    locations={puntosVerdes}
                                    selectedLocationId={selectedLocationId}
                                    hoveredLocationId={hoveredLocationId}
                                    onSelectLocation={handleSelectLocationFromMap}
                                    onHoverLocation={setHoveredLocationId}
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-7 space-y-8">
                            <div>
                                <FilterMenu activeFilter={activeFilter} setActiveFilter={setActiveFilter} user={user} />
                            </div>
                            
                            {isLoading ? (
                                <div className="text-center text-text-secondary p-8">
                                    <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cargando Puntos Verdes...
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredLocations.map(location => (
                                        <LocationCard 
                                            key={location.id}
                                            ref={el => { locationRefs.current[location.id] = el; }}
                                            location={location}
                                            isSelected={selectedLocationId === location.id}
                                            isFavorite={user?.favoriteLocations?.includes(location.id) ?? false}
                                            user={user}
                                            isAdminMode={isAdminMode}
                                            onClick={() => { setSelectedLocationId(location.id); setDetailModalLocation(location); }}
                                            onToggleFavorite={handleToggleFavorite}
                                            onEdit={() => handleOpenEditModal(location)}
                                            onDelete={() => handleDeleteLocation(location.id)}
                                            onHover={setHoveredLocationId}
                                        />
                                    ))}
                                </div>
                            )}
                             {filteredLocations.length === 0 && !isLoading && (
                                <div className="text-center text-text-secondary p-8 modern-card">
                                    <p className="text-2xl mb-2">🙁</p>
                                    <p className="font-semibold">No se encontraron Puntos Verdes</p>
                                    <p className="text-sm">Intenta con otro filtro o revisa tus favoritos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PuntosVerdesPage;