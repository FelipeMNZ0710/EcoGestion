import React, { useEffect, useState, useRef, useMemo, forwardRef } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import type { LocationData as MapLocationData } from '../components/InteractiveMap';
import FilterMenu from '../components/FilterMenu';
import type { Category as FilterCategory } from '../components/FilterMenu';
import type { User, GamificationAction } from '../types';

// --- Types ---
type LocationStatus = 'ok' | 'reported' | 'maintenance' | 'serviced';

interface Schedule {
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  open: string; // HH:MM format
  close: string; // HH:MM format
}

interface Location {
  id: string;
  name: string;
  address: string;
  hours: string; // Human-readable hours
  schedule: Schedule[];
  materials: string[];
  mapData: Omit<MapLocationData, 'status'>;
  imageUrl: string;
  distance?: number; // Optional distance in km
  status: LocationStatus;
}

const ADMIN_USERS = ['Felipe', 'Rolón Sergio Agustín'];

// --- Data ---
const initialPuntosVerdes: Location[] = [
    { 
        id: "guemes",
        name: "Centro Comunitario Güemes",
        address: "Av. Gendarmería Nacional 1234, B° Güemes",
        hours: "Lunes a Viernes de 08:00 a 16:00",
        schedule: [{ days: [1, 2, 3, 4, 5], open: "08:00", close: "16:00" }],
        materials: ['Plásticos', 'Papel/Cartón', 'Vidrio'],
        mapData: { name: "Güemes", lat: -26.1980, lng: -58.1995, x: 200, y: 450, emoji: '♻️' },
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
        mapData: { name: "Plaza S. Martín", lat: -26.1775, lng: -58.1744, x: 450, y: 250, emoji: '♻️' },
        imageUrl: 'https://images.unsplash.com/photo-1517009336183-50f2886216ec?q=80&w=800&auto=format&fit=crop',
        status: 'ok',
    },
    { 
        id: "economico",
        name: "Supermercado El Económico",
        address: "Av. Italia 1550, B° San Miguel",
        hours: "Lunes a Sábado de 09:00 a 20:00",
        schedule: [{ days: [1, 2, 3, 4, 5, 6], open: "09:00", close: "20:00" }],
        materials: ['Pilas'],
        mapData: { name: "Super El Económico", lat: -26.1701, lng: -58.1923, x: 300, y: 150, emoji: '🔋' },
        imageUrl: 'https://images.unsplash.com/photo-1629815024225-b8734e5a9526?q=80&w=800&auto=format&fit=crop',
        status: 'ok',
    },
    { 
        id: "la-paz",
        name: "Delegación Municipal B° La Paz",
        address: "Av. Néstor Kirchner 5595, B° La Paz",
        hours: "Lunes a Viernes de 07:00 a 13:00",
        schedule: [{ days: [1, 2, 3, 4, 5], open: "07:00", close: "13:00" }],
        materials: ['Plásticos', 'Papel/Cartón'],
        mapData: { name: "Delegación La Paz", lat: -26.1600, lng: -58.2150, x: 150, y: 300, emoji: '♻️' },
        imageUrl: 'https://images.unsplash.com/photo-1599827552899-62506655c64e?q=80&w=800&auto=format&fit=crop',
        status: 'ok',
    }
];

// --- Helper Functions ---
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const isLocationOpen = (schedule: Schedule[]): boolean => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const todaySchedule = schedule.find(s => s.days.includes(currentDay));
    return todaySchedule ? (currentTime >= todaySchedule.open && currentTime < todaySchedule.close) : false;
};

// --- Custom Hook for Dynamic Status ---
const useLocationStatus = (schedule: Schedule[]) => {
    const calculateStatus = () => {
        const now = new Date();
        const currentDay = now.getDay();
        
        if (isLocationOpen(schedule)) {
            const todaySchedule = schedule.find(s => s.days.includes(currentDay))!;
            return { isOpen: true, text: `Abierto • Cierra a las ${todaySchedule.close}` };
        }

        let nextOpeningDay: number | null = null;
        let nextSchedule: Schedule | null = null;
        for (let i = 0; i <= 7; i++) {
            const nextDay = (currentDay + i) % 7;
            const scheduleForNextDay = schedule.find(s => s.days.includes(nextDay));
            if (scheduleForNextDay) {
                if (i === 0) {
                    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    if (currentTime < scheduleForNextDay.open) {
                         return { isOpen: false, text: `Cerrado • Abre hoy a las ${scheduleForNextDay.open}` };
                    }
                } else {
                    nextOpeningDay = nextDay;
                    nextSchedule = scheduleForNextDay;
                    break;
                }
            }
        }
        
        if (nextSchedule && nextOpeningDay !== null) {
            const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const isTomorrow = (currentDay + 1) % 7 === nextOpeningDay;
            const nextDayName = isTomorrow ? 'mañana' : `el ${dayNames[nextOpeningDay]}`;
            return { isOpen: false, text: `Cerrado • Abre ${nextDayName} a las ${nextSchedule.open}` };
        }
        
        return { isOpen: false, text: 'Consultar horarios' };
    };
    
    const [status, setStatus] = useState(calculateStatus);

    useEffect(() => {
        const intervalId = setInterval(() => setStatus(calculateStatus()), 60000);
        return () => clearInterval(intervalId);
    }, [schedule]);

    return status;
};

const statusInfo: Record<LocationStatus, { text: string; colorClass: string; }> = {
    ok: { text: 'Operativo', colorClass: 'bg-green-100 text-green-800' },
    reported: { text: 'Reportado', colorClass: 'bg-yellow-100 text-yellow-800' },
    maintenance: { text: 'En mantenimiento', colorClass: 'bg-blue-100 text-blue-800' },
    serviced: { text: 'Servicio reciente', colorClass: 'bg-teal-100 text-teal-800' },
};

// --- Components ---
interface LocationCardProps {
    location: Location;
    isSelected: boolean;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    onReport: () => void;
    style?: React.CSSProperties;
}

const LocationCard = forwardRef<HTMLDivElement, LocationCardProps>(({ location, isSelected, isHovered, onMouseEnter, onMouseLeave, onClick, onReport, style }, ref) => {
    const status = useLocationStatus(location.schedule);
    const isReported = location.status === 'reported';

    const cardClasses = [
        'location-card-revamped',
        status.isOpen ? 'is-open' : '',
        isSelected ? 'is-selected' : '',
        isHovered ? 'is-hovered' : '',
        `status-${location.status}`
    ].join(' ');

    return (
        <div 
            ref={ref}
            className={cardClasses}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            style={style}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles de ${location.name}`}
        >
            <img src={location.imageUrl} alt={`Foto de ${location.name}`} className="location-card-thumbnail" />
            <div className="location-card-content">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-text-main pr-2">{location.name}</h3>
                    <div className="flex items-center space-x-2">
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${statusInfo[location.status].colorClass}`}>
                            {statusInfo[location.status].text}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${status.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {status.text}
                        </span>
                    </div>
                </div>
                <p className="text-sm text-text-secondary mb-3">{location.address}</p>
                 {location.distance && (
                    <p className="flex items-start space-x-2 font-semibold text-primary text-sm mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        <span>Aprox. {location.distance.toFixed(1)} km de distancia</span>
                    </p>
                )}
                <div className="flex-grow"></div>
                <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-wrap gap-1">
                        {location.materials.map(material => (
                            <span key={material} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 font-medium rounded-md">{material}</span>
                        ))}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onReport(); }} disabled={isReported} className="report-button">
                        {isReported ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                <span>Reportado</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <span>Contenedor lleno</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});
LocationCard.displayName = 'LocationCard';

const LocationDetailModal: React.FC<{
    location: Location; 
    onClose: () => void; 
    onReport: () => void; 
    onCheckIn: () => void;
    user: User | null; 
    onUpdateStatus: (status: LocationStatus) => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ location, onClose, onReport, onCheckIn, user, onUpdateStatus, onEdit, onDelete }) => {
    const status = useLocationStatus(location.schedule);
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const isAdmin = user ? ADMIN_USERS.includes(user.name) : false;
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <img src={location.imageUrl} alt={`Foto de ${location.name}`} className="w-full h-48 object-cover rounded-t-lg" />
                <button onClick={onClose} className="modal-close-button" aria-label="Cerrar modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo[location.status].colorClass}`}>
                            {statusInfo[location.status].text}
                        </span>
                         <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${status.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {status.text}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-text-main">{location.name}</h2>
                    <p className="text-text-secondary mt-1">{location.address}</p>
                    
                    <div className="mt-4 border-t pt-4">
                        <h3 className="font-semibold text-text-main mb-2">Horarios</h3>
                        {location.schedule.map((s, i) => (
                           <p key={i} className="text-sm text-text-secondary">
                             {s.days.length > 1 ? `${dayNames[s.days[0]]} a ${dayNames[s.days[s.days.length-1]]}` : dayNames[s.days[0]]}: {s.open} - {s.close}
                           </p> 
                        ))}
                    </div>

                    <div className="mt-4 border-t pt-4">
                         <h3 className="font-semibold text-text-main mb-2">Materiales Aceptados</h3>
                         <div className="flex flex-wrap gap-2">
                            {location.materials.map(material => (
                                <span key={material} className="px-2 py-1 text-sm bg-gray-100 text-gray-700 font-medium rounded-md">{material}</span>
                            ))}
                        </div>
                    </div>
                    
                    {isAdmin && (
                        <div className="mt-4 border-t pt-4">
                            <h3 className="font-semibold text-text-main mb-2">Panel de Administrador</h3>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={onEdit} className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full hover:bg-blue-200">Editar Punto</button>
                                <button onClick={onDelete} className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full hover:bg-red-200">Eliminar Punto</button>
                                <button onClick={() => onUpdateStatus('serviced')} className="px-3 py-1 text-xs font-medium text-teal-800 bg-teal-100 rounded-full hover:bg-teal-200">Marcar Atendido</button>
                                <button onClick={() => onUpdateStatus('maintenance')} className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full hover:bg-gray-200">Mantenimiento</button>
                                <button onClick={() => onUpdateStatus('ok')} className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full hover:bg-gray-200">Marcar OK</button>
                            </div>
                        </div>
                    )}


                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <button onClick={(e) => { e.stopPropagation(); onReport(); }} disabled={location.status === 'reported'} className="w-full flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md transition-colors report-button disabled:bg-yellow-100 disabled:text-yellow-800 disabled:border-yellow-200 bg-red-100 text-red-600 border-red-200 hover:bg-red-200">
                             {location.status === 'reported' ? 'Reporte recibido, ¡gracias!' : 'Reportar contenedor lleno'}
                         </button>
                         <button onClick={onCheckIn} className="w-full text-center bg-accent text-white font-semibold py-2 rounded-lg hover:bg-yellow-500 transition-colors block">
                            Hacer Check-in
                        </button>
                    </div>
                     <a href={`https://www.google.com/maps/dir/?api=1&destination=${location.mapData.lat},${location.mapData.lng}`} target="_blank" rel="noopener noreferrer" className="mt-3 w-full text-center bg-primary text-white font-semibold py-2 rounded-lg hover:bg-green-800 transition-colors block">
                        Cómo llegar
                    </a>
                </div>
            </div>
        </div>
    );
};

const LocationEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (location: Location) => void;
    location: Location | null;
}> = ({ isOpen, onClose, onSave, location }) => {
    const [formData, setFormData] = useState<Omit<Location, 'distance' | 'schedule' | 'hours'>>({
        id: '', name: '', address: '', materials: [], mapData: { name: '', lat: 0, lng: 0, x: 0, y: 0, emoji: '♻️' }, imageUrl: '', status: 'ok'
    });
    
    useEffect(() => {
        if (location) {
            setFormData(location);
        } else {
            // Reset for new location
            setFormData({
                id: `new-${Date.now()}`, name: '', address: '', materials: [], 
                mapData: { name: '', lat: 0, lng: 0, x: 50, y: 50, emoji: '♻️' }, imageUrl: '', status: 'ok'
            });
        }
    }, [location, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simplified schedule and hours generation for this example
        const newLocation: Location = {
            ...formData,
            hours: "Consultar horarios",
            schedule: [{ days: [1,2,3,4,5], open: "08:00", close: "18:00"}]
        };
        onSave(newLocation);
    };

    const handleMaterialChange = (material: string) => {
        const newMaterials = formData.materials.includes(material)
            ? formData.materials.filter(m => m !== material)
            : [...formData.materials, material];
        setFormData({ ...formData, materials: newMaterials });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">{location ? 'Editar Punto Verde' : 'Crear Nuevo Punto Verde'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 modal-form max-h-[70vh] overflow-y-auto pr-2">
                        <div><label>Nombre</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value, mapData: {...formData.mapData, name: e.target.value} })} required/></div>
                        <div><label>Dirección</label><input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required/></div>
                        <div><label>URL de Imagen</label><input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} required/></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Latitud</label><input type="number" step="any" value={formData.mapData.lat} onChange={e => setFormData({ ...formData, mapData: {...formData.mapData, lat: parseFloat(e.target.value)} })} required/></div>
                            <div><label>Longitud</label><input type="number" step="any" value={formData.mapData.lng} onChange={e => setFormData({ ...formData, mapData: {...formData.mapData, lng: parseFloat(e.target.value)} })} required/></div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div><label>Posición X (mapa)</label><input type="number" value={formData.mapData.x} onChange={e => setFormData({ ...formData, mapData: {...formData.mapData, x: parseInt(e.target.value, 10)} })} required/></div>
                            <div><label>Posición Y (mapa)</label><input type="number" value={formData.mapData.y} onChange={e => setFormData({ ...formData, mapData: {...formData.mapData, y: parseInt(e.target.value, 10)} })} required/></div>
                        </div>
                        <div>
                            <label>Materiales Aceptados</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['Plásticos', 'Vidrio', 'Papel/Cartón', 'Pilas'].map(m => (
                                    <label key={m} className="flex items-center space-x-2"><input type="checkbox" checked={formData.materials.includes(m)} onChange={() => handleMaterialChange(m)} /><span>{m}</span></label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-green-800">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

interface PuntosVerdesPageProps {
    user: User | null;
    onUserAction: (action: GamificationAction) => void;
}

const PuntosVerdesPage: React.FC<PuntosVerdesPageProps> = ({ user, onUserAction }) => {
    const [locations, setLocations] = useState<Location[]>(initialPuntosVerdes);
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalLocation, setModalLocation] = useState<Location | null>(null);
    const [editModalLocation, setEditModalLocation] = useState<Location | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [sortByDistance, setSortByDistance] = useState(false);
    const [filterOpenNow, setFilterOpenNow] = useState(false);
    
    const locationCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const handleUpdateStatus = (locationId: string, status: LocationStatus) => {
        setLocations(prev => prev.map(loc => loc.id === locationId ? {...loc, status} : loc));
        if(modalLocation && modalLocation.id === locationId) {
            setModalLocation(prev => prev ? {...prev, status} : null);
        }
        if (status === 'serviced') {
            setTimeout(() => {
                setLocations(prev => prev.map(loc => loc.id === locationId && loc.status === 'serviced' ? {...loc, status: 'ok'} : loc));
            }, 3600000); // 1 hour
        }
    };

    const handleReport = (locationId: string) => {
        handleUpdateStatus(locationId, 'reported');
        onUserAction('report_punto_verde');
    }
    
    const requestLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const error = "La geolocalización no es compatible con tu navegador.";
                setLocationError(error);
                reject(new Error(error));
                return;
            }
            setIsLocating(true);
            setLocationError(null);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setUserLocation(coords);
                    setIsLocating(false);
                    resolve(coords);
                },
                (error) => {
                    const errorMessage = error.code === error.PERMISSION_DENIED ? "Permiso denegado." : "No se pudo obtener tu ubicación.";
                    setLocationError(errorMessage);
                    setIsLocating(false);
                    reject(new Error(errorMessage));
                }
            );
        });
    };

    const handleFindNearestOpen = async () => {
        try {
            const coords = userLocation || await requestLocation();
            setSortByDistance(true);
            
            const openAndSortedPoints = locations
                .map(p => ({ ...p, distance: getDistance(coords.lat, coords.lng, p.mapData.lat, p.mapData.lng) }))
                .filter(p => isLocationOpen(p.schedule))
                .sort((a, b) => a.distance - b.distance);

            if (openAndSortedPoints.length > 0) {
                setModalLocation(openAndSortedPoints[0]);
            } else {
                setLocationError("No hay Puntos Verdes abiertos en este momento.");
            }
        } catch (error) {
            console.error("Error finding nearest open location:", error);
        }
    };
    
    const filteredPuntos = useMemo(() => {
        let pointsWithDistance = userLocation
            ? locations.map(p => ({ ...p, distance: getDistance(userLocation.lat!, userLocation.lng!, p.mapData.lat, p.mapData.lng) }))
            : locations.map(p => ({...p, distance: undefined }));

        let filtered = pointsWithDistance.filter(punto => {
            const matchesOpenNow = !filterOpenNow || isLocationOpen(punto.schedule);
            const matchesFilter = activeFilter === 'Todos' || punto.materials.includes(activeFilter);
            const matchesSearch = punto.name.toLowerCase().includes(searchTerm.toLowerCase()) || punto.address.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesOpenNow && matchesFilter && matchesSearch;
        });

        if (sortByDistance && userLocation) {
            filtered.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }
        
        return filtered;
    }, [locations, userLocation, sortByDistance, filterOpenNow, activeFilter, searchTerm]);
    
    const handlePinClick = (mapData: MapLocationData) => {
        const location = locations.find(p => p.mapData.name === mapData.name);
        if (location) {
            setModalLocation(location);
            setTimeout(() => {
                locationCardRefs.current[location.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const handleOpenEditModal = (location: Location | null) => {
        setEditModalLocation(location);
        setIsEditModalOpen(true);
        if (modalLocation) setModalLocation(null);
    };

    const handleSaveLocation = (locationToSave: Location) => {
        const exists = locations.some(l => l.id === locationToSave.id);
        if (exists) {
            setLocations(locations.map(l => l.id === locationToSave.id ? locationToSave : l));
        } else {
            setLocations([...locations, locationToSave]);
        }
        setIsEditModalOpen(false);
    };

    const handleDeleteLocation = (locationId: string) => {
        if(window.confirm("¿Estás seguro de que quieres eliminar este punto verde?")) {
            setLocations(locations.filter(l => l.id !== locationId));
            if (modalLocation) setModalLocation(null);
        }
    };
    
    const hoveredLocation = useMemo(() => locations.find(p => p.id === hoveredLocationId) || null, [hoveredLocationId, locations]);
    const mapLocations = useMemo(() => locations.map(p => ({...p.mapData, status: p.status})), [locations]);

    return (
        <div className="bg-background lg:h-[calc(100vh-80px)] lg:flex lg:flex-col">
            {modalLocation && (
                <LocationDetailModal 
                    location={modalLocation} 
                    onClose={() => setModalLocation(null)}
                    onReport={() => handleReport(modalLocation.id)}
                    onCheckIn={() => onUserAction('check_in')}
                    user={user}
                    onUpdateStatus={(newStatus) => handleUpdateStatus(modalLocation.id, newStatus)}
                    onEdit={() => handleOpenEditModal(modalLocation)}
                    onDelete={() => handleDeleteLocation(modalLocation.id)}
                />
            )}
            <LocationEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLocation} location={editModalLocation} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <header className="text-center mb-12 animate-fade-in-up pt-12">
                    <h1 className="text-4xl font-extrabold text-text-main sm:text-5xl">Encontrá tu Punto Verde</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Utilizá el mapa interactivo y el directorio para localizar el centro de reciclaje más conveniente para vos.</p>
                </header>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:flex-1 lg:overflow-hidden pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 lg:h-full">
                    <aside className="lg:col-span-2 h-96 lg:h-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <InteractiveMap 
                            locations={mapLocations}
                            selectedLocation={modalLocation ? {...modalLocation.mapData, status: modalLocation.status} : null}
                            hoveredLocation={hoveredLocation ? {...hoveredLocation.mapData, status: hoveredLocation.status} : null}
                            onPinClick={handlePinClick}
                        />
                    </aside>
                    <main className="lg:col-span-3 lg:h-full lg:overflow-y-auto location-list-scroller pr-2">
                        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="p-4 bg-white/80 rounded-xl border border-gray-200/80 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="search"
                                        placeholder="Buscar por nombre o dirección..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none transition"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <FilterMenu activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                                </div>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={requestLocation}
                                            disabled={isLocating}
                                            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                            {userLocation ? 'Actualizar' : 'Usar mi Ubicación'}
                                        </button>
                                         <button
                                            onClick={handleFindNearestOpen}
                                            disabled={isLocating}
                                            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-green-800 disabled:bg-gray-400"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                                            Buscar más cercano y abierto
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <label htmlFor="sort-distance" className={`flex items-center cursor-pointer transition-opacity ${!userLocation ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <input type="checkbox" id="sort-distance" className="sr-only" checked={sortByDistance} onChange={() => setSortByDistance(!sortByDistance)} disabled={!userLocation} />
                                            <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${sortByDistance ? 'bg-primary' : 'bg-gray-300'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${sortByDistance ? 'translate-x-4' : ''}`}></div></div>
                                            <span className="ml-2 text-sm font-medium text-gray-700">Distancia</span>
                                        </label>
                                        <label htmlFor="open-now-filter" className="flex items-center cursor-pointer">
                                            <input type="checkbox" id="open-now-filter" className="sr-only" checked={filterOpenNow} onChange={() => setFilterOpenNow(!filterOpenNow)} />
                                            <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${filterOpenNow ? 'bg-primary' : 'bg-gray-300'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${filterOpenNow ? 'translate-x-4' : ''}`}></div></div>
                                            <span className="ml-2 text-sm font-medium text-gray-700">Abierto</span>
                                        </label>
                                    </div>
                                </div>
                                 {locationError && <p className="mt-3 text-sm text-red-600 font-medium">{locationError}</p>}
                                 {user?.isAdmin && (<button onClick={() => handleOpenEditModal(null)} className="w-full mt-4 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors">Crear Nuevo Punto Verde</button>)}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {filteredPuntos.map((punto, index) => (
                                <LocationCard 
                                    key={punto.id}
                                    location={punto}
                                    isSelected={modalLocation?.id === punto.id}
                                    isHovered={hoveredLocationId === punto.id}
                                    onMouseEnter={() => setHoveredLocationId(punto.id)}
                                    onMouseLeave={() => setHoveredLocationId(null)}
                                    onClick={() => setModalLocation(punto)}
                                    onReport={() => handleReport(punto.id)}
                                    ref={(el) => { if (el) locationCardRefs.current[punto.id] = el; }}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                />
                            ))}
                            {filteredPuntos.length === 0 && (
                                <div className="text-center py-16 animate-fade-in-up">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                                    <h3 className="mt-2 text-lg font-semibold text-gray-900">Sin resultados</h3>
                                    <p className="mt-1 text-sm text-gray-500">No se encontraron puntos verdes que coincidan con tu búsqueda. Intenta ajustar los filtros.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PuntosVerdesPage;