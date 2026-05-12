// import React, { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
// import API_BASE_URL from "../../config";
// import { toast } from "react-toastify";
// import TemplateViewModal from "./TemplateViewModal.jsx";
// import RequireSubscription from "../Subscriptions/RequireSubscription.jsx";

// function Templates() {
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);

//   const [templates, setTemplates] = useState({ Data: [] }); // Initialize with empty Data array
//   const [loading, setLoading] = useState(true);
//   const [activeDropdownId, setActiveDropdownId] = useState(null);
//   const token = localStorage.getItem("authToken");
//   const navigate = useNavigate();
  
//   const handleViewTemplate = (template) => {
//     setSelectedTemplate(template);
//     setViewModalOpen(true);
//   };

//   const toggleDropdown = (dropdownId) => {
//     setActiveDropdownId(activeDropdownId === dropdownId ? null : dropdownId);
//   };

//   // Fetch templates from API
//   const fetchTemplates = async () => {
//     // setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/whatsapp/templates/`, {
//         headers: {
//           Authorization: `Token ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       setTemplates(response.data); // Update state with fetched templates
//       setLoading(false);
//     } catch (error) {
//       toast.error(error.response?.data?.error || "Failed to fetch templates");
//       setLoading(false);
//     }
//   };

//   // Initial fetch on component mount
//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   const delete_template = async (template_name) => {
//     const confirmDelete = window.confirm(`Are you sure you want to delete "${template_name}"?`);
//     if (!confirmDelete) return;

//     try {
//       const response = await axios.delete(`${API_BASE_URL}/api/whatsapp/templates/${template_name}/`, {
//         headers: {
//           Authorization: `Token ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       toast.success(response.data.message, {
//         autoClose: 2000,
//       });
//       // Refetch templates to update the list in real-time
//       await fetchTemplates();
//     } catch (error) {
//       toast.error(error.response?.data?.error || error.message);
//     }
//   };

//   const handleSync = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/whatsapp/templates/sync/`, {
//         headers: {
//           Authorization: `Token ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       toast.success(response.data.message, {
//         autoClose: 2000,
//       });
//       // Refetch templates to update the list in real-time
//       await fetchTemplates();
//     } catch (error) {
//       toast.error(error.response?.data?.error || error.message);
//     } finally {
//       setLoading(false);
//     }
//   };



//   return (
//    <RequireSubscription>
//   <div className="Main w-full max-h-screen bg-slate-100 px-4 sm:px-15">
//     {/* Header */}
//     <div className="header flex flex-col sm:flex-row justify-between py-1 px-4 sm:px-5">
//       <div className="left px-4 sm:px-5 py-5">
//         <h2 className="font-semibold text-xl mb-1">Message Templates</h2>
//         <p className="mb-6 flex items-center text-sm leading-6 text-gray-600">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//           >
//             <path
//               fill="none"
//               stroke="currentColor"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M12 11v5m0 5a9 9 0 1 1 0-18a9 9 0 0 1 0 18Zm.05-13v.1h-.1V8h.1Z"
//             ></path>
//           </svg>
//           <span className="ml-1 mt-1">Add Template</span>
//         </p>
//       </div>
//       <div className="right gap-2 px-4 sm:px-10 text-white flex flex-col sm:flex-row items-center">
//         <button
//           onClick={handleSync}
//           disabled={loading}
//           className={`rounded-full px-5 py-2 text-white text-sm font-semibold flex items-center w-full sm:w-auto mb-2 sm:mb-0 ${
//             loading
//               ? "bg-gray-400 cursor-not-allowed animate-pulse"
//               : "bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
//           }`}
//         >
//           {loading ? "Syncing..." : "Sync Template"}
//         </button>
//         <button
//           className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center w-full sm:w-auto"
//           onClick={() => navigate("/templates/create")}
//         >
//           Create Template
//         </button>
//       </div>
//     </div>

//     {/* Table Headers */}
//     <div className="container max-h-[500px] overflow-y-auto">
//       <div className="mx-4 sm:mx-10 bg-white py-3 px-2 rounded-md sticky top-0 z-10 shadow-md">
//         <div className="hidden sm:flex justify-center text-blue-600 font-semibold text-sm bg-gray-100 py-3 rounded-md">
//           {["Name", "Category", "Status", "Last Updated"].map((item, index) => (
//             <div key={index} className="w-1/4 text-center">{item}</div>
//           ))}
//         </div>
//         <div className="sm:hidden flex justify-between text-blue-600 font-semibold text-sm bg-gray-100 py-3 rounded-md">
//           <div className="w-1/2 text-center">Name</div>
//           <div className="w-1/2 text-center">Status</div>
//         </div>
//       </div>

//       {/* Templates List */}
//       {loading ? (
//         <p className="animate-pulse text-center py-30 text-2xl text-gray-600">
//           Loading templates...
//         </p>
//       ) : templates.Data.length > 0 ? (
//         <div className="templates mx-4 sm:mx-10 rounded-xl bg-white py-3 mt-2">
//           {templates.Data.map((template, index) => (
//             <div
//               key={index}
//               className="border-b last:border-none py-2 flex flex-col sm:flex-row sm:items-center"
//             >
//               <div className="sm:hidden w-full flex flex-col px-2">
//                 <p className="text-gray-700 font-medium">{template.template_name}</p>
//                 <p
//                   className={`text-center px-2 py-1 text-xs rounded-md ${
//                     template.status === "APPROVED"
//                       ? "bg-green-700"
//                       : template.status === "REJECTED" || template.status === "PENDING"
//                       ? "bg-red-700"
//                       : "bg-green-700"
//                   } text-white`}
//                 >
//                   {template.status}
//                 </p>
//               </div>
//               <div className="sm:hidden w-full px-2 mt-2 text-sm text-gray-600">
//                 <p>Category: {template.template_category}</p>
//                 <p>Updated: {new Date(template.updated_at).toLocaleString()}</p>
//               </div>
//               <p className="hidden sm:block w-1/4 text-center text-gray-700">
//                 {template.template_name}
//               </p>
//               <p className="hidden sm:block w-1/4 text-center text-gray-700">
//                 {template.template_category}
//               </p>
//               <p
//                 className={`hidden sm:block w-1/4 text-center ${
//                   template.status === "APPROVED"
//                     ? "text-green-700"
//                     : template.status === "REJECTED" || template.status === "PENDING"
//                     ? "text-red-700"
//                     : "text-green-700"
//                 } font-roboto`}
//               >
//                 {template.status}
//               </p>
//               <p className="hidden sm:block w-1/4 text-center text-gray-700">
//                 {new Date(template.updated_at).toLocaleString()}
//               </p>
//               <div className="relative inline-block text-left mt-2 sm:mt-0 sm:ml-auto">
//                 <button
//                   className="p-2 hover:bg-gray-200 cursor-pointer rounded-full"
//                   onClick={() => toggleDropdown(index)}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       fill="currentColor"
//                       d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2Z"
//                     ></path>
//                   </svg>
//                 </button>
//                 {activeDropdownId === index && (
//                   <div className="absolute right-0 origin-top-right z-10 mt-2 w-32 divide-y divide-gray-300 rounded-md bg-white shadow-lg ring-opacity-5 focus:outline-none">
//                     <div className="px-1 py-1" role="none">
//                       <button
                      
//                         onClick={() => handleViewTemplate(template)}
//                         className="text-black hover:bg-blue-600 hover:text-white flex w-full rounded-md px-2 py-2 text-sm"
//                       >
//                         View
//                       </button>
//                       <button
//                         className="text-black hover:bg-blue-600 hover:text-white cursor-pointer flex w-full rounded-md px-2 py-2 text-sm text-left"
//                         onClick={() => delete_template(template.template_name)}
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="p-4 py-3 mx-4 sm:mx-10 rounded-xl bg-white">
//           <div className="flex justify-center mb-4">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="72"
//               height="72"
//               viewBox="0 0 32 32"
//             >
//               <path
//                 fill="none"
//                 stroke="currentColor"
//                 strokeLinecap="round"
//                 strokeWidth="2"
//                 d="M12 15h8m-8 4h8m8 5V11c0-1.105-.892-2-1.997-2H17c-2 0-2-3-5-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2Z"
//               ></path>
//             </svg>
//           </div>
//           <h3 className="text-center text-lg font-medium mb-4">
//             You don't have any templates
//           </h3>
//           <div className="flex justify-center">
//             <button
//               className="rounded-full bg-green-900 hover:bg-green-700 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center"
//               onClick={() => navigate("/templates/create")}
//             >
//               Create Template
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//     <TemplateViewModal
//       isOpen={viewModalOpen}
//       onClose={() => setViewModalOpen(false)}
//       template={selectedTemplate}
//     />
//   </div>
// </RequireSubscription>
    
    
//   );
  
// }

// export default Templates;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";
import TemplateViewModal from "./TemplateViewModal.jsx";
import RequireSubscription from "../Subscriptions/RequireSubscription.jsx";

function Templates() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState({ Data: [] });
  const [loading, setLoading] = useState(true);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setViewModalOpen(true);
  };

  const toggleDropdown = (dropdownId) => {
    setActiveDropdownId(activeDropdownId === dropdownId ? null : dropdownId);
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/whatsapp/templates/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      setTemplates(response.data);
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch templates");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const delete_template = async (template_name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${template_name}"?`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/whatsapp/templates/${template_name}/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success(response.data.message, { autoClose: 2000 });
      await fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/whatsapp/templates/sync/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success(response.data.message, { autoClose: 2000 });
      await fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireSubscription>
      <div className="Main w-full min-h-screen overflow-visible bg-slate-100 dark:bg-[#111827] px-4 sm:px-15 transition-colors">
        {/* Header */}
        <div className="header flex flex-col sm:flex-row justify-between py-1 px-4 sm:px-5">
          <div className="left px-4 sm:px-5 py-5">
            <h2 className="font-semibold text-xl mb-1 text-gray-900 dark:text-gray-100">Message Templates</h2>
            <p className="mb-6 flex items-center text-sm leading-6 text-gray-600 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 11v5m0 5a9 9 0 1 1 0-18a9 9 0 0 1 0 18Zm.05-13v.1h-.1V8h.1Z" />
              </svg>
              <span className="ml-1 mt-1">Add Template</span>
            </p>
          </div>
          <div className="right gap-2 px-4 sm:px-10 text-white flex flex-col sm:flex-row items-center">
            <button
              onClick={handleSync}
              disabled={loading}
              className={`rounded-full px-5 py-2 text-white text-sm font-semibold flex items-center w-full sm:w-auto mb-2 sm:mb-0 transition-all ${
                loading
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
              }`}
            >
              {loading ? "Syncing..." : "Sync Template"}
            </button>
            <button
              className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center w-full sm:w-auto transition-all active:scale-95 shadow-sm"
              onClick={() => navigate("/templates/create")}
            >
              Create Template
            </button>
          </div>
        </div>

        {/* Table Headers */}
        <div className="container max-h-screen overflow-y-auto overflow-x-visible">
          <div className="mx-4 sm:mx-10 bg-white dark:bg-[#111827] py-3 px-2 rounded-md sticky top-0 z-10 shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="hidden sm:flex justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm bg-gray-100 dark:bg-gray-800 py-3 rounded-md transition-colors">
              {["Name", "Category", "Status", "Last Updated"].map((item, index) => (
                <div key={index} className="w-1/4 text-center">{item}</div>
              ))}
            </div>
            <div className="sm:hidden flex justify-between text-blue-600 dark:text-blue-400 font-semibold text-sm bg-gray-100 dark:bg-gray-800 py-3 rounded-md transition-colors">
              <div className="w-1/2 text-center">Name</div>
              <div className="w-1/2 text-center">Status</div>
            </div>
          </div>

          {/* Templates List */}
          {loading ? (
            <p className="animate-pulse text-center py-30 text-2xl text-gray-600 dark:text-gray-400">
              Loading templates...
            </p>
          ) : templates.Data.length > 0 ? (
            <div className="templates mx-4 sm:mx-10 rounded-xl bg-white dark:bg-[#111827] py-3 mt-2 border border-gray-200 dark:border-gray-700 transition-colors">
              {templates.Data.map((template, index) => (
                <div
                  key={index}
                  className="relative border-b last:border-none dark:border-gray-700 py-2 flex flex-col sm:flex-row sm:items-center"
                >
                  <div className="sm:hidden w-full flex flex-col px-2">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{template.template_name}</p>
                    <p
                      className={`text-center px-2 py-1 text-xs rounded-md ${
                        template.status === "APPROVED"
                          ? "bg-green-700"
                          : template.status === "REJECTED" || template.status === "PENDING"
                          ? "bg-red-700"
                          : "bg-green-700"
                      } text-white`}
                    >
                      {template.status}
                    </p>
                  </div>
                  <div className="sm:hidden w-full px-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>Category: {template.template_category}</p>
                    <p>Updated: {new Date(template.updated_at).toLocaleString()}</p>
                  </div>
                  <p className="hidden sm:block w-1/4 text-center text-gray-700 dark:text-gray-300">
                    {template.template_name}
                  </p>
                  <p className="hidden sm:block w-1/4 text-center text-gray-700 dark:text-gray-300">
                    {template.template_category}
                  </p>
                  <p
                    className={`hidden sm:block w-1/4 text-center font-roboto ${
                      template.status === "APPROVED"
                        ? "text-green-700 dark:text-green-400"
                        : template.status === "REJECTED" || template.status === "PENDING"
                        ? "text-red-700 dark:text-red-400"
                        : "text-green-700 dark:text-green-400"
                    }`}
                  >
                    {template.status}
                  </p>
                  <p className="hidden sm:block w-1/4 text-center text-gray-700 dark:text-gray-300">
                    {new Date(template.updated_at).toLocaleString()}
                  </p>
                  <div className="relative inline-block text-left mt-2 sm:mt-0 sm:ml-auto">
                    <button
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                      onClick={() => toggleDropdown(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor"
                          d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2Z" />
                      </svg>
                    </button>
                    {activeDropdownId === index && (
                      <div
                        className={`
                          absolute right-0 z-50 w-32
                          rounded-md bg-white dark:bg-[#111827]
                          shadow-xl border border-gray-200 dark:border-gray-700
                          divide-y divide-gray-300 dark:divide-gray-700
                          ring-1 ring-black/5
                          transition-all
                          ${
                            index >= templates.Data.length - 2
                              ? "bottom-full mb-2 origin-bottom-right"
                              : "top-full mt-2 origin-top-right"
                          }
                        `}
                      >
                        <div className="px-1 py-1" role="none">
                          <button
                            onClick={() => handleViewTemplate(template)}
                            className="text-gray-900 dark:text-gray-100 hover:bg-blue-600 hover:text-white flex w-full rounded-md px-2 py-2 text-sm transition-colors"
                          >
                            View
                          </button>
                          <button
                            className="text-gray-900 dark:text-gray-100 hover:bg-blue-600 hover:text-white cursor-pointer flex w-full rounded-md px-2 py-2 text-sm text-left transition-colors"
                            onClick={() => delete_template(template.template_name)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 py-3 mx-4 sm:mx-10 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="flex justify-center mb-4 text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 32 32">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"
                    d="M12 15h8m-8 4h8m8 5V11c0-1.105-.892-2-1.997-2H17c-2 0-2-3-5-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2Z" />
                </svg>
              </div>
              <h3 className="text-center text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                You don't have any templates
              </h3>
              <div className="flex justify-center">
                <button
                  className="rounded-full bg-green-900 hover:bg-green-700 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center transition-all active:scale-95 shadow-sm"
                  onClick={() => navigate("/templates/create")}
                >
                  Create Template
                </button>
              </div>
            </div>
          )}
        </div>
        <TemplateViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          template={selectedTemplate}
        />
      </div>
    </RequireSubscription>
  );
}

export default Templates;
