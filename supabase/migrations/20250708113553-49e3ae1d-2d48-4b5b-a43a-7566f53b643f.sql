-- إنشاء جدول إعدادات الأدمن
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للأدمن
CREATE POLICY "admins_can_manage_settings" ON public.admin_settings
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- إضافة رقم الأدمن الافتراضي
INSERT INTO public.admin_settings (setting_key, setting_value) 
VALUES ('admin_phone', '96871234567') 
ON CONFLICT (setting_key) DO NOTHING;

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();