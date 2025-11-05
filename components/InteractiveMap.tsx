import React, { useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import type { Location } from '../types';

const statusColors: Record<string, string> = {
    ok: 'fill-emerald-400',
    reported: 'fill-amber-400',
    maintenance: 'fill-blue-400',
    serviced: 'fill-cyan-400',
};

const Pin: React.FC<{ status: string; isSelected: boolean, isHovered: boolean }> = ({ status, isSelected, isHovered }) => {
    const statusColorClass = statusColors[status] || 'fill-slate-500';
    const scale = isSelected ? 1.25 : isHovered ? 1.1 : 1;
    const zIndex = isSelected || isHovered ? 10 : 1;

    return (
        <div style={{ transform: `scale(${scale})`, zIndex }} className="transition-transform duration-200">
            <svg viewBox="0 0 32 44" width="32" height="44" className="drop-shadow-lg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 28 16 28s16-19.163 16-28C32 7.163 24.837 0 16 0z" className={isSelected ? 'fill-primary' : 'fill-surface'} stroke="#181818" strokeWidth="2" />
                <circle cx="16" cy="16" r="6" className={statusColorClass} />
            </svg>
        </div>
    );
};

interface InteractiveMapProps {
    locations: Location[];
    selectedLocationId: string | null;
    hoveredLocationId: string | null;
    onSelectLocation: (location: Location) => void;
    onHoverLocation: (id: string | null) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ locations, selectedLocationId, hoveredLocationId, onSelectLocation, onHoverLocation }) => {
    const mapRef = useRef<MapRef>(null);

    // Centra el mapa cuando se selecciona una ubicación desde la lista.
    useEffect(() => {
        const selectedLocation = locations.find(l => l.id === selectedLocationId);
        if (selectedLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [selectedLocation.mapData.lng, selectedLocation.mapData.lat],
                zoom: 15,
                duration: 1500,
                essential: true,
            });
        }
    }, [selectedLocationId, locations]);

    return (
        <div className="map-container rounded-lg border border-white/10 shadow-inner h-96 lg:h-[calc(100vh-10rem)] overflow-hidden">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: -58.1742,
                    latitude: -26.1775,
                    zoom: 12.5,
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json"
                attributionControl={false}
            >
                <NavigationControl position="top-right" />
                
                {locations.map(location => (
                    <Marker
                        key={location.id}
                        longitude={location.mapData.lng}
                        latitude={location.mapData.lat}
                        anchor="bottom"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            onSelectLocation(location);
                        }}
                    >
                        <div onMouseEnter={() => onHoverLocation(location.id)} onMouseLeave={() => onHoverLocation(null)}>
                            <Pin 
                                status={location.status} 
                                isSelected={selectedLocationId === location.id}
                                isHovered={hoveredLocationId === location.id} 
                            />
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    );
};

export default InteractiveMap;