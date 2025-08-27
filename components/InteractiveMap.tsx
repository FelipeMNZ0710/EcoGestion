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
        <div className="map-container rounded-lg border border-white/10 shadow-inner">
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

                {/* -- Detailed Map Background -- */}
                <g id="map-background">
                    {/* River */}
                    <path className="map-water" d="M0 550 C 50 500, 150 600, 250 550 S 400 450, 500 550 S 650 600, 800 500 V 600 H 0 Z" />
                    
                    {/* City Blocks */}
                    <path className="map-block" d="M100 50 H 700 V 500 H 100 Z" />
                    
                    {/* Avenues */}
                    <line className="map-avenue" x1="100" y1="280" x2="700" y2="280" />
                    <line className="map-avenue" x1="100" y1="320" x2="700" y2="320" />
                    <line className="map-avenue" x1="380" y1="50" x2="380" y2="500" />
                    <line className="map-avenue" x1="420" y1="50" x2="420" y2="500" />
                    
                    {/* Streets */}
                    <line className="map-street" x1="100" y1="150" x2="700" y2="150" />
                    <line className="map-street" x1="100" y1="420" x2="700" y2="420" />
                    <line className="map-street" x1="250" y1="50" x2="250" y2="500" />
                    <line className="map-street" x1="550" y1="50" x2="550" y2="500" />
                    
                    {/* Plaza San Martin */}
                    <rect className="map-plaza" x="385" y="285" width="30" height="30" rx="5" />
                </g>
                
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