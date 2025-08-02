import React, { useRef, useCallback } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UploadWidgetProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
}

export const UploadWidget: React.FC<UploadWidgetProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizePerImage = 5
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const maxSizeBytes = maxSizePerImage * 1024 * 1024;

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name} is too large. Maximum size is ${maxSizePerImage}MB`);
        return;
      }

      newFiles.push(file);
    });

    // Check total images limit
    const totalImages = images.length + newFiles.length;
    if (totalImages > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    onImagesChange([...images, ...newFiles]);
  }, [images, onImagesChange, maxImages, maxSizePerImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${images.length >= maxImages 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={images.length < maxImages ? openFileDialog : undefined}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <div className="text-sm text-gray-600">
          {images.length >= maxImages ? (
            <p>Maximum {maxImages} images reached</p>
          ) : (
            <>
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="mt-1">PNG, JPG up to {maxSizePerImage}MB each</p>
              <p className="mt-1 text-xs text-gray-500">
                {images.length}/{maxImages} images selected
              </p>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* File info */}
              <div className="mt-1 text-xs text-gray-500 truncate">
                <div className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  <span>{image.name}</span>
                </div>
                <div className="text-gray-400">
                  {(image.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      {images.length === 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 Tips for better reports:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Take clear, well-lit photos</li>
            <li>Include multiple angles of the issue</li>
            <li>Show the surrounding area for context</li>
            <li>Avoid including personal information</li>
          </ul>
        </div>
      )}
    </div>
  );
};
