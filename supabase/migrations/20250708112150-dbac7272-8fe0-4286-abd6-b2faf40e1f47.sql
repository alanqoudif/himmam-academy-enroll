-- إضافة بعض البيانات التجريبية لاختبار النظام
INSERT INTO public.student_enrollments (
  full_name, 
  email, 
  phone, 
  grade, 
  selected_subjects, 
  total_amount, 
  status,
  created_at
) VALUES 
(
  'فيصل العماني', 
  'faisal@gmail.com', 
  '96871234567', 
  11, 
  ARRAY['اللغة العربية', 'اللغة الإنجليزية', 'التربية الإسلامية', 'هذا وطني'], 
  40.00, 
  'pending',
  now()
),
(
  'سارة المحمدي', 
  'sara@gmail.com', 
  '96871234568', 
  10, 
  ARRAY['الرياضيات', 'الفيزياء', 'الكيمياء'], 
  30.00, 
  'approved',
  now() - interval '1 day'
),
(
  'أحمد السعيدي', 
  'ahmed@gmail.com', 
  '96871234569', 
  9, 
  ARRAY['الرياضيات', 'العلوم'], 
  10.00, 
  'rejected',
  now() - interval '2 days'
) ON CONFLICT DO NOTHING;