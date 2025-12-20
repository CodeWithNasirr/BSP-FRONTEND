// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/GroupForm.jsx
// Form for adding new groups
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";

const GroupForm = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validation
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

  return (
    <div className="md:w-[70%] bg-zinc-100 md:h-[100vh] md:overflow-y-hidden">
      {/* Header */}
      <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10">
        <h1 className="text-xl font-semibold">Add Group</h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-500 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <div className="flex flex-1 justify-center items-start py-10 overflow-y-auto">
        <form
          className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md"
          onSubmit={handleSubmit}
        >
          {/* Group Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>

          {/* Group Name Input */}
          <div className="mb-6">
            <label
              htmlFor="group_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              id="group_name"
              name="group_name"
              type="text"
              value={groupName}
              onChange={handleChange}
              placeholder="e.g. VIP Customers"
              className={`mt-1 block w-full rounded-md border px-4 py-2.5 text-sm shadow-sm transition-colors
                ${error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
                }
                focus:ring focus:ring-opacity-50`}
            />
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Tips */}
          <div className="mb-6 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> Create groups to organize your contacts for
              targeted campaigns and easier management.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-5 py-2 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !groupName.trim()}
              className="rounded-full px-5 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
  <div className="md:w-[70%] bg-zinc-100 md:h-[100vh] md:overflow-y-hidden flex justify-center items-center">
    <div className="border border-slate-200 pt-20 py-10 w-[30em] rounded-xl bg-white shadow-sm">
      <h2 className="text-center text-2xl text-slate-500 mb-6">
        Select a Group
      </h2>

      <div className="flex justify-center">
        <div className="border-r border-slate-400 h-10"></div>
      </div>

      <h2 className="text-center text-slate-600 font-medium">OR</h2>

      <div className="flex justify-center">
        <div className="border-r border-slate-400 h-10"></div>
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={onAddGroup}
          className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
        >
          Add Group
        </button>
        <button
          className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors opacity-50 cursor-not-allowed"
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