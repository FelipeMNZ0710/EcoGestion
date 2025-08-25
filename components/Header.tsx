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

// Create a map to store JSX icons, keeping them inside the component file
const iconMap: Record<string, JSX.Element> = {
  home: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  'como-reciclar': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  'puntos-verdes': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  juegos: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  noticias: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h2m0 0V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V19a2 2 0 01-2 2Z" /></svg>,
  comunidad: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  contacto: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
};

// Generate navLinks dynamically from the single source of truth
const navLinks = navigationData.map(item => ({
  ...item,
  icon: iconMap[item.page],
}));

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
                <div className="flex items-center space-x-2">
                    <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); handleNavClick('perfil'); }}
                        className="text-sm font-medium text-text-main hover:text-primary transition-colors"
                    >
                        ¡Hola, {user.name}!
                    </a>
                </div>
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
            <div className="header-nav bg-slate-100 rounded-full p-1.5 shadow-sm border border-slate-200/80 flex items-center space-x-1">
              {navLinks.map(({ page, title, icon }) => (
                <a
                  key={page}
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleNavClick(page); }}
                  className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 ${currentPage === page ? 'active' : 'text-text-secondary'}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  <span className="flex-shrink-0">{icon}</span>
                  <span className="ml-2 font-medium text-sm">
                    {title}
                  </span>
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
        <div id="mobile-menu" className="lg:hidden bg-background border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <nav className="space-y-1">
                {navLinks.map(({ page, title, icon }) => (
                <a
                    key={page}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleNavClick(page); }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${currentPage === page ? 'bg-emerald-100 text-primary' : 'text-text-secondary hover:bg-slate-100'}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                >
                    {icon}
                    <span>{title}</span>
                </a>
                ))}
            </nav>
            <div className="pt-4 mt-4 border-t border-slate-200">
                {user?.isAdmin && <div className="mb-4"><AdminModeToggle isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} /></div>}
                <AuthButtons isMobile={true}/>
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