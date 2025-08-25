import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ComoReciclarPage from './pages/ComoReciclarPage';
import PuntosVerdesPage from './pages/PuntosVerdesPage';
import JuegosPage from './pages/JuegosPage';
import NoticiasPage from './pages/NoticiasPage';
import ComunidadPage from './pages/ComunidadPage';
import ContactoPage from './pages/ContactoPage';
import PerfilPage from './pages/PerfilPage';
import type { Page, User, Notification, GamificationAction } from './types';
import { processAction } from './services/gamificationService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('ecoUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('ecoUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('ecoUser');
      }
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, [user]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now() };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const handleUserAction = useCallback((action: GamificationAction, payload?: any) => {
    if (!user) return;
    
    if(action === 'daily_login') {
        const today = new Date().toISOString().split('T')[0];
        if (user.lastLogin === today) return;
    }

    const result = processAction(user, action, payload);
    setUser(result.updatedUser);
    result.notifications.forEach(addNotification);
  }, [user, addNotification]);
  
  const handleLogin = (newUser: User | null) => {
    if (!newUser) {
      setIsAdminMode(false);
      setUser(null);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    let userToSet = newUser;
    if (newUser.lastLogin !== today) {
        const { updatedUser, notifications } = processAction(newUser, 'daily_login');
        userToSet = updatedUser;
        notifications.forEach(addNotification);
    }
    setUser(userToSet);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} user={user} isAdminMode={isAdminMode} />;
      case 'como-reciclar':
        return <ComoReciclarPage user={user} onUserAction={handleUserAction} isAdminMode={isAdminMode} />;
      case 'puntos-verdes':
        return <PuntosVerdesPage user={user} setUser={setUser} onUserAction={handleUserAction} isAdminMode={isAdminMode} />;
      case 'juegos':
        return <JuegosPage user={user} onUserAction={handleUserAction} isAdminMode={isAdminMode} />;
      case 'noticias':
        return <NoticiasPage user={user} isAdminMode={isAdminMode} />;
      case 'comunidad':
        return <ComunidadPage user={user} onUserAction={handleUserAction} />;
      case 'contacto':
        return <ContactoPage />;
      case 'perfil':
        return <PerfilPage user={user} updateUser={updateUser} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} user={user} isAdminMode={isAdminMode} />;
    }
  };

  return (
    <div className="bg-slate-50">
        <Layout 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          user={user}
          setUser={handleLogin}
          notifications={notifications}
          isAdminMode={isAdminMode}
          setIsAdminMode={setIsAdminMode}
        >
          {renderPage()}
        </Layout>
    </div>
  );
};

export default App;