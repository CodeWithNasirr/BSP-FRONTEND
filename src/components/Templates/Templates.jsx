import React, { useEffect, useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";
import TemplateViewModal from "./TemplateViewModal.jsx";

function Templates() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setViewModalOpen(true);
  };
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const toggleDropdown = (dropdownId) => {
    setActiveDropdownId(activeDropdownId === dropdownId ? null : dropdownId);
  };

  const delete_template = async (template_name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${template_name}"?`);
    if (!confirmDelete) return; // If user cancels, exit function
  
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/whatsapp/templates/${template_name}/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success(response.data.message, {
        onClose: () => {
          window.location.reload();
        },
        autoClose: 2000 // Close toast after 2 seconds
      });
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.error || error.message));
    }
  };

  const handleSync = async (e) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/whatsapp/templates/sync/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success(response.data.message, {
        onClose: () => {
          window.location.reload();
        },
        autoClose: 2000 // Close toast after 2 seconds
      });
    } catch (error) {
      toast.error((error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates from API
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/whatsapp/templates/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        setTemplates(response.data);
        setLoading(false);
        // console.log(templates.Data);
      })
      .catch((error) => {
        toast.error(error)
        // console.error("Error fetching templates:", error);
        setLoading(false);
      });
  }, []);
    <TemplateViewModal
    isOpen={viewModalOpen}
    onClose={() => setViewModalOpen(false)}
    template={selectedTemplate}
  />



  return (
    <div className="Main w-full h-screen bg-slate-100 px-15">
      {/* Header */}
      <div className="header flex justify-between py-1 px-5">
        <div className="left px-5 py-5">
          <h2 className="font-semibold text-xl mb-1">Message Templates</h2>
          <p className="mb-6 flex items-center text-sm leading-6 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11v5m0 5a9 9 0 1 1 0-18a9 9 0 0 1 0 18Zm.05-13v.1h-.1V8h.1Z"
              ></path>
            </svg>
            <span className="ml-1 mt-1">Add Template</span>
          </p>
        </div>
        <div className="right gap-2 px-10 text-white flex items-center">
          <button
            onClick={handleSync}
            disabled={loading}
            className={`rounded-full px-5 py-2 text-white text-sm font-semibold flex items-center ${
              loading
                ? "bg-gray-400 cursor-not-allowed animate-pulse"
                : "bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
            }`}
          >
            {loading ? "Syncing..." : "Sync Template"}
          </button>
          <button
            className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center"
            onClick={() => navigate("/templates/create")}
          >
            Create Template
          </button>
        </div>
      </div>

      {/* Table Headers */}
      <div className="container max-h-[500px] overflow-y-auto">
        {/* Table Headers */}
        <div className="mx-10 bg-white py-3 px-2 rounded-md sticky top-0 z-10 shadow-md">
          <div className="flex justify-center text-blue-600 font-semibold text-sm bg-gray-100 py-3 rounded-md">
            {["Name", "Category", "Status", "Last Updated"].map(
              (item, index) => (
                <div key={index} className="w-1/4 text-center">
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        {/* Templates List */}
        {loading ? (
          <p className=" animate-pulse text-center py-30 text-2xl text-gray-600">
            Loading templates...
          </p>
        ) : templates.Data.length > 0 ? (
          <div className="templates mx-10 rounded-xl bg-white py-3 mt-2">
            {templates.Data.map((template, index) => (
              <div
                key={index}
                className="flex items-center border-b last:border-none py-2"
              >
                <p className="w-1/4 text-center text-gray-700">
                  {template.template_name}
                </p>
                <p className="w-1/4 text-center text-gray-700">
                  {template.template_category}
                </p>
                <p
                  className={`w-1/4 text-center ${
                    template.status === "APPROVED"
                      ? "text-green-700"
                      : template.status === "REJECTED" ||
                        template.status === "PENDING"
                      ? "text-red-700"
                      : "text-green-700"
                  } font-roboto`}
                >
                  {template.status}
                </p>
                <p className="w-1/4 text-center text-gray-700">
                  {new Date(template.updated_at).toLocaleString()}
                </p>

                <div className="relative inline-block text-left">
                  {/* SVG Button */}
                  <button
                    className="p-2 hover:bg-gray-200 cursor-pointer rounded-full"
                    onClick={() => toggleDropdown(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2Z"
                      ></path>
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdownId === index && (
                    <div className="absolute right-0 origin-top-right z-10 mt-2 w-32 divide-y divide-gray-300 rounded-md bg-white shadow-lg ring-opacity-5 focus:outline-none">
                      <div className="px-1 py-1" role="none">
                        <Link
                          to="#"
                          onClick={() => handleViewTemplate(template)}
                          className="text-black hover:bg-blue-600 hover:text-white flex w-full rounded-md px-2 py-2 text-sm"
                        >
                          View
                        </Link>
                        <button
                          className="text-black hover:bg-blue-600 hover:text-white cursor-pointer flex w-full rounded-md px-2 py-2 text-sm text-left"
              
                          onClick={()=>delete_template(template.template_name)}
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
          <div className="p-4 py-3 mx-10 rounded-xl bg-white ">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="72"
                height="72"
                viewBox="0 0 32 32"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M12 15h8m-8 4h8m8 5V11c0-1.105-.892-2-1.997-2H17c-2 0-2-3-5-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2Z"
                ></path>
              </svg>
            </div>
            <h3 className="text-center text-lg font-medium mb-4">
              You don't have any templates
            </h3>
            <div className="flex justify-center">
              <button
                className="rounded-full bg-green-900 hover:bg-green-700 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center"
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
    
    
  );
  
}

export default Templates;
