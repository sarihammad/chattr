const pricingPlans = [
  {
    name: "Free",
    price: "0",
    unit: "/month",
    description: "All current features",
    features: [
      "AI-powered matching",
      "All matchmaking modes (Friends, Dating, Random, Networking)",
      "Unlimited messaging",
      "AI conversation starters",
      "Block and report features",
      "Basic support",
    ],
    action: "Get Started Free",
    popular: true,
    limitedTime: false,
    checkoutPlanId: null,
  },
  {
    name: "Pro",
    price: "9.99",
    unit: "/month",
    description: "7-day free trial",
    features: [
      "Everything in Free plan",
      "Prioritized matches",
      "Deeper filters and preferences",
      "Advanced AI insights",
      "Priority support",
      "Early access to new features",
    ],
    action: "Start Pro Trial",
    popular: false,
    limitedTime: false,
    checkoutPlanId: "monthly",
  },
];

const getCheckoutPlanId = (planName) => {
  const plan = pricingPlans.find((item) => item.name === planName);
  return plan ? plan.checkoutPlanId : null;
};

module.exports = {
  pricingPlans,
  getCheckoutPlanId,
};
