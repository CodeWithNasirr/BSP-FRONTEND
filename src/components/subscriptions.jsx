import { useState } from "react";

const plans = [
  {
    name: "BASIC",
    price: 999,
    gradient: "from-green-500 to-green-600",
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
    gradient: "from-blue-500 to-blue-600",
    features: [
      "All in BASIC",
      "Advanced Automation Tools",
      "Message Analytics",
      "Priority Message Queue",
    ],
    disabled: true,
  },
  {
    name: "ENTERPRISE",
    price: "Custom Pricing",
    gradient: "from-purple-500 to-purple-600",
    features: [
      "All in PRO",
      "Custom Features",
      "Dedicated Account Manager",
      "24/7 Premium Support",
    ],
    disabled: true,
  },
];

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState("BASIC");

  return (
    <section className="bg-gray-50 py-5">
      <div className="container mx-auto px-4 text-center mb-12">
        <p className="text-sm font-semibold text-green-600 tracking-wide uppercase">PRICING PLANS</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
          Simple & Transparent Pricing
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-6 text-white flex flex-col justify-between min-h-[400px] bg-gradient-to-br ${plan.gradient} transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ${
              plan.disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">{plan.name}</h3>
              <h4 className="text-3xl font-semibold text-center mb-4">
                {typeof plan.price === "number" ? `₹${plan.price}/month` : plan.price}
              </h4>
              <ul className="text-white/90 text-sm space-y-2 mb-6 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2"
                         viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedPlan === plan.name
                  ? "bg-white text-green-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              onClick={() => !plan.disabled && setSelectedPlan(plan.name)}
              disabled={plan.disabled}
            >
              {plan.disabled ? "Coming Soon" : selectedPlan === plan.name ? "Selected Plan" : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingPlans;
