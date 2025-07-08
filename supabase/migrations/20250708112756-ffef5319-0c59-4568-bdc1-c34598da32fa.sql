-- حذف البيانات التجريبية
DELETE FROM public.student_enrollments 
WHERE email IN ('faisal@gmail.com', 'sara@gmail.com', 'ahmed@gmail.com');

-- التأكد من وجود bucket للإيصالات
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-receipts', 'payment-receipts', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];