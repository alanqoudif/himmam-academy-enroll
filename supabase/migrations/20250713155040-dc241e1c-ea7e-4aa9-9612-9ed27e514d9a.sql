-- إنشاء سياسات Storage للمعلمين لرفع المواد التعليمية

-- السماح للمعلمين بعرض ملفاتهم
CREATE POLICY "المعلمون يمكنهم عرض ملفاتهم"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'teacher'
    AND profiles.status = 'approved'
  )
);

-- السماح للمعلمين برفع الملفات
CREATE POLICY "المعلمون يمكنهم رفع المواد التعليمية"
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

-- السماح للمعلمين بتحديث ملفاتهم
CREATE POLICY "المعلمون يمكنهم تحديث ملفاتهم"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'teacher'
    AND profiles.status = 'approved'
  )
);

-- السماح للمعلمين بحذف ملفاتهم
CREATE POLICY "المعلمون يمكنهم حذف ملفاتهم"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'teacher'
    AND profiles.status = 'approved'
  )
);

-- السماح للطلاب المعتمدين بعرض المواد التعليمية
CREATE POLICY "الطلاب يمكنهم عرض المواد التعليمية"
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

-- السماح للإدمن بإدارة جميع الملفات
CREATE POLICY "الإدمن يمكنه إدارة جميع الملفات"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'lesson-materials' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);