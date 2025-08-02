import React from 'react';
import { ActivityLog } from '@/types';
import { Clock, User, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TimelineProps {
  activities: ActivityLog[];
  loading?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ activities = [], loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Ensure activities is an array
  const safeActivities = Array.isArray(activities) ? activities : [];

  if (safeActivities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    if (action.includes('created') || action.includes('reported')) {
      return <FileText className="h-4 w-4" />;
    }
    if (action.includes('updated') || action.includes('status')) {
      return <Clock className="h-4 w-4" />;
    }
    return <User className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('reported')) {
      return 'bg-blue-100 text-blue-600';
    }
    if (action.includes('resolved')) {
      return 'bg-green-100 text-green-600';
    }
    if (action.includes('progress')) {
      return 'bg-yellow-100 text-yellow-600';
    }
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {safeActivities.map((activity, index) => (
          <li key={activity._id}>
            <div className="relative pb-8">
              {/* Timeline line */}
              {index !== safeActivities.length - 1 && (
                <span 
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                  aria-hidden="true" 
                />
              )}
              
              <div className="relative flex space-x-3">
                {/* Icon */}
                <div className={`
                  relative px-1.5 py-1.5 rounded-full ring-8 ring-white
                  ${getActionColor(activity.action)}
                `}>
                  {getActionIcon(activity.action)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">
                      {activity.updatedBy.username}
                    </span>
                    {' '}
                    <span>{activity.action}</span>
                  </div>
                  
                  {/* Note */}
                  {activity.note && (
                    <div className="mt-1 text-sm text-gray-600">
                      "{activity.note}"
                    </div>
                  )}
                  
                  {/* Metadata */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {activity.metadata.previousStatus && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Previous Status:</span> {activity.metadata.previousStatus}
                        </div>
                      )}
                      {activity.metadata.priority && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Priority:</span> {activity.metadata.priority}
                        </div>
                      )}
                      {activity.metadata.estimatedResolutionTime && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Estimated Resolution:</span>{' '}
                          {new Date(activity.metadata.estimatedResolutionTime).toLocaleDateString()}
                        </div>
                      )}
                      {activity.metadata.adminNotes && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Admin Notes:</span> {activity.metadata.adminNotes}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="mt-1 text-xs text-gray-500">
                    {activity.createdAt 
                      ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                      : 'Date unknown'
                    }
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
