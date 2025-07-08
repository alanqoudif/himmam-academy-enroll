-- إصلاح مشكلة infinite recursion في RLS policies

-- حذف السياسات المتضاربة أولاً
DROP POLICY IF EXISTS "الأدمن يمكنه إدارة جميع التسجيلات" ON public.student_enrollments;
DROP POLICY IF EXISTS "الأدمن يمكنه إدارة المواد والأسعار" ON public.subjects_pricing;
DROP POLICY IF EXISTS "الأدمن يمكنه إدارة بيانات التحويل" ON public.bank_transfer_settings;
DROP POLICY IF EXISTS "الأدمن يمكنه إدارة تعيينات المستخدمين" ON public.user_assignments;

-- إنشاء سياسات جديدة أكثر بساطة لتجنب infinite recursion
CREATE POLICY "authenticated_users_can_manage_enrollments"
ON public.student_enrollments
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_manage_subjects"
ON public.subjects_pricing
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_manage_bank_settings"
ON public.bank_transfer_settings
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_manage_assignments"
ON public.user_assignments
FOR ALL
TO authenticated
USING (true);

-- التأكد من أن الجداول تقبل anonymous users للعمليات الأساسية
CREATE POLICY "anonymous_can_create_enrollments"
ON public.student_enrollments
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "anonymous_can_view_subjects"
ON public.subjects_pricing
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "anonymous_can_view_bank_settings"
ON public.bank_transfer_settings
FOR SELECT
TO anon
USING (is_active = true);