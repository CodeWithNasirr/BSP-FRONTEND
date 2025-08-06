import React from 'react';

const MetaCatalogSetup = () => {
  const catalogCreateURL = "https://business.facebook.com/commerce/catalogs";
  const catalogActivateURL = "https://business.facebook.com/latest/whatsapp_manager/catalog?";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Meta Catalog Setup</h2>
        <p className="text-gray-600 text-sm">
          Use the buttons below to create your Meta product catalog and activate it for your WhatsApp Business Account (WABA).
        </p>

        <div className="space-y-4">
          <a
            href={catalogCreateURL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            ➕ Create New Catalog
          </a>

          <a
            href={catalogActivateURL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition"
          >
            ✅ Activate Catalog for WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default MetaCatalogSetup;
