"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import MediaUpload from "@/components/image-upload";

interface MediaSubmission {
  id: string;
  name: string;
  filename: string;
  submitted_at: string;
  file_type?: string; // 'image' or 'video'
}

export default function Home() {
  const [mediaSubmissions, setMediaSubmissions] = useState<MediaSubmission[]>([]);
  const [name, setName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for viewing media in the modal
  const [viewingMedia, setViewingMedia] = useState<MediaSubmission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Fetch media with submitter information
  const fetchMedia = async () => {
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
      
      setMediaSubmissions(submissions || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMedia();
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
    fetchMedia(); // Refresh the media gallery
  };
  
  const handleViewMedia = (submission: MediaSubmission) => {
    setViewingMedia(submission);
    setIsViewModalOpen(true);
  };
  
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setTimeout(() => setViewingMedia(null), 300); // Clear after animation completes
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bella Konf</h1>
            <p className="text-gray-600">Del dine billeder og videoer fra eventet</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Name input and upload button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Dit navn
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Indtast dit navn..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleOpenModal}
              disabled={!name.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                name.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Upload billeder/videoer
            </button>
          </div>
        </div>

        {/* Media Gallery */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Delte billeder og videoer</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Indlæser indhold...</p>
            </div>
          ) : mediaSubmissions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:gap-8 max-w-4xl mx-auto">
              {mediaSubmissions.map((submission) => {
                const isVideo = submission.file_type === 'video';
                return (
                  <div 
                    key={submission.id} 
                    className="flex flex-col rounded-lg overflow-hidden shadow-md bg-white cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => handleViewMedia(submission)}
                  >
                    <div className="relative w-full pb-[100%]">
                      {isVideo ? (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <video
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${submission.filename}`}
                            className="w-full h-full object-contain"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="bg-black bg-opacity-60 rounded-full p-3">
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 5v10l8-5-8-5z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${submission.filename}`}
                          alt={`Media by ${submission.name}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 50vw"
                          className="object-contain bg-gray-50"
                        />
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <p className="font-medium text-sm md:text-base">
                        Delt af: {submission.name} {isVideo && <span className="text-blue-500">📹</span>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{formatDate(submission.submitted_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Intet indhold uploadet endnu. Vær den første til at dele!</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Upload billeder/videoer"
        >
          <div className="py-2">
            <p className="mb-4 text-gray-600">
              Hej {name}! Vælg billeder eller videoer du vil dele med os.
            </p>
            <MediaUpload name={name} onSuccess={handleUploadSuccess} />
          </div>
        </Modal>

        {/* View Media Modal */}
        {viewingMedia && (
          <Modal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            title={`${viewingMedia.file_type === 'video' ? 'Video' : 'Billede'} delt af ${viewingMedia.name}`}
          >
            <div className="py-2">
              <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden" style={{ height: 'calc(min(70vh, 500px))' }}>
                <div className="relative w-full h-full max-w-full max-h-full">
                  {viewingMedia.file_type === 'video' ? (
                    <video
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${viewingMedia.filename}`}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${viewingMedia.filename}`}
                      alt={`Media by ${viewingMedia.name}`}
                      fill
                      priority
                      sizes="(max-width: 1200px) 90vw"
                      className="object-contain"
                      style={{ objectPosition: 'center center' }}
                    />
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Delt af <span className="font-medium">{viewingMedia.name}</span> • {formatDate(viewingMedia.submitted_at)}
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
