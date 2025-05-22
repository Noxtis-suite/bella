"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import ImageUpload from "@/components/image-upload";

interface PhotoSubmission {
  id: string;
  name: string;
  filename: string;
  submitted_at: string;
}

export default function Home() {
  const [photoSubmissions, setPhotoSubmissions] = useState<PhotoSubmission[]>([]);
  const [name, setName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for viewing a photo in the modal
  const [viewingPhoto, setViewingPhoto] = useState<PhotoSubmission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Fetch photos with submitter information
  const fetchPhotos = async () => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // Get submissions from database
      const { data: submissions, error: submissionsError } = await supabase
        .from('photo_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        return;
      }
      
      setPhotoSubmissions(submissions || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleOpenModal = () => {
    if (!name.trim()) return;
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUploadSuccess = () => {
    setIsModalOpen(false);
    fetchPhotos(); // Refresh the image gallery
  };
  
  const handleViewPhoto = (submission: PhotoSubmission) => {
    setViewingPhoto(submission);
    setIsViewModalOpen(true);
  };
  
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setTimeout(() => setViewingPhoto(null), 300); // Clear after animation completes
  };
  
  const handleDownloadPhoto = async () => {
    if (!viewingPhoto) return;
    
    try {
      // Get the image URL
      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${viewingPhoto.filename}`;
      
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = viewingPhoto.filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading photo:", error);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('da-DK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Bella Konfirmation 2025!</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
          Del dine øjeblikke med os! Indtast dit navn og klik på "Send billede" for at uploade dine fotos fra konfirmationen!
        </p>
        
        <div className="mt-6 md:mt-8 flex flex-col gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dit navn"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button 
              onClick={handleOpenModal}
              disabled={!name.trim()}
              className={`w-full sm:w-auto px-6 py-2 rounded-lg ${
                !name.trim() 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Send billede
            </button>
            <Link href="/qr-code" className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
              Se QR Kode
            </Link>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Indlæser billeder...</p>
        </div>
      ) : photoSubmissions.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:gap-8 max-w-4xl mx-auto">
          {photoSubmissions.map((submission) => (
            <div 
              key={submission.id} 
              className="flex flex-col rounded-lg overflow-hidden shadow-md bg-white cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => handleViewPhoto(submission)}
            >
              <div className="relative w-full pb-[100%]">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${submission.filename}`}
                  alt={`Photo by ${submission.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1200px) 50vw"
                  className="object-contain bg-gray-50"
                />
              </div>
              <div className="p-2 md:p-3">
                <p className="font-medium text-sm md:text-base">Delt af: {submission.name}</p>
                <p className="text-xs text-gray-500 truncate">{formatDate(submission.submitted_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Ingen billeder uploadet endnu. Vær den første til at dele et billede!</p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Upload billede"
      >
        <div className="py-2">
          <p className="mb-4 text-gray-600">
            Hej {name}! Vælg et billede du vil dele med os.
          </p>
          <ImageUpload name={name} onSuccess={handleUploadSuccess} />
        </div>
      </Modal>

      {/* View Photo Modal */}
      {viewingPhoto && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          title={`Billede delt af ${viewingPhoto.name}`}
        >
          <div className="py-2">
            <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden" style={{ height: 'calc(min(70vh, 500px))' }}>
              <div className="relative w-full h-full max-w-full max-h-full">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${viewingPhoto.filename}`}
                  alt={`Photo by ${viewingPhoto.name}`}
                  fill
                  priority
                  sizes="(max-width: 1200px) 90vw"
                  className="object-contain"
                  style={{ objectPosition: 'center center' }}
                />
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Uploadet {formatDate(viewingPhoto.submitted_at)}
              </p>
              
              <button
                onClick={handleDownloadPhoto}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download billede
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
