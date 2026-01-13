const test = require("node:test");
const assert = require("node:assert/strict");
const pricingPlansModule = require("../src/lib/pricingPlans");

test("pricing plans expose checkout ids only for paid plans", () => {
  const { pricingPlans } = pricingPlansModule;
  const paidPlans = pricingPlans.filter((plan) => plan.checkoutPlanId);
  const freePlans = pricingPlans.filter((plan) => !plan.checkoutPlanId);

  assert.ok(paidPlans.length >= 1);
  assert.ok(freePlans.length >= 1);
});

test("getCheckoutPlanId returns the expected plan id", () => {
  const { getCheckoutPlanId } = pricingPlansModule;
  assert.equal(getCheckoutPlanId("Pro"), "monthly");
  assert.equal(getCheckoutPlanId("Free"), null);
});
