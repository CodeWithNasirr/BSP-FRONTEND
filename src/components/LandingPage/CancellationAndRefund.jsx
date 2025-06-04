import React from 'react';

const CancellationAndRefund = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-800 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-8 text-center">
        Cancellation and Refund Policy
      </h1>
      <p className="mb-6 text-lg leading-relaxed">
        At GPTX WhatsApp Marketing, we aim to provide a seamless experience with our WhatsApp automation platform, verified by Razorpay. Below is our policy for cancellations and refunds.
      </p>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">Cancellation Policy</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>You may cancel your subscription at any time via your account dashboard or by emailing <a href="mailto:skofficial665@gmail.com" className="text-blue-600 underline hover:text-blue-800">skofficial665@gmail.com</a>.</li>
        <li>Cancellation takes effect at the end of the current billing cycle, and you will retain access until then.</li>
        <li>No additional charges will be applied after cancellation.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">Refund Policy</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Refunds are evaluated on a case-by-case basis. If you are unsatisfied within 7 days of subscribing, contact us at <a href="mailto:skofficial665@gmail.com" className="text-blue-600 underline hover:text-blue-800">skofficial665@gmail.com</a> for a potential refund.</li>
        <li>No refunds are available for partial billing cycles or after the 7-day period.</li>
        <li>For payment disputes, please contact us before initiating a chargeback to avoid account suspension.</li>
      </ul>

      <p className="text-sm text-gray-600 text-center mt-8">Last Updated: April 17, 2025</p>
    </div>
  );
};

export default CancellationAndRefund;