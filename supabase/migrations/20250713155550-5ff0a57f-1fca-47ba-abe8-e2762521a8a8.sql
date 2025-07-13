-- إصلاح سياسات RLS لجدول الدروس
DROP POLICY IF EXISTS "المعلمون يمكنهم إدارة دروسهم" ON public.lessons;

-- إنشاء سياسة جديدة للمعلمين لإضافة دروسهم
CREATE POLICY "teachers_can_insert_lessons"
ON public.lessons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'teacher'
    AND profiles.status = 'approved'
  )
);

-- السماح للمعلمين بعرض وتحديت دروسهم
CREATE POLICY "teachers_can_manage_own_lessons"
ON public.lessons
FOR ALL
USING (
  teacher_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- السماح للطلاب بعرض الدروس النشطة
CREATE POLICY "students_can_view_active_lessons"
ON public.lessons
FOR SELECT
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.status = 'approved'
  )
);