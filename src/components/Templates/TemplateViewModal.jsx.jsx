// TemplateViewModal.jsx
import React from "react";
import API_BASE_URL from "../../config";

const TemplateViewModal = ({ isOpen, onClose, template }) => {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="w-[30%] max-h-[80%] overflow-auto border rounded-xl shadow-md p-4 bg-cover bg-center relative bg-white"
        style={{
          backgroundImage: `url('${API_BASE_URL}/media/FILES/whatsapp-bg-02.png')`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-200 rounded-full p-1 hover:bg-red-400 hover:text-white"
        >
          ✕
        </button>

        {/* WhatsApp Icon */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp Logo"
          className="w-6 h-6 mb-4"
        />

        {/* Message Bubble */}
        <div className="flex justify-start">
          <div className="flex items-end">
            <svg height="13" width="8">
              <path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z" />
            </svg>
          </div>
          <div className="rounded-r-lg rounded-tl-lg bg-white py-2 px-3 w-full">
            {template.header_text && <h1 className="font-semibold">{template.header_text}</h1>}
            <span className="text-sm">{template.body_text}</span>
            {template.footer_text && (
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-light">{template.footer_text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Button */}
        {template.button_text && (
          <div className="flex justify-start items-center py-2">
            <span className="bg-white rounded-lg w-full text-center text-blue-500 py-1">
              {template.button_text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateViewModal;
