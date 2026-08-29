import React from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f6f7fb]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Header />
          {children}
        </div>
      </main>
    </div>
  );
}
