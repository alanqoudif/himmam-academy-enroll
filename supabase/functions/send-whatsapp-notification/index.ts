import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const { message, recipient_type, student_name, phone_number, admin_phone } = await req.json()
    
    console.log('Received request:', { message, recipient_type, student_name, phone_number, admin_phone });
    
    // استخدام البيانات مباشرة كما طلبت
    const instance_id = "6848073DE839C"
    const access_token = "660f1622e1665"
    const admin_phone_number = admin_phone || "84933313xxx" // رقم الأدمن الافتراضي

    let target_phone = '';
    let full_message = '';

    if (recipient_type === 'student') {
      target_phone = phone_number || '';
      // إزالة علامة + من الرقم إن وجدت
      target_phone = target_phone.replace(/^\+/, '');
      full_message = `مرحباً ${student_name || ''}،\n\n${message}`;
    } else if (recipient_type === 'admin') {
      target_phone = admin_phone_number;
      // إزالة علامة + من الرقم إن وجدت
      target_phone = target_phone.replace(/^\+/, '');
      full_message = message;
    } else if (recipient_type === 'teacher') {
      target_phone = phone_number || '';
      // إزالة علامة + من الرقم إن وجدت
      target_phone = target_phone.replace(/^\+/, '');
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