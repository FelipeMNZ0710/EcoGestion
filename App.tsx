import React, { useState } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ComoReciclarPage from './pages/ComoReciclarPage';
import PuntosVerdesPage from './pages/PuntosVerdesPage';
import JuegosPage from './pages/JuegosPage';
import NoticiasPage from './pages/NoticiasPage';
import ComunidadPage from './pages/ComunidadPage';
import ContactoPage from './pages/ContactoPage';
import type { Page, User } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'como-reciclar':
        return <ComoReciclarPage />;
      case 'puntos-verdes':
        return <PuntosVerdesPage />;
      case 'juegos':
        return <JuegosPage />;
      case 'noticias':
        return <NoticiasPage />;
      case 'comunidad':
        return <ComunidadPage user={user} />;
      case 'contacto':
        return <ContactoPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage}
      user={user}
      setUser={setUser}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;