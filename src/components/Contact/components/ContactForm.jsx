// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/ContactForm.jsx
// Unified form for adding and editing contacts
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from "react";

/**
 * Contact form component
 * Handles both create and edit modes
 */
const ContactForm = ({
  mode = "create", // "create" | "edit"
  initialData = null,
  groups = [],
  onSubmit,
  onCancel,
  onDelete,
  onAddToGroup,
  onRemoveFromGroup,
  isSubmitting = false,
}) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // FORM STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone_number: "",
    email: "",
    group_name: "",
    location: "",
    tags: "",
    total_purchases: 0,
    total_spent: 0,
  });

  const [errors, setErrors] = useState({});

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE FORM DATA
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (initialData && mode === "edit") {
      const nameParts = (initialData.full_name || "").split(" ");
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        phone_number: initialData.phone_number || "",
        email: initialData.email || "",
        group_name: initialData.Group?.[0]?.group_name || "",
        location: initialData.location || "",
        tags: Array.isArray(initialData.tags) 
          ? initialData.tags.join(", ") 
          : initialData.tags || "",
        total_purchases: initialData.total_purchases || 0,
        total_spent: initialData.total_spent || 0,
      });
    } else {
      // Reset form for create mode
      setFormData({
        firstName: "",
        lastName: "",
        phone_number: "",
        email: "",
        group_name: "",
        location: "",
        tags: "",
        total_purchases: 0,
        total_spent: 0,
      });
    }
    setErrors({});
  }, [initialData, mode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.phone_number.replace(/\s/g, ""))) {
      newErrors.phone_number = "Invalid phone number format";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      
      if (!validate()) return;

      onSubmit(formData);
    },
    [formData, validate, onSubmit]
  );

  const handleGroupAdd = useCallback(
    (e) => {
      const groupName = e.target.value;
      if (!groupName || !initialData) return;

      const group = groups.find((g) => g.group_name === groupName);
      if (group) {
        onAddToGroup(initialData.id, group.id, group.group_name);
      }
      e.target.value = "";
    },
    [groups, initialData, onAddToGroup]
  );

  const handleGroupRemove = useCallback(
    (e) => {
      const groupName = e.target.value;
      if (!groupName || !initialData) return;

      const group = groups.find((g) => g.group_name === groupName);
      if (group) {
        onRemoveFromGroup(initialData.id, group.id);
      }
      e.target.value = "";
    },
    [groups, initialData, onRemoveFromGroup]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════

  const contactGroups = initialData?.Group || [];
  const availableGroups = groups.filter(
    (g) => !contactGroups.some((cg) => cg.group_name === g.group_name)
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="w-full md:w-[70%] bg-zinc-100 h-auto md:h-[100vh] overflow-y-auto">
      {/* Header */}
      <div className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-10">
        <h1 className="text-xl font-semibold">
          {mode === "create" ? "Add Contact" : "Edit Contact"}
        </h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-500 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <div className="flex justify-center md:h-[calc(100vh-5rem)] md:overflow-y-auto p-4">
        <form className="w-full max-w-[30em]" onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4 mb-6">
            <div className="rounded-full w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 flex items-center justify-center">
              <svg
                className="text-gray-400 w-20 h-20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-6 pb-6 border-b border-slate-200">
            {/* First Name */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`block w-full rounded-md border py-2 px-4 text-gray-900 shadow-sm outline-none text-sm
                  ${errors.firstName ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-blue-500"}`}
                type="text"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500"
                type="text"
              />
            </div>

            {/* Phone */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                className={`block w-full rounded-md border py-2 px-4 text-gray-900 shadow-sm outline-none text-sm
                  ${errors.phone_number ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-blue-500"}`}
                type="text"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
              )}
            </div>

            {/* Email */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Optional"
                className={`block w-full rounded-md border py-2 px-4 text-gray-900 shadow-sm outline-none text-sm
                  ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-blue-500"}`}
                type="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Location */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500"
                type="text"
              />
            </div>

            {/* Tags */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="VIP, Customer"
                className="block w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500"
                type="text"
              />
            </div>

            {/* Total Purchases */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Purchases
              </label>
              <input
                name="total_purchases"
                value={formData.total_purchases}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500"
                type="number"
                min="0"
              />
            </div>

            {/* Total Spent */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Spent (₹)
              </label>
              <input
                name="total_spent"
                value={formData.total_spent}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500"
                type="number"
                min="0"
                step="0.01"
              />
            </div>

            {/* Group Selection */}
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group
              </label>
              <select
                name="group_name"
                value={formData.group_name}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.group_name}>
                    {group.group_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Edit Mode: Add to Group */}
            {mode === "edit" && availableGroups.length > 0 && (
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add to Group
                </label>
                <select
                  onChange={handleGroupAdd}
                  defaultValue=""
                  className="block w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select group to add</option>
                  {availableGroups.map((group) => (
                    <option key={group.id} value={group.group_name}>
                      {group.group_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Edit Mode: Remove from Group */}
            {mode === "edit" && contactGroups.length > 0 && (
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remove from Group
                </label>
                <select
                  onChange={handleGroupRemove}
                  defaultValue=""
                  className="block w-full rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select group to remove</option>
                  {contactGroups.map((group) => (
                    <option key={group.id || group.group_name} value={group.group_name}>
                      {group.group_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 mb-10 pb-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-sm font-medium text-white bg-gray-500 rounded-full hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>

            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-500 transition-colors ml-auto"
              >
                Delete Contact
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;