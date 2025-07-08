-- إنشاء جدول الطلاب المسجلين
CREATE TABLE public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  grade INTEGER NOT NULL,
  selected_subjects TEXT[] NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  receipt_url TEXT,
  bank_transfer_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  access_credentials TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول المواد والأسعار
CREATE TABLE public.subjects_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  price_per_subject DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject_name, grade)
);

-- إدراج المواد والأسعار
INSERT INTO public.subjects_pricing (subject_name, grade, price_per_subject) VALUES
-- الصف الخامس (5 ريال)
('الرياضيات', 5, 5.00),
('العلوم', 5, 5.00),
('اللغة العربية', 5, 5.00),
('اللغة الإنجليزية', 5, 5.00),

-- الصف السادس (5 ريال)
('الرياضيات', 6, 5.00),
('العلوم', 6, 5.00),
('اللغة العربية', 6, 5.00),
('اللغة الإنجليزية', 6, 5.00),

-- الصف السابع (5 ريال)
('الرياضيات', 7, 5.00),
('العلوم', 7, 5.00),
('اللغة العربية', 7, 5.00),
('اللغة الإنجليزية', 7, 5.00),

-- الصف الثامن (5 ريال)
('الرياضيات', 8, 5.00),
('العلوم', 8, 5.00),
('اللغة العربية', 8, 5.00),
('اللغة الإنجليزية', 8, 5.00),

-- الصف التاسع (5 ريال)
('الرياضيات', 9, 5.00),
('الأحياء', 9, 5.00),
('الفيزياء', 9, 5.00),
('الكيمياء', 9, 5.00),
('اللغة العربية', 9, 5.00),
('اللغة الإنجليزية', 9, 5.00),

-- الصف العاشر (10 ريال)
('الرياضيات', 10, 10.00),
('الأحياء', 10, 10.00),
('الفيزياء', 10, 10.00),
('الكيمياء', 10, 10.00),
('اللغة العربية', 10, 10.00),
('اللغة الإنجليزية', 10, 10.00),
('التربية الإسلامية', 10, 10.00),

-- الصف الحادي عشر (10 ريال)
('الرياضيات المتقدمة', 11, 10.00),
('الرياضيات الأساسية', 11, 10.00),
('الأحياء', 11, 10.00),
('الفيزياء', 11, 10.00),
('الكيمياء', 11, 10.00),
('العلوم البيئية', 11, 10.00),
('اللغة العربية', 11, 10.00),
('اللغة الإنجليزية', 11, 10.00),
('التربية الإسلامية', 11, 10.00),
('هذا وطني', 11, 10.00);

-- إنشاء جدول إعدادات بيانات التحويل البنكي
CREATE TABLE public.bank_transfer_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL DEFAULT 'بنك مصدر',
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  iban TEXT,
  swift_code TEXT,
  branch_name TEXT,
  additional_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إدراج بيانات التحويل الافتراضية
INSERT INTO public.bank_transfer_settings (account_number, account_name, iban, branch_name) VALUES
('1234567890', 'أكاديمية همم التعليمية', 'OM12MSDR1234567890123456', 'الفرع الرئيسي');

-- تفعيل RLS
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfer_settings ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول التسجيلات
CREATE POLICY "الجميع يمكنهم إنشاء تسجيلات جديدة"
ON public.student_enrollments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "الجميع يمكنهم عرض تسجيلاتهم"
ON public.student_enrollments
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "الأدمن يمكنه إدارة جميع التسجيلات"
ON public.student_enrollments
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- سياسات RLS لجدول المواد والأسعار
CREATE POLICY "الجميع يمكنهم عرض المواد والأسعار"
ON public.subjects_pricing
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "الأدمن يمكنه إدارة المواد والأسعار"
ON public.subjects_pricing
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- سياسات RLS لجدول بيانات التحويل
CREATE POLICY "الجميع يمكنهم عرض بيانات التحويل"
ON public.bank_transfer_settings
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "الأدمن يمكنه إدارة بيانات التحويل"
ON public.bank_transfer_settings
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_student_enrollments_updated_at
BEFORE UPDATE ON public.student_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_pricing_updated_at
BEFORE UPDATE ON public.subjects_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_transfer_settings_updated_at
BEFORE UPDATE ON public.bank_transfer_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();