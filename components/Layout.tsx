import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatAssistantWidget from './ChatAssistantWidget';
import NotificationToaster from './NotificationToaster';
import type { Page, User, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  notifications: Notification[];
  isAdminMode: boolean;
  setIsAdminMode: (isActive: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, user, setUser, notifications, isAdminMode, setIsAdminMode }) => {
  return (
    <div className="bg-background min-h-screen flex flex-col antialiased text-text-main">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
        setUser={setUser}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
      />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <ChatAssistantWidget user={user} />
      <NotificationToaster notifications={notifications} />
    </div>
  );
};

export default Layout;
