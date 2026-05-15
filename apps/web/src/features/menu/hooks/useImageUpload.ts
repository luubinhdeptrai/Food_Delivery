import { useState } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

export function useImageUpload(folder = 'menu-items') {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    try {
      return await uploadToCloudinary(file, folder);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, uploadError };
}
