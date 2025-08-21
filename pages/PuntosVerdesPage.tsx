import React, { useEffect, useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import type { LocationData as MapLocationData } from '../components/InteractiveMap';
import FilterMenu from '../components/FilterMenu';
import type { Category as FilterCategory } from '../components/FilterMenu';

// Define the full location data structure
interface Location {
  name: string;
  status: 'Abierto' | 'Cerrado';
  address: string;
  hours: string;
  materials: string[];
  mapData: MapLocationData;
}

// Data for all recycling points
const puntosVerdes: Location[] = [
    { 
        name: "Centro Comunitario Güemes",
        status: "Abierto",
        address: "Av. Gendarmería Nacional 1234, B° Güemes",
        hours: "Lunes a Viernes de 08:00 a 16:00",
        materials: ['Plásticos', 'Papel/Cartón', 'Vidrio'],
        mapData: { name: "Güemes", x: 30, y: 75, icon: '🏢' }
    },
    { 
        name: "Plaza San Martín",
        status: "Abierto",
        address: "Av. 25 de Mayo y Moreno, Centro",
        hours: "24 horas",
        materials: ['Plásticos', 'Vidrio'],
        mapData: { name: "Plaza S. Martín", x: 55, y: 50, icon: '🌳' }
    },
    { 
        name: "Supermercado El Económico",
        status: "Cerrado",
        address: "Av. Italia 1550, B° San Miguel",
        hours: "Lunes a Sábado de 09:00 a 20:00",
        materials: ['Pilas'],
        mapData: { name: "Super El Económico", x: 78, y: 30, icon: '🛒' }
    },
    { 
        name: "Delegación Municipal B° La Paz",
        status: "Abierto",
        address: "Calle Falsa 123, B° La Paz",
        hours: "Lunes a Viernes de 07:00 a 13:00",
        materials: ['Plásticos', 'Papel/Cartón'],
        mapData: { name: "Delegación La Paz", x: 20, y: 25, icon: '🏛️' }
    }
];

const LocationCard = ({ name, status, address, hours, materials }: { name: string, status: 'Abierto' | 'Cerrado', address: string, hours: string, materials: string[] }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between transition-shadow hover:shadow-md fade-in-section">
        <div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-text-main">{name}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${status === 'Abierto' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status}
                </span>
            </div>
            <p className="text-sm text-text-secondary mb-1">{address}</p>
            <p className="text-sm text-text-secondary mb-3">{hours}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {materials.map(material => (
                    <span key={material} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">{material}</span>
                ))}
            </div>
        </div>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-primary text-white font-semibold py-2 rounded-lg hover:bg-green-800 transition-colors">
            Cómo llegar
        </a>
    </div>
);

const PuntosVerdesPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos');
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredPuntos = puntosVerdes.filter(punto => {
        const matchesFilter = activeFilter === 'Todos' || punto.materials.includes(activeFilter);
        const matchesSearch = 
            punto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            punto.address.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 fade-in-section">
                <h1 className="text-4xl font-extrabold text-text-main">Encontrá tu Punto Verde</h1>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Utilizá el mapa interactivo y el directorio para localizar el centro de reciclaje más conveniente para vos.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Map Section */}
                <div className="lg:col-span-1 h-96 lg:h-auto fade-in-section" style={{animationDelay: '0.2s'}}>
                    <InteractiveMap locations={puntosVerdes.map(p => p.mapData)} />
                </div>

                {/* Locations List */}
                <div className="lg:col-span-2">
                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 fade-in-section" style={{animationDelay: '0.4s'}}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <input
                                type="search"
                                placeholder="Buscar por dirección o barrio..."
                                className="w-full sm:w-auto flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FilterMenu activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredPuntos.map(punto => (
                            <LocationCard key={punto.name} {...punto} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PuntosVerdesPage;