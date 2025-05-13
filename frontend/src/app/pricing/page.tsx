'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Monthly',
    price: '19.99',
    unit: '/month',
    description: 'Perfect for casual learners',
    features: [
      'Unlimited AI conversations',
      'Access to all languages',
      'Personalized learning path',
      'Progress tracking',
      'Basic support',
    ],
    action: 'Start Monthly',
    popular: true,
  },
  {
    name: 'Yearly',
    price: '99.99',
    unit: '/year',
    description: 'Best value for dedicated learners',
    features: [
      'Everything in Monthly plan',
      'Save over 50% vs monthly',
      'Priority support',
      'Advanced analytics',
      'Learning community access',
    ],
    action: 'Start Yearly',
    popular: false,
  },
  {
    name: 'Lifetime',
    price: '299.99',
    unit: ' one time',
    description: 'Limited time offer',
    features: [
      'Everything in Yearly plan',
      'Lifetime access to all features',
      'VIP support',
      'Early access to new features',
      'Exclusive learning resources',
    ],
    action: 'Get Lifetime Access',
    popular: false,
    limitedTime: true,
  },
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 48,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds =
          prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-white/80 text-sm mb-4">
      Offer ends in: {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </div>
  );
}

export default function PricingPage() {
  const [isWeekend, setIsWeekend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkWeekend = () => {
      const day = new Date().getDay();
      setIsWeekend(day === 0 || day === 6);
    };
    checkWeekend();
  }, []);

  const handlePlanClick = (plan: string) => {
    router.push(`/checkout?plan=${plan.toLowerCase()}`);
  };

  const displayedPlans = isWeekend
    ? plans
    : plans.filter((plan) => plan.name !== 'Lifetime');

  return (
    <div className="relative min-h-screen w-full bg-[#030303] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,#030303,#030303_30%,rgba(99,56,255,0.2)_70%,rgba(217,70,239,0.2))]" />

      <div className="relative z-10 w-full">
        <div className="w-full py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-white mb-4">
                Choose Your Learning Journey
              </h1>
              <p className="text-xl text-white/60">
                Unlock the power of AI-driven language learning
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {displayedPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white/[0.05] backdrop-blur-sm rounded-2xl p-8 border ${
                    plan.popular
                      ? 'border-yellow-500 shadow-yellow-500/20'
                      : 'border-white/[0.1]'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-white/60">{plan.unit}</span>
                  </div>

                  {plan.limitedTime && (
                    <div className="absolute top-4 right-4">
                        <CountdownTimer />
                    </div>
                  )}

                  <ul className="space-y-3 mt-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-white/70">
                        <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanClick(plan.name)}
                    className="w-full py-3 px-4 mt-6 rounded-lg font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                  >
                    {plan.action}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
