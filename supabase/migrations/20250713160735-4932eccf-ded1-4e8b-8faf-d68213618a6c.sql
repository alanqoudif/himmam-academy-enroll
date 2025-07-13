-- إزالة قيود المفاتيح الخارجية المعطلة لجدول الدروس
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_teacher_id_fkey;

-- عدم إنشاء foreign key جديد - الاعتماد على التحقق في التطبيق
-- بما أن النظام يستخدم مصادقة مخصوصة وليس Supabase Auth المعياري

-- التأكد من أن جدول الدروس يعمل بدون قيود foreign key
ALTER TABLE public.lessons ALTER COLUMN teacher_id SET NOT NULL;