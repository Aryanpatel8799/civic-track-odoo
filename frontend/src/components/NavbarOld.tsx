import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  PlusCircle, 
  FileText, 
  User, 
  Settings,
  LogOut,
  Bell,
  Search,
  MapPin,
  ChevronDown,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3, requireAuth: true, hideForAdmin: true },
    { to: '/admin', label: 'Admin', icon: Settings, requireAuth: true, adminOnly: true },
    { to: '/issues', label: 'Issues', icon: FileText, requireAuth: true },
    { to: '/report', label: 'Report', icon: PlusCircle, requireAuth: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? "bg-white/90 backdrop-blur-2xl shadow-2xl border-b border-white/20" 
            : "bg-white/70 backdrop-blur-xl"
        )}
      >
        <div className="container-responsive">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    CivicTrack
                  </span>
                  <span className="text-xs text-gray-500 font-medium tracking-wide">
                    Smart City Solutions
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                if (item.requireAuth && !user) return null;
                if (item.adminOnly && user?.role !== 'admin') return null;
                if (item.hideForAdmin && user?.role === 'admin') return null;
                
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.to}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative group",
                        isActive
                          ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 backdrop-blur-sm"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                      )} />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavItem"
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-3 rounded-2xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-300 group"
                  >
                    <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                      3
                    </span>
                  </motion.button>

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 p-2 pr-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-800">
                          {user.username}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-gray-500 transition-transform duration-300",
                        showUserMenu && "rotate-180"
                      )} />
                    </motion.button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          
                          <div className="py-2">
                            <Link
                              to="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50/80 transition-colors duration-200"
                            >
                              <User className="w-4 h-4 text-blue-600" />
                              <span>Profile Settings</span>
                            </Link>
                            
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 transition-colors duration-200 w-full text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="btn-secondary px-6 py-2 rounded-2xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary px-6 py-2 rounded-2xl"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-3 rounded-2xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6 text-gray-700" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-gray-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-white/20"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <span className="text-xl font-bold gradient-text">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6">
                  {user && (
                    <div className="px-6 mb-6">
                      <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.username}</p>
                          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <nav className="px-6 space-y-2">
                    {navItems.map((item) => {
                      if (item.requireAuth && !user) return null;
                      if (item.adminOnly && user?.role !== 'admin') return null;
                      if (item.hideForAdmin && user?.role === 'admin') return null;
                      
                      const isActive = location.pathname === item.to;
                      const Icon = item.icon;
                      
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 p-4 rounded-2xl text-base font-medium transition-all duration-300",
                            isActive
                              ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                              : "text-gray-700 hover:bg-blue-50"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}

                    {user && (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 p-4 rounded-2xl text-base font-medium text-gray-700 hover:bg-blue-50 transition-all duration-300"
                        >
                          <User className="w-5 h-5" />
                          <span>Profile</span>
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 p-4 rounded-2xl text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-300 w-full text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    )}
                  </nav>
                </div>

                {!user && (
                  <div className="px-6 py-6 border-t border-gray-100 space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary w-full justify-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="btn-primary w-full justify-center"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {user ? (
                <>
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </motion.button>

                  {/* User Menu */}
                  <div className="relative group">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </motion.button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-white/95 backdrop-blur-md overflow-hidden"
            >
              <div className="container-responsive py-4">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CivicTrack
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {user && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    if (item.requireAuth && !user) return null;
                    if (item.adminOnly && user?.role !== 'admin') return null;
                    if (item.hideForAdmin && user?.role === 'admin') return null;
                    
                    const isActive = location.pathname === item.to;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {!user && (
                  <div className="mt-6 space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-4 py-3 text-center font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-4 py-3 text-center font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {user && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};
