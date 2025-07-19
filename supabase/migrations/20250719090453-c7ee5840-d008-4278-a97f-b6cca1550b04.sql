-- تصحيح أسعار الجغرافية والتاريخ للصفين 11 و 12 إلى 25 ريال

UPDATE public.subjects_pricing 
SET price_per_subject = 25, updated_at = now() 
WHERE subject_name IN ('الجغرافية', 'التاريخ') 
AND grade IN (11, 12);