-- إضافة حقل الجنس لجدول student_enrollments
ALTER TABLE public.student_enrollments 
ADD COLUMN gender text DEFAULT 'male' CHECK (gender IN ('male', 'female'));

-- إنشاء جدول مجموعات الواتساب
CREATE TABLE public.whatsapp_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade integer NOT NULL,
  subject_name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  group_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(grade, subject_name, gender)
);

-- تفعيل RLS للجدول الجديد
ALTER TABLE public.whatsapp_groups ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بعرض المجموعات النشطة
CREATE POLICY "الجميع يمكنهم عرض المجموعات النشطة"
ON public.whatsapp_groups 
FOR SELECT 
USING (is_active = true);

-- سياسة للسماح للإدارة بإدارة المجموعات
CREATE POLICY "الإدارة يمكنها إدارة المجموعات"
ON public.whatsapp_groups 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- إدراج بيانات المجموعات
-- مجموعات الذكور (5-9)
INSERT INTO public.whatsapp_groups (grade, subject_name, gender, group_url) VALUES
-- الصف الخامس - ذكور
(5, 'الرياضيات', 'male', 'https://chat.whatsapp.com/BZhB042Dpoi6RdMcRRPJQZ'),
(5, 'اللغة الإنجليزية', 'male', 'https://chat.whatsapp.com/KJGY5dpIsLq95dwqX1YyLE'),
(5, 'العلوم', 'male', 'https://chat.whatsapp.com/DyN9FQFMTM2DyuqRYpF7Yt'),
(5, 'اللغة العربية', 'male', 'https://chat.whatsapp.com/CWvqADBpGmG4sePZgxpj83'),

-- الصف السادس - ذكور
(6, 'الرياضيات', 'male', 'https://chat.whatsapp.com/JLQP37BWVCGAa73IqpJLtk'),
(6, 'اللغة الإنجليزية', 'male', 'https://chat.whatsapp.com/LT4IkcBt3WkK09EVHplqLx'),
(6, 'العلوم', 'male', 'https://chat.whatsapp.com/G9evnpXhrcX4UyTzhawCaM'),
(6, 'اللغة العربية', 'male', 'https://chat.whatsapp.com/CeO70wsryDv7wpkabNhOzg'),

-- الصف السابع - ذكور
(7, 'الرياضيات', 'male', 'https://chat.whatsapp.com/KQPGJW5frktGhrFSOJNJF5'),
(7, 'اللغة الإنجليزية', 'male', 'https://chat.whatsapp.com/IlD1AqWXWWC8XfhOgra1XP'),
(7, 'العلوم', 'male', 'https://chat.whatsapp.com/K6CsPKYHWH1FpsoyEMkusw'),
(7, 'اللغة العربية', 'male', 'https://chat.whatsapp.com/IhtaItt86ZaF2M1pYAE8Kb'),

-- الصف الثامن - ذكور
(8, 'الرياضيات', 'male', 'https://chat.whatsapp.com/DcoUhL8IKK59xsH7H2wLBI'),
(8, 'اللغة الإنجليزية', 'male', 'https://chat.whatsapp.com/BuVW6jk15Fj97mHBQcmQ5t'),
(8, 'العلوم', 'male', 'https://chat.whatsapp.com/I2Kb4zxKc4mBm1eBCEQ24t'),
(8, 'اللغة العربية', 'male', 'https://chat.whatsapp.com/EBtVRDOFKlEFlPShv7MppP'),

-- الصف التاسع - ذكور
(9, 'الرياضيات', 'male', 'https://chat.whatsapp.com/DIsNhyUM2TKKbBRrmAvjVY'),
(9, 'اللغة الإنجليزية', 'male', 'https://chat.whatsapp.com/Je7XJtD1xN0FOs86btLHCl'),
(9, 'الفيزياء', 'male', 'https://chat.whatsapp.com/LSvkuFQDEFLCPpHODZ8Zs0'),
(9, 'الكيمياء', 'male', 'https://chat.whatsapp.com/DyEgDSGDVrkBj0Ckg6QXJe'),
(9, 'الأحياء', 'male', 'https://chat.whatsapp.com/EFRqArK9KfXG4kddkkSfVg'),
(9, 'اللغة العربية', 'male', 'https://chat.whatsapp.com/G0YwVnipPqO0yBfGWoS2Vr'),

-- مجموعات الإناث (5-9)
-- الصف الخامس - إناث
(5, 'الرياضيات', 'female', 'https://chat.whatsapp.com/HUz5xYGSWtTLXVHKzNrjH5'),
(5, 'اللغة الإنجليزية', 'female', 'https://chat.whatsapp.com/CAkQmQDPnziIZnvaCTReaw'),
(5, 'العلوم', 'female', 'https://chat.whatsapp.com/ItUiFEVzqwzJ0OyMw5OrcA'),
(5, 'اللغة العربية', 'female', 'https://chat.whatsapp.com/Hmmpwjutnm26f3TfFeyQvH'),

-- الصف السادس - إناث
(6, 'الرياضيات', 'female', 'https://chat.whatsapp.com/E1NjXnfkvMS9v4GlJZ6nk8'),
(6, 'اللغة الإنجليزية', 'female', 'https://chat.whatsapp.com/HN29mhnlhUqIFOMVjrBw0o'),
(6, 'العلوم', 'female', 'https://chat.whatsapp.com/JSBbmcsyZuTJp1UDBnB0pz'),
(6, 'اللغة العربية', 'female', 'https://chat.whatsapp.com/EXNsw8bbtOF4ov1127pxdR'),

-- الصف السابع - إناث
(7, 'الرياضيات', 'female', 'https://chat.whatsapp.com/BuyhKsk7epBDXSCeZ1VILX'),
(7, 'اللغة الإنجليزية', 'female', 'https://chat.whatsapp.com/CJspl6iUGSc3n4n7HHKnHv'),
(7, 'العلوم', 'female', 'https://chat.whatsapp.com/FRoPeNG3aLA1LKVurr8XCE'),
(7, 'اللغة العربية', 'female', 'https://chat.whatsapp.com/LBOSqwLGFIe9L96epAPiRw'),

-- الصف الثامن - إناث
(8, 'الرياضيات', 'female', 'https://chat.whatsapp.com/J4k4yyz4SiIBXdaQGcvixi'),
(8, 'اللغة الإنجليزية', 'female', 'https://chat.whatsapp.com/BLiKK7R4GKjKzOeaLziS2P'),
(8, 'العلوم', 'female', 'https://chat.whatsapp.com/IXDoHoVaiyWLwZR9e3kUGe'),
(8, 'اللغة العربية', 'female', 'https://chat.whatsapp.com/HGnN420AciN4aiDkRJ2ou9'),

-- الصف التاسع - إناث
(9, 'الرياضيات', 'female', 'https://chat.whatsapp.com/KxqwJO8mQckAl7UpSMh3zv'),
(9, 'اللغة الإنجليزية', 'female', 'https://chat.whatsapp.com/FYs6VmmNLZ2K06Xs80EECl'),
(9, 'الكيمياء', 'female', 'https://chat.whatsapp.com/DL4gjOdHXVxJWB4ZV3dqPR'),
(9, 'الأحياء', 'female', 'https://chat.whatsapp.com/FLamcCqjV5uAEiGFmDAcqM'),
(9, 'الفيزياء', 'female', 'https://chat.whatsapp.com/HN91ZWFwJfV8L5bO4yHtYC'),
(9, 'اللغة العربية', 'female', 'https://chat.whatsapp.com/DnjKeh3JxMt9O5A6fcsCoY'),

-- مجموعات الصف الثاني عشر - ذكور
(12, 'الرياضيات المتقدمة', 'male', 'https://chat.whatsapp.com/G65gmJqVjAHK6ZT4Yu19fB'),
(12, 'الرياضيات الأساسية', 'male', 'https://chat.whatsapp.com/Bpcc4O9GJ7GFQTL26AxVvf'),
(12, 'الفيزياء', 'male', 'https://chat.whatsapp.com/LLg5jKxkuFNEqd9yTppCIf'),
(12, 'الكيمياء', 'male', 'https://chat.whatsapp.com/C64splzBe1209nHcETjYb5'),
(12, 'الأحياء', 'male', 'https://chat.whatsapp.com/Ho2INuuybE5AmtxVPNT3Ah'),
(12, 'اللغة العربية', 'male', 'https://chat.whatsapp.com/FsxGikTE4wNGtJ75zW4MoE'),
(12, 'اللغة الإنجليزية', 'male', 'https://chat.whatsapp.com/Kr6N5GsUZ3E2AxT37E6Hqi'),
(12, 'التاريخ', 'male', 'https://chat.whatsapp.com/D7twlmLoKkbGolmNyyivtv'),
(12, 'الجغرافيا', 'male', 'https://chat.whatsapp.com/EhG8dOpxBAPJTZGetE3lQw'),
(12, 'التربية الإسلامية', 'male', 'https://chat.whatsapp.com/JuMoJGRiRJdBmoJ3kmjb7Z'),
(12, 'هذا وطني', 'male', 'https://chat.whatsapp.com/CVSiBCubAQP3GLsokU1mGH'),

-- مجموعات الصف الثاني عشر - إناث
(12, 'الرياضيات المتقدمة', 'female', 'https://chat.whatsapp.com/JltKJk2SksZEz9aUFM7Oq6'),
(12, 'الرياضيات الأساسية', 'female', 'https://chat.whatsapp.com/B96qCYi5v5L0nj4RvX8A1v'),
(12, 'الفيزياء', 'female', 'https://chat.whatsapp.com/EQP6PdEUvMACzONoHS7KbV'),
(12, 'الكيمياء', 'female', 'https://chat.whatsapp.com/Dl7G9Ech4cNDZgw0dD0X6r'),
(12, 'الأحياء', 'female', 'https://chat.whatsapp.com/Bi6MZaPphT0AsObIv4z57t'),
(12, 'اللغة العربية', 'female', 'https://chat.whatsapp.com/DvaPNN4KqvN8kMceZXIF4Z'),
(12, 'اللغة الإنجليزية', 'female', 'https://chat.whatsapp.com/LLNqoooODec67q09lTTVen'),
(12, 'التاريخ', 'female', 'https://chat.whatsapp.com/Gluv8usYiGx5KgNkkR5MP3'),
(12, 'الجغرافيا', 'female', 'https://chat.whatsapp.com/GLqsukuFY88Grq5qYscbWS'),
(12, 'التربية الإسلامية', 'female', 'https://chat.whatsapp.com/Drc0IH2413j0GFPAbYBBBi'),
(12, 'هذا وطني', 'female', 'https://chat.whatsapp.com/BEMYMC4T5kk0022VTci96V');

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_whatsapp_groups_updated_at
BEFORE UPDATE ON public.whatsapp_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();