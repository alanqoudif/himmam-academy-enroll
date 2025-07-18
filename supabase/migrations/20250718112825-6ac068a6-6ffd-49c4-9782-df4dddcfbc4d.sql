-- تحديث أسعار المواد حسب الصفوف

-- تحديث أسعار الصف 12 إلى 25 ريال
UPDATE public.subjects_pricing 
SET price_per_subject = 25, updated_at = now() 
WHERE grade = 12;

-- تحديث أسعار الصفوف 10-11 إلى 25 ريال
UPDATE public.subjects_pricing 
SET price_per_subject = 25, updated_at = now() 
WHERE grade IN (10, 11);

-- تحديث أسعار الصفوف 5-9 إلى 15 ريال
UPDATE public.subjects_pricing 
SET price_per_subject = 15, updated_at = now() 
WHERE grade IN (5, 6, 7, 8, 9);