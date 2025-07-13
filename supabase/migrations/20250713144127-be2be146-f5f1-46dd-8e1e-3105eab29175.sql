-- إصلاح مشكلة Row Level Security للسماح للإدمن بإضافة معلمين
DROP POLICY IF EXISTS "authenticated_users_can_insert_profiles" ON public.profiles;

CREATE POLICY "allow_admin_insert_profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- السماح للإدمن بإضافة معلمين وطلاب
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
  OR
  -- السماح للمستخدمين بإنشاء ملفاتهم الشخصية (للتسجيل العادي)
  auth.uid() = NEW.user_id
);

-- تحديث سياسة التحديث أيضاً
DROP POLICY IF EXISTS "authenticated_users_can_update_profiles" ON public.profiles;

CREATE POLICY "allow_admin_update_profiles" 
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