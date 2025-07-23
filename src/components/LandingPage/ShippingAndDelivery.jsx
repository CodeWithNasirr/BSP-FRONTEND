import React from 'react';

const ShippingAndDelivery = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-800 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-8 text-center">
        Shipping and Delivery Policy
      </h1>
      <p className="mb-6 text-lg leading-relaxed">
        Numlockitsolutions WhatsApp Marketing is a digital SaaS platform for WhatsApp automation, verified by Razorpay. As our services are delivered digitally, no physical shipping is involved. Below is our policy for service delivery.
      </p>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">Service Delivery</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Access</strong>: After successful subscription and payment verification via Razorpay, you gain immediate access to the Numlockitsolutions platform.</li>
        <li><strong>Setup</strong>: WhatsApp Business API integration is typically completed within 24 hours, pending Meta’s approval.</li>
        <li><strong>Delays</strong>: In rare cases, delays may occur due to Meta’s verification process. We will keep you informed via email.</li>
        <li><strong>Support</strong>: For setup assistance, contact us at <a href="mailto:support@numlockitsolutions.co.in" className="text-blue-600 underline hover:text-blue-800">support@numlockitsolutions.co.in</a>.</li>
      </ul>

      <p className="text-sm text-gray-600 text-center mt-8">Last Updated: April 17, 2025</p>
    </div>
  );
};

export default ShippingAndDelivery;