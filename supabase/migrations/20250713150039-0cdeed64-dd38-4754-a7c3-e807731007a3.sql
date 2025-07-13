-- إزالة RLS مؤقتاً لإنشاء حساب المدير الأول
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials DISABLE ROW LEVEL SECURITY;

-- حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "authenticated_can_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_can_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_can_create_credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "authenticated_users_can_view_profiles" ON public.profiles;

-- إنشاء حساب المدير الأول مباشرة
DO $$
DECLARE
    admin_user_id UUID;
    existing_admin_count INTEGER;
BEGIN
    -- التحقق من عدم وجود مدير بالفعل
    SELECT COUNT(*) INTO existing_admin_count 
    FROM public.profiles 
    WHERE role = 'admin';
    
    -- إنشاء المدير فقط إذا لم يكن موجوداً
    IF existing_admin_count = 0 THEN
        admin_user_id := gen_random_uuid();
        
        -- إنشاء ملف المدير
        INSERT INTO public.profiles (
            user_id,
            full_name,
            phone,
            role,
            status,
            grade,
            subjects
        ) VALUES (
            admin_user_id,
            'مدير النظام',
            '96871234567',
            'admin',
            'approved',
            NULL,
            '{}'
        );
        
        -- إنشاء بيانات اعتماد المدير
        INSERT INTO public.user_credentials (
            user_id,
            username,
            password_hash
        ) VALUES (
            admin_user_id,
            'admin',
            'Admin123!'
        );
        
        RAISE NOTICE 'تم إنشاء حساب المدير بنجاح';
    ELSE
        RAISE NOTICE 'حساب المدير موجود بالفعل';
    END IF;
END $$;

-- إعادة تفعيل RLS مع سياسات محسنة
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- سياسات محسنة للعرض
CREATE POLICY "everyone_can_view_profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- سياسة للإدراج - تسمح للجميع (لأن التحقق يتم في التطبيق)
CREATE POLICY "allow_profile_insert" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- سياسة للتحديث - تسمح للجميع (لأن التحقق يتم في التطبيق)
CREATE POLICY "allow_profile_update" 
ON public.profiles 
FOR UPDATE 
USING (true);

-- سياسات بيانات الاعتماد
CREATE POLICY "allow_credentials_insert" 
ON public.user_credentials 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "allow_credentials_select" 
ON public.user_credentials 
FOR SELECT 
USING (true);

CREATE POLICY "allow_credentials_update" 
ON public.user_credentials 
FOR UPDATE 
USING (true);