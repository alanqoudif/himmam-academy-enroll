-- إصلاح مشكلة infinite recursion في جدول profiles
DROP POLICY IF EXISTS "الإدمن يمكنه عرض جميع الملفات الشخصية" ON public.profiles;
DROP POLICY IF EXISTS "المستخدمون يمكنهم تحديث ملفاتهم الشخصية" ON public.profiles;
DROP POLICY IF EXISTS "المستخدمون يمكنهم عرض ملفاتهم الشخصية" ON public.profiles;

-- إنشاء سياسات جديدة بدون infinite recursion
CREATE POLICY "authenticated_users_can_view_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_update_profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_insert_profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- إنشاء storage bucket للإيصالات إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-receipts', 'payment-receipts', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- إنشاء سياسات storage للإيصالات
CREATE POLICY "anyone_can_upload_receipts"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "anyone_can_view_receipts"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-receipts');

CREATE POLICY "anyone_can_update_receipts"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'payment-receipts');