// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/GroupForm.jsx
// Form for adding new groups — Full theme support + Mobile optimized
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";

const GroupForm = ({ onSubmit, onCancel, isSubmitting = false, isMobile = false }) => {
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!groupName.trim()) {
        setError("Group name is required");
        return;
      }
      const result = await onSubmit(groupName.trim());
      if (result.success) {
        setGroupName("");
        setError("");
      }
    },
    [groupName, onSubmit]
  );

  const handleChange = useCallback((e) => {
    setGroupName(e.target.value);
    if (error) setError("");
  }, [error]);

  const inputBaseClass = `
    mt-1 block w-full rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200
    bg-white dark:bg-[#111827]
    text-gray-900 dark:text-gray-100
    placeholder:text-gray-400 dark:placeholder:text-gray-600
    border-gray-200 dark:border-white/10
    focus:border-indigo-400 dark:focus:border-indigo-500/50
    focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
  `;

  return (
    <div className="w-full md:w-[70%] bg-gray-50 dark:bg-[#0b1120] h-full overflow-y-auto transition-colors duration-300">

      {/* Desktop Header — Hidden on mobile */}
      <div className="hidden md:flex h-16 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Add Group</h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <div className="flex flex-1 justify-center items-start py-6 sm:py-10 px-4">
        <form
          className="w-full max-w-lg bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-2xl shadow-premium dark:shadow-premium-dark border border-gray-100 dark:border-white/5 transition-colors duration-300"
          onSubmit={handleSubmit}
        >
          {/* Group Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/10 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-white/5">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          {/* Group Name Input */}
          <div className="mb-6">
            <label htmlFor="group_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              id="group_name"
              name="group_name"
              type="text"
              value={groupName}
              onChange={handleChange}
              placeholder="e.g. VIP Customers"
              className={`${inputBaseClass} ${error ? "border-red-400 dark:border-red-500/50 ring-1 ring-red-200 dark:ring-red-500/20" : ""}`}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 font-medium">{error}</p>
            )}
          </div>

          {/* Tips */}
          <div className="mb-6 p-4 bg-blue-50/80 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <strong className="font-semibold">Tip:</strong> Create groups to organize your contacts for targeted campaigns and easier management.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !groupName.trim()}
              className="px-6 py-3 text-sm font-medium bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-500 dark:hover:bg-indigo-400 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/10 active:scale-95"
            >
              {isSubmitting ? "Saving..." : "Save Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUP WELCOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export const GroupWelcomeScreen = ({ onAddGroup }) => (
  <div className="w-full md:w-[70%] bg-gray-50 dark:bg-[#0b1120] h-full flex justify-center items-center transition-colors duration-300 p-4">
    <div className="border border-gray-200 dark:border-white/10 py-12 sm:py-20 w-full max-w-[30rem] rounded-2xl bg-white dark:bg-[#111827] shadow-premium dark:shadow-premium-dark transition-colors duration-300 text-center px-6">
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-white dark:ring-white/5">
        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Select a Group
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Choose a group from the list or create a new one
      </p>

      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-px w-12 bg-gray-200 dark:bg-white/10"></div>
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">OR</span>
        <div className="h-px w-12 bg-gray-200 dark:bg-white/10"></div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={onAddGroup}
          className="px-6 py-3 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95"
        >
          Add Group
        </button>
        <button
          className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 text-sm font-semibold cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          Bulk Upload
        </button>
      </div>
    </div>
  </div>
);

export default GroupForm;