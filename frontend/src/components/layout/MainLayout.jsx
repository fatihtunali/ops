import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      {/* Sidebar for desktop */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-blue-600 to-indigo-600 border-t border-blue-500 py-4 px-4 sm:px-6 lg:px-8 mt-8 shadow-lg">
          <div className="flex justify-between items-center text-sm text-blue-50">
            <p>&copy; 2025 Funny Tourism. All rights reserved.</p>
            <p>Logged in as: <span className="font-medium text-white">{user?.full_name}</span> ({user?.role})</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
