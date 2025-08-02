import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
  variant?: 'default' | 'landing' | 'dashboard' | 'minimal';
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavbar = true, 
  showFooter = true,
  className = "",
  variant = 'default'
}) => {
  const getLayoutClasses = () => {
    switch (variant) {
      case 'landing':
        return 'min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30';
      case 'dashboard':
        return 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50/30';
      case 'minimal':
        return 'min-h-screen bg-white';
      default:
        return 'min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30';
    }
  };

  return (
    <div className={`${getLayoutClasses()} flex flex-col relative overflow-x-hidden`}>
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl" />
      </div>

      {showNavbar && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Navbar />
        </motion.div>
      )}
      
      <motion.main 
        className={`flex-1 relative z-10 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        {children}
      </motion.main>
      
      {showFooter && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          <Footer />
        </motion.div>
      )}
    </div>
  );
};
