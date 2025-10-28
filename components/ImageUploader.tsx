
import React, { useRef } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: ImageFile) => void;
  imageUrl: string | null;
  icon: JSX.Element;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, imageUrl, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const [header, base64] = result.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        onImageUpload({ base64, mimeType });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-700 h-full">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div
        onClick={handleCardClick}
        className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors duration-300 bg-gray-900/50"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-contain rounded-lg" />
        ) : (
          <div className="text-center text-gray-400">
            {icon}
            <p>Click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
