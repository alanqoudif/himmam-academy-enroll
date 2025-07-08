-- إصلاح سياسات الأمان لجدول admin_settings
DROP POLICY IF EXISTS "admins_can_manage_settings" ON public.admin_settings;

-- إنشاء سياسة جديدة تسمح للـ anon role بالوصول
CREATE POLICY "allow_anon_access_admin_settings" ON public.admin_settings
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);