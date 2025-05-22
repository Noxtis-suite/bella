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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    
    const files = e.dataTransfer.files;
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

  return (
    <div className="w-full">
      {/* File selection area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center ${error ? 'border-red-400' : 'border-gray-300'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {previews.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="relative h-24 w-full">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
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
            <div 
              className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center h-24 cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-2xl text-gray-400">+</span>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48" 
              aria-hidden="true"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              Træk og slip billeder her, eller{' '}
              <button 
                type="button" 
                className="text-blue-500 hover:text-blue-600"
                onClick={() => fileInputRef.current?.click()}
              >
                klik for at vælge
              </button>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG, GIF op til 5MB
            </p>
          </div>
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
      
      {/* Selected files count */}
      {selectedFiles.length > 0 && (
        <p className="mt-2 text-sm text-gray-600">
          {selectedFiles.length} {selectedFiles.length === 1 ? 'billede' : 'billeder'} valgt
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
      
      {/* Upload progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="mt-2">
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
      <div className="mt-4">
        <button
          type="button"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className={`w-full py-2 px-4 rounded-lg ${
            selectedFiles.length === 0 || isUploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isUploading ? 'Uploader...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} ${selectedFiles.length === 1 ? 'billede' : 'billeder'}`}
        </button>
      </div>
    </div>
  );
} 