-- حذف السياسات الموجودة وإعادة إنشاؤها بشكل صحيح
DROP POLICY IF EXISTS "المعلمون يمكنهم رفع المواد التعلي" ON storage.objects;
DROP POLICY IF EXISTS "المعلمون يمكنهم عرض ملفاتهم" ON storage.objects;
DROP POLICY IF EXISTS "المعلمون يمكنهم تحديث ملفاتهم" ON storage.objects;
DROP POLICY IF EXISTS "المعلمون يمكنهم حذف ملفاتهم" ON storage.objects;
DROP POLICY IF EXISTS "الطلاب يمكنهم عرض المواد التعليمية" ON storage.objects;
DROP POLICY IF EXISTS "الإدمن يمكنه إدارة جميع الملفات" ON storage.objects;

-- إنشاء السياسات الجديدة
CREATE POLICY "teachers_can_upload_materials"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'teacher'
    AND profiles.status = 'approved'
  )
);

CREATE POLICY "teachers_can_view_materials"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('teacher', 'admin')
    AND profiles.status = 'approved'
  )
);

CREATE POLICY "teachers_can_update_materials"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('teacher', 'admin')
    AND profiles.status = 'approved'
  )
);

CREATE POLICY "teachers_can_delete_materials"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('teacher', 'admin')
    AND profiles.status = 'approved'
  )
);

CREATE POLICY "students_can_view_materials"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'student'
    AND profiles.status = 'approved'
  )
);