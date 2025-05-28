-- Add file_type column to photo_submissions table
-- This column will store 'image' or 'video' to distinguish between file types

ALTER TABLE photo_submissions 
ADD COLUMN file_type VARCHAR(10) DEFAULT 'image';

-- Update existing records to have 'image' as file_type (since they were all images before)
UPDATE photo_submissions 
SET file_type = 'image' 
WHERE file_type IS NULL;

-- Optional: Add a check constraint to ensure only valid file types
ALTER TABLE photo_submissions 
ADD CONSTRAINT check_file_type 
CHECK (file_type IN ('image', 'video')); 