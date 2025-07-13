-- حذف السياسات الحالية وإعادة إنشاؤها بشكل صحيح
DROP POLICY IF EXISTS "allow_admin_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_update_profiles" ON public.profiles;

-- إنشاء سياسة جديدة للإدراج تسمح للإدمن بإضافة أي مستخدم
CREATE POLICY "admin_can_insert_any_profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- السماح للإدمن بإضافة أي مستخدم
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
  OR
  -- السماح للمستخدمين بإنشاء ملفاتهم الشخصية فقط
  auth.uid() = user_id
);

-- إنشاء سياسة جديدة للتحديث
CREATE POLICY "admin_can_update_any_profile" 
ON public.profiles 
FOR UPDATE 
USING (
  -- الإدمن يمكنه تحديث جميع الملفات
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
  OR
  -- المستخدمون يمكنهم تحديث ملفاتهم فقط
  auth.uid() = user_id
);

-- تحديث سياسة بيانات الاعتماد للسماح للإدمن بإنشائها
DROP POLICY IF EXISTS "إنشاء بيانات الاعتماد للمستخدمين" ON public.user_credentials;

CREATE POLICY "admin_can_create_credentials" 
ON public.user_credentials 
FOR INSERT 
WITH CHECK (
  -- السماح للإدمن بإنشاء بيانات اعتماد لأي مستخدم
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
  OR
  -- السماح للمستخدمين بإنشاء بياناتهم فقط
  auth.uid() = user_id
);