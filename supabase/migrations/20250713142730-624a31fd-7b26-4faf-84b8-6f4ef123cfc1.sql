-- إضافة جدول بيانات اعتماد المستخدمين للدخول
CREATE TABLE public.user_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إضافة فهرس للبحث السريع
CREATE INDEX idx_user_credentials_username ON public.user_credentials(username);

-- تفعيل RLS
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- سياسات الحماية - المستخدم يمكنه رؤية بياناته فقط
CREATE POLICY "المستخدمون يمكنهم عرض بياناتهم فقط" 
ON public.user_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث بياناتهم فقط" 
ON public.user_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "إنشاء بيانات الاعتماد للمستخدمين الجدد" 
ON public.user_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- تحديث جدول الدروس لإضافة نوع المحتوى
ALTER TABLE public.lessons 
ADD COLUMN content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'pdf', 'youtube_link')),
ADD COLUMN file_size_mb INTEGER DEFAULT 0,
ADD COLUMN thumbnail_url TEXT;

-- إضافة trigger لتحديث الوقت
CREATE TRIGGER update_user_credentials_updated_at
BEFORE UPDATE ON public.user_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة بيانات تجريبية للمعلم
INSERT INTO public.profiles (user_id, full_name, phone, role, status, grade, subjects)
VALUES (
  gen_random_uuid(),
  'أحمد محمد - معلم الرياضيات',
  '+966501234567',
  'teacher',
  'approved',
  10,
  ARRAY['الرياضيات', 'الفيزياء']
);

-- إضافة بيانات تجريبية للطالب
INSERT INTO public.profiles (user_id, full_name, phone, role, status, grade, subjects)
VALUES (
  gen_random_uuid(),
  'سارة أحمد - طالبة',
  '+966507654321',
  'student',
  'approved',
  10,
  ARRAY['الرياضيات', 'الأحياء']
);

-- إضافة بيانات اعتماد تجريبية للمعلم
INSERT INTO public.user_credentials (user_id, username, password_hash)
SELECT 
  p.user_id,
  'teacher001',
  crypt('Teacher123!', gen_salt('bf'))
FROM public.profiles p 
WHERE p.full_name LIKE 'أحمد محمد%' 
LIMIT 1;

-- إضافة بيانات اعتماد تجريبية للطالب
INSERT INTO public.user_credentials (user_id, username, password_hash)
SELECT 
  p.user_id,
  'student001',
  crypt('Student123!', gen_salt('bf'))
FROM public.profiles p 
WHERE p.full_name LIKE 'سارة أحمد%' 
LIMIT 1;

-- دالة للتحقق من بيانات الاعتماد
CREATE OR REPLACE FUNCTION public.verify_user_credentials(
  input_username TEXT,
  input_password TEXT
)
RETURNS TABLE (
  user_id UUID,
  profile_data JSONB
) 
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
    AND uc.password_hash = crypt(input_password, uc.password_hash)
    AND p.status = 'approved';
END;
$$;