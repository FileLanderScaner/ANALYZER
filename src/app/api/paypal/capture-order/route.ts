import { NextResponse } from 'next/server';
import { PayPalClient, OrdersCaptureRequest } from '@paypal/checkout-server-sdk';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// Configura el cliente de PayPal usando la nueva SDK
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_ID y/o PAYPAL_CLIENT_SECRET no configurados.');
  }

  return new PayPalClient({
    clientId,
    clientSecret,
    environment: baseUrl.includes('sandbox') ? 'sandbox' : 'live',
  });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabaseUserClient = createServerSupabaseClient(); // Call without arguments
  
  const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseAdminUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({
      error: 'Configuración de Supabase incompleta',
    }, { status: 500 });
  }

  const supabaseAdminClient = createAdminSupabaseClient<Database>(
    supabaseAdminUrl,
    supabaseServiceRoleKey
  );

  try {
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const { orderID } = body;

    if (!orderID) {
      return NextResponse.json({ error: 'Falta orderID de PayPal.' }, { status: 400 });
    }

    const paypalClient = getPayPalClient();
    const captureRequest = new OrdersCaptureRequest(orderID);
    const captureResponse = await paypalClient.execute(captureRequest);

    const paymentDetails = captureResponse.result;

    if (!paymentDetails || paymentDetails.status !== 'COMPLETED') {
      return NextResponse.json({
        error: `No se pudo capturar el pago. Estado: ${paymentDetails?.status || 'desconocido'}`,
      }, { status: 400 });
    }

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

    const { data: updateData, error: updateError } = await supabaseAdminClient
      .from('user_profiles')
      .update({
        subscription_status: 'active_premium',
        current_period_end: subscriptionEndDate.toISOString(),
        paypal_order_id: paymentDetails.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({
        message: 'Pago capturado, pero error al actualizar perfil.',
        error: updateError.message,
        paypalOrderId: paymentDetails.id
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Pago capturado y perfil actualizado.',
      orderID: paymentDetails.id,
      profileUpdate: updateData
    });

  } catch (error: any) {
    const isAlreadyCaptured = error?.message?.includes('ORDER_ALREADY_CAPTURED');
    if (isAlreadyCaptured) {
      return NextResponse.json({
        message: 'La orden de PayPal ya fue capturada.',
        orderID: (await request.json()).orderID || 'desconocido'
      }, { status: 200 });
    }

    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error?.message || String(error),
    }, { status: 500 });
  }
}
