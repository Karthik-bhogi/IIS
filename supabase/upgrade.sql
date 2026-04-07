-- 1. Add the new 'documents' column to the existing tables
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS documents text[] DEFAULT '{}';
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS documents text[] DEFAULT '{}';
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS documents text[] DEFAULT '{}';

-- 2. Create the storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT DO NOTHING;

-- 3. Create Row Level Security policies for the storage bucket
CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);
CREATE POLICY "Users can update their own documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid() = owner);
CREATE POLICY "Anyone can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
