// // TemplateViewModal.jsx
// import React from "react";
// import { assest } from "../../assets/assets";

// const TemplateViewModal = ({ isOpen, onClose, template }) => {
//   if (!isOpen || !template) return null;
//   console.log("Template in Modal:", template);
//   return (
//     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-2 sm:px-0">
//       <div
//         className="w-full sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[35%] max-h-[80vh] overflow-auto border rounded-xl shadow-md p-4 sm:p-6 relative bg-white"
//         style={{
//           backgroundImage: `url(${assest.whatsapp_bg})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 bg-gray-200 rounded-full p-1 hover:bg-red-400 hover:text-white"
//         >
//           ✕
//         </button>

//         {/* WhatsApp Icon */}
//         <img
//           src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
//           alt="WhatsApp Logo"
//           className="w-6 h-6 mb-4"
//         />

//        {/* Header Image for IMAGE Templates */}
//         {template.header_type === "IMAGE" && (
//           <div className="mb-4 flex justify-start">
//             <img
//               src="https://png.pngtree.com/png-clipart/20190619/original/pngtree-vector-gallery-icon-png-image_3989549.jpg"
//               alt="Template Header"
//               className="rounded-lg max-w-full h-auto"
//               style={{ maxHeight: "200px", objectFit: "cover" }}
//             />
//           </div>
//         )}

//         {/* Message Bubble */}
//         <div className="flex justify-start">
//           <div className="flex items-end">
//             <svg height="13" width="8">
//               <path
//                 fill="white"
//                 d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z"
//               />
//             </svg>
//           </div>
//           <div className="rounded-r-lg rounded-tl-lg bg-white py-2 px-3 w-full">
//             {template.header_text && (
//               <h1 className="font-semibold text-base sm:text-lg">
//                 {template.header_text}
//               </h1>
//             )}
//             <span className="text-sm sm:text-base">{template.body_text}</span>
//             {template.footer_text && (
//               <div className="text-xs text-gray-500 mt-1">
//                 <span className="font-light">{template.footer_text}</span>
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Buttons */}
//         {template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0 && (
//           <div className="flex flex-wrap justify-start gap-2 py-2">
//             {template.buttons.map((btn, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-lg px-4 py-1 text-blue-500 text-sm sm:text-base shadow-sm border cursor-default"
//               >
//                 {btn.text}
//               </div>
//             ))}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default TemplateViewModal;

import React from "react";
import { X } from "lucide-react";
import { assest } from "../../assets/assets";

const TemplateViewModal = ({ isOpen, onClose, template }) => {
  if (!isOpen || !template) return null;
  console.log("Template in Modal:", template);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 flex items-center justify-center px-2 sm:px-0 backdrop-blur-sm transition-colors">
      <div
        className="w-full sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[35%] max-h-[80vh] overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 sm:p-6 relative bg-white dark:bg-[#111827] transition-colors"
        style={{
          backgroundImage: `url(${assest.whatsapp_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark-mode readability overlay */}
        <div className="absolute inset-0 bg-white/80 dark:bg-[#111827]/90 rounded-xl pointer-events-none" />

        <div className="relative z-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full p-1.5 hover:bg-red-400 dark:hover:bg-red-500 hover:text-white transition-colors shadow-sm"
          >
            <X size={16} />
          </button>

          {/* WhatsApp Icon */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp Logo"
            className="w-6 h-6 mb-4"
          />

          {/* Header Image for IMAGE Templates */}
          {template.header_type === "IMAGE" && (
            <div className="mb-4 flex justify-start">
              <img
                src="https://png.pngtree.com/png-clipart/20190619/original/pngtree-vector-gallery-icon-png-image_3989549.jpg"
                alt="Template Header"
                className="rounded-lg max-w-full h-auto border border-gray-200 dark:border-gray-700"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Message Bubble */}
          <div className="flex justify-start">
            <div className="flex items-end">
              <svg height="13" width="8">
                <path
                  className="fill-white dark:fill-[#1f2937]"
                  d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z"
                />
              </svg>
            </div>
            <div className="rounded-r-lg rounded-tl-lg bg-white dark:bg-[#1f2937] py-2 px-3 w-full shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              {template.header_text && (
                <h1 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
                  {template.header_text}
                </h1>
              )}
              <span className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {template.body_text}
              </span>
              {template.footer_text && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-light">{template.footer_text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          {template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0 && (
            <div className="flex flex-wrap justify-start gap-2 py-2">
              {template.buttons.map((btn, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#1f2937] rounded-lg px-4 py-1.5 text-blue-500 dark:text-blue-400 text-sm sm:text-base shadow-sm border border-gray-200 dark:border-gray-700 cursor-default transition-colors"
                >
                  {btn.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateViewModal;
