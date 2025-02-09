// app/api/webhooks/lemonsqueezy/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';

const WEBHOOK_SECRET = "Mahir123";

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }
  
  // Update user credits based on plan
  async function updateUserCredits(userId: string, email: string, variantId: string) {
    // Map variant IDs to credits
    // const planCredits:any = {
    //   '686086': 100,  // Basic
    //   '688242': 300,  // Pro
    //   '688243': 700   // Enterprise
    // };
    const planCredits:any = {
        '487847': 100,  // Basic
        '487845': 300,  // Pro
        '487846': 700   // Enterprise
      };
  
    const credits = planCredits[variantId] || 0;
  
    const { error } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        email: email,
        balance: credits,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
  
    if (error) {
      console.error('Error updating credits:', error);
      throw error;
    }
  }
  
  export async function POST(request: Request) {
    try {
      // Get headers using getHeaders helper
      const headersList = headers();
      const signature = headersList.get('X-Signature') || headersList.get('x-signature');
  
      if (!signature || !WEBHOOK_SECRET) {
        console.log('Missing signature or webhook secret');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
  
      // Get the raw payload
      const payload = await request.text();
      
      // Log incoming webhook data for debugging
      console.log('Received webhook payload:', payload);
      console.log('Signature:', signature);
  
      const isValid = verifyWebhookSignature(payload, signature, WEBHOOK_SECRET);
  
      if (!isValid) {
        console.log('Invalid signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
  
      // Parse the webhook payload
      const webhookData = JSON.parse(payload);
      const { event_name } = webhookData.meta;
      
      console.log('Event type:', event_name);
  
      // Extract user data
      const userId = webhookData.meta.custom_data?.user_id;
      const email = webhookData.data.attributes.user_email || webhookData.meta.custom_data?.email;
      const variantId = webhookData.data.attributes.variant_id;
  
      console.log('Processing webhook for user:', { userId, email, variantId });
  
      if (!userId || !email) {
        console.error('Missing required user data:', { userId, email });
        return NextResponse.json(
          { error: 'Missing required user data' },
          { status: 400 }
        );
      }
  
      // Handle subscription events
      switch (event_name) {
        case 'subscription_created':
        case 'subscription_updated':
        case 'subscription_payment_success':
          if (webhookData.data.attributes.status === 'active') {
            await updateUserCredits(userId, email, variantId);
            console.log('Successfully updated credits for user:', userId);
          }
          break;
  
        case 'subscription_cancelled':
        case 'subscription_expired':
          // Optionally handle cancellation/expiration
          console.log('Subscription cancelled or expired for user:', userId);
          break;
  
        default:
          console.log('Unhandled webhook event:', event_name);
      }
  
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      );
    }
  }