import React from 'react';

type LocationStatus = 'ok' | 'reported' | 'maintenance' | 'serviced';

export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  status: LocationStatus;
}

interface InteractiveMapProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  hoveredLocationId: string | null;
  onPinClick: (location: LocationData) => void;
  onPinMouseEnter: (id: string) => void;
  onPinMouseLeave: () => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ locations, selectedLocation, hoveredLocationId, onPinClick, onPinMouseEnter, onPinMouseLeave }) => {
    return (
        <div className="map-container rounded-lg border-2 border-slate-200/80 bg-slate-50 shadow-inner">
            <svg
                className="map-svg"
                viewBox="0 0 800 600"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
                    </filter>
                </defs>
                {/* Simplified map paths */}
                <path className="map-river" d="M 0,300 C 100,250 150,350 250,300 S 400,200 500,300 S 650,400 800,350 L 800,600 L 0,600 Z" />
                <path className="map-city" d="M 50,50 L 750,50 L 750,550 L 50,550 Z" opacity="0.5" />
                <path className="map-city" d="M 100,80 L 300,80 L 350,150 L 150,150 Z" />
                <path className="map-city" d="M 400,100 L 700,100 L 700,300 L 450,300 Z" />
                <path className="map-city" d="M 150,400 L 400,400 L 400,500 L 150,500 Z" />
                <path className="map-city" d="M 500,450 L 700,450 L 700,550 L 500,550 Z" />
                
                {locations.map(location => {
                    const isSelected = selectedLocation?.id === location.id;
                    const isHovered = hoveredLocationId === location.id;
                    
                    return (
                        <g
                            key={location.id}
                            className={`map-pin ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''}`}
                            transform={`translate(${location.x}, ${location.y})`}
                            onClick={() => onPinClick(location)}
                            onMouseEnter={() => onPinMouseEnter(location.id)}
                            onMouseLeave={onPinMouseLeave}
                            aria-label={`Punto verde: ${location.name}`}
                        >
                            <circle className="map-pin-halo" cx="0" cy="-14" r="15" />
                            <path 
                                className={`map-pin-body status-${location.status}`}
                                d="M0,0 C-8.836,0 -16,-7.164 -16,-16 C-16,-24.836 -8.836,-32 0,-32 C8.836,-32 16,-24.836 16,-16 C16,-7.164 8.836,0 0,0 Z"
                                transform="translate(0, -18) scale(0.8)"
                            />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default InteractiveMap;