import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MapPin, Loader2, Camera, Send } from 'lucide-react';
import { issueService } from '@/services/issueService';
import { UploadWidget } from '@/components/UploadWidget';
import { MapView } from '@/components/MapView';
import { CreateIssueRequest, LocationCoordinates } from '@/types';
import { getCurrentLocation, getLocationFromCoordinates } from '@/utils';

const reportSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['Road', 'Water', 'Cleanliness', 'Lighting', 'Safety']),
  isAnonymous: z.boolean().default(false)
});

type ReportFormData = z.infer<typeof reportSchema>;

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema)
  });

  // Get user's current location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Update address when location changes
  useEffect(() => {
    if (location) {
      updateAddress(location.lat, location.lng);
    }
  }, [location]);

  const getUserLocation = async () => {
    setIsGettingLocation(true);
    try {
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);
      toast.success('Location detected successfully');
    } catch (error) {
      console.warn('Location detection failed:', error);
      // Set default location (Ahmedabad)
      setLocation({ lat: 23.0225, lng: 72.5714 });
      toast.error('Could not detect location. Please select manually on the map.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const updateAddress = async (lat: number, lng: number) => {
    try {
      const addressText = await getLocationFromCoordinates(lat, lng);
      setAddress(addressText);
    } catch (error) {
      console.warn('Address lookup failed:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleLocationSelect = (newLocation: LocationCoordinates) => {
    setLocation(newLocation);
    toast.success('Location selected on map');
  };

  const createIssueMutation = useMutation(
    (data: CreateIssueRequest) => issueService.createIssue(data),
    {
      onSuccess: (response) => {
        toast.success('Issue reported successfully!');
        navigate(`/issue/${response.data.issue._id}`);
      },
      onError: (error: any) => {
        console.error('Issue creation error:', error);
        const message = error.response?.data?.message || error.response?.data?.error || 'Failed to report issue';
        const details = error.response?.data?.details ? ` Details: ${error.response.data.details}` : '';
        toast.error(message + details);
      }
    }
  );

  const onSubmit = (data: ReportFormData) => {
    if (!location) {
      toast.error('Please select a location for the issue');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    const issueData: CreateIssueRequest = {
      title: data.title,
      description: data.description,
      category: data.category,
      coordinates: [location.lng, location.lat],
      address: address,
      isAnonymous: data.isAnonymous,
      images: images
    };

    console.log('Submitting issue data:', issueData);
    createIssueMutation.mutate(issueData);
  };

  const categoryDescriptions = {
    Road: 'Potholes, damaged roads, traffic signs, road markings',
    Water: 'Water leakage, drainage issues, water quality problems',
    Cleanliness: 'Garbage collection, public area cleanliness, waste management',
    Lighting: 'Street lights, public area lighting, electrical issues',
    Safety: 'Security concerns, dangerous areas, public safety issues'
  };

  return (
    <div className="min-h-screen  bg-gray-50">
      {/* Header */}
      <div className="bg-white py-100 mb-200 shadow-sm">
        <div className="container-responsive py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {/* Report an Issue */}
          </h1>
          <p className="text-gray-600">
            {/* Help improve your community by reporting civic issues */}
          </p>
        </div>
      </div>

      <div className="container-responsive py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Issue Details */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Issue Details
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className={`input ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="e.g., Large pothole on Main Street near bus stop"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Be specific and descriptive. Mention landmarks or street names.
                </p>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className={`input ${errors.category ? 'border-red-300' : ''}`}
                >
                  <option value="">Select a category</option>
                  {Object.entries(categoryDescriptions).map(([category]) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
                {watch('category') && (
                  <p className="mt-1 text-xs text-gray-500">
                    {categoryDescriptions[watch('category') as keyof typeof categoryDescriptions]}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={`input ${errors.description ? 'border-red-300' : ''}`}
                  placeholder="Provide detailed description of the issue. Include any relevant context, when you noticed it, and how it affects the community..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {watch('description')?.length || 0}/1000 characters
                </p>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center">
                <input
                  {...register('isAnonymous')}
                  id="isAnonymous"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                  Report anonymously
                </label>
              </div>
              {watch('isAnonymous') && (
                <p className="mt-1 text-xs text-gray-500">
                  Your name will not be visible to other users, but administrators can still see it for moderation purposes.
                </p>
              )}
            </div>

            {/* Location Selection */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Location
                </h2>
                <button
                  type="button"
                  onClick={getUserLocation}
                  disabled={isGettingLocation}
                  className="btn-outline"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  {isGettingLocation ? 'Getting Location...' : 'Use My Location'}
                </button>
              </div>

              {/* Address Display */}
              {address && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Selected Location:</p>
                      <p className="text-sm text-gray-600">{address}</p>
                      {location && (
                        <p className="text-xs text-gray-500 mt-1">
                          Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="h-64 rounded-lg overflow-hidden">
                <MapView
                  center={location || { lat: 23.0225, lng: 72.5714 }}
                  height="100%"
                  showLocationSelector={true}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Click on the map to select the exact location of the issue, or use the "Use My Location" button.
              </p>
            </div>

            {/* Image Upload */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <Camera className="h-5 w-5 inline mr-2" />
                Images
              </h2>

              <UploadWidget
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                maxSizePerImage={5}
              />

              {images.length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  At least one image is required to report an issue.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createIssueMutation.isLoading || !location || images.length === 0}
                className="btn-primary px-8"
              >
                {createIssueMutation.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                {createIssueMutation.isLoading ? 'Reporting Issue...' : 'Report Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
