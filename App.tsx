import React, { useState, useCallback } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now() };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const handleUserAction = useCallback((action: GamificationAction) => {
    if (!user) return;
    
    // For daily login, ensure it only runs once per day
    if(action === 'daily_login') {
        const today = new Date().toISOString().split('T')[0];
        if (user.lastLogin === today) return;
    }

    const result = processAction(user, action);
    setUser(result.updatedUser);
    result.notifications.forEach(addNotification);
  }, [user, addNotification]);
  
  const handleSetUser = (newUser: User | null) => {
    if (newUser) {
      // This is where we trigger the daily login check
      const today = new Date().toISOString().split('T')[0];
      if (newUser.lastLogin !== today) {
          handleUserAction('daily_login');
          // The gamification service will update the user object, so we use its result
          const { updatedUser, notifications } = processAction(newUser, 'daily_login');
          setUser(updatedUser);
          notifications.forEach(addNotification);
          return; // Exit to avoid setting user twice
      }
    }
    setUser(newUser);
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} user={user} />;
      case 'como-reciclar':
        return <ComoReciclarPage user={user} />;
      case 'puntos-verdes':
        return <PuntosVerdesPage user={user} onUserAction={handleUserAction} />;
      case 'juegos':
        return <JuegosPage user={user} />;
      case 'noticias':
        return <NoticiasPage user={user} />;
      case 'comunidad':
        return <ComunidadPage user={user} onUserAction={handleUserAction} />;
      case 'contacto':
        return <ContactoPage />;
      case 'perfil':
        return <PerfilPage user={user} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} user={user} />;
    }
  };

  return (
    <div className="bg-slate-50">
        <Layout 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          user={user}
          setUser={handleSetUser}
          notifications={notifications}
        >
          {renderPage()}
        </Layout>
    </div>
  );
};

export default App;