import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-800 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-8 text-center">
        Privacy Policy – Numlock IT Solutions WhatsApp Marketing
      </h1>

      <p className="mb-6 text-lg leading-relaxed">
        At <strong>Numlock IT Solutions</strong>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal data when you use our WhatsApp marketing automation platform. We are a trusted service integrated with the WhatsApp Cloud API and secure payment gateways like Razorpay.
      </p>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>WhatsApp Business phone numbers</li>
        <li>WhatsApp message templates</li>
        <li>Meta user ID and access tokens (via Meta login)</li>
        <li>Name and email address (if provided)</li>
      </ul>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">2. How We Use Your Information</h2>
      <p className="mb-6">
        We only use your data to operate and improve our services. Specifically:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Send WhatsApp messages on your behalf through the Cloud API</li>
        <li>Manage and customize your message templates</li>
        <li>Analyze campaign performance to help you improve results</li>
      </ul>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">3. Data Sharing</h2>
      <p className="mb-6">
        We do not sell or rent your personal data. We only share it with:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Meta, for WhatsApp messaging functionality</li>
        <li>Razorpay, for secure payment processing</li>
        <li>Legal authorities, when required by law</li>
      </ul>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">4. Data Retention & Deletion</h2>
      <p className="mb-6">
        You can request deletion of your account and associated data anytime by contacting:
        <a
          href="mailto:support@numlockitsolutions.co.in"
          className="text-blue-600 underline hover:text-blue-800 ml-1"
        >
          support@numlockitsolutions.co.in
        </a>.
        We will fulfill your request in compliance with applicable laws and platform policies.
      </p>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">5. Data Security</h2>
      <p className="mb-6">
        We use industry-standard security practices, including:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Encrypted communication with Meta APIs</li>
        <li>Secure access token handling and storage</li>
        <li>Payment protection through Razorpay’s secure infrastructure</li>
      </ul>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">6. Contact Us</h2>
      <p className="mb-6">
        If you have any questions or concerns about this Privacy Policy, feel free to contact us at:
        <a
          href="mailto:support@numlockitsolutions.co.in"
          className="text-blue-600 underline hover:text-blue-800 ml-1"
        >
          support@numlockitsolutions.co.in
        </a>
      </p>

      <p className="text-sm text-gray-600 text-center mt-8">
        Last Updated: April 17, 2025
      </p>
    </div>
  );
};

export default PrivacyPolicy;
