import React, { useEffect, useState, useRef, useMemo } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import type { LocationData as MapLocationData } from '../components/InteractiveMap';
import FilterMenu from '../components/FilterMenu';
import type { Category as FilterCategory } from '../components/FilterMenu';

// --- Types ---
interface Schedule {
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  open: string; // HH:MM format
  close: string; // HH:MM format
}

interface Location {
  name: string;
  address: string;
  hours: string; // Human-readable hours
  schedule: Schedule[];
  materials: string[];
  mapData: MapLocationData;
  distance?: number; // Optional distance in km
}

// --- Data ---
const puntosVerdes: Location[] = [
    { 
        name: "Centro Comunitario Güemes",
        address: "Av. Gendarmería Nacional 1234, B° Güemes",
        hours: "Lunes a Viernes de 08:00 a 16:00",
        schedule: [{ days: [1, 2, 3, 4, 5], open: "08:00", close: "16:00" }],
        materials: ['Plásticos', 'Papel/Cartón', 'Vidrio'],
        mapData: { name: "Güemes", lat: -26.1980, lng: -58.1995, x: 200, y: 450, emoji: '♻️' }
    },
    { 
        name: "Plaza San Martín",
        address: "Av. 25 de Mayo y Moreno, Centro",
        hours: "24 horas",
        schedule: [{ days: [0, 1, 2, 3, 4, 5, 6], open: "00:00", close: "23:59" }],
        materials: ['Plásticos', 'Vidrio'],
        mapData: { name: "Plaza S. Martín", lat: -26.1775, lng: -58.1744, x: 450, y: 250, emoji: '♻️' }
    },
    { 
        name: "Supermercado El Económico",
        address: "Av. Italia 1550, B° San Miguel",
        hours: "Lunes a Sábado de 09:00 a 20:00",
        schedule: [{ days: [1, 2, 3, 4, 5, 6], open: "09:00", close: "20:00" }],
        materials: ['Pilas'],
        mapData: { name: "Super El Económico", lat: -26.1701, lng: -58.1923, x: 300, y: 150, emoji: '🔋' }
    },
    { 
        name: "Delegación Municipal B° La Paz",
        address: "Av. Néstor Kirchner 5595, B° La Paz",
        hours: "Lunes a Viernes de 07:00 a 13:00",
        schedule: [{ days: [1, 2, 3, 4, 5], open: "07:00", close: "13:00" }],
        materials: ['Plásticos', 'Papel/Cartón'],
        mapData: { name: "Delegación La Paz", lat: -26.1600, lng: -58.2150, x: 150, y: 300, emoji: '♻️' }
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
    const [status, setStatus] = useState({ isOpen: false, text: '' });

    const calculateStatus = () => {
        const now = new Date();
        const currentDay = now.getDay();
        
        if (isLocationOpen(schedule)) {
            const todaySchedule = schedule.find(s => s.days.includes(currentDay))!;
            setStatus({ isOpen: true, text: `Abierto • Cierra a las ${todaySchedule.close}` });
            return;
        }

        // If closed, find next opening time
        let nextOpeningDay: number | null = null;
        let nextSchedule: Schedule | null = null;
        for (let i = 1; i <= 7; i++) {
            const nextDay = (currentDay + i) % 7;
            const scheduleForNextDay = schedule.find(s => s.days.includes(nextDay));
            if (scheduleForNextDay) {
                nextOpeningDay = nextDay;
                nextSchedule = scheduleForNextDay;
                break;
            }
        }

        if (nextSchedule && nextOpeningDay !== null) {
            const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const isTomorrow = (currentDay + 1) % 7 === nextOpeningDay;
            const nextDayName = isTomorrow ? 'mañana' : `el ${dayNames[nextOpeningDay]}`;
            setStatus({ isOpen: false, text: `Cerrado • Abre ${nextDayName} a las ${nextSchedule.open}` });
        } else {
            setStatus({ isOpen: false, text: 'Cerrado permanentemente' });
        }
    };
    
    useEffect(() => {
        calculateStatus();
        const intervalId = setInterval(calculateStatus, 60000); // Update every minute
        return () => clearInterval(intervalId);
    }, [schedule]);

    return status;
};

// --- Components ---
interface LocationCardProps {
    location: Location;
    isSelected: boolean;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    forwardedRef: (el: HTMLDivElement | null) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, isSelected, isHovered, onMouseEnter, onMouseLeave, onClick, forwardedRef }) => {
    const status = useLocationStatus(location.schedule);

    const cardClasses = [
        'location-card',
        'bg-white rounded-lg border p-4 flex flex-col justify-between transition-transform transition-shadow transition-colors duration-300 cursor-pointer fade-in-section',
        isSelected ? 'border-primary shadow-lg ring-2 ring-primary' : 'border-gray-200',
        !isSelected && isHovered ? 'shadow-md -translate-y-1' : ''
    ].join(' ');

    return (
        <div 
            ref={forwardedRef}
            className={cardClasses}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-text-main">{location.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${status.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {status.text}
                    </span>
                </div>
                <div className="space-y-2 text-sm text-text-secondary mb-3">
                    <p className="flex items-start space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{location.address}</span>
                    </p>
                    <p className="flex items-start space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{location.hours}</span>
                    </p>
                     {location.distance && (
                        <p className="flex items-start space-x-2 font-medium text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                            <span>Aprox. {location.distance.toFixed(1)} km de distancia</span>
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {location.materials.map(material => (
                        <span key={material} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">{material}</span>
                    ))}
                </div>
            </div>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${location.mapData.lat},${location.mapData.lng}`} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-primary text-white font-semibold py-2 rounded-lg hover:bg-green-800 transition-colors">
                Cómo llegar
            </a>
        </div>
    );
}

const PuntosVerdesPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [sortByDistance, setSortByDistance] = useState(false);
    const [filterOpenNow, setFilterOpenNow] = useState(false);
    
    const locationCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.fade-in-section');
        elements.forEach((el) => observer.observe(el));

        return () => elements.forEach((el) => observer.unobserve(el));
    }, []);

    const handleRequestLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("La geolocalización no es compatible con tu navegador.");
            return;
        }
        setIsLocating(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setSortByDistance(true);
                setIsLocating(false);
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationError("Permiso de ubicación denegado. Habilítalo en tu navegador para usar esta función.");
                } else {
                    setLocationError("No se pudo obtener tu ubicación.");
                }
                setIsLocating(false);
                setSortByDistance(false);
            }
        );
    };

    const filteredPuntos = useMemo(() => {
        let points: Location[] = [...puntosVerdes];

        // 1. Calculate distances if user location is available
        if (userLocation) {
            points = points.map(p => ({
                ...p,
                distance: getDistance(userLocation.lat, userLocation.lng, p.mapData.lat, p.mapData.lng)
            }));
        }

        // 2. Sort by distance if enabled
        if (sortByDistance && userLocation) {
            points.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }

        // 3. Apply filters
        return points.filter(punto => {
            const matchesOpenNow = !filterOpenNow || isLocationOpen(punto.schedule);
            const matchesFilter = activeFilter === 'Todos' || punto.materials.includes(activeFilter);
            const matchesSearch = 
                punto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                punto.address.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesOpenNow && matchesFilter && matchesSearch;
        });
    }, [userLocation, sortByDistance, filterOpenNow, activeFilter, searchTerm]);
    
    const handlePinClick = (mapData: MapLocationData) => {
        const location = puntosVerdes.find(p => p.mapData.name === mapData.name) || null;
        setSelectedLocation(location);
        if (location) {
            locationCardRefs.current[location.name]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    };

    const handleCardClick = (location: Location) => {
        setSelectedLocation(location);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 fade-in-section">
                <h1 className="text-4xl font-extrabold text-text-main">Encontrá tu Punto Verde</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Utilizá el mapa interactivo y el directorio para localizar el centro de reciclaje más conveniente para vos.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                {/* Map Section */}
                <div className="lg:col-span-2 lg:sticky lg:top-28 h-96 lg:h-[70vh] fade-in-section" style={{animationDelay: '0.2s'}}>
                    <InteractiveMap 
                        locations={puntosVerdes.map(p => p.mapData)}
                        selectedLocation={selectedLocation?.mapData}
                        hoveredLocation={hoveredLocation?.mapData}
                        onPinClick={handlePinClick}
                    />
                </div>

                {/* Locations List */}
                <div className="lg:col-span-3">
                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 fade-in-section sticky top-24 z-10" style={{animationDelay: '0.4s'}}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="search"
                                placeholder="Buscar por dirección o barrio..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FilterMenu activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <button
                                onClick={handleRequestLocation}
                                disabled={isLocating}
                                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-green-800 disabled:bg-gray-400"
                            >
                                {isLocating ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                )}
                                {sortByDistance ? 'Actualizar Distancias' : 'Ordenar por Cercanía'}
                            </button>
                            <div className="flex items-center">
                                <label htmlFor="open-now-filter" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" id="open-now-filter" className="sr-only" checked={filterOpenNow} onChange={() => setFilterOpenNow(!filterOpenNow)} />
                                        <div className={`block w-14 h-8 rounded-full ${filterOpenNow ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${filterOpenNow ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-sm font-medium text-gray-700">Abierto Ahora</div>
                                </label>
                            </div>
                        </div>
                         {locationError && <p className="mt-2 text-sm text-red-600">{locationError}</p>}
                    </div>
                    <div className="space-y-4">
                        {filteredPuntos.map((punto, index) => (
                            <LocationCard 
                                key={punto.name}
                                location={punto}
                                isSelected={selectedLocation?.name === punto.name}
                                isHovered={hoveredLocation?.name === punto.name}
                                onMouseEnter={() => setHoveredLocation(punto)}
                                onMouseLeave={() => setHoveredLocation(null)}
                                onClick={() => handleCardClick(punto)}
                                forwardedRef={el => locationCardRefs.current[punto.name] = el}
                            />
                        ))}
                         {filteredPuntos.length === 0 && (
                            <div className="text-center py-12 text-gray-500 fade-in-section">
                                <p className="font-semibold">No se encontraron resultados.</p>
                                <p>Intentá ajustar tu búsqueda o filtro.</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PuntosVerdesPage;
