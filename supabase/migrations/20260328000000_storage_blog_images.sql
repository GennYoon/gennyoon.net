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

-- RLS 정책
CREATE POLICY "blog-images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "blog-images auth upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "blog-images auth update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "blog-images auth delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
