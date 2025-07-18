import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface WhatsAppMessage {
  number: string;
  type: string;
  message: string;
  instance_id: string;
  access_token: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, recipient_type, student_name, phone_number, admin_phone, grade, subjects, gender } = await req.json()
    
    console.log('Received request:', { message, recipient_type, student_name, phone_number, admin_phone, grade, subjects, gender });
    
    // استخدام البيانات مباشرة كما طلبت
    const instance_id = "6848073DE839C"
    const access_token = "660f1622e1665"
    const admin_phone_number = admin_phone || "84933313xxx" // رقم الأدمن الافتراضي

    let target_phone = '';
    let full_message = '';

    // جلب روابط مجموعات الواتساب إذا كانت الرسالة للطالب وتتضمن بيانات المواد
    let whatsappGroups = '';
    if (recipient_type === 'student' && grade && subjects && gender) {
      try {
        console.log('Fetching WhatsApp groups for:', { grade, gender, subjects });
        
        const { data: groups, error } = await supabase
          .from('whatsapp_groups')
          .select('subject_name, group_url')
          .eq('grade', grade)
          .eq('gender', gender)
          .in('subject_name', subjects)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching WhatsApp groups:', error);
        } else if (groups && groups.length > 0) {
          whatsappGroups = '\n\n📱 روابط مجموعات الواتساب:\n';
          groups.forEach(group => {
            whatsappGroups += `\n${group.subject_name}:\n${group.group_url}\n`;
          });
        }
      } catch (groupError) {
        console.error('Error in fetching groups:', groupError);
      }
    }

    // دالة لتنسيق رقم الهاتف (إضافة 968 إذا لم يكن موجوداً)
    const formatPhoneNumber = (phone: string) => {
      if (!phone) return '';
      
      // إزالة المسافات والرموز غير الضرورية
      const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
      
      // إذا كان الرقم يبدأ بـ 968 فلا نضيف شيء
      if (cleanPhone.startsWith('968')) {
        return cleanPhone;
      }
      
      // إذا كان الرقم يبدأ بـ 8 أو 9 ولا يحتوي على 968 في البداية، نضيف 968
      if (cleanPhone.startsWith('8') || cleanPhone.startsWith('9')) {
        return '968' + cleanPhone;
      }
      
      // إذا كان الرقم لا يبدأ بـ 968 أو 8 أو 9، نضيف 968 مباشرة
      return '968' + cleanPhone;
    };

    if (recipient_type === 'student') {
      target_phone = formatPhoneNumber(phone_number);
      const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'https://platform-url.com'}/login`;
      
      // تحسين الرسالة مع رابط تسجيل الدخول المباشر وشرح مفصل
      full_message = `مرحباً ${student_name || ''}،\n\n${message}\n\n🔗 رابط تسجيل الدخول المباشر:\n${loginUrl}\n\n📋 طريقة تسجيل الدخول:\n\n1️⃣ اضغط على الرابط أعلاه للانتقال مباشرة لصفحة تسجيل الدخول\n\n2️⃣ ستجد خانتين في الصفحة:\n   • خانة "اسم المستخدم" - ادخل فيها اسم المستخدم المرسل لك\n   • خانة "كلمة المرور" - ادخل فيها كلمة المرور المرسلة لك\n\n3️⃣ اضغط على زر "تسجيل الدخول"\n\n4️⃣ بعد تسجيل الدخول ستتمكن من:\n   • مشاهدة دروسك\n   • الوصول لجميع المواد المسجل فيها\n   • متابعة تقدمك الدراسي\n\n⚠️ مهم: من أجل الأمان، يُنصح بتغيير كلمة المرور بعد أول تسجيل دخول${whatsappGroups}`;
    } else if (recipient_type === 'admin') {
      target_phone = formatPhoneNumber(admin_phone_number);
      full_message = message;
    } else if (recipient_type === 'teacher') {
      target_phone = formatPhoneNumber(phone_number);
      full_message = `مرحباً ${student_name || ''}،\n\n${message}`;
    }

    console.log('Target phone after processing:', target_phone);

    if (!target_phone) {
      console.warn('No phone number provided for recipient type:', recipient_type)
      return new Response(
        JSON.stringify({ success: false, error: 'No phone number provided' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Final message to send:', full_message);

    const whatsappPayload: WhatsAppMessage = {
      number: target_phone,
      type: "text",
      message: full_message,
      instance_id: instance_id,
      access_token: access_token
    }

    console.log('Sending WhatsApp message:', { 
      number: target_phone, 
      message_length: full_message.length,
      instance_id,
      access_token: access_token.substring(0, 6) + '...' 
    })

    const response = await fetch('https://automapi.com/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappPayload)
    })

    const result = await response.json()
    console.log('WhatsApp API response:', result)

    return new Response(
      JSON.stringify({ success: true, result }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})