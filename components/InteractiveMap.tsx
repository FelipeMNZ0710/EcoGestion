import React from 'react';

interface MapPointProps {
  x: number;
  y: number;
  name: string;
  icon: string;
}

const MapPoint: React.FC<MapPointProps> = ({ x, y, name, icon }) => {
  const style = {
    '--x': x,
    '--y': y,
  } as React.CSSProperties;

  return (
    <div style={style} className="map-city">
      <div className="map-city__label">
        <span data-icon={icon} className="map-city__sign">
          {name}
        </span>
      </div>
    </div>
  );
};

export interface LocationData {
  name: string;
  x: number;
  y: number;
  icon: string;
}

interface InteractiveMapProps {
  locations: LocationData[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ locations }) => {
  return (
    <div className="map-container">
      <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" className="map-background">
        <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E0E0E0" strokeWidth="0.5"/>
            </pattern>
        </defs>
        
        {/* Base Land */}
        <rect width="800" height="800" fill="#F5F5F5" />
        <rect width="800" height="800" fill="url(#grid)" />

        {/* River */}
        <path d="M 650, -50 C 550, 150 600, 300 500, 450 S 400, 600 350, 850" fill="none" stroke="#66BB6A" strokeWidth="60" strokeOpacity="0.3" />
        <path d="M 650, -50 C 550, 150 600, 300 500, 450 S 400, 600 350, 850" fill="none" stroke="#AED581" strokeWidth="40" />

        {/* Park Areas */}
        <path d="M 50, 50 H 200 V 150 H 50 Z" fill="#2E7D32" opacity="0.4" rx="10" />
        <path d="M 350, 500 a 100,80 0 1,0 200,0 a 100,80 0 1,0 -200,0" fill="#2E7D32" opacity="0.4"/>
        <path d="M 50, 600 H 280 V 750 H 50 Z" fill="#2E7D32" opacity="0.4" rx="10" />
        
        {/* Main Roads */}
        <path d="M -50, 200 C 200, 220 600, 180 850, 200" fill="none" stroke="#FFFFFF" strokeWidth="15" />
        <path d="M -50, 200 C 200, 220 600, 180 850, 200" fill="none" stroke="#BDBDBD" strokeWidth="8" />
        <path d="M 250, -50 C 230, 300 270, 600 250, 850" fill="none" stroke="#FFFFFF" strokeWidth="15" />
        <path d="M 250, -50 C 230, 300 270, 600 250, 850" fill="none" stroke="#BDBDBD" strokeWidth="8" />

      </svg>
      <div className="map-cities">
        {locations.map((location) => (
          <MapPoint key={location.name} {...location} />
        ))}
      </div>
    </div>
  );
};

export default InteractiveMap;
