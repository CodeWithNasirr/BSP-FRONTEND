import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-700">
      <h1 className="text-4xl font-bold text-green-600 mb-6">Privacy Policy for WhatsGPTX</h1>
      <p className="mb-4">
        At WhatsGPTX, a product of Numlock IT Solutions, we are committed to protecting the privacy and
        security of our users. This privacy policy explains how we collect, use, and protect information in
        connection with our WhatsApp automation SaaS tool.
      </p>

      <h2 className="text-2xl font-semibold text-green-500 mt-8 mb-2">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-4">
        <li>WhatsApp Business Phone Numbers</li>
        <li>WhatsApp Message Templates</li>
        <li>Meta User ID and access tokens</li>
        <li>Name, Email (if provided by Meta login)</li>
      </ul>

      <h2 className="text-2xl font-semibold text-green-500 mt-8 mb-2">2. How We Use the Information</h2>
      <p className="mb-4">
        We use the data only to:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Send messages via WhatsApp on behalf of the user</li>
        <li>Personalize message templates</li>
        <li>Analyze campaign performance</li>
      </ul>

      <h2 className="text-2xl font-semibold text-green-500 mt-8 mb-2">3. Data Sharing</h2>
      <p className="mb-4">
        We do not sell or share your information with third parties. Your data is only used within our
        platform for automation purposes.
      </p>

      <h2 className="text-2xl font-semibold text-green-500 mt-8 mb-2">4. Data Retention & Deletion</h2>
      <p className="mb-4">
        Users may request deletion of their account and associated data at any time by contacting:
        <a href="mailto:support@numlockitsolutions.co.in" className="text-green-600 underline"> support@numlockitsolutions.co.in</a>
      </p>

      <h2 className="text-2xl font-semibold text-green-500 mt-8 mb-2">5. Data Security</h2>
      <p className="mb-4">
        We take all reasonable steps to secure your data and ensure secure API communication between our
        platform and Meta’s services.
      </p>

      <h2 className="text-2xl font-semibold text-green-500 mt-8 mb-2">Contact</h2>
      <p className="mb-4">
        If you have questions, reach us at:
        <a href="mailto:support@numlockitsolutions.co.in" className="text-green-600 underline"> support@numlockitsolutions.co.in</a>
      </p>

      <p className="text-sm text-gray-500">Updated on: April 17, 2025</p>
    </div>
  );
};

export default PrivacyPolicy;
