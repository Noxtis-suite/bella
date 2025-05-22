"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

interface ImageUploadProps {
  name: string;
  onSuccess?: () => void;
}

export default function ImageUpload({ name, onSuccess }: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    // Process each file
    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Vælg venligst kun billedfiler");
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`Billedet '${file.name}' er større end 5MB`);
        return;
      }
      
      newFiles.push(file);
      
      // Create preview for this file
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
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
    setUploadProgress(0);
    
    try {
      const supabase = createClient();
      let successCount = 0;
      
      // Upload each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Generate a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(fileName, file);
          
        if (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
          continue; // Try to upload the next file
        }
        
        // Add entry to database with name and timestamp
        const { error: dbError } = await supabase
          .from('photo_submissions')
          .insert([
            { 
              name: name,
              filename: fileName,
              submitted_at: new Date().toISOString()
            }
          ]);
          
        if (dbError) {
          console.error(`Error adding database entry for ${fileName}:`, dbError);
          continue; // Try the next file
        }
        
        successCount++;
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      
      // Reset form if at least one upload was successful
      if (successCount > 0) {
        setSelectedFiles([]);
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Call success callback
        if (onSuccess) onSuccess();
      } else {
        setError("Ingen billeder blev uploadet. Prøv igen.");
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
            className="w-full py-4 px-2 border-2 border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-50 focus:outline-none"
          >
            <div className="flex flex-col items-center">
              <svg 
                className="h-10 w-10 text-gray-400 mb-2" 
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
              <span className="text-sm font-medium text-blue-500">Vælg billeder</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF op til 5MB</span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 focus:outline-none mb-3"
          >
            <span className="text-sm font-medium text-blue-500">Tilføj flere billeder</span>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
      </div>
      
      {/* Selected images previews */}
      {previews.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {selectedFiles.length} {selectedFiles.length === 1 ? 'billede' : 'billeder'} valgt
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded overflow-hidden" style={{ paddingBottom: '100%', position: 'relative' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
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
          <div className="bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-gray-500 text-right">{uploadProgress}%</p>
        </div>
      )}
      
      {/* Upload button */}
      {selectedFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full py-3 px-4 rounded-lg ${
            isUploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isUploading ? 'Uploader...' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'billede' : 'billeder'}`}
        </button>
      )}
    </div>
  );
} 