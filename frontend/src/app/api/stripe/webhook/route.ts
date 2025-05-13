import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

function determineSubscriptionType(subscription: Stripe.Subscription): 'monthly' | 'yearly' {
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
  const priceId = subscription.items.data[0]?.price.id;
  return priceId === monthlyPriceId ? 'monthly' : 'yearly';
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const buf = await (req as any).arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error('Missing Stripe signature header');
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const subscription = event.data.object as Stripe.Subscription;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
      
        if (session.subscription) {
          const fullSub = await stripe.subscriptions.retrieve(session.subscription as string);
          const periodEnd = fullSub.items.data[0]?.current_period_end;
          const subscriptionType = determineSubscriptionType(fullSub);

          await db.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              stripeSubscriptionId: fullSub.id,
              isSubscribed: true,
              subscriptionStatus: fullSub.status,
              subscriptionType,
              cancelAtPeriodEnd: fullSub.cancel_at_period_end ?? false,
              subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            },
          });
        }
      
        break;
      }

      case 'customer.subscription.created': {
      const newSub = event.data.object as Stripe.Subscription;
      const periodEnd = newSub.items.data[0]?.current_period_end;

      await db.user.updateMany({
        where: { stripeCustomerId: newSub.customer as string },
        data: {
          stripeSubscriptionId: newSub.id,
          subscriptionStatus: newSub.status,
          isSubscribed: ['active', 'trialing'].includes(newSub.status),
          subscriptionType: determineSubscriptionType(newSub),
          cancelAtPeriodEnd: newSub.cancel_at_period_end ?? false,
          subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      });

      break;
    }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object as Stripe.Subscription;
        const periodEnd = deletedSub.items.data[0]?.current_period_end;

        await db.user.updateMany({
          where: {
            stripeSubscriptionId: deletedSub.id,
          },
          data: {
            subscriptionStatus: 'canceled',
            isSubscribed: false,
            cancelAtPeriodEnd: deletedSub.cancel_at_period_end ?? false,
            subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            stripeSubscriptionId: null,
            subscriptionType: null,
            isDowngrading: false,
          },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const updatedSub = event.data.object as Stripe.Subscription;
        const periodEnd = updatedSub.items.data[0]?.current_period_end;

        await db.user.updateMany({
          where: { stripeSubscriptionId: updatedSub.id },
          data: {
            subscriptionStatus: updatedSub.status,
            isSubscribed: ['active', 'trialing'].includes(updatedSub.status),
            cancelAtPeriodEnd: updatedSub.cancel_at_period_end ?? false,
            subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            subscriptionType: determineSubscriptionType(updatedSub),
          },
        });

        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        if (
          typeof invoice === 'object' &&
          invoice !== null &&
          'subscription' in invoice &&
          typeof invoice.subscription === 'string'
        ) {
          const subscriptionId = invoice.subscription;

          await db.user.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              subscriptionStatus: 'past_due',
              isSubscribed: false,
              subscriptionType: null,
              cancelAtPeriodEnd: false,
            },
          });
        } else {
          console.warn('invoice.payment_failed without valid subscription ID');
        }

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
      
        if (
          typeof invoice === 'object' &&
          invoice !== null &&
          'subscription' in invoice &&
          typeof invoice.subscription === 'string'
        ) {
          const subscriptionId = invoice.subscription;
          const fullSub = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = fullSub.items.data[0]?.current_period_end;
      
          await db.user.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              subscriptionStatus: 'active',
              isSubscribed: true,
              cancelAtPeriodEnd: fullSub.cancel_at_period_end ?? false,
              subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
              subscriptionType: determineSubscriptionType(fullSub),
            },
          });
        } else {
          console.warn('invoice.paid without valid subscription ID');
        }
      
        break;
      }

      case 'subscription_schedule.created': {
        const schedule = event.data.object as Stripe.SubscriptionSchedule;

        const subscriptionId = schedule.subscription;
        const customerId = schedule.customer as string;

        if (subscriptionId && customerId) {
          await db.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              isDowngrading: true,
            },
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return new NextResponse('Webhook Error', { status: 500 });
  }
}
