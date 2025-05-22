import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Create the photo_submissions table if it doesn't exist
    const { error } = await supabase.rpc('create_photo_submissions_table');

    if (error) {
      console.error("Error creating table:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// This is a SQL function to create in Supabase SQL editor:
/*
-- Create the extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION create_photo_submissions_table()
RETURNS void AS $$
BEGIN
  -- Create the photo_submissions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS photo_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Create a policy that allows inserts for all users
  DROP POLICY IF EXISTS "Allow inserts for all users" ON photo_submissions;
  CREATE POLICY "Allow inserts for all users" ON photo_submissions
    FOR INSERT WITH CHECK (true);
    
  -- Create a policy that allows all users to read the data
  DROP POLICY IF EXISTS "Allow reads for all users" ON photo_submissions;
  CREATE POLICY "Allow reads for all users" ON photo_submissions
    FOR SELECT USING (true);

  -- Set table to be accessible by public (anonymous users)
  ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;
  GRANT SELECT, INSERT ON photo_submissions TO anon;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create the table and set permissions
SELECT create_photo_submissions_table();

-- Make sure the storage bucket exists and has proper permissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Set storage policy to allow uploads from anyone
CREATE POLICY "Allow uploads for all users" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-photos');
  
-- Set storage policy to allow reading by anyone
CREATE POLICY "Allow viewing for all users" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-photos');
*/ 