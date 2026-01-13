export type CheckoutPlanId = "monthly" | "yearly";

export interface PricingPlan {
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  action: string;
  popular: boolean;
  limitedTime: boolean;
  checkoutPlanId: CheckoutPlanId | null;
}

declare const pricingPlansModule: {
  pricingPlans: PricingPlan[];
  getCheckoutPlanId: (planName: string) => CheckoutPlanId | null;
};

export default pricingPlansModule;
