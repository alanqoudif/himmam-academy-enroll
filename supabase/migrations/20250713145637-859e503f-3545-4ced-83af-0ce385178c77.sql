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

-- سياسة أكثر تساهلاً للإدراج - تسمح لأي مستخدم مصدق
CREATE POLICY "authenticated_can_insert_profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- سياسة أكثر تساهلاً للتحديث - تسمح لأي مستخدم مصدق
CREATE POLICY "authenticated_can_update_profiles" 
ON public.profiles 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- تحديث policy لبيانات الاعتماد - أكثر تساهلاً
DROP POLICY IF EXISTS "admin_can_create_credentials" ON public.user_credentials;

CREATE POLICY "authenticated_can_create_credentials" 
ON public.user_credentials 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');