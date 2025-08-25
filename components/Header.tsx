import React, { useState } from 'react';
import type { Page, User } from '../types';
import { navigationData } from '../data/navigationData';
import LoginModal from './LoginModal';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAdminMode: boolean;
  setIsAdminMode: (isActive: boolean) => void;
}

const iconProps = {
  fill: "currentColor",
  viewBox: "0 0 256 256",
};

const iconPathProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "16",
} as const;

const iconMap: Record<string, JSX.Element> = {
  home: <svg {...iconProps}><rect width="256" height="256" fill="none" /><path d="M213.3815,109.61945,133.376,36.88436a8,8,0,0,0-10.76339.00036l-79.9945,72.73477A8,8,0,0,0,40,115.53855V208a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V115.53887A8,8,0,0,0,213.3815,109.61945Z" {...iconPathProps} /></svg>,
  'como-reciclar': <svg {...iconProps}><rect width="256" height="256" fill="none" /><path d="M176,80h40a8,8,0,0,1,6.54,12.28l-24,36A8,8,0,0,1,192,136H144l32-48A8,8,0,0,1,176,80ZM80,176H40a8,8,0,0,1-6.54-12.28l24-36A8,8,0,0,1,64,120h48L80,168A8,8,0,0,1,80,176Zm88-48h40a8,8,0,0,0,6.54-12.28l-24-36A8,8,0,0,0,184,72H136l32,48A8,8,0,0,0,168,128Z" {...iconPathProps} /></svg>,
  'puntos-verdes': <svg {...iconProps}><rect width="256" height="256" fill="none" /><circle cx="128" cy="104" r="72" {...iconPathProps} /><path d="M183.5658,199.87543a111.9983,111.9983,0,0,1-111.1316,0" {...iconPathProps} /><path d="M208,224l-30.68652-30.70215" {...iconPathProps} /></svg>,
  juegos: <svg {...iconProps}><rect width="256" height="256" fill="none" /><path d="M82.14214,197.45584,52.201,227.397a8,8,0,0,1-11.31371,0L28.603,215.11268a8,8,0,0,1,0-11.31371l29.94113-29.94112a8,8,0,0,0,0-11.31371L37.65685,141.65685a8,8,0,0,1,0-11.3137l12.6863-12.6863a8,8,0,0,1,11.3137,0l76.6863,76.6863a8,8,0,0,1,0,11.3137l-12.6863,12.6863a8,8,0,0,1-11.3137,0L93.45584,197.45584A8,8,0,0,0,82.14214,197.45584Z" {...iconPathProps} /><polyline points="76.201 132.201 152.201 40.201 216 40 215.799 103.799 123.799 179.799" {...iconPathProps} /></svg>,
  noticias: <svg {...iconProps}><rect width="256" height="256" fill="none" /><path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,16,0V56H216a8,8,0,0,1,0,16H160a24,24,0,0,0-24,24v88a24,24,0,0,0,24,24h56a8,8,0,0,1,0,16H40a16,16,0,0,0-16,16v0a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Z" {...iconPathProps} /></svg>,
  comunidad: <svg {...iconProps}><rect width="256" height="256" fill="none" /><path d="M45.42853,176.99811A95.95978,95.95978,0,1,1,79.00228,210.5717l.00023-.001L45.84594,220.044a8,8,0,0,1-9.89-9.89l9.47331-33.15657Z" {...iconPathProps} /></svg>,
  contacto: <svg {...iconProps}><rect width="256" height="256" fill="none" /><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19629l82.59375,55.0625a8.00008,8.00008,0,0,0,9.40625,0L216,74.19629V192Z" {...iconPathProps} /></svg>,
  perfil: <svg {...iconProps}><rect width="256" height="256" fill="none" /><circle cx="128" cy="96" r="64" {...iconPathProps} strokeMiterlimit="10" /><path d="M30.989,215.99064a112.03731,112.03731,0,0,1,194.02311.002" {...iconPathProps} /></svg>,
};


const AdminModeToggle: React.FC<{
  isAdminMode: boolean;
  setIsAdminMode: (isActive: boolean) => void;
}> = ({ isAdminMode, setIsAdminMode }) => (
    <div className="flex items-center space-x-2">
        <span className={`text-xs font-bold ${isAdminMode ? 'text-accent' : 'text-text-secondary'}`}>Modo Admin</span>
        <label htmlFor="admin-toggle" className="custom-toggle-label">
            <input
                id="admin-toggle"
                type="checkbox"
                className="custom-toggle-input"
                checked={isAdminMode}
                onChange={(e) => setIsAdminMode(e.target.checked)}
            />
            <div className="custom-toggle-track">
                <div className="custom-toggle-thumb"></div>
            </div>
        </label>
    </div>
);

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, user, setUser, isAdminMode, setIsAdminMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };
  
  const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
      setIsMobileMenuOpen(false);
  };
  
  const handleLogout = () => {
      setUser(null);
      setIsMobileMenuOpen(false);
  }

  const AuthButtons: React.FC<{isMobile?: boolean}> = ({ isMobile }) => {
    if (user) {
        return (
            <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'space-x-4'}`}>
                 {user.isAdmin && !isMobile && <AdminModeToggle isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} />}
                <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        )
    }
    return (
        <button
            onClick={handleOpenLoginModal}
            className={`px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-transform duration-200 hover:scale-105 ${isMobile ? 'w-full' : ''}`}
        >
            Iniciar Sesión
        </button>
    )
  }

  const baseNavLinks = navigationData.map(item => ({
    ...item,
    icon: iconMap[item.page],
  }));

  const navLinks = user
    ? baseNavLinks
    : baseNavLinks.filter(link => link.page !== 'perfil');
  
  const userSpecificLinks = user 
    ? [{ page: 'perfil' as Page, title: 'Perfil', description: 'Tu perfil de usuario', icon: iconMap['perfil'] }]
    : [];

  return (
    <>
    <header className="main-header bg-background/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} className="flex items-center space-x-2 flex-shrink-0" aria-label="Página de inicio de EcoGestión">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.88 7.43A2 2 0 0 0 11 6.15V4a1 1 0 0 0-2 0v2.15a2 2 0 0 0-1.88 1.28C4.53 8.3 3 10.91 3 14h18c0-3.09-1.53-5.7-4.12-6.57zM5.51 16c.32-1.63 1.42-3 2.9-3.66l.33-.14.15-.33c.4-1.04 1.39-1.77 2.6-1.86a.5.5 0 0 1 .51.5v.05c0 1.23-.9 2.25-2.12 2.37L9 13.01a.5.5 0 0 1-.49-.58l.12-.5c.21-.83.6-1.58 1.13-2.19l.01-.01c.21-.24.4-.38.53-.41a.5.5 0 0 1 .58.41l.01.12V11.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h.19c.13 0 .25.06.34.16l.1.13c.18.23.33.5.45.79l.13.3c.04.1.06.2.06.31v.9l-.02.26-.2.13c-.8.54-1.4 1.34-1.66 2.28H5.51zM6 18h12v2H6v-2z" />
            </svg>
            <span className="text-2xl font-bold text-text-main">EcoGestión</span>
          </a>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="menu">
              {navLinks.map(({ page, title, icon }) => (
                <a
                  key={page}
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleNavClick(page as Page); }}
                  className={`link ${currentPage === page ? 'active' : ''}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  <span className="link-icon">{icon}</span>
                  <span className="link-title">{title}</span>
                </a>
              ))}
               {user && userSpecificLinks.map(({ page, title, icon }) => (
                <a
                  key={page}
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleNavClick(page as Page); }}
                  className={`link ${currentPage === page ? 'active' : ''}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  <span className="link-icon">{icon}</span>
                  <span className="link-title">{title}</span>
                </a>
              ))}
            </div>
            <div className="ml-6">
                <AuthButtons />
            </div>
          </nav>
          
          <div className="flex items-center lg:hidden">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hamburger p-2 rounded-md text-text-main hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-background border-t border-slate-200 mobile-menu-animate">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <nav className="space-y-1">
                {baseNavLinks.map(({ page, title, icon }) => (
                <a
                    key={page}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleNavClick(page as Page); }}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${currentPage === page ? 'bg-emerald-100 text-primary font-semibold' : 'text-text-secondary hover:bg-slate-100 hover:text-text-main'}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                >
                    <div className="h-6 w-6">{icon}</div>
                    <span>{title}</span>
                </a>
                ))}
            </nav>
            <div className="pt-4 mt-4 border-t border-slate-200">
                {user?.isAdmin && <div className="mb-4"><AdminModeToggle isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} /></div>}
                {user ? (
                     <div className="space-y-2">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('perfil'); }} className={`flex items-center space-x-4 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${currentPage === 'perfil' ? 'bg-emerald-100 text-primary font-semibold' : 'text-text-secondary hover:bg-slate-100 hover:text-text-main'}`}><div className="h-6 w-6">{iconMap['perfil']}</div><span>Hola, {user.name.split(' ')[0]}</span></a>
                        <AuthButtons isMobile={true}/>
                     </div>
                ) : <AuthButtons isMobile={true}/>}
            </div>
          </div>
        </div>
      )}
    </header>
    <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={setUser}
      />
    </>
  );
};

export default Header;