import React, { useState, useEffect,useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Context } from "../context/Context";
import { assest } from "../../assets/assets";
import RequireSubscription from "../Subscriptions/RequireSubscription";
function CreateTemplate() {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true); 
  const token = localStorage.getItem("authToken");
  const [loading,setLoading] = useState(false)
  const [formData, setformData] = useState({
    template_name: "",
    template_language: "",
    template_category: "",
    header_type: "",
    header_text: "",
    header_img_video_file_url: "",
    body_text: "",
    footer_text: "",
    button_type: "",
    button_text: "",
    button_url: "", 
    button_number: "",
    placeholder_mappings: {}, // Store variable to contact field mappings
    
  });

  const [variables, setVariables] = useState([]);

  // Function to extract variables like {{1}}, {{2}}, etc.
  const extractVariables = (text) => {
    const regex = /{{\d+}}/g;
    const matches = text.match(regex) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  // Update variables whenever body_text changes
  useEffect(() => {
    const extractedVars = extractVariables(formData.body_text || formData.header_text);
    setVariables(extractedVars);
  }, [formData.body_text],[formData.header_text]);

// Handle variable mapping changes (field selection)
  const handleVariableFieldChange = (variable, field) => {
    setformData((prev) => ({
      ...prev,
      placeholder_mappings: {
        ...prev.placeholder_mappings,
        [variable]: {
          ...prev.placeholder_mappings[variable],
          field: field,
        },
      },
    }));
  };



 // Handle variable example changes
  const handleVariableExampleChange = (variable, example) => {
    setformData((prev) => ({
      ...prev,
      placeholder_mappings: {
        ...prev.placeholder_mappings,
        [variable]: {
          ...prev.placeholder_mappings[variable],
          example: example,
        },
      },
    }));
  };



  const headerButtonClick = (btn) => {
    setActiveButton(btn);
    setformData((prev) => ({ ...prev, header_type: btn })); // Update formData
  };
  const [isVisible, setIsVisible] = useState(true);

  const bottomButtonClick = (type) => {
    setActiveButton(type);
    setIsVisible(true);
    setformData((prev) => ({ ...prev, button_type: type })); // Update formData
  };

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    setformData((prevData) => {
      let updatedData;

      if (type === "file") {
        updatedData = { ...prevData, [name]: files[0] }; // ✅ Store file object
      } else {
        updatedData={
        ...prevData,
        [name]:name === 'template_name'?value.toLowerCase() : value
      }}

      // Check if all required fields are filled
      const isFormComplete =
        updatedData.template_name.trim() !== "" &&
        updatedData.template_language.trim() !== "" &&
        updatedData.template_category.trim() !== "" &&
        updatedData.body_text.trim() !== "";

      // Update isDisabled state
      // console.log(formData);
      setIsDisabled(!isFormComplete);
      return updatedData;
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Prepare form data
    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (
        typeof value === "string" &&
        value.trim() === "" &&
        key !== "header_img_video_file_url"
      ) {
        return; // Skip empty strings except files
      }

      if (key === "placeholder_mappings") {
        formDataToSend.append(key, JSON.stringify(value));
      } else {
        formDataToSend.append(key, value);
      }
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/whatsapp/create-template/`,
      formDataToSend,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Template Created Successfully!");
    console.log(response)
    resetFormData();

  } catch (error) {
    console.error("Error creating template:", error?.response?.data);

    try {
      const errorData = JSON.parse(error?.response?.data?.error || "{}");
      const userMsg = errorData?.error?.error_user_msg || "Failed to create template";
      toast.error(userMsg);
    } catch {
      // console.log(error.response.data.error)
      toast.error(error.response.data.error.error_user_msg);
    }
  } finally {
    setLoading(false);
  }
};

// Optional: Clear form data separately for reusability
const resetFormData = () => {
  setformData({
    template_name: "",
    template_language: "",
    template_category: "",
    header_type: "",
    header_text: "",
    header_img_video_file_url: "",
    body_text: "",
    footer_text: "",
    button_type: "",
    button_text: "",
    button_url: "",
    button_number: "",
    placeholder_mappings:{},
  });
};

  const {isConnected} = useContext(Context)
  return (
    <RequireSubscription>
    <div className="main bg-zinc-50">
      <form onSubmit={handleSubmit}>
        <div className="header flex justify-between px-5">
          <div className="left py-5 ">
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
              className="rounded-full bg-black cursor-pointer px-5 py-2 text-white text-sm font-semibold  flex items-center"
              onMouseDown={() => navigate("/templates")}
            >
              Back
            </button>
            <button
              className={`rounded-full px-5 py-2 text-white text-sm font-semibold flex items-center 
          ${
            isDisabled 
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 cursor-pointer"
          }`}
              disabled={isDisabled}
              type="submit"
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </div>

        <div className="container flex flex-row w-full max-h-[500px]">
          {!isConnected && (
            <div className="md:w-[50%] md:p-8 overflow-y-auto">
              <div className="p-4 md:p-8 overflow-y-auto">
                <div className="bg-slate-50 border border-primary shadow rounded-md p-4 py-8">
                  {/* Icon Container */}
                  <div className="flex justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="72"
                      height="72"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="black"
                        d="M43.634 4.366a1.25 1.25 0 0 1 0 1.768l-4.913 4.913a9.253 9.253 0 0 1-.744 12.244l-3.343 3.343a1.25 1.25 0 0 1-1.768 0l-11.5-11.5a1.25 1.25 0 0 1 0-1.768l3.343-3.343a9.25 9.25 0 0 1 12.244-.743l4.913-4.914a1.25 1.25 0 0 1 1.768 0m-7.611 7.425a6.75 6.75 0 0 0-9.546 0l-2.46 2.459l9.733 9.732l2.46-2.459a6.75 6.75 0 0 0 0-9.546zM9.28 36.953l-4.914 4.913a1.25 1.25 0 0 0 1.768 1.768l4.913-4.913a9.253 9.253 0 0 0 12.244-.744l3.343-3.343a1.25 1.25 0 0 0 0-1.768L25.268 31.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L23.5 29.732L18.268 24.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L16.5 22.732l-1.366-1.366a1.25 1.25 0 0 0-1.768 0l-3.343 3.343a9.25 9.25 0 0 0-.743 12.244m2.51-10.476l2.46-2.46l9.732 9.733l-2.459 2.46a6.75 6.75 0 0 1-9.546 0l-.186-.187a6.75 6.75 0 0 1 0-9.546"
                      />
                    </svg>
                  </div>

                  {/* Heading */}
                  <h3 className="text-center text-lg font-medium mb-4">
                    Connect your whatsapp account
                  </h3>

                  {/* Subheading */}
                  <h4 className="text-center mb-4">
                    You need to connect your WhatsApp account first before you
                    can create a template.
                  </h4>

                  {/* Button Link */}
                  <Link  to={isConnected ? "#" : "/connect-form"} onClick={(e) => isConnected && e.preventDefault()} className={`rounded-md cursor-pointer ${isConnected ? 'bg-green-500 hover:bg-green-400' : 'bg-indigo-600 hover:bg-indigo-500'
                  } px-3 py-2 text-sm font-semibold text-white shadow-sm mx-10`}
                  disabled={isConnected}>{isConnected ? 'Connected WhatsApp Successfully' : 'Connect WhatsApp Business'}</Link>
                </div>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="md:w-[50%] md:p-8 overflow-y-auto">
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-6 mb-8 capitalize">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="template_name"
                    className="block text-sm leading-6 text-gray-900"
                  >
                    Name
                  </label>
                  <div>
                    <input
                      name="template_name"
                      value={formData.template_name}
                      onChange={handleChange}
                      className="block w-full bg-white rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                      type="text"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="template_category"
                    className="block text-sm leading-6 text-gray-900"
                  >
                    Category
                  </label>
                  <div className="relative">
                    <select
                      className="rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-5 text-sm"
                      value={formData.template_category}
                      onChange={handleChange}
                      name="template_category"
                      id="template_category"
                    >
                      <option value="" disabled className="sm:text-sm">
                        Select Category
                      </option>
                      <option value="UTILITY">Utility</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="AUTHENTICATION">AUTHENTICATION</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="template_language"
                    className="block text-sm leading-6 text-gray-900"
                  >
                    Language
                  </label>
                  <div className="relative">
                    <select
                      className="rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-5 text-sm"
                      value={formData.template_language}
                      onChange={handleChange}
                      name="template_language"
                      id="template_language"
                    >
                      <option value="" disabled>
                        Select Language
                      </option>
                      <option value="en_US">English</option>
                    </select>
                  </div>
                </div>
              </div>

              <h2 className="text-slate-600">
                Header <span className="text-xs">(Optional)</span>
              </h2>
              <span className="text-slate-600 text-xs">
                Add a title or choose which type of media you'll use for this
                header
              </span>
              <div className="grid grid-cols-4 mt-2 bg-[#f9f9fa] rounded-lg mb-4">
                {["TEXT", "IMAGE", "VIDEO", "DOCUMENT"].map((btn) => (
                  <button
                    type="button"
                    key={btn}
                    className={`text-center py-2 text-sm text-slate-800 m-1 
                ${activeButton === btn ? "bg-white shadow rounded-lg" : ""}
              cursor-pointer`}
                    onMouseDown={() => headerButtonClick(btn)}
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {activeButton == "TEXT" && (
                <div className="Text py-2">
                  <input
                    value={formData.header_text}
                    onChange={handleChange}
                    placeholder="Enter Heading text..."
                    className="block w-full bg-white rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                    type="text"
                    name="header_text"
                    id=""
                  />
                  {/* <span className="text-xs text-slate-600">Characters: 0/60</span> */}
                </div>
              )}
              {activeButton === "IMAGE" && (
                <div className="Img flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <input
                    onChange={handleChange}
                    type="file"
                    className="sr-only"
                    accept=".jpg, .png"
                    id="file-upload"
                    name="header_img_video_file_url"
                  />
                  <div className="text-center">
                    <div>
                      <label htmlFor="file-upload">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 cursor-pointer"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M14 9a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0Z"
                          ></path>
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M7.268 4.658a54.647 54.647 0 0 1 9.465 0l1.51.132a3.138 3.138 0 0 1 2.831 2.66a30.604 30.604 0 0 1 0 9.1a3.138 3.138 0 0 1-2.831 2.66l-1.51.131c-3.15.274-6.316.274-9.465 0l-1.51-.131a3.138 3.138 0 0 1-2.832-2.66a30.601 30.601 0 0 1 0-9.1a3.138 3.138 0 0 1 2.831-2.66l1.51-.132Zm9.335 1.495a53.147 53.147 0 0 0-9.206 0l-1.51.131A1.638 1.638 0 0 0 4.41 7.672a29.101 29.101 0 0 0-.311 5.17L7.97 8.97a.75.75 0 0 1 1.09.032l3.672 4.13l2.53-.844a.75.75 0 0 1 .796.21l3.519 3.91a29.101 29.101 0 0 0 .014-8.736a1.638 1.638 0 0 0-1.478-1.388l-1.51-.131Zm2.017 11.435l-3.349-3.721l-2.534.844a.75.75 0 0 1-.798-.213l-3.471-3.905l-4.244 4.243c.049.498.11.996.185 1.491a1.638 1.638 0 0 0 1.478 1.389l1.51.131c3.063.266 6.143.266 9.206 0l1.51-.131c.178-.016.35-.06.507-.128Z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </label>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>
                            Provide examples of the variables or media in the
                            header
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG or JPG files only
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeButton === "VIDEO" && (
                <div className="Video flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <input
                    onChange={handleChange}
                    type="file"
                    className="sr-only"
                    accept=".mp4"
                    id="file-upload"
                    name="header_img_video_file_url"
                  />
                  <div className="text-center">
                    <div>
                      <label htmlFor="file-upload">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 cursor-pointer"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            d="M2 11.5c0-3.287 0-4.931.908-6.038a4 4 0 0 1 .554-.554C4.57 4 6.212 4 9.5 4c3.287 0 4.931 0 6.038.908a4 4 0 0 1 .554.554C17 6.57 17 8.212 17 11.5v1c0 3.287 0 4.931-.908 6.038a4.001 4.001 0 0 1-.554.554C14.43 20 12.788 20 9.5 20c-3.287 0-4.931 0-6.038-.908a4 4 0 0 1-.554-.554C2 17.43 2 15.788 2 12.5v-1Zm15-2l.658-.329c1.946-.973 2.92-1.46 3.63-1.02c.712.44.712 1.528.712 3.703v.292c0 2.176 0 3.263-.711 3.703c-.712.44-1.685-.047-3.63-1.02L17 14.5v-5Z"
                          ></path>
                        </svg>
                      </label>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>
                            Provide examples of the variables or media in the
                            header
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">MP4 files only</p>
                    </div>
                  </div>
                </div>
              )}
              {activeButton === "DOCUMENT" && (
                <div className="Doc flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <input
                    onChange={handleChange}
                    type="file"
                    className="sr-only"
                    accept=".pdf"
                    id="file-upload"
                    name="header_img_video_file_url"
                  />
                  <div className="text-center">
                    <div>
                      <label htmlFor="file-upload">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 cursor-pointer"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M18.53 9L13 3.47a.75.75 0 0 0-.53-.22H8A2.75 2.75 0 0 0 5.25 6v12A2.75 2.75 0 0 0 8 20.75h8A2.75 2.75 0 0 0 18.75 18V9.5a.75.75 0 0 0-.22-.5Zm-5.28-3.19l2.94 2.94h-2.94ZM16 19.25H8A1.25 1.25 0 0 1 6.75 18V6A1.25 1.25 0 0 1 8 4.75h3.75V9.5a.76.76 0 0 0 .75.75h4.75V18A1.25 1.25 0 0 1 16 19.25Z"
                          ></path>
                          <path
                            fill="currentColor"
                            d="M13.49 14.85a3.15 3.15 0 0 1-1.31-1.66a4.44 4.44 0 0 0 .19-2a.8.8 0 0 0-1.52-.19a5 5 0 0 0 .25 2.4A29 29 0 0 1 9.83 16c-.71.4-1.68 1-1.83 1.69c-.12.56.93 2 2.72-1.12a18.58 18.58 0 0 1 2.44-.72a4.72 4.72 0 0 0 2 .61a.82.82 0 0 0 .62-1.38c-.42-.43-1.67-.31-2.29-.23Zm-4.78 3a4.32 4.32 0 0 1 1.09-1.24c-.68 1.08-1.09 1.27-1.09 1.25Zm2.92-6.81c.26 0 .24 1.15.06 1.46a3.07 3.07 0 0 1-.06-1.45Zm-.87 4.88a14.76 14.76 0 0 0 .88-1.92a3.88 3.88 0 0 0 1.08 1.26a12.35 12.35 0 0 0-1.96.67Zm4.7-.18s-.18.22-1.33-.28c1.25-.08 1.46.21 1.33.29Z"
                          ></path>
                        </svg>
                      </label>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>
                            Provide examples of the variables or media in the
                            header
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF files only</p>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-slate-600">
                Body <span className="text-xs">(Required)</span>
              </h2>
              <span className="text-slate-600 text-xs">
                Enter the text for your message in the language that you've
                selected
              </span>
              <textarea
                value={formData.body_text}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                rows="5"
                name="body_text"
              ></textarea>

            {/* Variable Mapping and Samples Section */}
              {variables.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-slate-600 text-sm font-medium">
                    Map Variables to Contact Fields
                  </h3>
                  <p className="text-slate-600 text-xs mb-2">
                    Map each variable to a contact field for dynamic substitution and provide an example.
                  </p>
                  {variables.map((variable, index) => (
                    <div key={index} className="mb-2 flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="text-slate-600 text-xs">
                          [{variable}] - Field
                        </label>
                        <input
                          list="contact-fields"
                          value={formData.placeholder_mappings[variable]?.field || ""}
                          onChange={(e) => handleVariableFieldChange(variable, e.target.value)}
                          placeholder="Select or type a field name"
                          className="rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-5 text-sm w-full"
                        />
                        <datalist id="contact-fields">
                          <option value="name" />
                          <option value="email" />
                          <option value="phone" />
                          <option value="discount" />
                          <option value="offer_end_date" />
                          {/* Add more if needed */}
                        </datalist>
                      </div>
                      <div className="flex-1">
                        <label className="text-slate-600 text-xs">
                          [{variable}] - Example
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., John"
                          value={formData.placeholder_mappings[variable]?.example || ""}
                          onChange={(e) => handleVariableExampleChange(variable, e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="text-slate-600">
                Footer Description <span className="text-xs">(Optional)</span>
              </h2>
              <span className="text-slate-600 text-xs">
                Add a short line of text to the bottom of your message template
              </span>
              <textarea
                value={formData.footer_text}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                rows="2"
                name="footer_text"
              ></textarea>

              <h2 className="text-slate-600">
                Buttons <span className="text-xs">(Optional)</span>
              </h2>
              <span className="text-slate-600 text-xs">
                Create buttons that let customers respond to your message or
                take action
              </span>

              <div className="grid grid-cols-2 mt-3 mb-2">
                <button
                  type="button"
                  onMouseDown={() => bottomButtonClick("PHONE_CALL")}
                  name="PHONE_CALL"
                  className="flex items-center justify-center text-slate-700 text-sm bg-slate-100 hover:bg-slate-200 hover:shadow-sm rounded-lg p-2 px-4 mr-2 cursor-pointer"
                >
                  Call phone number
                </button>

                <button
                  type="button"
                  onMouseDown={() => bottomButtonClick("CALLBACK")}
                  name="button_url"
                  className="flex items-center justify-center text-slate-700 text-sm bg-slate-100 hover:bg-slate-200 hover:shadow-sm rounded-lg p-2 px-4 cursor-pointer"
                >
                  Visit website
                </button>

                <button
                  type="button"
                  onMouseDown={() => bottomButtonClick("QUICK-REPLIES")}
                  name="button_text"
                  className="flex items-center justify-center text-slate-700 text-sm bg-slate-100 hover:bg-slate-200 hover:shadow-sm rounded-lg p-2 px-4 mt-5 cursor-pointer"
                >
                  Simple Text
                </button>
              </div>

              {/* Phone Number  */}
              {activeButton === "PHONE_CALL" && isVisible && (
                <div className="mt-3 mb-8">
                  <div className="bg-[#f9f9fa] p-3 rounded-lg mb-3">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-sm">Call Phone Number</span>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setIsVisible(false);
                          setformData((prevData) => ({
                            ...prevData,
                            button_text: "",
                            button_number: "",
                            button_type: "",
                          }));
                        }}
                        className="bg-slate-200 hover:shadow rounded-full p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M17.707 7.707a1 1 0 0 0-1.414-1.414L12 10.586L7.707 6.293a1 1 0 0 0-1.414 1.414L10.586 12l-4.293 4.293a1 1 0 1 0 1.414 1.414L12 13.414l4.293 4.293a1 1 0 1 0 1.414-1.414L13.414 12l4.293-4.293Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="flex space-x-1 border-t pt-2">
                      {/* Button Text */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm leading-6 text-gray-900 mb-0">
                          Button Text
                        </label>
                        <input
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          type="text"
                          name="button_text"
                          value={formData.button_text}
                          onChange={handleChange}
                          placeholder="Enter button text"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm leading-6 text-gray-900 mb-0">
                          Phone Number
                        </label>
                        <input
                          value={formData.button_number}
                          onChange={handleChange}
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          type="text"
                          name="button_number"
                          // value={phoneNumber}
                          // onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Website */}
              {activeButton === "CALLBACK" && isVisible && (
                <div className="mt-3 mb-8">
                  <div className="bg-[#f9f9fa] p-3 rounded-lg mb-3">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-sm">Website URL</span>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setIsVisible(false);
                          setformData((prevData) => ({
                            ...prevData,
                            button_text: "",
                            button_type: "",
                            button_url: "",
                          }));
                        }}
                        className="bg-slate-200 hover:shadow rounded-full p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M17.707 7.707a1 1 0 0 0-1.414-1.414L12 10.586L7.707 6.293a1 1 0 0 0-1.414 1.414L10.586 12l-4.293 4.293a1 1 0 1 0 1.414 1.414L12 13.414l4.293 4.293a1 1 0 1 0 1.414-1.414L13.414 12l4.293-4.293Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="flex space-x-1 border-t pt-2">
                      {/* Button Text */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm leading-6 text-gray-900 mb-0">
                          Button Text
                        </label>
                        <input
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          name="button_text"
                          value={formData.button_text}
                          onChange={handleChange}
                          placeholder="Enter button text"
                        />
                      </div>

                      {/* Website URL */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm leading-6 text-gray-900 mb-0">
                          Website URL
                        </label>
                        <input
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          type="text"
                          name="button_url"
                          value={formData.button_url}
                          onChange={handleChange}
                          placeholder="Enter Website URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Simple Text */}
              {activeButton === "QUICK-REPLIES" && isVisible && (
                <div className="mt-3 mb-8">
                  <div className="bg-[#f9f9fa] p-3 rounded-lg mb-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="text-sm">Custom Button</span>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setIsVisible(false);
                          setformData((prevData) => ({
                            ...prevData,
                            button_text: "",
                            button_type: "",
                          }));
                        }}
                        className="bg-slate-200 hover:shadow rounded-full p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M17.707 7.707a1 1 0 0 0-1.414-1.414L12 10.586L7.707 6.293a1 1 0 0 0-1.414 1.414L10.586 12l-4.293 4.293a1 1 0 1 0 1.414 1.414L12 13.414l4.293 4.293a1 1 0 1 0 1.414-1.414L13.414 12l4.293-4.293Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Button Text */}
                    <div className="sm:col-span-2 py-2">
                      <label className="block text-sm leading-6 text-gray-900 mb-0">
                        Button Text
                      </label>
                      <input
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                        name="button_text"
                        value={formData.button_text}
                        onChange={handleChange}
                        placeholder="Enter button text"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
 
          <div className="w-[30%] mx-auto h-[50%] border overflow-auto rounded-xl shadow-md p-4 bg-cover bg-center" style={{ backgroundImage:`url(${assest.whatsapp_bg})`, }}>
          <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp Logo"
              className="w-6 h-6 mr-2"
            />
            <div className="flex justify-start">
              <div className="flex items-end">
                  <svg height="13" width="8">
                    <path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z" />
                  </svg>
                </div>
              <div className="rounded-r-lg rounded-tl-lg bg-white py-2 px-2">
              {/* <img 
                src="https://whatsappx.up.railway.app/media/static_media/WhatsApp_Image_2025-04-08_at_23.17.35_778df306.jpg" 
                alt="" 
                className="w-screen h-[30vh] object-cover"
              /> */}
                <h1 className="font-semibold">{formData.header_text}</h1>
                <span className="text-sm">{formData.body_text}</span>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-light">{formData.footer_text}</span>
                  <br />
                
                </div>
              </div>
            </div>
            <div className="flex justify-start items-center py-2">
                  <span className="bg-white rounded-l-lg rounded-r-lg w-full text-center text-blue-500">
                   {formData.button_text}
                  </span>
              </div>
           
          </div>
          
        </div>
      </form>
    </div>
    </RequireSubscription>
  );
}

export default CreateTemplate;
