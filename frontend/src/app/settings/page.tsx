'use client';

import Image from 'next/image';
import { useSession } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getApiUrl, getAuthHeaders } from '@/lib/api';

interface Subscription {
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  subscriptionType: 'monthly' | 'yearly';
  isDowngrading: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  // Add ordinal suffix to the day
  const day = date.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? 'st' :
                 day % 10 === 2 && day !== 12 ? 'nd' :
                 day % 10 === 3 && day !== 13 ? 'rd' : 'th';

  return formattedDate.replace(/\d+/, `${day}${suffix}`);
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionVersion, setSubscriptionVersion] = useState(0);

    useEffect(() => {
    if (session === null) {
      router.replace('/login');
    }
  }, [session, router]);

  useEffect(() => {
    
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    

    async function fetchSubscription() {
      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        if (res.ok) {
          setSubscription({
            isSubscribed: data.isSubscribed,
            subscriptionStatus: data.subscriptionStatus,
            subscriptionPeriodEnd: data.subscriptionPeriodEnd,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            subscriptionType: data.subscriptionType,
            isDowngrading: data.isDowngrading,
          });
          // Debug log for fetched subscription data
          console.log('Fetched subscription status:', data);
        }
      } catch {
        setSubscription(null);
      }
    }

    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status, router, subscriptionVersion]);

  async function handleCancelSubscription() {
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      if (res.ok) {
        console.log('Subscription cancellation scheduled.');
        setSubscriptionVersion(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
    }
  }

  async function handleResubscribe() {
    try {
      const res = await fetch('/api/subscription/resubscribe', { method: 'POST' });
      if (res.ok) {
        console.log('Subscription resumed.');
        setSubscriptionVersion(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error resubscribing:', err);
    }
  }

  async function handleUpgrade(newPriceId: string) {
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPriceId }),
      });
      if (!res.ok) throw new Error('Upgrade failed');
      setSubscriptionVersion((v) => v + 1);
    } catch (err) {
      console.error('Error upgrading subscription:', err);
    }
  }

  async function handleDowngrade(newPriceId: string) {
    try {
      const res = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPriceId }),
      });
      if (!res.ok) throw new Error('Downgrade failed');
      setSubscriptionVersion((v) => v + 1);
    } catch (err) {
      console.error('Error downgrading subscription:', err);
    }
  }

  async function handleCancelDowngrade() {
    try {
      const res = await fetch('/api/subscription/cancel-downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to cancel downgrade');
      setSubscriptionVersion((v) => v + 1);
    } catch (err) {
      console.error('Error canceling downgrade:', err);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-10 w-1/3 bg-gray-200 animate-pulse rounded" />
          <div className="h-5 w-1/2 bg-gray-100 animate-pulse rounded" />

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
            <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded mb-4" />
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-48 bg-gray-100 animate-pulse rounded" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
            <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded mb-4" />
            <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded mb-2" />
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account and preferences</p>

        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <Image
              src="/default-avatar.png"
              alt="User avatar"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-800">{session.user.name}</p>
              <p className="text-gray-500 text-sm">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Matching Settings */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Matching</h2>
          <MatchingSettings />
        </div>

        {/* Account Settings */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account</h2>
          <AccountSettings />
        </div>

        <SubscriptionSection
          key={subscriptionVersion}
          subscription={subscription}
          handleCancelSubscription={handleCancelSubscription}
          handleResubscribe={handleResubscribe}
          handleUpgrade={handleUpgrade}
          handleDowngrade={handleDowngrade}
          handleCancelDowngrade={handleCancelDowngrade}
        />
      </div>
    </div>
  );
}

function MatchingSettings() {
  const [matchingPaused, setMatchingPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current matching status
    fetch(`${getApiUrl()}/api/v1/user/me`, {
      headers: getAuthHeaders(),
    })
      .then(res => res.json())
      .then(data => {
        // Note: matchingPaused might not be in the response yet, default to false
        setMatchingPaused(data.matchingPaused || false);
      })
      .catch(console.error);
  }, []);

  const handleTogglePause = async () => {
    setLoading(true);
    try {
      const endpoint = matchingPaused ? '/api/v1/user/me/resume' : '/api/v1/user/me/pause';
      const response = await fetch(`${getApiUrl()}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setMatchingPaused(!matchingPaused);
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-800 font-medium">Pause matching</p>
          <p className="text-sm text-gray-500">
            Temporarily stop receiving new introductions
          </p>
        </div>
        <button
          onClick={handleTogglePause}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            matchingPaused ? 'bg-rose-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              matchingPaused ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function AccountSettings() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/user/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-800 font-medium">Delete account</p>
          <p className="text-sm text-gray-500">
            Permanently delete your account and all data
          </p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition"
        >
          Delete
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete account</h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function SubscriptionSection({
  subscription,
  handleCancelSubscription,
  handleResubscribe,
  handleUpgrade,
  handleDowngrade,
  handleCancelDowngrade,
}: {
  subscription: Subscription | null;
  handleCancelSubscription: () => void;
  handleResubscribe: () => void;
  handleUpgrade: (newPriceId: string) => void;
  handleDowngrade: (newPriceId: string) => void;
  handleCancelDowngrade: () => void;
}) {
  // Debug log for subscription prop
  console.log('Rendering SubscriptionSection with:', subscription);

  const router = useRouter();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResubscribeModal, setShowResubscribeModal] = useState(false);
  const [showCancelDowngradeModal, setShowCancelDowngradeModal] = useState(false);

  if (!subscription) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Subscription</h2>
        <p className="text-gray-500">Checking subscription status...</p>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Subscription</h2>
      {subscription.isSubscribed ? (
        <div>
          {subscription.subscriptionStatus === 'trialing' ? (
            <>
              {subscription.cancelAtPeriodEnd ? (
                <>
                  <p className="text-green-700 text-sm font-medium mb-2">
                    Your trial has been canceled. It will remain active until {subscription.subscriptionPeriodEnd ? formatDate(subscription.subscriptionPeriodEnd) : 'N/A'}. You won’t be charged.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    You’ll retain full access until your trial ends.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    Your free trial is currently active.
                  </p>
                  <p className="text-green-600 text-sm mb-4">
                    Your next payment is scheduled for {subscription.subscriptionPeriodEnd ? formatDate(subscription.subscriptionPeriodEnd) : 'N/A'}.
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-2">
                You’re subscribed to the premium plan.
              </p>
              {subscription.isDowngrading ? (
                <>
                  <p className="text-yellow-700 text-sm mb-2">
                    You have scheduled a downgrade to the Monthly Plan. Your current plan will remain active until {subscription.subscriptionPeriodEnd ? formatDate(subscription.subscriptionPeriodEnd) : 'N/A'}.
                  </p>
                  {(!subscription.cancelAtPeriodEnd || subscription.isDowngrading) && (
                    <p className="text-green-600 text-sm mb-4">
                      Your next payment is scheduled for {subscription.subscriptionPeriodEnd ? formatDate(subscription.subscriptionPeriodEnd) : 'N/A'}.
                    </p>
                  )}
                </>
              ) : subscription.cancelAtPeriodEnd ? (
                <>
                  <p className="text-green-700 text-sm font-medium mb-2">
                    Your subscription will remain active until {subscription.subscriptionPeriodEnd ? formatDate(subscription.subscriptionPeriodEnd) : 'N/A'}. You won’t be charged again.
                  </p>
                  {subscription.subscriptionStatus === 'trialing' && (
                    <p className="text-sm text-gray-500 mb-4">You’ll retain full access until your free trial ends.</p>
                  )}
                </>
              ) : (
                <>
                  {(!subscription.cancelAtPeriodEnd || subscription.isDowngrading) && (
                    <p className="text-green-600 text-sm mb-4">
                      Your next payment is scheduled for {subscription.subscriptionPeriodEnd ? formatDate(subscription.subscriptionPeriodEnd) : 'N/A'}.
                    </p>
                  )}
                </>
              )}
              <p className="text-gray-500 text-sm mb-4">
                Billing cycle: {subscription.subscriptionType === 'monthly' ? 'Monthly' : 'Yearly'}
              </p>
            </>
          )}
          {subscription.cancelAtPeriodEnd ? (
            <>
              <div className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
                {!subscription.isDowngrading && (
                  <button
                    onClick={() => setShowResubscribeModal(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Resubscribe
                  </button>
                )}
                {/* Only show upgrade/downgrade/cancel downgrade if not actively canceling (unless downgrading) */}
                {subscription.subscriptionType === 'monthly' && subscription.subscriptionStatus !== 'trialing' && !(subscription.cancelAtPeriodEnd && !subscription.isDowngrading) ? (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Upgrade to Yearly
                  </button>
                ) : subscription.subscriptionType === 'yearly' && subscription.isDowngrading ? (
                  <button
                    onClick={() => setShowCancelDowngradeModal(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Cancel Downgrade
                  </button>
                ) : subscription.subscriptionType === 'yearly' && subscription.subscriptionStatus !== 'trialing' && (!subscription.cancelAtPeriodEnd || subscription.isDowngrading) ? (
                  <button
                    onClick={() => setShowDowngradeModal(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Downgrade to Monthly
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Cancel Subscription
                </button>
                {/* Only show upgrade/downgrade/cancel downgrade if not actively canceling (unless downgrading) */}
                {subscription.subscriptionType === 'monthly' && subscription.subscriptionStatus !== 'trialing' && !(subscription.cancelAtPeriodEnd && !subscription.isDowngrading) ? (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Upgrade to Yearly
                  </button>
                ) : subscription.subscriptionType === 'yearly' && subscription.isDowngrading ? (
                  <button
                    onClick={() => setShowCancelDowngradeModal(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Cancel Downgrade
                  </button>
                ) : subscription.subscriptionType === 'yearly' && subscription.subscriptionStatus !== 'trialing' && (!subscription.cancelAtPeriodEnd || subscription.isDowngrading) ? (
                  <button
                    onClick={() => setShowDowngradeModal(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Downgrade to Monthly
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">
            You are currently on the <strong>Free Plan</strong>.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
          >
            Try Pro for free
          </button>
        </div>
      )}

      {showUpgradeModal && (
        <Modal
          title="Confirm Upgrade"
          message="Are you sure you want to upgrade to the Yearly Plan?"
          onCancel={() => setShowUpgradeModal(false)}
          onConfirm={() => {
            handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!);
            setShowUpgradeModal(false);
          }}
        />
      )}
      {showDowngradeModal && (
        <Modal
          title="Confirm Downgrade"
          message="Are you sure you want to downgrade to the Monthly Plan?"
          onCancel={() => setShowDowngradeModal(false)}
          onConfirm={() => {
            handleDowngrade(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!);
            setShowDowngradeModal(false);
          }}
        />
      )}
      {showCancelModal && (
        <Modal
          title="Confirm Cancellation"
          message="Are you sure you want to cancel your subscription?"
          onCancel={() => setShowCancelModal(false)}
          onConfirm={() => {
            handleCancelSubscription();
            setShowCancelModal(false);
          }}
        />
      )}
      {showResubscribeModal && (
        <Modal
          title="Resume Subscription"
          message="Resume your subscription and continue enjoying premium features?"
          onCancel={() => setShowResubscribeModal(false)}
          onConfirm={() => {
            handleResubscribe();
            setShowResubscribeModal(false);
          }}
        />
      )}
      {showCancelDowngradeModal && (
        <Modal
          title="Cancel Downgrade"
          message="Are you sure you want to cancel the scheduled downgrade and stay on your current plan?"
          onCancel={() => setShowCancelDowngradeModal(false)}
          onConfirm={() => {
            handleCancelDowngrade();
            setShowCancelDowngradeModal(false);
          }}
        />
      )}
    </div>
  );
}

function Modal({ title, message, onConfirm, onCancel }: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg border border-gray-200 ring-1 ring-gray-100">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
