import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Configura el cliente PayPal con credenciales y entorno
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('CRITICAL_SERVER_ERROR: PAYPAL_CLIENT_ID y/o PAYPAL_CLIENT_SECRET no configurados.');
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
    const requestOrder = new paypal.orders.OrdersCreateRequest();
    requestOrder.prefer('return=representation');
    requestOrder.requestBody({
      intent: 'CAPTURE',
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
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    });
    const response = await paypalClient.execute(requestOrder);
    if (!response.result?.id) {
      return NextResponse.json(
        {
          error: `No se pudo crear la orden en PayPal.`,
          details: response.result ? JSON.stringify(response.result) : 'Sin detalles de PayPal.',
        },
        { status: response.statusCode || 500 }
      );
    }
    return NextResponse.json({ orderID: response.result.id });
  } catch (error: any) {
    let errorMessage = 'Error interno del servidor al crear la orden de PayPal.';
    let errorDetails = error.message || String(error);
    let status = 500;
    if (error.message?.includes('CRITICAL_SERVER_ERROR')) {
      errorMessage = error.message;
      status = 503;
    }
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status }
    );
  }
}
