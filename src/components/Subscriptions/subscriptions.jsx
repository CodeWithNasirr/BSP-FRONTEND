import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';
import { Context } from '../context/Context';

const plans = [
  {
    name: 'BASIC',
    monthly: 499,
    yearly: 3299,
    included_messages: 1000,
    gradient: 'from-green-500 to-green-600',
    disabled: false,
    features: [
      'Client Dashboard Access',
      'Up to 1,000 messages/month',
      'Unlimited Contacts & Groups',
      'Limited Campaigns (Text Only)',
      'No Media Support',
      'No Chatbot or Automation',
      'Basic Delivery Reports',
      'Basic Support',
    ],
  },
  {
    name: 'GROWTH',
    monthly: 999,
    yearly: 6999,
    included_messages: 5000,
    gradient: 'from-blue-500 to-blue-600',
    disabled: false,
    bestSeller: true, // ⭐ add this
    features: [
      'Everything in BASIC',
      'Up to 5,000 messages/month',
      'Image/Video/Document Template Support',
      'Smart Campaign Retargeting',
      'Auto Campaigns on Group/Contact Triggers',
      'Basic Chatbot Automation',
      'Cart + Order Collection System',
      'Daily Analytics Summary',
      'Realtime Delivery Reports',
      'Email & WhatsApp Support',
    ],
  },
  {
    name: 'BUSINESS PRO',
    monthly: 1999,
    yearly: 19999,
    included_messages: 12000,
    gradient: 'from-purple-500 to-purple-600',
    disabled: false,
    features: [
      'Everything in GROWTH',
      'Up to 12,000 messages/month',
      'Drag & Drop Chatbot Flow Builder',
      'Advanced Automation & Segmentation',
      'Product Showcase via WhatsApp',
      'Website & CRM Integration',
      'Catalog Sharing',
      'Webhook-Based Triggers',
      'Priority Messaging Queue',
      'Live Support via WhatsApp',
      'Custom Domain & Branding (on request)',
    ],
  },
];

const Subscriptions = () => {
  const [billing, setBilling] = useState('monthly');
  const { userInfo, subscriptionStatus, setSubscriptionStatus } = useContext(Context);
  const [selectedPlan, setSelectedPlan] = useState('BASIC');
  const [loading, setLoading] = useState(true);
  const [couponCodes, setCouponCodes] = useState({});
  const [couponMessages, setCouponMessages] = useState({});
  const [discountedPrices, setDiscountedPrices] = useState({});
  const [usage, setUsage] = useState({});
  const token = localStorage.getItem('authToken');
  const user_email = userInfo.email || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userInfo.api_provider === 'gupshup' && subscriptionStatus?.is_active) {
          const usageResponse = await axios.get(`${API_BASE_URL}/api/get-message-volume/`, {
            headers: { Authorization: `Token ${token}` },
          });
          setUsage(usageResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, subscriptionStatus?.is_active]);

  const applyCoupon = async (plan) => {
    const couponCode = couponCodes[plan.name] || '';
    if (!couponCode) {
      setCouponMessages((prev) => ({ ...prev, [plan.name]: 'Please enter a coupon code.' }));
      return;
    }
    try {
      const originalPrice = billing === 'monthly' ? plan.monthly : plan.yearly;
      const response = await axios.post(
        `${API_BASE_URL}/api/subscription/create/`,
        { 
          plan: plan.name, 
          coupon_code: couponCode, 
          billing: billing, 
          amount: originalPrice * 100 // Send in paise
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      const { amount, discount_applied } = response.data;
      const discountedPrice = amount / 100; // Convert back to INR
      if (discount_applied && discountedPrice < originalPrice) {
        setDiscountedPrices((prev) => ({ ...prev, [plan.name]: discountedPrice }));
        setCouponMessages((prev) => ({ ...prev, [plan.name]: 'Coupon applied successfully!' }));
      } else {
        setCouponMessages((prev) => ({ ...prev, [plan.name]: 'Coupon applied but no discount available.' }));
      }
    } catch (error) {
      setCouponMessages((prev) => ({
        ...prev,
        [plan.name]: error.response?.data?.error || 'Error applying coupon.',
      }));
    }
  };

  const handlePayment = async (plan) => {
    try {
      const couponCode = couponCodes[plan.name] || '';
      const originalPrice = billing === 'monthly' ? plan.monthly : plan.yearly;
      const response = await axios.post(
        `${API_BASE_URL}/api/subscription/create/`,
        { 
          plan: plan.name, 
          coupon_code: couponCode, 
          billing: billing, 
          amount: originalPrice * 100 // Send in paise
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      const { order_id, amount, currency, razorpay_key_id, discount_applied } = response.data;
      const discountedPrice = amount / 100;

      if (discount_applied && discountedPrice < originalPrice) {
        setDiscountedPrices((prev) => ({ ...prev, [plan.name]: discountedPrice }));
        setCouponMessages((prev) => ({ ...prev, [plan.name]: 'Coupon applied successfully!' }));
      }

      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: currency,
        order_id: order_id,
        name: 'WhatsAppGPTx',
        description: `${plan.name} Plan Subscription (${billing})`,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/api/subscription/verify/`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.name,
                billing: billing,
              },
              { headers: { Authorization: `Token ${token}` } }
            );
            toast.success('Subscription activated!');
            setSubscriptionStatus({ 
              ...subscriptionStatus, 
              is_active: true, 
              plan: plan.name,
              subscription_start: new Date().toISOString() // Set locally as fallback
            });
            setCouponCodes((prev) => ({ ...prev, [plan.name]: '' }));
            setCouponMessages((prev) => ({ ...prev, [plan.name]: '' }));
            setDiscountedPrices((prev) => ({ ...prev, [plan.name]: null }));
            setUsage((prev) => ({ ...prev, remaining: plan.included_messages }));
          } catch (error) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: { email: user_email },
        theme: { color: '#22C55E' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Error initiating payment.');
    }
  };

  const handleRecharge = async (plan, additional_messages = 1000) => {
    try {
      const gupshup_cost_per_message = 0.001; // USD per message
      const recharge_amount = additional_messages * gupshup_cost_per_message * 86.76; // INR
      const response = await axios.post(
        `${API_BASE_URL}/api/wallet/create-order/`,
        { additional_messages, amount: recharge_amount },
        { headers: { Authorization: `Token ${token}` } }
      );

      const { order_id, amount, currency, razorpay_key_id } = response.data;

      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: currency,
        order_id: order_id,
        name: 'WhatsAppGPTx',
        description: `Recharge for ${additional_messages} messages`,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/api/wallet/verify-payment/`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Token ${token}` } }
            );
            toast.success('Recharge successful!');
            const { remaining_messages } = verifyRes.data;
            setUsage((prev) => ({ ...prev, remaining: remaining_messages }));
          } catch (error) {
            console.log(error);
            toast.error('Recharge verification failed.');
          }
        },
        prefill: { email: user_email },
        theme: { color: '#22C55E' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Error initiating recharge.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <section className="bg-gray-50 py-5 max-h-screen">
      <div className="container mx-auto px-4 text-center mb-12">
        <p className="text-sm font-semibold text-green-600 tracking-wide uppercase">PRICING PLANS</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Simple & Transparent Pricing</h2>
        <div className="flex justify-center mt-4">
          <div className="inline-flex bg-white shadow rounded-full">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                billing === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                billing === 'yearly' ? 'bg-gray-900 text-white' : 'text-gray-700'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-6">
        {plans.map((plan) => {
          const isActivePlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === plan.name;
          const originalPrice = billing === 'monthly' ? plan.monthly : plan.yearly;
          const displayPrice = discountedPrices[plan.name] || originalPrice;
          const remaining = subscriptionStatus?.get_remaining_messages || (isActivePlan ? plan.included_messages - (usage?.used || 0) : 0);

          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 text-white flex flex-col justify-between min-h-[400px] bg-gradient-to-br ${plan.gradient} transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.disabled || isActivePlan ? 'opacity-100 cursor-not-allowed' : ''
              }`}
            >
                {plan.bestSeller && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                    ⭐ Best Seller
                </div>
                )}
              <div>
                <h3 className="text-2xl font-bold text-white text-center mb-2">{plan.name}</h3>
                <h4 className="text-3xl font-semibold text-center mb-4">
                  ₹{displayPrice}/{billing === 'monthly' ? 'month' : 'year'}
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
                {!isActivePlan && !plan.disabled && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodes[plan.name] || ''}
                      onChange={(e) => setCouponCodes((prev) => ({ ...prev, [plan.name]: e.target.value.toUpperCase() }))}
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

                <button
                  className={`w-full py-4 rounded-xl text-sm font-semibold transition-all ${
                    selectedPlan === plan.name && !isActivePlan
                      ? 'bg-white text-green-600'
                      : isActivePlan
                      ? 'bg-green-700 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={() => {
                    setSelectedPlan(plan.name);
                    if (isActivePlan) return;
                    handlePayment(plan);
                  }}
                  disabled={plan.disabled || isActivePlan}
                >
                  {plan.disabled ? 'Coming Soon' : isActivePlan ? 'Activated' : selectedPlan === plan.name ? 'Selected Plan' : 'Choose Plan'}
                

                {isActivePlan && userInfo.api_provider === 'gupshup' && (
                  <div className="space-y-2">
                    <p className="text-sm text-white">Used: {usage.used} messages</p>
                    <p className="text-sm text-white">Remaining: {remaining > 0 ? remaining : 0}</p>
                    {(usage.recharge_needed || remaining <= 0) && (
                      <button
                        onClick={() => handleRecharge(plan, 1000)}
                        className="w-full py-2 bg-green-800 text-white rounded-xl text-sm font-semibold hover:bg-yellow-600"
                      >
                        Recharge for 1,000+ Messages (₹86.76)
                      </button>
                    )}
                  </div>
                )}
                {isActivePlan && userInfo.api_provider === 'meta' && (
                  <p className="text-sm text-white">Wallet Balance: ₹{subscriptionStatus?.wallet_balance || 0}</p>
                )}
                {isActivePlan && subscriptionStatus?.subscription_start && (
                  <p className="text-sm text-white">
                    Activated: {new Date(subscriptionStatus.subscription_start).toLocaleDateString()}
                  </p>
                )}
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

export default Subscriptions;