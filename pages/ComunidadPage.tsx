import React, { useState } from 'react';

const channels = [
    { id: 'general', name: 'general', description: 'Discusiones generales sobre reciclaje y sostenibilidad en Formosa.' },
    { id: 'dudas', name: 'dudas', description: '¿No sabés dónde va algo? ¡Preguntá acá!' },
    { id: 'proyectos', name: 'proyectos', description: 'Compartí tus ideas y proyectos de reciclaje.' },
    { id: 'compostaje', name: 'compostaje', description: 'Todo sobre el arte de compostar en casa.' },
];

const messagesData = {
    general: [
        { user: 'Ana Gómez', avatarColor: 'bg-blue-200', time: '10:30 AM', text: '¡Buen día! ¿Alguien sabe si los envases de tetrabrik van con el cartón o los plásticos?' },
        { user: 'Admin Recicla', avatarColor: 'bg-primary/20', time: '10:32 AM', text: 'Hola Ana! Van con el cartón, pero asegurate de enjuagarlos y aplastarlos bien. 👍' },
        { user: 'Carlos Ruiz', avatarColor: 'bg-yellow-200', time: '11:15 AM', text: 'Confirmado, es como dice el admin. La clave es que estén limpios y secos.' },
    ],
    dudas: [
        { user: 'Laura Paez', avatarColor: 'bg-pink-200', time: '02:40 PM', text: 'Tengo una duda, ¿las lamparitas de bajo consumo dónde se tiran?' },
        { user: 'Admin Recicla', avatarColor: 'bg-primary/20', time: '02:42 PM', text: '¡Excelente pregunta, Laura! Esas lamparitas contienen mercurio y no van a la basura común. Hay que llevarlas a puntos de recolección de residuos peligrosos. Pronto actualizaremos el mapa con esos puntos.' },
    ],
    proyectos: [
         { user: 'Marcos Solis', avatarColor: 'bg-indigo-200', time: '09:00 AM', text: 'Estoy pensando en armar una compostera comunitaria en el barrio. ¿Alguien se prende?' },
    ],
    compostaje: [
        { user: 'Juana Diaz', avatarColor: 'bg-orange-200', time: 'Yesterday at 5:20 PM', text: 'Mi compost tiene olor feo, ¿qué puedo estar haciendo mal?' },
    ]
};

const members = [
    { name: 'Ana Gómez', online: true },
    { name: 'Carlos Ruiz', online: true },
    { name: 'Admin Recicla', online: true },
    { name: 'Laura Paez', online: false },
    { name: 'Marcos Solis', online: true },
    { name: 'Juana Diaz', online: false },
    { name: 'Pedro Ortiz', online: true },
]

const ComunidadPage: React.FC = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const channelInfo = channels.find(c => c.id === activeChannel);
    const channelMessages = messagesData[activeChannel] || [];

    return (
        <div className="h-[calc(100vh-5rem)] flex bg-white font-sans">
            {/* Channel List Sidebar */}
            <aside className="w-60 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
                <header className="p-4 border-b border-gray-200">
                    <h2 className="font-bold text-lg text-text-main">Canales</h2>
                </header>
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {channels.map(channel => (
                        <a 
                            key={channel.id} 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); setActiveChannel(channel.id); }}
                            className={`flex items-center px-3 py-2 text-text-secondary rounded-md transition-colors ${activeChannel === channel.id ? 'bg-secondary/20 text-primary font-semibold' : 'hover:bg-gray-100'}`}
                        >
                            <span className="mr-2 text-gray-400">#</span> {channel.name}
                        </a>
                    ))}
                </nav>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                <header className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-xl font-bold text-text-main"># {channelInfo?.name}</h1>
                    <p className="text-sm text-text-secondary">{channelInfo?.description}</p>
                </header>
                
                <div className="flex-1 p-4 space-y-6 overflow-y-auto bg-gray-50/30">
                    {channelMessages.map((msg, index) => (
                        <div key={index} className="flex items-start space-x-3 group">
                            <div className={`w-10 h-10 rounded-full ${msg.avatarColor} flex-shrink-0`}></div>
                            <div className="flex-1">
                                <p className="font-semibold text-text-main">{msg.user} <span className="text-xs text-text-secondary font-normal ml-2">{msg.time}</span></p>
                                <p className="text-text-main">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Inicia sesión para enviar un mensaje en #general" 
                            disabled 
                            className="w-full bg-gray-100 border border-gray-200 rounded-lg p-3 pr-10 cursor-not-allowed focus:outline-none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg">
                            <p className="text-sm text-text-secondary font-medium px-4 py-2 bg-gray-100 border border-gray-200 rounded-full">
                                <a href="#" className="text-primary font-bold hover:underline">Inicia sesión</a> para participar
                            </p>
                        </div>
                    </div>
                </footer>
            </main>

             {/* Member List Sidebar */}
            <aside className="w-56 bg-gray-50 border-l border-gray-200 flex-col flex-shrink-0 hidden lg:flex">
                 <header className="p-4 border-b border-gray-200">
                    <h2 className="font-bold text-lg text-text-main">Miembros — {members.filter(m => m.online).length}</h2>
                </header>
                 <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                    {members.map(member => (
                         <div key={member.name} className="flex items-center px-3 py-1.5 text-text-secondary rounded-md">
                            <div className="relative mr-3">
                                <div className={`w-8 h-8 rounded-full ${member.online ? 'bg-green-200' : 'bg-gray-200'}`}></div>
                                {member.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-gray-50"></span>}
                            </div>
                            <span>{member.name}</span>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
};

export default ComunidadPage;