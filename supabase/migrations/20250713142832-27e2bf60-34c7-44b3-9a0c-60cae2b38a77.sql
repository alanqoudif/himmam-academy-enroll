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

-- الإدمن يمكنه إدارة جميع بيانات الاعتماد
CREATE POLICY "الإدمن يمكنه إدارة جميع بيانات الاعتماد" 
ON public.user_credentials 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- تحديث جدول الدروس لإضافة نوع المحتوى
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'pdf', 'youtube_link')),
ADD COLUMN IF NOT EXISTS file_size_mb INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- إضافة trigger لتحديث الوقت
CREATE TRIGGER update_user_credentials_updated_at
BEFORE UPDATE ON public.user_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

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

-- دالة لإنشاء username تلقائياً
CREATE OR REPLACE FUNCTION public.generate_username(role_type TEXT, full_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_username TEXT;
  counter INTEGER := 1;
  final_username TEXT;
BEGIN
  -- إنشاء username أساسي
  IF role_type = 'teacher' THEN
    base_username := 'teacher' || LPAD(counter::TEXT, 3, '0');
  ELSE
    base_username := 'student' || LPAD(counter::TEXT, 3, '0');
  END IF;
  
  -- البحث عن username فريد
  WHILE EXISTS (SELECT 1 FROM public.user_credentials WHERE username = base_username) LOOP
    counter := counter + 1;
    IF role_type = 'teacher' THEN
      base_username := 'teacher' || LPAD(counter::TEXT, 3, '0');
    ELSE
      base_username := 'student' || LPAD(counter::TEXT, 3, '0');
    END IF;
  END LOOP;
  
  RETURN base_username;
END;
$$;