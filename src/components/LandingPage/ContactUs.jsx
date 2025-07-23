import React from 'react';

const ContactUs = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-800 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-8 text-center">
        Contact Us
      </h1>
      <p className="mb-6 text-lg leading-relaxed">
        We’re here to assist you with any questions or support needs for Numlockitsolutions WhatsApp Marketing, a Razorpay-verified WhatsApp automation platform. Reach out to us using the details below.
      </p>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">Get in Touch</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Email</strong>: <a href="mailto:support@numlockitsolutions.co.in" className="text-blue-600 underline hover:text-blue-800">support@numlockitsolutions.co.in</a></li>
        <li><strong>Response Time</strong>: We aim to respond within 24-48 hours.</li>
        <li><strong>Support Hours</strong>: Monday to Friday, 9 AM to 6 PM IST.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">Additional Information</h2>
      <p className="mb-6">
        For urgent issues, please include your account details and a brief description of the problem in your email. We value your feedback and are committed to improving your experience.
      </p>

      <p className="text-sm text-gray-600 text-center mt-8">Last Updated: April 17, 2025</p>
    </div>
  );
};

export default ContactUs;