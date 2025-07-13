-- إصلاح دالة التحقق من بيانات الاعتماد لتعمل مع النصوص البسيطة مؤقتاً
CREATE OR REPLACE FUNCTION public.verify_user_credentials(input_username text, input_password text)
RETURNS TABLE(user_id uuid, profile_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.user_id,
    json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'phone', p.phone,
      'role', p.role,
      'status', p.status,
      'grade', p.grade,
      'subjects', p.subjects
    )::jsonb as profile_data
  FROM public.user_credentials uc
  JOIN public.profiles p ON p.user_id = uc.user_id
  WHERE uc.username = input_username
    AND uc.password_hash = input_password  -- مقارنة مباشرة مؤقتاً
    AND p.status = 'approved';
END;
$$;