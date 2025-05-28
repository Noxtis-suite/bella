# Video Support Setup

Your app now supports both images and videos! Here's what was added:

## Changes Made

1. **MediaUpload Component**: Updated to accept both images and videos
   - Videos can be up to 50MB (vs 5MB for images)
   - Shows video preview with play icon
   - Accepts video formats: MP4, MOV, AVI, etc.

2. **Gallery View**: 
   - Shows video thumbnails with play button overlay
   - Videos autoplay when clicked (mobile-friendly)
   - Uses native HTML5 video player with controls

3. **Database**: Added `file_type` column to track if file is 'image' or 'video'

## Database Migration

Run this SQL in your Supabase dashboard:

```sql
-- Add file_type column to photo_submissions table
ALTER TABLE photo_submissions 
ADD COLUMN file_type VARCHAR(10) DEFAULT 'image';

-- Update existing records to have 'image' as file_type
UPDATE photo_submissions 
SET file_type = 'image' 
WHERE file_type IS NULL;

-- Add constraint to ensure only valid file types
ALTER TABLE photo_submissions 
ADD CONSTRAINT check_file_type 
CHECK (file_type IN ('image', 'video'));
```

## How It Works on Mobile

- **Gallery**: Videos show with a play button overlay
- **Click to Play**: When users tap a video, it opens in a modal and autoplays
- **Native Controls**: Uses HTML5 video with `controls`, `autoPlay`, and `playsInline` attributes
- **No React Player**: Avoids React Player issues on mobile by using native video elements

## File Size Limits

- **Images**: 5MB max
- **Videos**: 50MB max

The app will automatically detect file type and handle accordingly! 