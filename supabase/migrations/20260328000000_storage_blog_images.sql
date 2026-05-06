-- blog-images Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS 정책 (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'blog-images public read') THEN
    CREATE POLICY "blog-images public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'blog-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'blog-images auth upload') THEN
    CREATE POLICY "blog-images auth upload"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'blog-images auth update') THEN
    CREATE POLICY "blog-images auth update"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'blog-images auth delete') THEN
    CREATE POLICY "blog-images auth delete"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
  END IF;
END $$;
