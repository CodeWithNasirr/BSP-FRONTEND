import { useState } from "react";

const plans = [
  {
    name: "BASIC",
    price: 999,
    features: [
      "Dashboard",
      "Unlimited Contacts",
      "Unlimited Campaigns",
      "Templates - Bulk Templates",
      "Chats - Conversations",
      "WhatsApp customization",
      "Retargeting Campaigns",
      "Smart Campaign Manager",
      "Template Message APIs",
      "1200 messages/min",
    ],
    disabled: false,
  },
  {
    name: "PRO",
    price: 2399,
    features: [
        "All in Basic",
        "Additional Features",
    ],
    disabled: true,
  },
  {
    name: "ENTERPRISE",
    price: "Custom Pricing",
    features: [
      "All in PRO",
      "Premium Support & Additional Features",
    ],
    disabled: true,
  },
];

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState("BASIC");

  return (
    <div className="max-w-4xl mx-auto py-10 px-5">
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-6 border rounded-lg shadow-md ${
              selectedPlan === plan.name ? "border-green-600" : "border-gray-300"
            } ${plan.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <h3 className="text-xl font-semibold text-center mb-2">{plan.name}</h3>
            <h4 className="text-2xl font-bold text-center mb-4">
              {typeof plan.price === "number" ? `₹${plan.price}/month` : plan.price}
            </h4>
            <ul className="text-sm text-gray-600 mb-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="mb-1">• {feature}</li>
              ))}
            </ul>
            <button
              className={`w-full py-2 rounded-lg font-semibold mt-2 transition ${
                selectedPlan === plan.name
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => !plan.disabled && setSelectedPlan(plan.name)}
              disabled={plan.disabled}
            >
              {plan.disabled ? "coming soon" : selectedPlan === plan.name ? "Chosen Plan" : "Select Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingPlans;
