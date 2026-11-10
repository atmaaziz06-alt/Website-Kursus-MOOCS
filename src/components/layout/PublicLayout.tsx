import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopContactBar } from './TopContactBar';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-app">
      <TopContactBar />
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

