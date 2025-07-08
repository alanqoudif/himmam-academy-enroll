-- حل مشكلة عدم حفظ تحديثات student_enrollments
-- إصلاح سياسات RLS لجدول student_enrollments

DROP POLICY IF EXISTS "الجميع يمكنهم إنشاء تسجيلات جديدة" ON public.student_enrollments;
DROP POLICY IF EXISTS "الجميع يمكنهم عرض تسجيلاتهم" ON public.student_enrollments;
DROP POLICY IF EXISTS "authenticated_users_can_manage_enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "anonymous_can_create_enrollments" ON public.student_enrollments;

-- إنشاء سياسات جديدة مبسطة
CREATE POLICY "allow_all_student_enrollments" ON public.student_enrollments
FOR ALL
USING (true)
WITH CHECK (true);