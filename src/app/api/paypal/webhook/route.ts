// /src/app/api/paypal/webhook/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk'; // SDK for verification, if applicable
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client FOR DATABASE OPERATIONS
// Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("CRITICAL ERROR (PayPal Webhook): Supabase URL or Service Role Key not configured. Webhook cannot update database.");
  // This is a server configuration error. The webhook will likely fail to process meaningfully.
}
const supabaseAdminClient = createClient(supabaseUrl!, supabaseServiceRoleKey!);


// Helper function to configure PayPal client (ensure this matches your other PayPal API routes)
// This might be different for webhook verification depending on PayPal's SDK/API.
// For webhook verification, you often use your Client ID, Secret, and Webhook ID.
function getPayPalEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    console.error('CRITICAL ERROR (PayPal Webhook): PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not configured for environment.');
    throw new Error('PayPal Client configuration incomplete for webhook.');
  }

  return baseUrl.includes('sandbox')
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
}

// --- TODO: CRITICAL - Implement PayPal Webhook Signature Verification ---
// This function is a conceptual placeholder. Actual implementation is complex.
// You MUST verify the webhook signature to ensure requests are genuinely from PayPal.
// Refer to PayPal's official documentation for "Verifying webhook signatures".
// You'll need your PAYPAL_WEBHOOK_ID (from PayPal Developer Portal) and specific headers from the request.
async function verifyPayPalWebhookSignature(request: Request, rawBody: string): Promise<boolean> {
  const paypalWebhookId = process.env.PAYPAL_WEBHOOK_ID; // You must set this in your .env.local

  if (!paypalWebhookId) {
    console.error("PayPal Webhook: PAYPAL_WEBHOOK_ID environment variable is not set. Cannot verify signature.");
    return false; // Or throw an error, depending on desired strictness for security
  }

  const headers = request.headers;
  const transmissionId = headers.get('paypal-transmission-id');
  const transmissionSig = headers.get('paypal-transmission-sig');
  const transmissionTime = headers.get('paypal-transmission-time');
  const authAlgo = headers.get('paypal-auth-algo');
  const certUrl = headers.get('paypal-cert-url');

  if (!transmissionId || !transmissionSig || !transmissionTime || !authAlgo || !certUrl) {
    console.error("PayPal Webhook: Missing required PayPal headers for signature verification.");
    return false;
  }

  // The PayPal SDK (@paypal/checkout-server-sdk) might have utilities for this,
  // or you might need to make a direct API call to PayPal's verify-webhook-signature endpoint.
  // This is a simplified conceptual outline:
  /*
  try {
    const client = new paypal.core.PayPalHttpClient(getPayPalEnvironment());
    const verificationRequest = new paypal.notifications.VerifyWebhookSignatureRequest(); // This class might vary or not exist; check SDK
    verificationRequest.transmissionId(transmissionId);
    verificationRequest.transmissionSig(transmissionSig);
    verificationRequest.transmissionTime(transmissionTime);
    verificationRequest.authAlgo(authAlgo);
    verificationRequest.certUrl(certUrl);
    verificationRequest.webhookId(paypalWebhookId);
    verificationRequest.webhookEvent(JSON.parse(rawBody)); // The SDK might require the parsed event body

    const response = await client.execute(verificationRequest);
    if (response.result.verification_status === 'SUCCESS') {
      console.log('PayPal Webhook: Signature verified successfully.');
      return true;
    } else {
      console.error('PayPal Webhook: SIGNATURE VERIFICATION FAILED:', response.result);
      return false;
    }
  } catch (error) {
    console.error('PayPal Webhook: Error during signature verification API call:', error);
    return false;
  }
  */

  // For now, returning true as a placeholder.
  console.warn("PayPal Webhook: 🔴🔴🔴 CRITICAL SECURITY WARNING: Webhook signature verification is CURRENTLY A PLACEHOLDER and BYPASSED. This is NOT secure for production. You MUST implement actual signature verification. 🔴🔴🔴");
  return true; // !! REPLACE WITH ACTUAL VERIFICATION !!
}
// --- END TODO ---


export async function POST(request: Request) {
  console.log('PayPal Webhook: Received POST request.');
  let eventData;
  let rawBody;

  try {
    rawBody = await request.text(); // Get raw body for signature verification first
    eventData = JSON.parse(rawBody); // Then parse it
    console.log('PayPal Webhook: Event body parsed. Event Type:', eventData.event_type, 'Resource ID:', eventData.resource?.id);
    // console.log('PayPal Webhook: Full Event (truncated):', JSON.stringify(eventData, null, 2).substring(0, 1000) + "...");

    // -------------------------------------------------------------------------
    // STEP 1: VERIFY WEBHOOK SIGNATURE (CRITICAL FOR SECURITY!)
    // -------------------------------------------------------------------------
    const isSignatureVerified = await verifyPayPalWebhookSignature(request, rawBody);
    if (!isSignatureVerified) {
      console.error('PayPal Webhook: SIGNATURE VERIFICATION FAILED. Unauthorized request.');
      return NextResponse.json({ error: 'Webhook signature verification failed. Unauthorized.' }, { status: 401 });
    }
    console.log('PayPal Webhook: Signature verification passed (or placeholder bypassed).');


    // -------------------------------------------------------------------------
    // STEP 2: PROCESS THE EVENT
    // -------------------------------------------------------------------------
    const eventType = eventData.event_type;
    const resource = eventData.resource; // This contains the data for the event (e.g., order details, capture details)

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      // This event is fired when a payment capture is completed.
      const captureId = resource.id; // This is the PayPal capture ID
      const orderIdFromCapture = resource.supplementary_data?.related_ids?.order_id || resource.purchase_units?.[0]?.payments?.captures?.[0]?.links?.find((link: any) => link.rel === 'up')?.href.split('/').pop();
      const customId = resource.custom_id || resource.purchase_units?.[0]?.custom_id; // If you set a custom_id when creating the order
      const invoiceId = resource.invoice_id || resource.purchase_units?.[0]?.invoice_id; // If you set an invoice_id

      console.log(`PayPal Webhook: Processing PAYMENT.CAPTURE.COMPLETED. Capture ID: ${captureId}, Order ID (from capture): ${orderIdFromCapture}, Custom ID: ${customId}, Invoice ID: ${invoiceId}`);

      // Determine the user to update.
      // The most reliable way is if your `/api/paypal/capture-order` route stored the *PayPal Order ID*
      // (the one returned when you *created* the order, not the capture ID) in your `user_profiles.paypal_order_id` field.
      // The webhook resource for PAYMENT.CAPTURE.COMPLETED often has the original order ID in `resource.supplementary_data.related_ids.order_id`
      // or you might need to link it via `custom_id` or `invoice_id` if you set those.

      const payPalOrderIdToSearch = orderIdFromCapture || (customId ? customId.split('_user_')[0] : null) || invoiceId; // Adapt this logic based on how you link orders to users

      if (!payPalOrderIdToSearch) {
          console.error(`PayPal Webhook (PAYMENT.CAPTURE.COMPLETED): Could not determine a valid PayPal Order ID from webhook resource to link to a user. Capture ID: ${captureId}`);
          return NextResponse.json({ received: true, error: "Could not link webhook to an internal order/user." }, { status: 200 });
      }
      
      console.log(`PayPal Webhook: Searching user_profiles for paypal_order_id: ${payPalOrderIdToSearch}`);
      const { data: userProfileData, error: profileError } = await supabaseAdminClient
        .from('user_profiles')
        .select('id, subscription_status, email') // Select email for logging
        .eq('paypal_order_id', payPalOrderIdToSearch) // Match against the PayPal Order ID you stored
        .single();

      if (profileError || !userProfileData) {
        console.warn(`PayPal Webhook: User profile not found for paypal_order_id ${payPalOrderIdToSearch}. Error: ${profileError?.message}. This might be okay if /api/paypal/capture-order already updated the DB, or if this is a duplicate webhook.`);
        return NextResponse.json({ received: true, message: `User profile not found for PayPal order ID ${payPalOrderIdToSearch} or already processed.` }, { status: 200 });
      }
      
      const userId = userProfileData.id;
      console.log(`PayPal Webhook: User profile found for PayPal order ID ${payPalOrderIdToSearch}. User ID: ${userId}, Email: ${userProfileData.email}`);

      // Idempotency Check: Only update if not already premium or if subscription needs extension.
      if (userProfileData.subscription_status !== 'active_premium') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        console.log(`PayPal Webhook: Updating user ${userId} to active_premium.`);
        const { error: dbUpdateError } = await supabaseAdminClient
          .from('user_profiles')
          .update({
            subscription_status: 'active_premium',
            current_period_end: thirtyDaysFromNow.toISOString(),
            updated_at: new Date().toISOString(),
            // Optionally, store the capture_id if needed for reconciliation, maybe in a separate payments table
            // paypal_capture_id: captureId, 
          })
          .eq('id', userId);

        if (dbUpdateError) {
          console.error(`PayPal Webhook: CRITICAL - Error updating DB for order ${payPalOrderIdToSearch}, user ${userId}:`, dbUpdateError.message);
          // Still return 200 to PayPal to prevent retries for this event, but this needs immediate investigation.
          return NextResponse.json({ received: true, error_db_update: dbUpdateError.message }, { status: 200 });
        }
        console.log(`PayPal Webhook: Subscription updated in DB for order ${payPalOrderIdToSearch}, user ${userId}. New status: active_premium.`);
      } else {
        console.log(`PayPal Webhook: User ${userId} (order ${payPalOrderIdToSearch}) already has active_premium status. No DB update needed from this PAYMENT.CAPTURE.COMPLETED event.`);
      }

    } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        // This event fires when the user approves the order on PayPal's site, *before* capture.
        // You usually act on PAYMENT.CAPTURE.COMPLETED to grant service.
        // You might use this event for provisional actions or logging.
        console.log(`PayPal Webhook: Received CHECKOUT.ORDER.APPROVED for Order ID: ${resource?.id}. Typically, action is taken on PAYMENT.CAPTURE.COMPLETED.`);
    
    } else if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        // For PayPal Subscriptions (recurring payments)
        // const subscriptionId = resource.id;
        // const userId = resource.custom_id; // If you set custom_id on the subscription plan
        console.log(`PayPal Webhook: TODO - Implement logic for BILLING.SUBSCRIPTION.ACTIVATED. Subscription ID: ${resource?.id}`);
        // Logic: Mark user as premium, set current_period_end based on subscription details.
    
    } else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
        // For PayPal Subscriptions
        // const subscriptionId = resource.id;
        console.log(`PayPal Webhook: TODO - Implement logic for BILLING.SUBSCRIPTION.CANCELLED. Subscription ID: ${resource?.id}`);
        // Logic: Update user's subscription_status to 'cancelled', perhaps keep premium until current_period_end.
    
    } else if (eventType === 'CUSTOMER.DISPUTE.CREATED') {
        console.log(`PayPal Webhook: Customer dispute created for resource ID: ${resource?.id}. Investigate.`);
        // Logic: Log this event, potentially flag the user's account for review.
    
    } else if (eventType === 'PAYMENT.SALE.REFUNDED') {
        console.log(`PayPal Webhook: Payment refunded for resource ID: ${resource?.id}. Original Sale ID: ${resource?.sale_id}`);
        // Logic: Update user's subscription status (e.g., to 'free' or 'refunded'), adjust access.
    
    } else {
      console.log(`PayPal Webhook: Event type "${eventType}" received but not explicitly handled or not relevant for this application's immediate subscription logic.`);
    }

    // Always respond to PayPal with a 200 OK to acknowledge receipt.
    // This prevents PayPal from retrying the webhook for events we've "seen".
    return NextResponse.json({ received: true, message: "Webhook event acknowledged." }, { status: 200 });

  } catch (error: any) {
    console.error('PayPal Webhook: Critical error in webhook handler:', error.message);
    console.error('PayPal Webhook: Raw body received before error:', rawBody ? rawBody.substring(0, 500) + "..." : "No raw body captured or error before body was read.");
    
    // It's generally recommended to return a 200 OK to PayPal even if your internal processing fails,
    // to prevent PayPal from retrying the same (potentially malformed or unprocessable) event indefinitely.
    // Log the error thoroughly on your side for investigation.
    // If the error was due to a temporary issue on your server (e.g., DB down), PayPal might retry if it got a 5xx.
    // However, for parsing errors or unhandled event types, a 200 is safer to stop retries.
    let status = 200; // Default to 200 to acknowledge receipt to PayPal
    let errorMessage = 'Webhook event acknowledged but internal processing error occurred.';

    if (error instanceof SyntaxError) { // JSON parsing error
        errorMessage = 'Invalid JSON payload received from PayPal.';
        // status = 400; // You might choose to send 400 for bad payload, but PayPal might retry.
    } else {
        errorMessage = error.message || 'Internal server error processing webhook.';
        // status = 500; // If you want PayPal to retry for genuine server errors.
    }
    
    return NextResponse.json({ error: errorMessage, details: error.message }, { status });
  }
}