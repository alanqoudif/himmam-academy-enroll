-- إصلاح نهائي لسياسات admin_settings
ALTER TABLE public.admin_settings DISABLE ROW LEVEL SECURITY;

-- إعادة تمكين RLS مع سياسة مبسطة
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "allow_anon_access_admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "admins_can_manage_settings" ON public.admin_settings;

-- إنشاء سياسة مبسطة تسمح بكل العمليات
CREATE POLICY "allow_all_admin_settings" ON public.admin_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- التأكد من وجود الرقم الافتراضي
INSERT INTO public.admin_settings (setting_key, setting_value) 
VALUES ('admin_phone', '96871234567') 
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;