import React, { useEffect, useState, useRef, useMemo, forwardRef } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import type { LocationData as MapLocationData } from '../components/InteractiveMap';
import type { User, GamificationAction } from '../types';

// --- Types ---
type LocationStatus = 'ok' | 'reported' | 'maintenance' | 'serviced';

interface Schedule {
  days: number[];
  open: string;
  close: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  hours: string;
  schedule: Schedule[];
  materials: string[];
  mapData: Omit<MapLocationData, 'status'>;
  imageUrl: string;
  status: LocationStatus;
}

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
        imageUrl: 'https://images.unsplash.com/photo-1582029132869-755a953a7a2f?q=80&w=800&auto=format=fit-crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1517009336183-50f2886216ec?q=80&w=800&auto=format=fit-crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1629815024225-b8734e5a9526?q=80&w=800&auto=format=fit-crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1599827552899-62506655c64e?q=80&w=800&auto=format=fit-crop',
        status: 'maintenance',
    }
];

// --- Sub-Components ---

const LocationCard = forwardRef<HTMLDivElement, {
    location: Location;
    isSelected: boolean;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
}>(({ location, isSelected, isHovered, onMouseEnter, onMouseLeave, onClick }, ref) => {
    return (
        <div 
            ref={ref}
            className={`location-card ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles de ${location.name}`}
        >
            <img src={location.imageUrl} alt={`Foto de ${location.name}`} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
            <div className="flex flex-col flex-grow py-1">
                <h3 className="font-bold text-lg text-text-main leading-tight">{location.name}</h3>
                <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  {location.address}
                </p>
                <div className="flex-grow"></div>
                <div className="flex items-center gap-1.5 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM4.172 7.172a6 6 0 018.486 0L12 8.657l-1.414-1.414a2 2 0 10-2.828 2.828L10 12.343l-1.414 1.414a4 4 0 11-5.656-5.656L4.172 7.172z" /></svg>
                    <div className="flex flex-wrap gap-1">
                        {location.materials.map(material => (<span key={material} className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-700 font-medium rounded-md">{material}</span>))}
                    </div>
                </div>
            </div>
        </div>
    );
});
LocationCard.displayName = 'LocationCard';

const LocationDetailModal: React.FC<{ 
    location: Location; 
    onClose: () => void; 
    user: User | null;
    onUserAction: (action: GamificationAction) => void;
}> = ({ location, onClose, user, onUserAction }) => {
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [hasReported, setHasReported] = useState(false);

    useEffect(() => {
        setHasCheckedIn(false);
        setHasReported(false);

        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [location, onClose]);
    
    const handleCheckIn = () => {
        onUserAction('check_in');
        setHasCheckedIn(true);
    };

    const handleReport = () => {
        onUserAction('report_punto_verde');
        setHasReported(true);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <img src={location.imageUrl} alt={`Foto de ${location.name}`} className="w-full h-48 object-cover rounded-t-lg" />
                    <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors" aria-label="Cerrar modal"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full rounded-b-lg">
                        <h2 className="text-2xl font-bold text-white drop-shadow-md">{location.name}</h2>
                    </div>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg><div><h3 className="font-semibold text-text-main -mt-0.5">Dirección</h3><p className="text-text-secondary">{location.address}</p></div></div>
                    <div className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg><div><h3 className="font-semibold text-text-main -mt-0.5">Horarios</h3><p className="text-text-secondary">{location.hours}</p></div></div>
                    <div className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM4.172 7.172a6 6 0 018.486 0L12 8.657l-1.414-1.414a2 2 0 10-2.828 2.828L10 12.343l-1.414 1.414a4 4 0 11-5.656-5.656L4.172 7.172z" /></svg><div><h3 className="font-semibold text-text-main -mt-0.5">Materiales Aceptados</h3><div className="flex flex-wrap gap-2 mt-1">{location.materials.map(material => (<span key={material} className="px-2 py-1 text-sm bg-slate-100 text-slate-700 font-medium rounded-md">{material}</span>))}</div></div></div>
                </div>
                 <div className="px-5 pb-5 space-y-4">
                    {user && (
                        <div className="border-t border-slate-200 pt-4">
                            <h3 className="font-semibold text-text-main mb-3 text-sm uppercase text-slate-500">Acciones de Usuario</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCheckIn}
                                    disabled={hasCheckedIn}
                                    className={`flex-1 flex items-center justify-center gap-2 text-center font-semibold py-2 rounded-lg transition-colors disabled:cursor-not-allowed ${
                                        hasCheckedIn
                                            ? 'bg-lime-100 text-lime-700'
                                            : 'bg-emerald-100 text-primary hover:bg-emerald-200'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    {hasCheckedIn ? '¡Check-in Hecho!' : 'Hacer Check-in'}
                                </button>
                                <button
                                    onClick={handleReport}
                                    disabled={hasReported}
                                    className={`flex-1 flex items-center justify-center gap-2 text-center font-semibold py-2 rounded-lg transition-colors disabled:cursor-not-allowed ${
                                        hasReported
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.37-1.21 3.006 0l7.22 13.75a1.75 1.75 0 01-1.503 2.651H2.534a1.75 1.75 0 01-1.503-2.651l7.22-13.75zM10 14a1 1 0 11-2 0 1 1 0 012 0zm-1-5a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {hasReported ? '¡Reporte Enviado!' : 'Reportar Problema'}
                                </button>
                            </div>
                        </div>
                    )}
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${location.mapData.lat},${location.mapData.lng}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center text-center bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors">
                        Cómo llegar
                    </a>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const PuntosVerdesPage: React.FC<{
    user: User | null;
    onUserAction: (action: GamificationAction) => void;
}> = ({ user, onUserAction }) => {
    const [locations] = useState<Location[]>(initialPuntosVerdes);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
    const locationCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const filteredLocations = useMemo(() => {
        return locations.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [locations, searchTerm]);

    const handleLocationClick = (locationId: string) => {
        setSelectedLocationId(locationId);
        setTimeout(() => {
            locationCardRefs.current[locationId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const mapLocations = useMemo(() => 
        locations.map(p => ({ ...p.mapData, status: p.status })), 
    [locations]);

    const selectedLocation = useMemo(() => 
        locations.find(p => p.id === selectedLocationId) || null,
    [locations, selectedLocationId]);

    return (
        <div className="bg-background lg:h-[calc(100vh-80px)] lg:flex lg:flex-col">
            {selectedLocation && (
                <LocationDetailModal 
                    location={selectedLocation} 
                    onClose={() => setSelectedLocationId(null)}
                    user={user}
                    onUserAction={onUserAction}
                />
            )}

            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center py-12">
                <h1 className="text-4xl font-extrabold text-text-main sm:text-5xl">Encontrá tu Punto Verde</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Utilizá el mapa interactivo y el directorio para localizar el centro de reciclaje más conveniente.</p>
            </header>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:flex-1 lg:overflow-hidden pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:h-full">
                    <aside className="lg:col-span-2 h-96 lg:h-full">
                        <InteractiveMap 
                            locations={mapLocations} 
                            selectedLocation={selectedLocation ? { ...selectedLocation.mapData, status: selectedLocation.status } : null}
                            hoveredLocationId={hoveredLocationId}
                            onPinClick={(mapData) => handleLocationClick(mapData.id)}
                            onPinMouseEnter={setHoveredLocationId}
                            onPinMouseLeave={() => setHoveredLocationId(null)} 
                        />
                    </aside>
                    <main className="lg:col-span-3 lg:h-full flex flex-col">
                        <div className="flex-shrink-0 p-4 bg-white/80 rounded-xl border border-slate-200/80 shadow-sm backdrop-blur-sm">
                             <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                                <input 
                                    type="search" 
                                    placeholder="Buscar por nombre o dirección..." 
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none transition" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-2 mt-4">
                            {filteredLocations.map(punto => (
                                <LocationCard 
                                    key={punto.id} 
                                    location={punto} 
                                    isSelected={selectedLocationId === punto.id} 
                                    isHovered={hoveredLocationId === punto.id} 
                                    onMouseEnter={() => setHoveredLocationId(punto.id)} 
                                    onMouseLeave={() => setHoveredLocationId(null)}
                                    onClick={() => handleLocationClick(punto.id)}
                                    ref={(el) => { if (el) locationCardRefs.current[punto.id] = el; }} 
                                />
                            ))}
                            {filteredLocations.length === 0 && (
                                <div className="text-center py-16">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                                    <h3 className="mt-2 text-lg font-semibold text-slate-900">Sin resultados</h3>
                                    <p className="mt-1 text-sm text-slate-500">No se encontraron puntos verdes con ese término de búsqueda.</p>
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