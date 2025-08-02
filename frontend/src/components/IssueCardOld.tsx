import React from 'react';
import { Issue } from '@/types';
import { MapPin, Clock, ThumbsUp, Eye, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  showDistance?: boolean;
}

const categoryColors = {
  Road: 'bg-red-100 text-red-800',
  Water: 'bg-blue-100 text-blue-800',
  Cleanliness: 'bg-green-100 text-green-800',
  Lighting: 'bg-yellow-100 text-yellow-800',
  Safety: 'bg-purple-100 text-purple-800'
};

const statusColors = {
  Reported: 'bg-orange-100 text-orange-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800'
};

const priorityColors = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800'
};

export const IssueCard: React.FC<IssueCardProps> = ({ 
  issue, 
  onClick, 
  showDistance = false 
}) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div 
      className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      {issue.images && issue.images.length > 0 && (
        <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={issue.images[0]}
            alt={issue.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
          {issue.title}
        </h3>
        <div className="flex items-center gap-1 ml-2">
          {issue.spamVotes > 0 && (
            <span className="flex items-center text-xs text-red-600">
              <Flag className="h-3 w-3 mr-1" />
              {issue.spamVotes}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {issue.description}
      </p>

      {/* Location */}
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <MapPin className="h-4 w-4 mr-1" />
        <span className="truncate">{issue.address}</span>
        {showDistance && issue.distance && (
          <span className="ml-auto text-primary-600 font-medium">
            {formatDistance(issue.distance)} away
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[issue.category]}`}>
          {issue.category}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
          {issue.status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
          {issue.priority}
        </span>
      </div>

      {/* Stats & Time */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{issue.upvotes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{issue.views}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>
            {issue.createdAt 
              ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })
              : 'Date unknown'
            }
          </span>
        </div>
      </div>

      {/* Anonymous indicator */}
      {issue.isAnonymous && (
        <div className="mt-2 text-xs text-gray-500 italic">
          Posted anonymously
        </div>
      )}
    </div>
  );
};
