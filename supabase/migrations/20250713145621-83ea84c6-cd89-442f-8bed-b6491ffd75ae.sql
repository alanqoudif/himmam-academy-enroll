-- إنشاء حساب المدير الرئيسي
INSERT INTO public.profiles (
  user_id,
  full_name,
  phone,
  role,
  status,
  grade,
  subjects
) VALUES (
  gen_random_uuid(),
  'مدير النظام',
  '96871234567',
  'admin',
  'approved',
  NULL,
  '{}'
);

-- إنشاء بيانات اعتماد للمدير
INSERT INTO public.user_credentials (
  user_id,
  username,
  password_hash
) 
SELECT 
  user_id,
  'admin',
  'Admin123!'
FROM public.profiles 
WHERE role = 'admin' 
AND full_name = 'مدير النظام'
LIMIT 1;

-- إنشاء دالة للتحقق من دور المستخدم لتجنب infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- إعادة إنشاء RLS policies باستخدام الدالة الآمنة
DROP POLICY IF EXISTS "admin_can_insert_any_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_can_update_any_profile" ON public.profiles;

CREATE POLICY "admin_can_insert_any_profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() = 'admin'
  OR auth.uid() = user_id
);

CREATE POLICY "admin_can_update_any_profile" 
ON public.profiles 
FOR UPDATE 
USING (
  public.get_current_user_role() = 'admin'
  OR auth.uid() = user_id
);

-- تحديث policy لبيانات الاعتماد
DROP POLICY IF EXISTS "admin_can_create_credentials" ON public.user_credentials;

CREATE POLICY "admin_can_create_credentials" 
ON public.user_credentials 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() = 'admin'
  OR auth.uid() = user_id
);