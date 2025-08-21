import React from 'react';

type LocationStatus = 'ok' | 'reported' | 'maintenance' | 'serviced';

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  emoji: string;
  status: LocationStatus;
}

interface InteractiveMapProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  hoveredLocation: LocationData | null;
  onPinClick: (location: LocationData) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ locations, selectedLocation, hoveredLocation, onPinClick }) => {
    return (
        <div className="map-container rounded-lg border-2 border-gray-200 bg-white">
            <svg
                className="map-svg"
                viewBox="0 0 800 600"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Simplified map paths */}
                <path className="map-river" d="M 0,300 C 100,250 150,350 250,300 S 400,200 500,300 S 650,400 800,350 L 800,600 L 0,600 Z" />
                <path className="map-city" d="M 50,50 L 750,50 L 750,550 L 50,550 Z" opacity="0.5" />
                <path className="map-city" d="M 100,80 L 300,80 L 350,150 L 150,150 Z" />
                <path className="map-city" d="M 400,100 L 700,100 L 700,300 L 450,300 Z" />
                <path className="map-city" d="M 150,400 L 400,400 L 400,500 L 150,500 Z" />
                <path className="map-city" d="M 500,450 L 700,450 L 700,550 L 500,550 Z" />
                
                {locations.map(location => {
                    const isSelected = selectedLocation?.name === location.name;
                    const isHovered = hoveredLocation?.name === location.name;
                    const pinClasses = [
                        'map-pin',
                        isSelected ? 'selected' : '',
                        isHovered ? 'hovered' : ''
                    ].join(' ');
                    const circleClasses = `map-pin-circle status-${location.status}`;

                    return (
                        <g
                            key={location.name}
                            className={pinClasses}
                            transform={`translate(${location.x}, ${location.y})`}
                            onClick={() => onPinClick(location)}
                            aria-label={`Punto verde: ${location.name}`}
                        >
                            <circle className="map-pin-halo" r="15" />
                            <circle className={circleClasses} r="12" />
                            <text className="map-pin-emoji" y="2">{location.emoji}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default InteractiveMap;