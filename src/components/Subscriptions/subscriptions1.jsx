import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';

const plans = [
  { 
    name: 'BASIC',
    price: 999,
    gradient: 'from-green-500 to-green-600',
    features: [
      'Dashboard',
      'Unlimited Contacts',
      'Unlimited Campaigns',
      'Templates - Bulk Templates',
      'Chats - Conversations',
      'WhatsApp customization',
      'Retargeting Campaigns',
      'Smart Campaign Manager',
      'Template Message APIs',
      '1200 messages/min',
    ],
    disabled: false,
  },
  {
    name: 'PRO',
    price: 2399,
    gradient: 'from-blue-500 to-blue-600',
    features: [
      'All in BASIC',
      'Advanced Automation Tools',
      'Message Analytics',
      'Priority Message Queue',
    ],
    disabled: true,
  },
  {
    name: 'ENTERPRISE',
    price: 'Custom Pricing',
    gradient: 'from-purple-500 to-purple-600',
    features: [
      'All in PRO',
      'Custom Features',
      'Dedicated Account Manager',
      '24/7 Premium Support',
    ],
    disabled: true,
  },
];

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState('BASIC');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCodes, setCouponCodes] = useState({}); // Store coupon codes for each plan
  const [couponMessages, setCouponMessages] = useState({}); // Store coupon messages for each plan
  const [discountedPrices, setDiscountedPrices] = useState({}); // Store discounted prices for each plan
  const token = localStorage.getItem('authToken');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const user_email = userInfo.email || '';

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/subscription-status/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setSubscriptionStatus(response.data);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setSubscriptionStatus({ is_active: false });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const applyCoupon = async (plan) => {
    const couponCode = couponCodes[plan.name] || '';
    if (!couponCode) {
      setCouponMessages((prev) => ({
        ...prev,
        [plan.name]: 'Please enter a coupon code.',
      }));
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/subscription/create/`,
        { plan: plan.name, coupon_code: couponCode },
        { headers: { Authorization: `Token ${token}` } }
      );

      const { amount, discount_applied } = response.data;
      if (discount_applied) {
        setDiscountedPrices((prev) => ({
          ...prev,
          [plan.name]: amount / 100, // Convert paise to rupees
        }));
        setCouponMessages((prev) => ({
          ...prev,
          [plan.name]: 'Coupon applied successfully!',
        }));
      }
    } catch (error) {
      setCouponMessages((prev) => ({
        ...prev,
        [plan.name]: error.response?.data?.error || 'Error applying coupon. Please try again.',
      }));
    }
  };

  const handlePayment = async (plan) => {
    if (plan.disabled || (subscriptionStatus?.is_active && subscriptionStatus?.plan === plan.name)) return;

    try {
      // Create Razorpay order with coupon
      const couponCode = couponCodes[plan.name] || '';
      const response = await axios.post(
        `${API_BASE_URL}/api/subscription/create/`,
        { plan: plan.name, coupon_code: couponCode },
        { headers: { Authorization: `Token ${token}` } }
      );

      const { order_id, amount, currency, razorpay_key_id, discount_applied } = response.data;

      // Update displayed price if discount applied
      if (discount_applied) {
        setDiscountedPrices((prev) => ({
          ...prev,
          [plan.name]: amount / 100, // Convert paise to rupees
        }));
        setCouponMessages((prev) => ({
          ...prev,
          [plan.name]: 'Coupon applied successfully!',
        }));
      }

      // Initialize Razorpay checkout
      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: currency,
        order_id: order_id,
        name: 'WhatsAppGPTx',
        description: `${plan.name} Plan Subscription`,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${API_BASE_URL}/api/subscription/verify/`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.name,
              },
              { headers: { Authorization: `Token ${token}` } }
            );
            toast.success(verifyResponse.data.message);
            // Update subscription status
            setSubscriptionStatus({ ...subscriptionStatus, is_active: true, plan: plan.name });
            // Reset coupon state for this plan
            setCouponCodes((prev) => ({ ...prev, [plan.name]: '' }));
            setCouponMessages((prev) => ({ ...prev, [plan.name]: '' }));
            setDiscountedPrices((prev) => ({ ...prev, [plan.name]: null }));
          } catch (error) {
            toast.error('Payment verification failed. Please try again.');
            console.error(error);
          }
        },
        prefill: {
          email: user_email,
        },
        theme: { color: '#22C55E' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error initiating payment. Please try again.');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="bg-gray-50 py-5">
      <div className="container mx-auto px-4 text-center mb-12">
        <p className="text-sm font-semibold text-green-600 tracking-wide uppercase">PRICING PLANS</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
          Simple & Transparent Pricing
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-6">
        {plans.map((plan) => {
          const isActivePlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === plan.name;
          const displayPrice = discountedPrices[plan.name] !== undefined ? discountedPrices[plan.name] : plan.price;
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 text-white flex flex-col justify-between min-h-[400px] bg-gradient-to-br ${plan.gradient} transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.disabled || isActivePlan ? 'opacity-100 cursor-not-allowed' : ''
              }`}
            >
              <div>
                <h3 className="text-2xl font-bold text-white text-center mb-2">{plan.name}</h3>
                <h4 className="text-3xl font-semibold text-center mb-4">
                  {typeof displayPrice === 'number' ? (
                    <>
                      {discountedPrices[plan.name] !== undefined && (
                        <span className="line-through text-xl mr-2">₹{plan.price}</span>
                      )}
                      ₹{displayPrice}/month
                    </>
                  ) : (
                    displayPrice
                  )}
                </h4>
                <ul className="text-white/90 text-sm space-y-2 mb-6 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 mt-1 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                {/* Coupon Input and Submit Button */}
                {!isActivePlan && !plan.disabled && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodes[plan.name] || ''}
                      onChange={(e) =>
                        setCouponCodes((prev) => ({
                          ...prev,
                          [plan.name]: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="Enter coupon code"
                      className="w-full border rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <button
                      onClick={() => applyCoupon(plan)}
                      className="bg-white text-green-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponMessages[plan.name] && (
                  <p className={`text-sm ${couponMessages[plan.name].includes('successfully') ? 'text-green-200' : 'text-red-200'}`}>
                    {couponMessages[plan.name]}
                  </p>
                )}

                {/* Plan Selection Button */}
                <button
                  className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedPlan === plan.name && !isActivePlan
                      ? 'bg-white text-green-600'
                      : isActivePlan
                      ? 'bg-green-700 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={() => {
                    setSelectedPlan(plan.name);
                    handlePayment(plan);
                  }}
                  disabled={plan.disabled || isActivePlan}
                >
                  {plan.disabled ? 'Coming Soon' : isActivePlan ? 'Activated' : selectedPlan === plan.name ? 'Selected Plan' : 'Choose Plan'}

                {/* Subscription Expiry Info */}
                {isActivePlan && subscriptionStatus?.subscription_expiry && (
                  <p className="text-sm text-white">
                    Expires: {new Date(subscriptionStatus.subscription_expiry).toLocaleDateString()}
                  </p>
                )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingPlans;