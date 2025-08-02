import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  ThumbsUp, 
  Flag, 
  Eye, 
  Calendar, 
  MapPin, 
  User,
  Share2,
  ExternalLink
} from 'lucide-react';
import { issueService } from '@/services/issueService';
import { MapView } from '@/components/MapView';
import { Timeline } from '@/components/Timeline';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { copyToClipboard, generateShareUrl } from '@/utils';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch issue details
  const { data: issueData, isLoading: issueLoading, error } = useQuery(
    ['issue', id],
    () => issueService.getIssueById(id!),
    {
      enabled: !!id
    }
  );

  // Fetch issue activity
  const { data: activityData, isLoading: activityLoading } = useQuery(
    ['issue-activity', id],
    () => issueService.getIssueActivity(id!),
    {
      enabled: !!id && !!issueData
    }
  );

  // Upvote mutation
  const upvoteMutation = useMutation(
    () => issueService.toggleUpvote(id!),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['issue', id]);
        toast.success('Vote updated!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update vote';
        toast.error(message);
      }
    }
  );

  // Spam report mutation
  const spamMutation = useMutation(
    (reason: string) => issueService.reportSpam(id!, { reason: reason as any }),
    {
      onSuccess: () => {
        toast.success('Spam report submitted');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to report spam';
        toast.error(message);
      }
    }
  );

  const handleUpvote = () => {
    if (!isAuthenticated) {
      toast.error('Please login to upvote');
      navigate('/login');
      return;
    }
    upvoteMutation.mutate();
  };

  const handleSpamReport = (reason: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to report spam');
      navigate('/login');
      return;
    }
    spamMutation.mutate(reason);
  };

  const handleShare = async () => {
    const url = generateShareUrl(id!);
    const success = await copyToClipboard(url);
    
    if (success) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  if (issueLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-responsive py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !issueData?.data?.issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
          <p className="text-gray-600 mb-6">The issue you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const issue = issueData.data.issue;
  
  // Safely extract coordinates with proper validation
  const coordinates = issue.location?.coordinates;
  let lat = 0;
  let lng = 0;
  
  if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
    const [longitude, latitude] = coordinates;
    if (typeof longitude === 'number' && typeof latitude === 'number' && 
        !isNaN(longitude) && !isNaN(latitude)) {
      lng = longitude;
      lat = latitude;
    }
  }
  
  // Fallback to a default location if coordinates are invalid
  if (lat === 0 && lng === 0) {
    lat = 23.0225; // Default to Ahmedabad, Gujarat
    lng = 72.5714;
  }

  const statusColors = {
    'Reported': 'bg-orange-100 text-orange-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Resolved': 'bg-green-100 text-green-800'
  };

  const categoryColors = {
    'Road': 'bg-red-100 text-red-800',
    'Water': 'bg-blue-100 text-blue-800',
    'Cleanliness': 'bg-green-100 text-green-800',
    'Lighting': 'bg-yellow-100 text-yellow-800',
    'Safety': 'bg-purple-100 text-purple-800'
  };

  const priorityColors = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {issue.title}
                  </h1>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[issue.status]}`}>
                      {issue.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[issue.category]}`}>
                      {issue.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[issue.priority]}`}>
                      {issue.priority} Priority
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        {issue.isAnonymous ? 'Anonymous' : issue.user?.username || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {issue.createdAt 
                          ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })
                          : 'Date unknown'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{issue.views} views</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={handleShare}
                    className="btn-ghost p-2"
                    title="Share issue"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <a
                    href={`https://maps.google.com/?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost p-2"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {issue.description}
                </p>
              </div>

              {/* Admin Notes */}
              {issue.adminNotes && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Admin Notes</h4>
                  <p className="text-blue-800">{issue.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {issue.images.map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={`Issue image ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <MapPin className="h-5 w-5 inline mr-2" />
                Location
              </h3>
              <div className="mb-4">
                <p className="text-gray-700">{issue.address}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              </div>
              <div className="h-64 rounded-lg overflow-hidden">
                <ErrorBoundary fallback={
                  <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Unable to load map</p>
                  </div>
                }>
                  <MapView
                    center={{ lat, lng }}
                    height="100%"
                    issues={[issue]}
                    zoom={16}
                  />
                </ErrorBoundary>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              <Timeline 
                activities={activityData?.data?.activities || []} 
                loading={activityLoading} 
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              {/* Upvote Button */}
              <button
                onClick={handleUpvote}
                disabled={upvoteMutation.isLoading}
                className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-3"
              >
                <ThumbsUp className="h-5 w-5" />
                <span>{issue.upvotes} Upvotes</span>
              </button>

              {/* Spam Report */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Report as spam:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Fake Report', 'Inappropriate Content', 'Duplicate', 'Spam'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => handleSpamReport(reason)}
                      disabled={spamMutation.isLoading}
                      className="p-2 text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Flag className="h-3 w-3 inline mr-1" />
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Issue Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{issue.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upvotes</span>
                  <span className="font-medium">{issue.upvotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spam Reports</span>
                  <span className="font-medium">{issue.spamVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {issue.createdAt 
                      ? new Date(issue.createdAt).toLocaleDateString()
                      : 'Date unknown'
                    }
                  </span>
                </div>
                {issue.lastStatusUpdate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Update</span>
                    <span className="font-medium">
                      {new Date(issue.lastStatusUpdate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Estimated Resolution */}
            {issue.estimatedResolutionTime && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Estimated Resolution
                </h3>
                <p className="text-gray-600">
                  {new Date(issue.estimatedResolutionTime).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
