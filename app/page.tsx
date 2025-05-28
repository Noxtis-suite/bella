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

  const handleDownloadMedia = async () => {
    if (!viewingMedia) return;
    
    try {
      // Get the media URL
      const mediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${viewingMedia.filename}`;
      
      // Fetch the media file
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = viewingMedia.filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading media:", error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Festive Scrolling Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-3 overflow-hidden relative">
        <div className="animate-scroll whitespace-nowrap">
          <span className="inline-block px-8 text-lg font-bold">
            🎉 BELLA'S KONFIRMATION 2025!! 🎊 BELLA'S KONFIRMATION 2025!! 🎈 BELLA'S KONFIRMATION 2025!! ✨ BELLA'S KONFIRMATION 2025!! 🎉 BELLA'S KONFIRMATION 2025!! 🎊 BELLA'S KONFIRMATION 2025!! 🎈 BELLA'S KONFIRMATION 2025!! ✨
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-8 md:mb-12 text-center">
          <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed max-w-2xl mx-auto">
            🌟 <strong>Fejr med os!</strong> 🌟
            <br />
            Del dine magiske øjeblikke fra Bella's konfirmation! 
            <br />
            Indtast dit navn og upload dine smukke billeder og videoer fra denne særlige dag! 📸🎬
          </p>
          
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="✨ Dit navn"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleOpenModal}
                disabled={!name.trim()}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all ${
                  !name.trim() 
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                📸🎬 Send billeder/videoer
              </button>
              <Link 
                href="/qr-code" 
                className="w-full sm:w-auto px-6 py-3 border-2 border-purple-200 rounded-xl hover:bg-purple-50 text-center font-medium transition-all hover:border-purple-300"
              >
                📱 Se QR Kode
              </Link>
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-2 text-gray-500">Indlæser magiske øjeblikke...</p>
          </div>
        ) : mediaSubmissions.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:gap-8 max-w-4xl mx-auto">
            {mediaSubmissions.map((submission) => {
              const isVideo = submission.file_type === 'video';
              return (
                <div 
                  key={submission.id} 
                  className="flex flex-col rounded-lg overflow-hidden shadow-md bg-white cursor-pointer transition-transform hover:scale-[1.02] border-2 border-purple-100 hover:border-purple-300"
                  onClick={() => handleViewMedia(submission)}
                >
                  <div className="relative w-full pb-[100%]">
                    {isVideo ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                        <video
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${submission.filename}`}
                          className="w-full h-full object-contain"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-90 rounded-full p-3 shadow-lg">
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
                        className="object-contain bg-gradient-to-br from-purple-50 to-pink-50"
                      />
                    )}
                  </div>
                  <div className="p-2 md:p-3 bg-gradient-to-r from-purple-50 to-pink-50">
                    <p className="font-medium text-sm md:text-base text-purple-800">
                      Delt af: {submission.name} {isVideo && <span className="text-pink-500">🎬</span>}
                    </p>
                    <p className="text-xs text-purple-600 truncate">{formatDate(submission.submitted_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen magiske øjeblikke uploadet endnu. Vær den første til at dele! ✨</p>
          </div>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="🎉 Upload billeder/videoer"
        >
          <div className="py-2">
            <p className="mb-4 text-gray-600">
              Hej {name}! Vælg billeder eller videoer du vil dele med os fra denne magiske dag! ✨
            </p>
            <MediaUpload name={name} onSuccess={handleUploadSuccess} />
          </div>
        </Modal>

        {/* View Media Modal */}
        {viewingMedia && (
          <Modal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            title={`${viewingMedia.file_type === 'video' ? '🎬 Video' : '📸 Billede'} delt af ${viewingMedia.name}`}
          >
            <div className="py-2">
              <div className="flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg overflow-hidden" style={{ height: 'calc(min(70vh, 500px))' }}>
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
                <p className="text-sm text-gray-600 mb-3">
                  Delt af <span className="font-medium text-purple-700">{viewingMedia.name}</span> • {formatDate(viewingMedia.submitted_at)}
                </p>
                
                <button
                  onClick={handleDownloadMedia}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  💾 Download {viewingMedia.file_type === 'video' ? 'video' : 'billede'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
