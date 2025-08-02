import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, MapPin, List, Map as MapIcon } from 'lucide-react';
import { issueService } from '@/services/issueService';
import { IssueCard } from '@/components/IssueCard';
import { MapView } from '@/components/MapView';
import { Issue, IssueFilters, LocationCoordinates } from '@/types';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<IssueFilters>({
    page: 1,
    limit: 12,
    sort: 'createdAt',
    order: 'desc'
  });
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to default location (Ahmedabad)
          setUserLocation({ lat: 23.0225, lng: 72.5714 });
        }
      );
    } else {
      setUserLocation({ lat: 23.0225, lng: 72.5714 });
    }
  }, []);

  // Fetch issues
    const { data: issuesData, isLoading } = useQuery(
    ['issues', filters, userLocation],
    () => {
      if (userLocation && filters.distance) {
        return issueService.getNearbyIssues(
          userLocation.lat,
          userLocation.lng,
          filters.distance * 1000, // Convert km to meters
          filters
        );
      }
      return issueService.getIssues(filters);
    },
    {
      enabled: !!userLocation,
      keepPreviousData: true
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleIssueClick = (issue: Issue) => {
    navigate(`/issue/${issue._id}`);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-responsive py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-gradient">CivicTrack</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Report civic issues in your area and help make your community better
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-20 w-full text-lg"
                placeholder="Search issues in your area..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mr-2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <Filter className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  className="btn-primary h-10 px-6 mr-1"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    <option value="Road">Road</option>
                    <option value="Water">Water</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    className="input"
                  >
                    <option value="">All Status</option>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* Distance Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <select
                    value={filters.distance || ''}
                    onChange={(e) => handleFilterChange('distance', e.target.value ? Number(e.target.value) : undefined)}
                    className="input"
                  >
                    <option value="">All Areas</option>
                    <option value="1">Within 1 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by
                  </label>
                  <select
                    value={`${filters.sort}-${filters.order}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      handleFilterChange('sort', sort);
                      handleFilterChange('order', order);
                    }}
                    className="input"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="upvotes-desc">Most Upvoted</option>
                    <option value="views-desc">Most Viewed</option>
                    <option value="distance-asc">Nearest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setView('list')}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${view === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <List className="h-4 w-4 inline mr-2" />
                List View
              </button>
              <button
                onClick={() => setView('map')}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${view === 'map' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <MapIcon className="h-4 w-4 inline mr-2" />
                Map View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-responsive py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : view === 'list' ? (
          <>
            {/* Issues Grid */}
            {issuesData?.data.issues.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or be the first to report an issue in this area.
                </p>
                <button
                  onClick={() => navigate('/report')}
                  className="btn-primary"
                >
                  Report First Issue
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {issuesData?.data.issues.map(issue => (
                    <IssueCard
                      key={issue._id}
                      issue={issue}
                      onClick={() => handleIssueClick(issue)}
                      showDistance={!!filters.distance}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {issuesData?.data.pagination && issuesData.data.pagination.totalPages > 1 && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(issuesData.data.pagination.currentPage - 1)}
                        disabled={!issuesData.data.pagination.hasPrev}
                        className="btn-outline disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      <span className="px-4 py-2 text-sm text-gray-600">
                        Page {issuesData.data.pagination.currentPage} of {issuesData.data.pagination.totalPages}
                      </span>
                      
                      <button
                        onClick={() => handlePageChange(issuesData.data.pagination.currentPage + 1)}
                        disabled={!issuesData.data.pagination.hasNext}
                        className="btn-outline disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // Map View
          <div className="h-96 lg:h-[600px]">
            <MapView
              center={userLocation || { lat: 23.0225, lng: 72.5714 }}
              issues={issuesData?.data.issues || []}
              onIssueClick={handleIssueClick}
              height="100%"
            />
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="container-responsive text-center">
          <h2 className="text-3xl font-bold mb-4">
            See an issue in your community?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Report it now and help make your neighborhood better
          </p>
          <button
            onClick={() => navigate('/report')}
            className="btn-lg bg-white text-primary-600 hover:bg-gray-100"
          >
            Report an Issue
          </button>
        </div>
      </div>
    </div>
  );
};
