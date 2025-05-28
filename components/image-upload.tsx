"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

interface MediaUploadProps {
  name: string;
  onSuccess?: () => void;
}

export default function MediaUpload({ name, onSuccess }: MediaUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const newFiles: File[] = [];
    const newPreviews: { url: string; type: 'image' | 'video' }[] = [];
    
    // Process each file
    Array.from(files).forEach(file => {
      // Check file type - accept both images and videos
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        setError("Vælg venligst kun billede- eller videofiler");
        return;
      }
      
      // Check file size (max 50MB for videos, 5MB for images)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      const sizeText = isVideo ? "50MB" : "5MB";
      
      if (file.size > maxSize) {
        setError(`Filen '${file.name}' er større end ${sizeText}`);
        return;
      }
      
      newFiles.push(file);
      
      // Create preview for this file
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          url: reader.result as string,
          type: isVideo ? 'video' : 'image'
        });
        // Update previews when all have been processed
        if (newPreviews.length === newFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        
        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(fileName, file);
        
        if (uploadError) {
          throw new Error(`Upload fejl: ${uploadError.message}`);
        }
        
        // Determine file type
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';
        
        // Save submission to database
        const { error: dbError } = await supabase
          .from('photo_submissions')
          .insert({
            name: name,
            filename: fileName,
            file_type: fileType,
            submitted_at: new Date().toISOString()
          });
        
        if (dbError) {
          throw new Error(`Database fejl: ${dbError.message}`);
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / selectedFiles.length) * 100);
        setUploadProgress(progress);
      }
      
      // Reset form
      setSelectedFiles([]);
      setPreviews([]);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err: any) {
      setError(err.message || "Der opstod en fejl under upload");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full">
      {/* Simple mobile-friendly file selection */}
      <div className="mb-4">
        {previews.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 px-2 border-2 border-dashed border-purple-300 rounded-lg text-center hover:bg-purple-50 focus:outline-none transition-all"
          >
            <div className="flex flex-col items-center">
              <svg 
                className="h-10 w-10 text-purple-400 mb-2" 
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              <span className="text-sm font-medium text-purple-600">✨ Vælg billeder eller videoer</span>
              <span className="text-xs text-purple-500 mt-1">Billeder: PNG, JPG, GIF op til 5MB<br/>Videoer: MP4, MOV, AVI op til 50MB</span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 border border-purple-300 rounded-lg text-center hover:bg-purple-50 focus:outline-none mb-3 transition-all"
          >
            <span className="text-sm font-medium text-purple-600">✨ Tilføj flere filer</span>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
      </div>
      
      
      {previews.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-purple-700 mb-2">
            {selectedFiles.length} {selectedFiles.length === 1 ? 'magisk fil' : 'magiske filer'} valgt ✨
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded overflow-hidden border-2 border-purple-200" style={{ paddingBottom: '100%', position: 'relative' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {preview.type === 'video' ? (
                      <video
                        src={preview.url}
                        className="w-full h-full object-contain"
                        muted
                      />
                    ) : (
                      <Image
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                  {preview.type === 'video' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5v10l8-5-8-5z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-pink-600 transition-all"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-500 mb-3">{error}</p>
      )}
      
      {/* Upload progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="mb-3">
          <div className="bg-purple-100 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-purple-600 text-right">{uploadProgress}% ✨</p>
        </div>
      )}
      
      {/* Upload button */}
      {selectedFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            isUploading
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isUploading ? '🎉 Uploader magiske øjeblikke...' : `✨ Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'magisk fil' : 'magiske filer'}`}
        </button>
      )}
    </div>
  );
} 