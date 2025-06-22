

import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Configura el cliente PayPal con credenciales y entorno
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com'; // Sandbox por defecto

  console.log("PAYPAL_CLIENT_ID (desde process.env en API):", clientId ? clientId.substring(0, 5) + "..." : "NO DEFINIDO");
  console.log("PAYPAL_CLIENT_SECRET (desde process.env en API):", clientSecret ? clientSecret.substring(0, 5) + "..." : "NO DEFINIDO");
  console.log("PAYPAL_API_BASE_URL (desde process.env en API):", baseUrl);

  if (!clientId || clientId === "tu_paypal_sandbox_client_id_aqui_para_api_rest") {
    const errorMsg = 'CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_ID no está configurado correctamente en .env.local o sigue siendo el valor placeholder. Por favor, revise el README.md.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (!clientSecret || clientSecret === "tu_paypal_sandbox_client_secret_aqui") {
    const errorMsg = 'CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_SECRET no está configurado correctamente en .env.local o sigue siendo el valor placeholder. Por favor, revise el README.md.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const environment = baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    console.error("Error al parsear JSON en /api/paypal/create-order:", e);
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido o malformado.", details: (e as Error).message },
      { status: 400 }
    );
  }

  const orderAmount = typeof body?.orderAmount === 'string' && body.orderAmount.trim() !== '' ? body.orderAmount : '10.00';
  const currencyCode = typeof body?.currencyCode === 'string' && body.currencyCode.trim() !== '' ? body.currencyCode : 'USD';
  const description = typeof body?.description === 'string' && body.description.trim() !== '' ? body.description : 'Suscripción Premium - Centro de Análisis de Seguridad Integral';

  try {
    const paypalClient = getPayPalClient();

    const bodyPayload = {
      intent: 'CAPTURE' as const,
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: orderAmount,
          },
          description,
        },
      ],
      application_context: {
        brand_name: 'Centro de Análisis de Seguridad Integral',
        shipping_preference: 'NO_SHIPPING' as const,
        user_action: 'PAY_NOW' as const,
      },
    };

    console.log("Enviando orden a PayPal (/api/paypal/create-order):", JSON.stringify(bodyPayload, null, 2));

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer('return=representation');
    paypalRequest.requestBody(bodyPayload);

    const response = await paypalClient.execute(paypalRequest);

    if (response.statusCode !== 201 || !response.result?.id) {
      console.error('Error al crear la orden en PayPal API:', response);
      return NextResponse.json(
        {
          error: `No se pudo crear la orden en PayPal. Código: ${response.statusCode}`,
          details: response.result ? JSON.stringify(response.result) : 'Sin detalles de PayPal.',
        },
        { status: response.statusCode || 500 }
      );
    }

    console.log("Orden creada con éxito en PayPal. ID:", response.result.id);
    return NextResponse.json({ orderID: response.result.id });

  } catch (error: any) {
    console.error('Error crítico creando orden PayPal (/api/paypal/create-order):', error);

    let errorMessage = 'Error interno del servidor al crear la orden de PayPal.';
    let errorDetails = error.message || String(error);
    let status = 500;

    if (error.message?.includes('CRITICAL_SERVER_ERROR')) {
      errorMessage = error.message; // Propagate critical config errors from getPayPalClient
      status = 503; // Service Unavailable due to misconfiguration
    } else if (error.message?.includes('Authentication failed') || (error.data && JSON.stringify(error.data).includes('invalid_client'))) {
      errorMessage = 'Credenciales de PayPal inválidas. Asegúrese de que PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en su archivo .env.local sean correctos y correspondan a una aplicación REST API válida en su cuenta de PayPal Developer. Los valores de ejemplo del README no funcionarán directamente.';
      errorDetails = error.data ? JSON.stringify(error.data) : errorDetails;
      status = 400; // Bad Request due to client-side (application owner) configuration error
    } else if (error.statusCode && typeof error.message === 'string') {
      errorMessage = `Error de PayPal (${error.statusCode}): ${error.message}`;
      const data = error.data || error.original?.data;
      if (data?.details) {
        errorDetails = JSON.stringify(data.details);
      } else if (data?.message) {
        errorDetails = data.message;
      } else if (typeof data === 'string') {
        errorDetails = data;
      }
      status = error.statusCode || 500;
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status }
    );
  }
}
