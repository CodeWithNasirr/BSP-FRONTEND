import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Context } from "../context/Context";
import { assest } from "../../assets/assets";
import RequireSubscription from "../Subscriptions/RequireSubscription";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";


function CreateTemplate() {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({  
    template_name: "",
    template_language: "",
    template_category: "",
    header_type: "",
    header_text: "",
    header_media_url: "",
    // header_media_url: "",
    body_text: "",
    footer_text: "",
    buttons: [] ,
    // XXXXX
    button_type: "",
    button_text: "",
    button_url: "",
    button_number: "",
    // XXXXX
    placeholder_mappings: {},
  });

  const [variables, setVariables] = useState([]);

  // Function to extract variables like {{1}}, {{2}}, etc.
  const extractVariables = (text) => {
    const regex = /{{\d+}}/g;
    const matches = text.match(regex) || [];
    return [...new Set(matches)];
  };

  // Update variables whenever body_text or header_text changes
  useEffect(() => {
    const extractedVars = extractVariables(formData.body_text || formData.header_text);
    setVariables(extractedVars);
  }, [formData.body_text, formData.header_text]);

  // Handle variable mapping changes (field selection)
  const handleVariableFieldChange = (variable, field) => {
    setFormData((prev) => ({
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
    setFormData((prev) => ({
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
     setFormData((prev) => ({
      ...prev,
      header_type: "",
      header_text: "",
      header_media_url: "",
      // header_media_url: "",
    }));
    setFormData((prev) => ({ ...prev, header_type: btn }));

  };

  // New function to clear header selection
  const clearHeader = () => {
    setActiveButton(null);
    setFormData((prev) => ({
      ...prev,
      header_type: "",
      header_text: "",
      header_media_url: "",
      // header_media_url: "",
    }));
  };

  const [isVisible, setIsVisible] = useState(true);

  const bottomButtonClick = (type) => {
    setActiveButton(type);
    setIsVisible(true);
    setFormData((prev) => ({ ...prev, button_type: type }));
  };

  const addButton = (type) => {
    
    // 1️⃣ META BUTTON LIMIT RULES
    const quickRepliesCount = formData.buttons.filter(b => b.type === "QUICK-REPLIES").length;
    const callbackCallCount = formData.buttons.filter(b =>
        b.type === "CALLBACK" || b.type === "PHONE_CALL"
    ).length;

    // a) Quick replies limit = 10
    if (type === "QUICK-REPLIES" && quickRepliesCount >= 10) {
        toast.error("You can add a maximum of 10 quick reply buttons.");
        return;
    }

    // b) CALL + URL combined limit = 2
    if ((type === "CALLBACK" || type === "PHONE_CALL") && callbackCallCount >= 2) {
        toast.error("You can add a maximum of 2 Call/URL buttons combined.");
        return;
    }

    // c) Total max 10
    if (formData.buttons.length >= 10) {
        toast.error("Maximum 10 buttons allowed.");
        return;
    }

    // 2️⃣ VALIDATION OF BUTTON FIELDS
    if (!formData.button_text.trim()) {
        toast.error("Button text is required");
        return;
    }

    const newButton = { type, text: formData.button_text.trim() };

    if (type === "PHONE_CALL") {
        if (!formData.button_number.trim()) {
            toast.error("Phone number is required.");
            return;
        }
        newButton.phone_number = formData.button_number.trim();
    }

    if (type === "CALLBACK") {
        if (!formData.button_url.trim()) {
            toast.error("URL is required.");
            return;
        }
        newButton.url = formData.button_url.trim();
    }

    // 3️⃣ PUSH TO ARRAY
    setFormData(prev => ({
        ...prev,
        buttons: [...prev.buttons, newButton],
        button_text: "",
        button_url: "",
        button_number: "",
        button_type: "",
    }));

    setActiveButton(null);
  };

  const removeButton = (index) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index),
    }));
  };




  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    setFormData((prevData) => {
      let updatedData;

      if (type === "file") {
        updatedData = { ...prevData, [name]: files[0] };
      } else {
        updatedData = {
          ...prevData,
          [name]: name === "template_name" ? value.toLowerCase() : value,
        };
      }

      const isFormComplete =
        updatedData.template_name.trim() !== "" &&
        updatedData.template_language.trim() !== "" &&
        updatedData.template_category.trim() !== "" &&
        updatedData.body_text.trim() !== "";

      setIsDisabled(!isFormComplete);
      return updatedData;
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (
          typeof value === "string" &&
          value.trim() === "" &&
          key !== "header_media_url"
        ) {
          return;
        }
        if (key === "buttons") return;
        if (key === "placeholder_mappings") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
       

      });
      // 🔥 FINAL — Add buttons JSON
      formDataToSend.append("buttons", JSON.stringify(formData.buttons));

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
      navigate("/templates");
      resetFormData();
    } catch (error) {
      console.error("Error creating template:", error?.response?.data);
      try {
        const errorData = JSON.parse(error?.response?.data?.error || "{}");
        const userMsg = errorData?.error?.error_user_msg || "Failed to create template";
        toast.error(userMsg);
      } catch {
        toast.error(error?.response?.data?.error?.error_user_msg || "Failed to create template");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      template_name: "",
      template_language: "",
      template_category: "",
      header_type: "",
      header_text: "",
      // header_media_url: "",
      header_media_url: "",
      body_text: "",
      footer_text: "",
      buttons: [],
      button_type: "",
      button_text: "",
      button_url: "",
      button_number: "",
      placeholder_mappings: {},
    });
    setActiveButton(null);
    setIsVisible(true);
  };

  const { isConnected } = useContext(Context);

  return (
    <RequireSubscription>
      <div className="main bg-zinc-50 min-h-screen px-4 sm:px-6">
        <form onSubmit={handleSubmit}>
          <div className="header flex flex-col sm:flex-row justify-between px-4 sm:px-5">
            <div className="left py-5">
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
            <div className="right gap-2 px-4 sm:px-10 text-white flex flex-col sm:flex-row items-center">
              <button
                className="rounded-full bg-black cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center w-full sm:w-auto mb-2 sm:mb-0"
                onMouseDown={() => navigate("/templates")}
                type="button"
              >
                Back
              </button>
              <button
                className={`rounded-full px-5 py-2 text-white text-sm font-semibold flex items-center w-full sm:w-auto 
                  ${isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 cursor-pointer"}`}
                disabled={isDisabled}
                type="submit"
              >
                {loading ? "Creating..." : "Create Template"}
              </button>
            </div>
          </div>

          <div className="container flex flex-col sm:flex-row w-full max-h-[500px]">
            {!isConnected && (
              <div className="w-full sm:md:w-[50%] p-4 sm:p-8 overflow-y-auto">
                <div className="bg-slate-50 border border-primary shadow rounded-md p-4 py-8">
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
                  <h3 className="text-center text-lg font-medium mb-4">
                    Connect your WhatsApp account
                  </h3>
                  <h4 className="text-center mb-4">
                    You need to connect your WhatsApp account first before you
                    can create a template.
                  </h4>
                  <div className="flex justify-center">
                    <Link
                      to={isConnected ? "#" : "/connect-form"}
                      onClick={(e) => isConnected && e.preventDefault()}
                      className={`rounded-md cursor-pointer ${
                        isConnected ? "bg-green-500 hover:bg-green-400" : "bg-indigo-600 hover:bg-indigo-500"
                      } px-3 py-2 text-sm font-semibold text-white shadow-sm mx-4 sm:mx-10`}
                      disabled={isConnected}
                    >
                      {isConnected ? "Connected WhatsApp Successfully" : "Connect WhatsApp Business"}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {isConnected && (
              <div className="w-full sm:md:w-[50%] p-4 sm:p-8 overflow-y-auto">
                <div className="grid gap-x-4 sm:gap-x-6 gap-y-4 sm:grid-cols-6 mb-8 capitalize">
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
                        className="block w-full rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-4 text-sm"
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
                        className="block w-full rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-4 text-sm"
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 bg-[#f9f9fa] rounded-lg mb-4">
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
                  {activeButton && (
                    <button
                      type="button"
                      className="text-center py-2 text-sm text-slate-800 m-1 bg-red-100 hover:bg-red-200 rounded-lg cursor-pointer"
                      onMouseDown={clearHeader}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {activeButton === "TEXT" && (
                  <div className="sm:col-span-6">
                    <label htmlFor="header_text" className="block text-sm leading-6 text-gray-900">
                      Header Text
                    </label>
                    <input
                      value={formData.header_text}
                      onChange={handleChange}
                      placeholder="Enter Heading text..."
                      className="block w-full bg-white rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                      type="text"
                      name="header_text"
                    />
                  </div>
                )}

                {["IMAGE", "VIDEO", "DOCUMENT"].includes(activeButton) && (
                <div className="sm:col-span-6">
                  <label className="block text-sm leading-6 text-gray-900">
                    Upload {activeButton}
                  </label>

                  <input
                    name="header_media_url"
                    type="file"
                    accept={
                      activeButton === "IMAGE"
                        ? "image/jpeg,image/png"
                        : activeButton === "VIDEO"
                        ? "video/mp4"
                        : "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
                    }
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 px-4 ring-1 ring-inset ring-gray-300"
                  />

                  {formData.header_media_url && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {formData.header_media_url.name}
                    </p>
                  )}
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

                {variables.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-slate-600 text-sm font-medium">
                      Map Variables to Contact Fields
                    </h3>
                    <p className="text-slate-600 text-xs mb-2">
                      Map each variable to a contact field for dynamic substitution and provide an example.
                    </p>
                    {variables.map((variable, index) => (
                      <div
                        key={index}
                        className="mb-2 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
                      >
                        <div className="flex-1 w-full">
                          <label className="text-slate-600 text-xs">
                            [{variable}] - Field
                          </label>
                          <input
                            list="contact-fields"
                            value={formData.placeholder_mappings[variable]?.field || ""}
                            onChange={(e) => handleVariableFieldChange(variable, e.target.value)}
                            placeholder="Select or type a field name"
                            className="block w-full rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-4 text-sm"
                          />
                          <datalist id="contact-fields">
                            <option value="name" />
                            <option value="email" />
                            <option value="phone" />
                            <option value="discount" />
                            <option value="offer_end_date" />
                          </datalist>
                        </div>
                        <div className="flex-1 w-full">
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
                  rows="4"
                  name="footer_text"
                ></textarea>

                <h2 className="text-slate-600">
                    Buttons <span className="text-xs">(Optional)</span>
                  </h2>
                  <span className="text-slate-600 text-xs">
                    Create buttons that let customers respond to your message or take action
                  </span>

                  <div className="flex gap-3 my-3">
                    <button
                      type="button"
                      onMouseDown={() => bottomButtonClick("PHONE_CALL")}
                      className="px-4 py-2 bg-slate-100 rounded-lg"
                    >
                      Add Phone Call
                    </button>

                    <button
                      type="button"
                      onMouseDown={() => bottomButtonClick("CALLBACK")}
                      className="px-4 py-2 bg-slate-100 rounded-lg"
                    >
                      Add URL Button
                    </button>

                    <button
                      type="button"
                      onMouseDown={() => bottomButtonClick("QUICK-REPLIES")}
                      className="px-4 py-2 bg-slate-100 rounded-lg"
                    >
                      Add Quick Reply
                    </button>
                  </div>

                 {formData.buttons.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-gray-700 font-semibold mb-2">Added Buttons (Drag to reorder)</h4>

                    <DragDropContext
                      onDragEnd={(result) => {
                        if (!result.destination) return;

                        const updated = Array.from(formData.buttons);
                        const [moved] = updated.splice(result.source.index, 1);
                        updated.splice(result.destination.index, 0, moved);

                        setFormData((prev) => ({
                          ...prev,
                          buttons: updated
                        }));
                      }}
                    >
                      <Droppable droppableId="buttons">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex flex-col gap-2"
                          >
                            {formData.buttons.map((btn, idx) => (
                              <Draggable key={idx} draggableId={`btn-${idx}`} index={idx}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center justify-between px-3 py-2 bg-blue-100 rounded-lg cursor-move"
                                  >
                                    {/* text */}
                                    <span className="text-blue-700 text-sm">
                                      {btn.text} ({btn.type})
                                    </span>

                                    {/* delete */}
                                    <button
                                      type="button"
                                      onClick={() => removeButton(idx)}
                                      className="text-red-500 font-bold hover:text-red-700"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}




                {activeButton === "PHONE_CALL" && isVisible && (
                  <div className="mt-4 mb-8">
                    <div className="bg-[#f9f9fa] p-3 rounded-lg">

                      <div className="flex items-center justify-between pb-4">
                        <span className="text-sm text-gray-900">Call Phone Number</span>
                        <button
                          type="button"
                          onMouseDown={() => setActiveButton(null)}
                          className="bg-slate-100 hover:bg-gray-200 rounded-full p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 border-t pt-4">
                        <div className="flex-1">
                          <label className="block text-sm leading-6 text-gray-900 mb-1">Button Text</label>
                          <input
                            type="text"
                            name="button_text"
                            value={formData.button_text}
                            onChange={handleChange}
                            placeholder="Call Now"
                            className="block w-full rounded-md border-0 py-1.5 px-4 ring-1 ring-inset ring-gray-300"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm leading-6 text-gray-900 mb-1">Phone Number</label>
                          <input
                            type="text"
                            name="button_number"
                            value={formData.button_number}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            className="block w-full rounded-md border-0 py-1.5 px-4 ring-1 ring-inset ring-gray-300"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onMouseDown={() => addButton("PHONE_CALL")}
                        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg"
                      >
                        Add Button
                      </button>

                    </div>
                  </div>
                )}


                {activeButton === "CALLBACK" && isVisible && (
                <div className="mt-4 mb-8">
                  <div className="bg-[#f9f9fa] p-4 rounded-lg">

                    <div className="flex items-center justify-between pb-4">
                      <span className="text-sm text-gray-900">Website URL</span>
                      <button
                        type="button"
                        onMouseDown={() => setActiveButton(null)}
                        className="bg-slate-100 hover:bg-gray-200 rounded-full p-1"
                      >
                      ✕
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 border-t pt-4">
                      <div className="flex-1">
                        <label className="block text-sm leading-6 text-gray-900 mb-1">Button Text</label>
                        <input
                          type="text"
                          name="button_text"
                          value={formData.button_text}
                          onChange={handleChange}
                          placeholder="Visit Website"
                          className="block w-full rounded-md border-0 py-1.5 px-4 ring-1 ring-inset ring-gray-300"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm leading-6 text-gray-900 mb-1">Website URL</label>
                        <input
                          type="text"
                          name="button_url"
                          value={formData.button_url}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          className="block w-full rounded-md border-0 py-1.5 px-4 ring-1 ring-inset ring-gray-300"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onMouseDown={() => addButton("CALLBACK")}
                      className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg"
                    >
                      Add Button
                    </button>

                  </div>
                </div>
              )}


                {activeButton === "QUICK-REPLIES" && isVisible && (
                <div className="mt-4 mb-8">
                  <div className="bg-[#f9f9fa] p-4 rounded-lg">

                    <div className="flex items-center justify-between pb-4">
                      <span className="text-sm text-gray-900">Quick Reply Button</span>
                      <button
                        type="button"
                        onMouseDown={() => setActiveButton(null)}
                        className="bg-slate-100 hover:bg-gray-200 rounded-full p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <label className="block text-sm leading-6 text-gray-900 mb-1">Button Text</label>
                    <input
                      type="text"
                      name="button_text"
                      value={formData.button_text}
                      onChange={handleChange}
                      placeholder="Yes"
                      className="block w-full rounded-md border-0 py-1.5 px-4 ring-1 ring-inset ring-gray-300"
                    />

                    <button
                      type="button"
                      onMouseDown={() => addButton("QUICK-REPLIES")}
                      className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg"
                    >
                      Add Button
                    </button>

                  </div>
                </div>
              )}

              </div>
            )}

            <div
                className="w-full sm:w-[30%] mx-auto sm:h-[80vh] p-4 sm:p-6 rounded-xl shadow-sm bg-cover bg-center"
                style={{ backgroundImage: `url(${assest.whatsapp_bg})` }}
              >
                {/* WhatsApp logo */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp Logo"
                  className="w-6 h-6 mb-4"
                />

                {/* CHAT BUBBLE */}
                <div className="flex justify-start">
                  <div className="flex items-end">
                    {/* <svg height="10" width="10">
                      <path
                        fill="white"
                        d="M2.8,13L8,13V0.2C7.1,5.5,6.5,8.7,1,7,10.4C-1.6,11.5,1,13,2.8,13z"
                      />
                    </svg> */}
                  </div>

                  <div className="rounded-r-lg rounded-tl-lg bg-white py-2 px-4 max-w-[90%]">

                    {/* HEADER MEDIA PREVIEW */}
                    {formData.header_media_url && (
                      <div className="mb-2">

                        {activeButton === "IMAGE" && (
                          <img
                            src={URL.createObjectURL(formData.header_media_url)}
                            alt="Preview"
                            className="w-full max-w-[220px] rounded-lg border"
                          />
                        )}

                        {activeButton === "VIDEO" && (
                          <video
                            src={URL.createObjectURL(formData.header_media_url)}
                            controls
                            className="w-full max-w-[220px] rounded-lg border"
                          />
                        )}

                        {activeButton === "DOCUMENT" && (
                          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg border w-[220px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M14 2H6c-1.1 0-2 .9-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 2l4 4h-4z"
                              />
                            </svg>
                            <span className="text-xs truncate">{formData.header_media_url.name}</span>
                          </div>
                        )}

                      </div>
                    )}

                    {/* HEADER TEXT */}
                    {formData.header_text && (
                      <h1 className="font-semibold text-sm mb-1">{formData.header_text}</h1>
                    )}

                    {/* BODY TEXT */}
                    <span className="text-xs sm:text-sm whitespace-pre-wrap">
                      {formData.body_text}
                    </span>

                    {/* FOOTER */}
                    {formData.footer_text && (
                      <div className="text-[11px] text-gray-500 mt-2">
                        {formData.footer_text}
                      </div>
                    )}
                  </div>
                </div>

                {/* BUTTONS PREVIEW */}
                {formData.buttons.length > 0 && (
                  <div className="mt-3 space-y-2">

                    {formData.buttons.map((btn, index) => (
                      <div key={index} className="flex justify-start items-center">
                        <span className="bg-white rounded-full w-full py-2 text-center text-blue-500 text-xs sm:text-sm shadow-sm">
                          {btn.text}
                        </span>
                      </div>
                    ))}

                  </div>
                )}
              </div>

          </div>
        </form>
      </div>
    </RequireSubscription>
  );
}

export default CreateTemplate;