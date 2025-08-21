import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatAssistantWidget from './ChatAssistantWidget';
import type { Page, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, user, setUser }) => {
  return (
    <div className="bg-gradient-subtle min-h-screen flex flex-col antialiased text-text-main">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} setUser={setUser} />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <ChatAssistantWidget user={user} />
    </div>
  );
};

export default Layout;