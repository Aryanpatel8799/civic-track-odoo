import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Users,
  Eye,
  Heart,
  MessageSquare,
  Star,
  Grid3x3,
  List,
  SlidersHorizontal,
  Zap,
  ChevronDown,
  ArrowUpDown,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '@/services/issueService';
import { IssueCard } from '@/components/IssueCard';
import { useAuth } from '@/contexts/AuthContext';
import { IssueFilters, Issue } from '@/types';

export const IssuesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const [activeTab, setActiveTab] = useState<'my-issues' | 'nearby' | 'all-issues'>('my-issues');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IssueFilters>({
    page: 1,
    limit: 12,
    sort: 'createdAt',
    order: 'desc'
  });

  // Get user location for nearby issues
  useEffect(() => {
    if (activeTab === 'nearby' && !userLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationError(null);
          },
          (error) => {
            console.error('Error getting location:', error);
            setLocationError('Unable to get your location. Showing all issues instead.');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser.');
      }
    }
  }, [activeTab, userLocation]);

  // Parallax effect for header
  const headerY = useTransform(scrollY, [0, 200], [0, 50]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  // Fetch user's issues
  const { data: myIssuesData, isLoading: myIssuesLoading } = useQuery(
    ['user-issues', filters],
    () => issueService.getUserIssues(filters),
    {
      enabled: activeTab === 'my-issues'
    }
  );

  // Fetch all issues (admin only)
  const { data: allIssuesData, isLoading: allIssuesLoading } = useQuery(
    ['all-issues', filters],
    () => issueService.getIssues(filters),
    {
      enabled: activeTab === 'all-issues' && user?.role === 'admin'
    }
  );

  // Fetch issue statistics
  const { data: issueStats, isLoading: statsLoading, error: statsError } = useQuery(
    ['issue-stats'],
    () => issueService.getIssueStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: 1000
    }
  );

  // Fetch nearby issues with location
  const { data: nearbyIssuesData, isLoading: nearbyLoading } = useQuery(
    ['nearby-issues', filters, userLocation],
    () => {
      const nearbyFilters = { 
        ...filters, 
        ...(userLocation && { 
          lat: userLocation.lat, 
          lng: userLocation.lng, 
          radius: 5000 // 5km radius
        })
      };
      return issueService.getIssues(nearbyFilters);
    },
    {
      enabled: activeTab === 'nearby'
    }
  );

  const currentData = activeTab === 'my-issues' ? myIssuesData : activeTab === 'nearby' ? nearbyIssuesData : allIssuesData;
  const isLoading = activeTab === 'my-issues' ? myIssuesLoading : activeTab === 'nearby' ? nearbyLoading : allIssuesLoading;

  const handleIssueClick = (issue: Issue) => {
    navigate(`/issue/${issue._id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  // Real statistics from API
  const statusStats = [
    { 
      label: 'Total Issues', 
      value: issueStats?.data?.totalIssues || 0, 
      color: 'from-blue-500 to-blue-600', 
      icon: AlertCircle 
    },
    { 
      label: 'Resolved', 
      value: issueStats?.data?.resolvedIssues || 0, 
      color: 'from-green-500 to-green-600', 
      icon: CheckCircle 
    },
    { 
      label: 'In Progress', 
      value: issueStats?.data?.inProgressIssues || 0, 
      color: 'from-orange-500 to-orange-600', 
      icon: ClockIcon 
    },
    { 
      label: 'New Reports', 
      value: issueStats?.data?.newIssues || 0, 
      color: 'from-purple-500 to-purple-600', 
      icon: Star 
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Header */}
      <motion.section 
        style={{ y: headerY, opacity: headerOpacity }}
        className="relative pt-36 pb-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-responsive relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center text-white"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Community Issues Dashboard
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg"
            >
              Track & Transform
              <br />
              <span className="text-blue-100 drop-shadow-md">Your Community</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 drop-shadow-sm"
            >
              Monitor progress, engage with neighbors, and drive meaningful change in your area.
            </motion.p>

            {/* Stats Overview */}
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
            >
              {statsLoading ? (
                // Loading skeleton for stats
                [1, 2, 3, 4].map((index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="card-glass p-6 text-center border border-white/20 animate-pulse"
                  >
                    <div className="w-16 h-16 bg-white/30 rounded-2xl mx-auto mb-4"></div>
                    <div className="h-8 bg-white/30 rounded-lg mb-2 w-16 mx-auto"></div>
                    <div className="h-4 bg-white/20 rounded-lg w-20 mx-auto"></div>
                  </motion.div>
                ))
              ) : (
                statusStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="card-glass p-6 text-center group cursor-pointer border border-white/20"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-blue-100">{stat.label}</div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation Tabs & Controls */}
        <section className="py-8 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <div className="container-responsive">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {/* Tabs */}
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-8">
                  <button
                    onClick={() => setActiveTab('my-issues')}
                    className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      activeTab === 'my-issues'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-800 hover:text-blue-600 hover:bg-blue-50/80 bg-white/60 backdrop-blur-sm border border-gray-200/50'
                    }`}
                  >
                    <span className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      My Issues ({myIssuesData?.data?.pagination?.totalItems || 0})
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('nearby')}
                    className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      activeTab === 'nearby'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-800 hover:text-blue-600 hover:bg-blue-50/80 bg-white/60 backdrop-blur-sm border border-gray-200/50'
                    }`}
                  >
                    <span className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Nearby Issues ({nearbyIssuesData?.data?.pagination?.totalItems || 0})
                      {activeTab === 'nearby' && !userLocation && !locationError && (
                        <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </span>
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setActiveTab('all-issues')}
                      className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                        activeTab === 'all-issues'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-800 hover:text-blue-600 hover:bg-blue-50/80 bg-white/60 backdrop-blur-sm border border-gray-200/50'
                      }`}
                    >
                      <span className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        All Issues ({allIssuesData?.data?.pagination?.totalItems || 0})
                      </span>
                    </button>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/report')}
                  className="btn-primary btn-lg group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Report New Issue
                  </span>
                </motion.button>
              </motion.div>

              {/* Search & Filters */}
              <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Search */}
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Search issues by title, location, or description..."
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      Search
                    </motion.button>
                  </form>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <div className="relative">
                    <select
                      value={filters.status || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined, page: 1 }))}
                      className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="">All Status</option>
                      <option value="Reported">Reported</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={`${filters.sort}-${filters.order}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setFilters(prev => ({ ...prev, sort: sort as any, order: order as any, page: 1 }));
                      }}
                      className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="upvotes-desc">Most Upvoted</option>
                      <option value="views-desc">Most Viewed</option>
                    </select>
                    <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 transition-all duration-300 ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 transition-all duration-300 ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Location Status Alert for Nearby Issues */}
              {activeTab === 'nearby' && (
                <motion.div
                  variants={itemVariants}
                  className="mt-6"
                >
                  {locationError ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center">
                      <AlertCircle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-orange-800 font-medium">Location Access Limited</p>
                        <p className="text-orange-700 text-sm">{locationError}</p>
                      </div>
                    </div>
                  ) : userLocation ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-green-800 font-medium">Location Found</p>
                        <p className="text-green-700 text-sm">
                          Showing issues within 5km of your location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3 flex-shrink-0"></div>
                      <div>
                        <p className="text-blue-800 font-medium">Getting Your Location</p>
                        <p className="text-blue-700 text-sm">Please allow location access to see nearby issues</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Issues Grid/List */}
        <section className="py-12">
          <div className="container-responsive">
            {isLoading ? (
              <motion.div
                variants={containerVariants}
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                  : "space-y-6"
                }
              >
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    className="card-glass p-6 animate-pulse"
                  >
                    <div className="aspect-video bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4 w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : !currentData || (Array.isArray(currentData) ? currentData.length === 0 : currentData.data?.issues?.length === 0) ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  {activeTab === 'my-issues' ? (
                    <Plus className="w-16 h-16 text-blue-600" />
                  ) : (
                    <MapPin className="w-16 h-16 text-purple-600" />
                  )}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {activeTab === 'my-issues' ? 'No issues reported yet' : activeTab === 'nearby' ? 'No nearby issues found' : 'No issues in the system'}
                </h3>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  {activeTab === 'my-issues' 
                    ? 'Start by reporting your first issue to help improve your community and make a positive impact.'
                    : activeTab === 'nearby'
                      ? locationError 
                        ? 'Unable to access your location. Showing all available issues instead.'
                        : userLocation 
                          ? 'No issues found within 5km of your location. Try expanding your search or check back later.'
                          : 'We\'re getting your location to show nearby issues. Please wait a moment...'
                      : 'No issues have been reported to the system yet. Encourage your community to start reporting issues.'
                  }
                </p>
                {activeTab === 'my-issues' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/report')}
                    className="btn-primary btn-xl group"
                  >
                    <span className="flex items-center">
                      <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      Report Your First Issue
                    </span>
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={containerVariants}
                  className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" 
                    : "space-y-6 mb-12"
                  }
                >
                  {(Array.isArray(currentData) ? currentData : currentData?.data?.issues || []).map((issue, index) => (
                    <motion.div
                      key={issue._id}
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => handleIssueClick(issue)}
                    >
                      <IssueCard
                        issue={issue}
                        onClick={() => handleIssueClick(issue)}
                        showDistance={activeTab === 'nearby'}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Enhanced Pagination */}
                {currentData?.data?.pagination && currentData.data.pagination.totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters(prev => ({ ...prev, page: currentData.data.pagination.currentPage - 1 }))}
                        disabled={!currentData.data.pagination.hasPrev}
                        className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </motion.button>
                      
                      <div className="flex items-center space-x-2">
                        {[...Array(Math.min(5, currentData.data.pagination.totalPages))].map((_, i) => {
                          const pageNum = i + 1;
                          const isActive = pageNum === currentData.data.pagination.currentPage;
                          return (
                            <motion.button
                              key={pageNum}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                              className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                                isActive
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                            >
                              {pageNum}
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters(prev => ({ ...prev, page: currentData.data.pagination.currentPage + 1 }))}
                        disabled={!currentData.data.pagination.hasNext}
                        className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
