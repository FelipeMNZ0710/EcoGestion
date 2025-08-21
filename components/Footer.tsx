import React, { useEffect, useState } from 'react';

const socialLinks = [
  { name: 'Instagram', color: '#E4405F', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Instagram</title><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.314.935 20.644.523 19.854.218 19.09.083 18.22.015 16.947 0 15.667 0 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.06 1.17-.249 1.805-.413 2.227a3.48 3.48 0 0 1-.896 1.382c-.42.419-.82.679-1.38.896-.423.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.585-.015-4.85-.07c-1.17-.06-1.805-.249-2.227-.413a3.493 3.493 0 0 1-1.382-.896c-.42-.42-.679-.82-.896-1.38a3.37 3.37 0 0 1-.413-2.227c-.057-1.266-.07-1.646-.07-4.85s.015-3.585.07-4.85c.06-1.17.249-1.805.413-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413C8.415 2.18 8.797 2.16 12 2.16zm0 5.48c-3.12 0-5.64 2.52-5.64 5.64s2.52 5.64 5.64 5.64 5.64-2.52 5.64-5.64-2.52-5.64-5.64-5.64zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845a1.44 1.44 0 1 1 0 2.88 1.44 1.44 0 0 1 0-2.88z"/></svg> },
  { name: 'Twitter', color: '#1DA1F2', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg> },
  { name: 'LinkedIn', color: '#0A66C2', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg> },
  { name: 'WhatsApp', color: '#25D366', icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp</title><path d="M19.11 4.91A9.81 9.81 0 0 0 12.008.02C6.077.02 1.252 4.92 1.252 11.12c0 1.99.51 3.86 1.45 5.54L1.2 22.99l6.53-1.74c1.61.88 3.39 1.36 5.26 1.36 5.93 0 10.75-4.9 10.75-11.11a9.78 9.78 0 0 0-5.63-9.58zM12 20.45c-1.73 0-3.39-.45-4.83-1.25l-.35-.2-3.58.95.97-3.48-.22-.37c-.85-1.48-1.3-3.15-1.3-4.94 0-5.18 4.11-9.4 9.17-9.4s9.17 4.22 9.17 9.4c0 5.18-4.1 9.4-9.17 9.4zm5.5-7.3c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.14-.18.28-.71.89-.87 1.08-.16.19-.32.21-.6.07-.28-.14-1.18-.43-2.25-1.38-1.07-.95-1.79-2.13-2-2.49-.21-.36-.02-.55.12-.68.12-.12.28-.32.41-.48.14-.17.18-.28.28-.46.09-.18.05-.35-.02-.49-.07-.14-.61-1.45-.83-1.98-.23-.53-.47-.45-.65-.45h-.58c-.18 0-.47.07-.7.35-.23.28-.87.84-.87 2.05 0 1.21.89 2.37 1.01 2.55.12.18 1.75 2.63 4.24 3.73 2.49 1.1 2.49.73 2.93.7.44-.02 1.63-.67 1.86-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.2-.53-.34z"/></svg> },
];

const Footer: React.FC = () => {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        // This is mostly for completeness, as the year won't change during a session.
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="main-footer bg-text-main text-gray-300">
            <div className="footer-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Logo and Description */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.88 7.43A2 2 0 0 0 11 6.15V4a1 1 0 0 0-2 0v2.15a2 2 0 0 0-1.88 1.28C4.53 8.3 3 10.91 3 14h18c0-3.09-1.53-5.7-4.12-6.57zM5.51 16c.32-1.63 1.42-3 2.9-3.66l.33-.14.15-.33c.4-1.04 1.39-1.77 2.6-1.86a.5.5 0 0 1 .51.5v.05c0 1.23-.9 2.25-2.12 2.37L9 13.01a.5.5 0 0 1-.49-.58l.12-.5c.21-.83.6-1.58 1.13-2.19l.01-.01c.21-.24.4-.38.53-.41a.5.5 0 0 1 .58.41l.01.12V11.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h.19c.13 0 .25.06.34.16l.1.13c.18.23.33.5.45.79l.13.3c.04.1.06.2.06.31v.9l-.02.26-.2.13c-.8.54-1.4 1.34-1.66 2.28H5.51zM6 18h12v2H6v-2z" />
                            </svg>
                            <span className="text-2xl font-bold text-white">Formosa Recicla</span>
                        </div>
                        <p className="text-sm">
                            Educando y facilitando el reciclaje para construir una Formosa más verde y sostenible. Juntos, hacemos la diferencia.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="md:mx-auto">
                        <h3 className="text-lg font-semibold text-white mb-4">Navegación</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-secondary transition-colors">Inicio</a></li>
                            <li><a href="#" className="hover:text-secondary transition-colors">Cómo Reciclar</a></li>
                            <li><a href="#" className="hover:text-secondary transition-colors">Puntos Verdes</a></li>
                            <li><a href="#" className="hover:text-secondary transition-colors">Noticias</a></li>
                            <li><a href="#" className="hover:text-secondary transition-colors">Contacto</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Social Media */}
                    <div className="md:mx-auto">
                        <h3 className="text-lg font-semibold text-white mb-4">Seguinos</h3>
                        <div className="flex items-center space-x-3">
                            {socialLinks.map(social => (
                                <a key={social.name} href="#" className="group rounded-full p-3 bg-gray-700 hover:scale-110 transition-all duration-300" style={{'--social-color': social.color} as React.CSSProperties} aria-label={`Visita nuestro ${social.name}`}>
                                    <div className="w-6 h-6 text-white group-hover:text-[var(--social-color)] transition-colors duration-300">
                                        {social.icon}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm">
                    <p>&copy; {year} Formosa Recicla. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
