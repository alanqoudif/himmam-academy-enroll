-- تحديث بيانات التحويل البنكي
UPDATE public.bank_transfer_settings 
SET 
  bank_name = 'بنك مسقط',
  account_number = '0363001509080044',
  account_name = 'سلطان سعيد الشيدي',
  branch_name = 'الفرع الرئيسي',
  iban = NULL,
  swift_code = NULL,
  additional_info = 'يرجى التأكد من كتابة رقم الحساب بشكل صحيح عند التحويل',
  updated_at = now()
WHERE is_active = true;