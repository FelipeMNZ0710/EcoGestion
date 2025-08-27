import React, { useEffect, useState, useRef, useMemo, forwardRef } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import type { User, GamificationAction, Location, Schedule, LocationStatus } from '../types';
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
        mapData: { name: "Güemes", id: 'guemes', lat: -26.1980, lng: -58.1995, x: 200, y: 450 },
        imageUrl: 'https://images.unsplash.com/photo-1582029132869-755a953a7a2f?q=80&w=800&auto=format&fit=crop',
        status: 'ok',
    },
    {
        id: "san-martin",
        name: "Plaza San Martín",
        address: "Av. 25 de Mayo y Moreno, Centro",
        hours: "24 horas",
        schedule: [{ days: [0, 1, 2, 3, 4, 5, 6], open: "00:00", close: "23:59" }],
        materials: ['Plásticos', 'Vidrio'],
        mapData: { name: "Plaza S. Martín", id: 'san-martin', lat: -26.1775, lng: -58.1744, x: 450, y: 250 },
        imageUrl: 'https://images.unsplash.com/photo-1517009336183-50f2886216ec?q=80&w=800&auto=format&fit=crop',
        status: 'reported',
    },
    {
        id: "economico",
        name: "Supermercado El Económico",
        address: "Av. Italia 1550, B° San Miguel",
        hours: "Lunes a Sábado de 09:00 a 20:00",
        schedule: [{ days: [1, 2, 3, 4, 5, 6], open: "09:00", close: "20:00" }],
        materials: ['Pilas'],
        mapData: { name: "Super El Económico", id: 'economico', lat: -26.1701, lng: -58.1923, x: 300, y: 150 },
        imageUrl: 'https://images.unsplash.com/photo-1629815024225-b8734e5a9526?q=80&w=800&auto=format=fit=crop',
        status: 'ok',
    },
    {
        id: "la-paz",
        name: "Delegación Municipal B° La Paz",
        address: "Av. Néstor Kirchner 5595, B° La Paz",
        hours: "Lunes a Viernes de 07:00 a 13:00",
        schedule: [{ days: [1, 2, 3, 4, 5], open: "07:00", close: "13:00" }],
        materials: ['Plásticos', 'Papel/Cartón'],
        mapData: { name: "Delegación La Paz", id: 'la-paz', lat: -26.1600, lng: -58.2150, x: 150, y: 300 },
        imageUrl: 'https://images.unsplash.com/photo-1599827552899-62506655c64e?q=80&w=800&auto=format&fit=crop',
        status: 'maintenance',
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
const formatSchedule = (schedule: Schedule[]): { day: string, hours: string }[] => {
    const dailyHours: { [key: number]: { open: string, close: string } } = {};
    schedule.forEach(s => {
        s.days.forEach(dayIndex => {
            dailyHours[dayIndex] = { open: s.open, close: s.close };
        });
    });

    if (Object.keys(dailyHours).length === 7 && Object.values(dailyHours).every(h => h.open === '00:00' && h.close === '23:59')) {
        return [{ day: 'Todos los días', hours: '24 horas' }];
    }

    const groupedDays: { [key: string]: number[] } = {};
    for (let i = 0; i < 7; i++) {
        const hours = dailyHours[i] ? `${dailyHours[i].open} - ${dailyHours[i].close}` : 'Cerrado';
        if (!groupedDays[hours]) {
            groupedDays[hours] = [];
        }
        groupedDays[hours].push(i);
    }
    
    return Object.entries(groupedDays).map(([hours, days]) => {
        if (hours === 'Cerrado') return null;
        let dayStr;
        if (days.length === 1) {
            dayStr = daysOfWeek[days[0]];
        } else {
            const startDay = daysOfWeek[days[0]];
            const endDay = daysOfWeek[days[days.length - 1]];
            dayStr = `${startDay} a ${endDay}`;
        }
        return { day: dayStr, hours };
    }).filter(Boolean) as { day: string; hours: string }[];
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
        <div ref={ref} className={`location-card bg-surface border border-white/10 rounded-lg p-3 flex gap-4 transition-all duration-200 cursor-pointer ${isSelected || isHovered ? 'border-secondary/50 bg-white/5' : ''}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick} role="button" tabIndex={0} aria-label={`Ver detalles de ${location.name}`}>
            {user?.isAdmin && isAdminMode && (
                <div className="card-admin-controls">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="admin-action-button !bg-slate-700 !text-white" title="Editar punto"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="admin-action-button !bg-slate-700 !text-white delete" title="Eliminar punto"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            )}
            {user && (
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className={`absolute top-2 left-2 z-10 p-1.5 rounded-full transition-colors ${isFavorite ? 'text-yellow-400 bg-yellow-400/20' : 'text-slate-400 bg-surface/50 hover:text-yellow-400'}`} title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </button>
            )}
            <img src={location.imageUrl} alt={`Foto de ${location.name}`} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
            <div className="flex flex-col flex-grow py-1">
                <h3 className="font-bold text-lg text-text-main leading-tight">{location.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{location.address}</p>
                <div className="flex items-center gap-1.5 mt-2"><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${currentStatus.color}`}>{currentStatus.text}</span></div>
                <div className="flex-grow"></div>
                <div className="flex items-center gap-1.5 mt-2"><div className="flex flex-wrap gap-1">{location.materials.map(material => (<span key={material} className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-300 font-medium rounded-md">{material}</span>))}</div></div>
            </div>
        </div>
    );
});
LocationCard.displayName = 'LocationCard';

const LocationDetailModal: React.FC<{location: Location | null; user: User | null; onClose: () => void; onCheckIn: () => void; onReport: () => void;}> = ({ location, user, onClose, onCheckIn, onReport }) => {
    if (!location) return null;
    const currentStatus = statusInfo[location.status];
    const formattedHours = formatSchedule(location.schedule);
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <img src={location.imageUrl} alt={location.name} className="w-full h-48 object-cover rounded-t-2xl" />
                <div className="p-6">
                    <span className={`px-2.5 py-1 text-sm font-bold rounded-full ${currentStatus.color}`}>{currentStatus.text}</span>
                    <h2 className="text-2xl font-bold font-display text-text-main mt-3">{location.name}</h2>
                    <p className="text-text-secondary mt-1">{location.address}</p>
                    <div className="mt-4 border-t border-white/10 pt-4">
                        <h3 className="font-semibold text-text-main mb-2">Horarios</h3>
                        {formattedHours.map(s => (<div key={s.day} className="flex justify-between text-sm text-text-secondary"><p>{s.day}</p><p className="font-medium">{s.hours}</p></div>))}
                    </div>
                    <div className="mt-4 border-t border-white/10 pt-4">
                        <h3 className="font-semibold text-text-main mb-2">Materiales Aceptados</h3>
                        <div className="flex flex-wrap gap-2">{location.materials.map(m => (<span key={m} className="px-2 py-1 text-sm bg-slate-700 text-slate-300 font-medium rounded-md">{m}</span>))}</div>
                    </div>
                    {user && (
                        <div className="mt-6 flex gap-3">
                            <button onClick={onCheckIn} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors">Hacer Check-in (+25 pts)</button>
                            <button onClick={onReport} className="flex-1 bg-secondary/20 text-secondary font-bold py-3 rounded-lg hover:bg-secondary/30 transition-colors">Reportar Problema</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScheduleEditor: React.FC<{ schedule: { day: string; enabled: boolean; open: string; close: string }[], onChange: (dayIndex: number, field: string, value: any) => void }> = ({ schedule, onChange }) => (
    <div>
        {schedule.map((day, index) => (
            <div key={index} className="schedule-editor-row">
                <label className="custom-toggle-label schedule-day-label">
                    <input type="checkbox" className="custom-toggle-input" checked={day.enabled} onChange={e => onChange(index, 'enabled', e.target.checked)} />
                    <div className="custom-toggle-track mr-2"><div className="custom-toggle-thumb"></div></div>
                    {day.day}
                </label>
                <div className="schedule-time-inputs">
                    <input type="time" value={day.open} onChange={e => onChange(index, 'open', e.target.value)} disabled={!day.enabled} />
                    <span>-</span>
                    <input type="time" value={day.close} onChange={e => onChange(index, 'close', e.target.value)} disabled={!day.enabled} />
                </div>
            </div>
        ))}
    </div>
);

const LocationEditModal: React.FC<{
    isOpen: boolean;
    location: Location | null;
    onClose: () => void;
    onSave: (location: Location) => void;
}> = ({ location, onClose, onSave, isOpen }) => {
    const [formData, setFormData] = useState<Omit<Location, 'mapData'>>({
        id: `new_${Date.now()}`, name: '', address: '',
        hours: '', materials: [], schedule: [],
        imageUrl: '', status: 'ok',
    });
    const [scheduleUI, setScheduleUI] = useState(daysOfWeek.map((day) => ({ day, enabled: false, open: '08:00', close: '16:00' })));

    useEffect(() => {
        if (isOpen) {
            if (location) {
                setFormData({ ...location, hours: '' });
                const newScheduleUI = daysOfWeek.map((day, index) => {
                    let daySchedule = { enabled: false, open: '08:00', close: '16:00' };
                    location.schedule.forEach(s => { if (s.days.includes(index)) { daySchedule = { enabled: true, open: s.open, close: s.close }; } });
                    return { day, ...daySchedule };
                });
                setScheduleUI(newScheduleUI);
            } else {
                // Reset for new location
                setFormData({
                    id: `new_${Date.now()}`, name: '', address: '',
                    hours: '', materials: [], schedule: [],
                    imageUrl: '', status: 'ok',
                });
                setScheduleUI(daysOfWeek.map((day) => ({ day, enabled: false, open: '08:00', close: '16:00' })));
            }
        }
    }, [location, isOpen]);

    const handleScheduleChange = (dayIndex: number, field: string, value: any) => {
        const newSchedule = [...scheduleUI];
        (newSchedule[dayIndex] as any)[field] = value;
        setScheduleUI(newSchedule);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const groupedSchedule: { [key: string]: number[] } = {};
        scheduleUI.forEach((day, index) => {
            if (day.enabled) {
                const key = `${day.open}-${day.close}`;
                if (!groupedSchedule[key]) groupedSchedule[key] = [];
                groupedSchedule[key].push(index);
            }
        });
        const finalSchedule: Schedule[] = Object.entries(groupedSchedule).map(([hours, days]) => ({
            days, open: hours.split('-')[0], close: hours.split('-')[1]
        }));
        const finalHours = formatSchedule(finalSchedule).map(s => `${s.day}: ${s.hours}`).join(', ');

        // For new locations, we need to generate some map data.
        const mapData = location?.mapData || {
            name: formData.name.substring(0, 20), id: formData.id, lat: -26.18, lng: -58.18,
            x: 100 + Math.random() * 600, y: 100 + Math.random() * 400
        };

        onSave({ ...formData, schedule: finalSchedule, hours: finalHours, mapData });
    };
    
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold font-display text-text-main mb-4">{location ? 'Editar Punto Verde' : 'Crear Nuevo Punto Verde'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 modal-form">
                        <div><label htmlFor="name">Nombre</label><input id="name" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                        <div><label htmlFor="address">Dirección</label><input id="address" type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required /></div>
                        <div><label htmlFor="imageUrl">URL de la Imagen</label><input id="imageUrl" type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} /></div>
                        <div><label>Materiales Aceptados</label><div className="flex flex-wrap gap-2 mt-1">{allMaterials.map(m => (<button type="button" key={m} onClick={() => setFormData(f => ({ ...f, materials: f.materials.includes(m) ? f.materials.filter(mat => mat !== m) : [...f.materials, m] }))} className={`px-2 py-1 text-sm rounded-full border ${formData.materials.includes(m) ? 'bg-primary text-white border-primary' : 'bg-slate-700 border-slate-600'}`}>{m}</button>))}</div></div>
                        <div><label>Estado</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as LocationStatus })}>{Object.entries(statusInfo).map(([key, value]) => (<option key={key} value={key}>{value.text}</option>))}</select></div>
                        <div><label>Horarios</label><ScheduleEditor schedule={scheduleUI} onChange={handleScheduleChange} /></div>
                        <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar Cambios</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const PuntosVerdesPage: React.FC<{ user: User | null; setUser: (user: User | null) => void; onUserAction: (action: GamificationAction, payload?: any) => void; isAdminMode: boolean; }> = ({ user, setUser, onUserAction, isAdminMode }) => {
    const [locations, setLocations] = useState<Location[]>(initialPuntosVerdes);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos');
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const locationCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const filteredAndSortedLocations = useMemo(() => {
        const favoriteIds = user?.favoriteLocations || [];
        return locations.filter(p => (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.toLowerCase().includes(searchTerm.toLowerCase())) && (activeFilter === 'Todos' || p.materials.includes(activeFilter)))
            .sort((a, b) => {
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
    
    const handleOpenEditModal = (location: Location | null) => {
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
        onUserAction('check_in', { locationId: selectedLocationId });
        setSelectedLocationId(null);
    };

    const handleReport = () => {
        if (!selectedLocationId) return;
        setLocations(prev => prev.map(l => l.id === selectedLocationId ? { ...l, status: 'reported' } : l));
        onUserAction('report_punto_verde', { locationId: selectedLocationId });
        setSelectedLocationId(null);
    };

    const mapLocations = useMemo(() => locations.map(p => ({ ...p.mapData, status: p.status })), [locations]);
    const selectedLocation = useMemo(() => locations.find(p => p.id === selectedLocationId) || null, [locations, selectedLocationId]);

    return (
        <div className="bg-background lg:h-[calc(100vh-80px)] lg:flex lg:flex-col">
            <LocationDetailModal location={selectedLocation} user={user} onClose={() => setSelectedLocationId(null)} onCheckIn={handleCheckIn} onReport={handleReport} />
            <LocationEditModal isOpen={isEditModalOpen} location={editingLocation} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLocation} />
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center py-12 pt-28"><h1 className="text-4xl font-extrabold font-display text-text-main sm:text-5xl">Encontrá tu Punto Verde</h1><p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Utilizá los filtros y el mapa interactivo para localizar el centro de reciclaje más conveniente.</p></header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:flex-1 lg:overflow-hidden pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:h-full">
                    <aside className="lg:col-span-2 h-96 lg:h-full"><InteractiveMap locations={mapLocations} selectedLocation={selectedLocation ? { ...selectedLocation.mapData, status: selectedLocation.status } : null} hoveredLocationId={hoveredLocationId} onPinClick={(mapData) => handleMapPinClick(mapData.id)} onPinMouseEnter={setHoveredLocationId} onPinMouseLeave={() => setHoveredLocationId(null)} /></aside>
                    <main className="lg:col-span-3 lg:h-full flex flex-col">
                        <div className="flex-shrink-0 p-4 bg-surface/80 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm space-y-4">
                            <div className="relative"><svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg><input type="search" placeholder="Buscar por nombre o dirección..." className="w-full pl-10 pr-4 py-2 form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                            <FilterMenu activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-2 mt-4 relative">
                            {user?.isAdmin && isAdminMode && (<div className="pb-2"><button onClick={() => handleOpenEditModal(null)} className="w-full text-center py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">+ Crear Nuevo Punto Verde</button></div>)}
                            {filteredAndSortedLocations.map(punto => (<LocationCard key={punto.id} location={punto} user={user} isAdminMode={isAdminMode} isSelected={selectedLocationId === punto.id} isHovered={hoveredLocationId === punto.id} isFavorite={user?.favoriteLocations?.includes(punto.id) ?? false} onMouseEnter={() => setHoveredLocationId(punto.id)} onMouseLeave={() => setHoveredLocationId(null)} onClick={() => handleLocationClick(punto.id)} onToggleFavorite={() => handleToggleFavorite(punto.id)} onEdit={() => handleOpenEditModal(punto)} onDelete={() => handleDeleteLocation(punto.id)} ref={(el) => { if (el) locationCardRefs.current[punto.id] = el; }} />))}
                            {filteredAndSortedLocations.length === 0 && (<div className="text-center py-16"><svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg><h3 className="mt-2 text-lg font-semibold text-slate-300">Sin resultados</h3><p className="mt-1 text-sm text-slate-500">No se encontraron puntos verdes con esos filtros.</p></div>)}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PuntosVerdesPage;