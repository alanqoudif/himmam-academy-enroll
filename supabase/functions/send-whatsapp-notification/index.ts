import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  group_id: string;
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
    const { message, recipient_type, student_name, admin_group_id } = await req.json()
    
    const instance_id = Deno.env.get('WHATSAPP_INSTANCE_ID')
    const access_token = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const student_group_id = Deno.env.get('WHATSAPP_STUDENT_GROUP_ID')
    const admin_group_id_env = Deno.env.get('WHATSAPP_ADMIN_GROUP_ID')

    if (!instance_id || !access_token) {
      throw new Error('Missing WhatsApp API credentials')
    }

    let target_group_id = '';
    let full_message = '';

    if (recipient_type === 'student') {
      target_group_id = student_group_id || '';
      full_message = `مرحباً ${student_name || ''}،\n\n${message}`;
    } else if (recipient_type === 'admin') {
      target_group_id = admin_group_id || admin_group_id_env || '';
      full_message = message;
    }

    if (!target_group_id) {
      console.warn('No group ID found for recipient type:', recipient_type)
      return new Response(
        JSON.stringify({ success: false, error: 'No group ID configured' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const whatsappPayload: WhatsAppMessage = {
      group_id: target_group_id,
      type: "text",
      message: full_message,
      instance_id: instance_id,
      access_token: access_token
    }

    console.log('Sending WhatsApp message:', whatsappPayload)

    const response = await fetch('https://automapi.com/api/send_group', {
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