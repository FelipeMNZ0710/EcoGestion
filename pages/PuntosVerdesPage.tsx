import React, { useEffect, useState, useRef, useMemo, forwardRef } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import type { User, GamificationAction, Location, Schedule, LocationStatus, Report } from '../types';
import FilterMenu, { Category as FilterCategory } from '../components/FilterMenu';


// --- Data ---
const initialPuntosVerdes: Location[] = [
    {
        id: "guemes",
        name: "Centro Comunitario Güemes",
        address: "Av. Gendarmería Nacional 1234, B° Güemes",
        hours: "Lunes a Viernes de 08:00 a 16:00",
        schedule: [{ days: [1, 2, 3, 4, 5], open: "08:00", close: "16:00" }],
        materials: ['Plásticos', 'Papel/Cartón', 'Vidrio'],
        mapData: { name: "Güemes", id: 'guemes', lat: -26.1980, lng: -58.1995, x: 250, y: 450 },
        status: 'ok',
        description: "Un punto de recolección clave en el barrio, ideal para dejar tus reciclables después de hacer las compras en la zona. Suele tener buen mantenimiento.",
        lastServiced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        checkIns: 183,
        reports: [],
        imageUrls: ['https://images.unsplash.com/photo-1582029132869-755a953a7a2f?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800&auto=format&fit=crop'],
    },
    {
        id: "san-martin",
        name: "Plaza San Martín",
        address: "Av. 25 de Mayo y Moreno, Centro",
        hours: "24 horas",
        schedule: [{ days: [0, 1, 2, 3, 4, 5, 6], open: "00:00", close: "23:59" }],
        materials: ['Plásticos', 'Vidrio'],
        mapData: { name: "Plaza S. Martín", id: 'san-martin', lat: -26.1775, lng: -58.1744, x: 400, y: 300 },
        status: 'reported',
        description: "Punto de reciclaje principal ubicado en la plaza central. Contenedores para múltiples materiales disponibles 24/7. Muy concurrido, a veces puede estar lleno.",
        lastServiced: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        checkIns: 412,
        reports: [{ userId: 'user2', userName: 'Ana Gómez', reason: 'full', comment: 'El contenedor de plásticos está rebalsando.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }],
        imageUrls: ['https://images.unsplash.com/photo-1517009336183-50f2886216ec?q=80&w=800&auto=format&fit=crop'],
    },
    {
        id: "economico",
        name: "Supermercado El Económico",
        address: "Av. Italia 1550, B° San Miguel",
        hours: "Lunes a Sábado de 09:00 a 20:00",
        schedule: [{ days: [1, 2, 3, 4, 5, 6], open: "09:00", close: "20:00" }],
        materials: ['Pilas'],
        mapData: { name: "Super El Económico", id: 'economico', lat: -26.1701, lng: -58.1923, x: 350, y: 180 },
        status: 'ok',
        description: "Contenedor especial para pilas y baterías ubicado en la entrada del supermercado. Es importante depositar aquí estos residuos peligrosos de forma segura.",
        lastServiced: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        checkIns: 98,
        reports: [],
        imageUrls: ['https://images.unsplash.com/photo-1629815024225-b8734e5a9526?q=80&w=800&auto=format&fit=crop'],
    },
    {
        id: "la-paz",
        name: "Delegación Municipal B° La Paz",
        address: "Av. Néstor Kirchner 5595, B° La Paz",
        hours: "Lunes a Viernes de 07:00 a 13:00",
        schedule: [{ days: [1, 2, 3, 4, 5], open: "07:00", close: "13:00" }],
        materials: ['Plásticos', 'Papel/Cartón'],
        mapData: { name: "Delegación La Paz", id: 'la-paz', lat: -26.1600, lng: -58.2150, x: 180, y: 350 },
        status: 'maintenance',
        description: "Punto de recolección gestionado por la municipalidad. Actualmente en mantenimiento, se espera que vuelva a estar operativo pronto.",
        lastServiced: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        checkIns: 55,
        reports: [],
        imageUrls: ['https://images.unsplash.com/photo-1599827552899-62506655c64e?q=80&w=800&auto=format&fit=crop'],
    }
];

const allMaterials: FilterCategory[] = ['Plásticos', 'Vidrio', 'Papel/Cartón', 'Pilas'];
const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const statusInfo: Record<LocationStatus, { text: string; color: string }> = {
    ok: { text: "Operativo", color: "text-emerald-300 bg-emerald-500/20" },
    reported: { text: "Reportado", color: "text-amber-300 bg-amber-500/20" },
    maintenance: { text: "En Mantenimiento", color: "text-blue-300 bg-blue-500/20" },
    serviced: { text: "Servicio Reciente", color: "text-cyan-300 bg-cyan-500/20" }
};

// --- Helper Functions ---
const checkOpen = (schedule: Schedule[]): boolean => {
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
    location: Location; isSelected: boolean; isHovered: boolean; isFavorite: boolean;
    user: User | null; isAdminMode: boolean; onMouseEnter: () => void;
    onMouseLeave: () => void; onClick: () => void; onToggleFavorite: () => void;
    onEdit: () => void; onDelete: () => void;
}>(({ location, isSelected, isHovered, isFavorite, user, isAdminMode, onMouseEnter, onMouseLeave, onClick, onToggleFavorite, onEdit, onDelete }, ref) => {
    const currentStatus = statusInfo[location.status];
    return (
        <div ref={ref} className={`modern-card overflow-hidden flex flex-col transition-all duration-200 cursor-pointer relative ${isSelected || isHovered ? 'border-primary bg-surface' : 'border-white/10 bg-surface'}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick} role="button" tabIndex={0} aria-label={`Ver detalles de ${location.name}`}>
            <div className="relative">
                <img src={location.imageUrls[0]} alt={`Foto de ${location.name}`} className="w-full h-40 object-cover" />
                 {user?.isAdmin && isAdminMode && (
                    <div className="card-admin-controls">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="admin-action-button" title="Editar punto"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="admin-action-button delete" title="Eliminar punto"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                )}
                 {user && (
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className={`absolute top-2 left-2 z-10 p-1.5 rounded-full transition-colors ${isFavorite ? 'text-yellow-400 bg-yellow-400/20' : 'text-slate-400 bg-surface/50 hover:text-yellow-400'}`} title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
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
            <div className="modal-content !max-w-xl" onClick={e => e.stopPropagation()}>
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
                        <div className="activity-stat-item"><div className="value">{location.reports.length}</div><div className="label">Reportes</div></div>
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

const ReportModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (reportData: Omit<Report, 'userId' | 'userName' | 'timestamp'>) => void; }> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState<'full' | 'dirty' | 'damaged' | 'other'>('full');
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

const LocationEditModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (location: Location) => void; location: Location | null; }> = ({ isOpen, onClose, onSave, location }) => {
    const [editedLocation, setEditedLocation] = useState<Location | null>(location);

    useEffect(() => {
        setEditedLocation(location);
    }, [location]);

    if (!isOpen || !editedLocation) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedLocation);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedLocation(prev => prev ? { ...prev, [name]: value } : null);
    };
    
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 modal-form">
                    <h2 className="text-xl font-bold text-text-main">Editar Punto Verde</h2>
                    <div><label>Nombre</label><input type="text" name="name" value={editedLocation.name} onChange={handleInputChange} /></div>
                    <div><label>Dirección</label><input type="text" name="address" value={editedLocation.address} onChange={handleInputChange} /></div>
                    <div><label>Descripción</label><textarea name="description" value={editedLocation.description} onChange={handleInputChange} rows={3}></textarea></div>
                    <div><label>Fecha Último Servicio (YYYY-MM-DD)</label><input type="date" name="lastServiced" value={new Date(editedLocation.lastServiced).toISOString().split('T')[0]} onChange={e => handleInputChange({ target: { name: 'lastServiced', value: new Date(e.target.value).toISOString() } } as any)} /></div>
                    <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar</button></div>
                </form>
            </div>
        </div>
    )
};


const PuntosVerdesPage: React.FC<{ user: User | null; setUser: (user: User | null) => void; onUserAction: (action: GamificationAction, payload?: any) => void; isAdminMode: boolean; }> = ({ user, setUser, onUserAction, isAdminMode }) => {
    const [locations, setLocations] = useState<Location[]>(initialPuntosVerdes);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos');
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const locationCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const filteredAndSortedLocations = useMemo(() => {
        const favoriteIds = user?.favoriteLocations || [];
    
        let filtered = locations;
    
        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(lowercasedSearch) || 
                p.address.toLowerCase().includes(lowercasedSearch)
            );
        }

        if (activeFilter === 'Favoritos') {
            filtered = filtered.filter(p => favoriteIds.includes(p.id));
        } else if (activeFilter !== 'Todos') {
            filtered = filtered.filter(p => p.materials.includes(activeFilter));
        }

        return filtered.sort((a, b) => {
            const aIsFav = favoriteIds.includes(a.id);
            const bIsFav = favoriteIds.includes(b.id);
            if (aIsFav && !bIsFav) return -1;
            if (!aIsFav && bIsFav) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [locations, searchTerm, activeFilter, user]);

    const handleLocationClick = (locationId: string) => setSelectedLocationId(prevId => prevId === locationId ? null : locationId);
    const handleMapPinClick = (locationId: string) => {
        setSelectedLocationId(locationId);
        setTimeout(() => { locationCardRefs.current[locationId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    };
    const handleToggleFavorite = (locationId: string) => {
        if (!user) return;
        const currentFavorites = user.favoriteLocations || [];
        const newFavorites = currentFavorites.includes(locationId) ? currentFavorites.filter(id => id !== locationId) : [...currentFavorites, locationId];
        setUser({ ...user, favoriteLocations: newFavorites });
    };
    
    const handleOpenEditModal = (location: Location) => {
        setEditingLocation(location);
        setIsEditModalOpen(true);
    };
    
    const handleSaveLocation = (savedLocation: Location) => {
        setLocations(prev => {
            const exists = prev.some(l => l.id === savedLocation.id);
            if (exists) return prev.map(l => l.id === savedLocation.id ? savedLocation : l);
            return [...prev, savedLocation];
        });
        setIsEditModalOpen(false);
    };

    const handleDeleteLocation = (locationId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este punto verde? Esta acción no se puede deshacer.')) {
            setLocations(prev => prev.filter(l => l.id !== locationId));
        }
    };

    const handleCheckIn = () => {
        if (!selectedLocationId) return;
        setLocations(prev => prev.map(l => l.id === selectedLocationId ? { ...l, checkIns: l.checkIns + 1 } : l));
        onUserAction('check_in', { locationId: selectedLocationId });
        setSelectedLocationId(null);
    };

    const handleOpenReportModal = () => {
        if (!selectedLocationId) return;
        setIsReportModalOpen(true);
    };
    
    const handleSendReport = (reportData: Omit<Report, 'userId' | 'userName' | 'timestamp'>) => {
        if (!selectedLocationId || !user) return;
        const newReport: Report = {
            ...reportData,
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString()
        };
        setLocations(prev => prev.map(l => l.id === selectedLocationId ? { ...l, status: 'reported', reports: [...l.reports, newReport] } : l));
        onUserAction('report_punto_verde', { locationId: selectedLocationId });
        setIsReportModalOpen(false);
        setSelectedLocationId(null);
    };


    const mapLocations = useMemo(() => locations.map(p => ({ ...p.mapData, status: p.status })), [locations]);
    const selectedLocation = useMemo(() => locations.find(p => p.id === selectedLocationId) || null, [locations, selectedLocationId]);

    return (
        <div className="bg-background pt-20 lg:h-screen lg:flex lg:flex-col">
            <LocationDetailModal location={selectedLocation} user={user} onClose={() => setSelectedLocationId(null)} onCheckIn={handleCheckIn} onReport={handleOpenReportModal} />
            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSubmit={handleSendReport} />
            <LocationEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLocation} location={editingLocation} />
            
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center py-8"><h1 className="text-4xl font-extrabold font-display text-text-main sm:text-5xl">Encontrá tu Punto Verde</h1><p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Utilizá los filtros y el mapa interactivo para localizar el centro de reciclaje más conveniente.</p></header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:flex-1 lg:overflow-hidden pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:h-full">
                    <aside className="lg:col-span-2 h-96 lg:h-full"><InteractiveMap locations={mapLocations} selectedLocation={selectedLocation ? { ...selectedLocation.mapData, status: selectedLocation.status } : null} hoveredLocationId={hoveredLocationId} onPinClick={(mapData) => handleMapPinClick(mapData.id)} onPinMouseEnter={setHoveredLocationId} onPinMouseLeave={() => setHoveredLocationId(null)} /></aside>
                    <main className="lg:col-span-3 lg:h-full flex flex-col lg:overflow-hidden">
                        <div className="flex-shrink-0 p-4 bg-surface/80 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm space-y-4">
                            <div className="relative"><svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg><input type="search" placeholder="Buscar por nombre o dirección..." className="w-full pl-10 pr-4 py-2 form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                            <FilterMenu activeFilter={activeFilter} setActiveFilter={setActiveFilter} user={user} />
                        </div>
                        <div className="flex-1 overflow-y-auto pt-4 pr-2 mt-4 relative">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {filteredAndSortedLocations.map(punto => (<LocationCard key={punto.id} location={punto} user={user} isAdminMode={isAdminMode} isSelected={selectedLocationId === punto.id} isHovered={hoveredLocationId === punto.id} isFavorite={user?.favoriteLocations?.includes(punto.id) ?? false} onMouseEnter={() => setHoveredLocationId(punto.id)} onMouseLeave={() => setHoveredLocationId(null)} onClick={() => handleLocationClick(punto.id)} onToggleFavorite={() => handleToggleFavorite(punto.id)} onEdit={() => handleOpenEditModal(punto)} onDelete={() => handleDeleteLocation(punto.id)} ref={(el) => { if (el) locationCardRefs.current[punto.id] = el; }} />))}
                            </div>
                            {filteredAndSortedLocations.length === 0 && (<div className="text-center py-16"><svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2-2H5a2 2 0 01-2-2z" /></svg><h3 className="mt-2 text-lg font-semibold text-slate-300">Sin resultados</h3><p className="mt-1 text-sm text-slate-500">No se encontraron puntos verdes con esos filtros.</p></div>)}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PuntosVerdesPage;