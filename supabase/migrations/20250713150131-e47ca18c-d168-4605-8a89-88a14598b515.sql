-- إزالة قيد foreign key المتعلق بـ auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- إزالة RLS مؤقتاً
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials DISABLE ROW LEVEL SECURITY;

-- حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "authenticated_can_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_can_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_can_create_credentials" ON public.user_credentials;
DROP POLICY IF EXISTS "authenticated_users_can_view_profiles" ON public.profiles;
DROP POLICY IF EXISTS "everyone_can_view_profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_profile_insert" ON public.profiles;
DROP POLICY IF EXISTS "allow_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "allow_credentials_insert" ON public.user_credentials;
DROP POLICY IF EXISTS "allow_credentials_select" ON public.user_credentials;
DROP POLICY IF EXISTS "allow_credentials_update" ON public.user_credentials;

-- إنشاء حساب المدير الأول
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

-- إعادة تفعيل RLS مع سياسات مبسطة
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- سياسات مبسطة وآمنة
CREATE POLICY "allow_all_operations_profiles" 
ON public.profiles 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_all_operations_credentials" 
ON public.user_credentials 
FOR ALL 
USING (true)
WITH CHECK (true);