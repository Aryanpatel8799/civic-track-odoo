import React from 'react';
import { motion } from 'framer-motion';
import { Issue } from '@/types';
import { 
  MapPin, 
  Clock, 
  ThumbsUp, 
  Eye, 
  Flag, 
  Heart,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  Zap,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  showDistance?: boolean;
}

const categoryConfig = {
  Road: { 
    color: 'from-red-500 to-red-600', 
    bgColor: 'bg-red-50 border-red-200', 
    textColor: 'text-red-700',
    icon: Flag
  },
  Water: { 
    color: 'from-blue-500 to-blue-600', 
    bgColor: 'bg-blue-50 border-blue-200', 
    textColor: 'text-blue-700',
    icon: Flag
  },
  Cleanliness: { 
    color: 'from-green-500 to-green-600', 
    bgColor: 'bg-green-50 border-green-200', 
    textColor: 'text-green-700',
    icon: Flag
  },
  Lighting: { 
    color: 'from-yellow-500 to-yellow-600', 
    bgColor: 'bg-yellow-50 border-yellow-200', 
    textColor: 'text-yellow-700',
    icon: Zap
  },
  Safety: { 
    color: 'from-purple-500 to-purple-600', 
    bgColor: 'bg-purple-50 border-purple-200', 
    textColor: 'text-purple-700',
    icon: AlertCircle
  }
};

const statusConfig = {
  Reported: { 
    color: 'from-orange-500 to-orange-600', 
    bgColor: 'bg-orange-50 border-orange-200', 
    textColor: 'text-orange-700',
    icon: ClockIcon
  },
  'In Progress': { 
    color: 'from-blue-500 to-blue-600', 
    bgColor: 'bg-blue-50 border-blue-200', 
    textColor: 'text-blue-700',
    icon: TrendingUp
  },
  Resolved: { 
    color: 'from-green-500 to-green-600', 
    bgColor: 'bg-green-50 border-green-200', 
    textColor: 'text-green-700',
    icon: CheckCircle
  }
};

const priorityConfig = {
  Low: { 
    color: 'from-gray-500 to-gray-600', 
    bgColor: 'bg-gray-50 border-gray-200', 
    textColor: 'text-black-700'
  },
  Medium: { 
    color: 'from-yellow-500 to-yellow-600', 
    bgColor: 'bg-yellow-50 border-yellow-200', 
    textColor: 'text-yellow-700'
  },
  High: { 
    color: 'from-orange-500 to-orange-600', 
    bgColor: 'bg-orange-50 border-orange-200', 
    textColor: 'text-orange-700'
  },
  Critical: { 
    color: 'from-red-500 to-red-600', 
    bgColor: 'bg-red-50 border-red-200', 
    textColor: 'text-red-700'
  }
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

  const categoryInfo = categoryConfig[issue.category as keyof typeof categoryConfig] || categoryConfig.Road;
  const statusInfo = statusConfig[issue.status as keyof typeof statusConfig] || statusConfig.Reported;
  const priorityInfo = priorityConfig[issue.priority as keyof typeof priorityConfig] || priorityConfig.Low;

  const StatusIcon = statusInfo.icon;
  const CategoryIcon = categoryInfo.icon;

  return (
    <motion.div 
      className="group cursor-pointer h-full"
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="card-glass h-full overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-200/50">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden">
          {issue.images && issue.images.length > 0 ? (
            <motion.img 
              src={issue.images[0]} 
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              whileHover={{ scale: 1.1 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-500">
              <CategoryIcon className="w-16 h-16 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
            </div>
          )}
          
          {/* Overlay with Status */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full border-2 ${statusInfo.bgColor} backdrop-blur-sm`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              <span className={`text-xs font-semibold ${statusInfo.textColor}`}>
                {issue.status}
              </span>
            </div>
          </div>

          {/* Priority Badge */}
          <div className="absolute top-4 right-4">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full border-2 ${priorityInfo.bgColor} backdrop-blur-sm`}>
              <div className={`w-2 h-2 bg-gradient-to-r ${priorityInfo.color} rounded-full mr-2`}></div>
              <span className={`text-xs font-semibold ${priorityInfo.textColor}`}>
                {issue.priority}
              </span>
            </div>
          </div>

          {/* View count overlay */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm">
              <Eye className="w-4 h-4 mr-1" />
              {issue.views || 0}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category */}
          <div className="flex items-center justify-between mb-3">
            <div className={`inline-flex items-center px-3 py-1 rounded-full border ${categoryInfo.bgColor}`}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              <span className={`text-xs font-semibold ${categoryInfo.textColor}`}>
                {issue.category}
              </span>
            </div>
            
            {showDistance && issue.distance && (
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {formatDistance(issue.distance)}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {issue.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>

          {/* Location */}
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            <span className="truncate">{`${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}`}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Engagement Stats */}
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex items-center text-gray-500 hover:text-red-500 transition-colors group/like cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="w-4 h-4 mr-1 group-hover/like:text-red-500 transition-colors" />
                <span className="text-sm font-medium">{issue.upvotes || 0}</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center text-gray-500 hover:text-blue-500 transition-colors group/comment cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-4 h-4 mr-1 group-hover/comment:text-blue-500 transition-colors" />
                <span className="text-sm font-medium">0</span>
              </motion.div>
            </div>

            {/* Time */}
            <div className="flex items-center text-gray-400 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Progress Bar for In Progress Issues */}
          {issue.status === 'In Progress' && (
            <motion.div 
              className="mt-4 pt-4 border-t border-gray-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>70%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </motion.div>
          )}

          {/* Success Badge for Resolved Issues */}
          {issue.status === 'Resolved' && (
            <motion.div 
              className="mt-4 pt-4 border-t border-gray-100"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl py-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700 font-semibold text-sm">Successfully Resolved!</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
