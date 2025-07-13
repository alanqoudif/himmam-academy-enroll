-- التأكد من وجود bucket الـ lesson-materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-materials', 'lesson-materials', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  name = 'lesson-materials';

-- التأكد من أن bucket الإيصالات موجود أيضاً
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  name = 'payment-receipts';