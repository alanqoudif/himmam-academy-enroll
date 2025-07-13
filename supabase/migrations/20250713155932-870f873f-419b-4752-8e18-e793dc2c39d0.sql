-- حذف جميع السياسات الموجودة على storage.objects وإعادة إنشاؤها
DROP POLICY IF EXISTS "teachers_can_upload_materials" ON storage.objects;
DROP POLICY IF EXISTS "teachers_can_view_materials" ON storage.objects;
DROP POLICY IF EXISTS "teachers_can_update_materials" ON storage.objects;
DROP POLICY IF EXISTS "teachers_can_delete_materials" ON storage.objects;
DROP POLICY IF EXISTS "students_can_view_materials" ON storage.objects;

-- إنشاء دالة مساعدة للتحقق من دور المستخدم بناءً على user_id
CREATE OR REPLACE FUNCTION public.get_user_role_by_id(input_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = input_user_id 
  AND status = 'approved'
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'none');
END;
$$;

-- سياسة بسيطة للسماح لجميع المستخدمين المصدقين برفع الملفات في lesson-materials
CREATE POLICY "allow_authenticated_upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-materials'
);

-- السماح لجميع المستخدمين المصدقين بعرض الملفات
CREATE POLICY "allow_authenticated_select"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'lesson-materials'
);

-- السماح لجميع المستخدمين المصدقين بتحديث الملفات
CREATE POLICY "allow_authenticated_update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'lesson-materials'
);

-- السماح لجميع المستخدمين المصدقين بحذف الملفات
CREATE POLICY "allow_authenticated_delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'lesson-materials'
);