// contacts/components/ContactForm.jsx
// Unified form for adding and editing contacts — Full theme support + Mobile optimized
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from "react";

const ContactForm = ({
  mode = "create",
  initialData = null,
  groups = [],
  onSubmit,
  onCancel,
  onDelete,
  onAddToGroup,
  onRemoveFromGroup,
  isSubmitting = false,
  isMobile = false,
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
  // THEME-AWARE INPUT CLASSES
  // ═══════════════════════════════════════════════════════════════════════════

  const inputBaseClass = `
    block w-full rounded-xl border py-3 px-4 text-sm shadow-sm outline-none transition-all duration-200
    bg-white dark:bg-[#111827]
    text-gray-900 dark:text-gray-100
    placeholder:text-gray-400 dark:placeholder:text-gray-600
    border-gray-200 dark:border-white/10
    focus:border-blue-400 dark:focus:border-blue-500/50
    focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
    hover:border-gray-300 dark:hover:border-white/20
  `;

  const inputErrorClass = `
    border-red-400 dark:border-red-500/50
    ring-1 ring-red-200 dark:ring-red-500/20
  `;

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const sectionClass = "grid gap-x-4 gap-y-4 grid-cols-1 sm:grid-cols-6 pb-6 border-b border-gray-200 dark:border-white/10";

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="w-full md:w-[70%] bg-gray-50 dark:bg-[#0b1120] h-full overflow-y-auto transition-colors duration-300">

      {/* Desktop Header — Hidden on mobile */}
      <div className="hidden md:flex h-16 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {mode === "create" ? "Add Contact" : "Edit Contact"}
        </h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <div className="flex justify-center min-h-full p-4 sm:p-6 lg:p-8">
        <form className="w-full max-w-[32rem]" onSubmit={handleSubmit}>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-white/5 transition-colors duration-300">
              <svg className="text-gray-400 dark:text-gray-500 w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Form Fields */}
          <div className={sectionClass}>
            {/* First Name */}
            <div className="sm:col-span-3">
              <label className={labelClass}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${inputBaseClass} ${errors.firstName ? inputErrorClass : ""}`}
                type="text"
              />
              {errors.firstName && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="sm:col-span-3">
              <label className={labelClass}>Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={inputBaseClass}
                type="text"
              />
            </div>

            {/* Phone */}
            <div className="sm:col-span-3">
              <label className={labelClass}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                className={`${inputBaseClass} ${errors.phone_number ? inputErrorClass : ""}`}
                type="tel"
                inputMode="tel"
              />
              {errors.phone_number && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{errors.phone_number}</p>
              )}
            </div>

            {/* Email */}
            <div className="sm:col-span-3">
              <label className={labelClass}>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Optional"
                className={`${inputBaseClass} ${errors.email ? inputErrorClass : ""}`}
                type="email"
                inputMode="email"
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Location */}
            <div className="sm:col-span-3">
              <label className={labelClass}>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputBaseClass}
                type="text"
              />
            </div>

            {/* Tags */}
            <div className="sm:col-span-3">
              <label className={labelClass}>Tags (comma separated)</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="VIP, Customer"
                className={inputBaseClass}
                type="text"
              />
            </div>

            {/* Total Purchases */}
            <div className="sm:col-span-3">
              <label className={labelClass}>Total Purchases</label>
              <input
                name="total_purchases"
                value={formData.total_purchases}
                onChange={handleChange}
                className={inputBaseClass}
                type="number"
                min="0"
              />
            </div>

            {/* Total Spent */}
            <div className="sm:col-span-3">
              <label className={labelClass}>Total Spent (₹)</label>
              <input
                name="total_spent"
                value={formData.total_spent}
                onChange={handleChange}
                className={inputBaseClass}
                type="number"
                min="0"
                step="0.01"
              />
            </div>

            {/* Group Selection */}
            <div className="sm:col-span-6">
              <label className={labelClass}>Group</label>
              <select
                name="group_name"
                value={formData.group_name}
                onChange={handleChange}
                className={inputBaseClass}
              >
                <option value="" className="dark:bg-[#111827] dark:text-gray-300">Select a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.group_name} className="dark:bg-[#111827] dark:text-gray-300">
                    {group.group_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Edit Mode: Add to Group */}
            {mode === "edit" && availableGroups.length > 0 && (
              <div className="sm:col-span-6">
                <label className={labelClass}>Add to Group</label>
                <select
                  onChange={handleGroupAdd}
                  defaultValue=""
                  className={inputBaseClass}
                >
                  <option value="" className="dark:bg-[#111827] dark:text-gray-300">Select group to add</option>
                  {availableGroups.map((group) => (
                    <option key={group.id} value={group.group_name} className="dark:bg-[#111827] dark:text-gray-300">
                      {group.group_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Edit Mode: Remove from Group */}
            {mode === "edit" && contactGroups.length > 0 && (
              <div className="sm:col-span-6">
                <label className={labelClass}>Remove from Group</label>
                <select
                  onChange={handleGroupRemove}
                  defaultValue=""
                  className={inputBaseClass}
                >
                  <option value="" className="dark:bg-[#111827] dark:text-gray-300">Select group to remove</option>
                  {contactGroups.map((group) => (
                    <option key={group.id || group.group_name} value={group.group_name} className="dark:bg-[#111827] dark:text-gray-300">
                      {group.group_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 mb-10 pb-10 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 active:scale-95"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-xl hover:bg-blue-500 dark:hover:bg-blue-400 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10 active:scale-95"
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Save Contact" : "Update Contact"}
            </button>

            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="px-6 py-3 text-sm font-medium text-white bg-red-500 dark:bg-red-500/90 rounded-xl hover:bg-red-600 dark:hover:bg-red-400 transition-all duration-200 shadow-lg shadow-red-500/25 active:scale-95 sm:ml-auto"
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