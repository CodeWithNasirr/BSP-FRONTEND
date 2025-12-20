// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/EmptyStates.jsx
// Empty state and welcome screens
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { Link } from "react-router-dom";
// import DownloadCSVTemplate from "./Sample_csv";
import DownloadCSVTemplate from "../Sample_csv";
// import ExportContactsButton from "./Export_Contact";
import ExportContactsButton from "../Export_Contact";
// ─────────────────────────────────────────────────────────────────────────────
// WELCOME SCREEN (No contact selected)
// ─────────────────────────────────────────────────────────────────────────────

export const WelcomeScreen = ({ onAddContact }) => (
  <div className="md:w-[70%] bg-zinc-100 md:h-[100vh] md:overflow-y-hidden flex justify-center items-center">
    <div className="border border-slate-200 pt-20 py-10 w-[30em] rounded-xl bg-white shadow-sm">
      <h2 className="text-center text-2xl text-slate-500 mb-6">
        Select a Contact
      </h2>

      <div className="flex justify-center">
        <div className="border-r border-slate-400 h-10"></div>
      </div>

      <h2 className="text-center text-slate-600 font-medium">OR</h2>

      <div className="flex justify-center">
        <div className="border-r border-slate-400 h-10"></div>
      </div>

      <div className="grid grid-cols-2 gap-5 text-center px-10">
        <button
          onClick={onAddContact}
          className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
        >
          Add Contact
        </button>

        <Link
          to="/bulk-upload"
          className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
        >
          Bulk Upload
        </Link>

        <DownloadCSVTemplate />
        <ExportContactsButton />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY CONTACTS STATE
// ─────────────────────────────────────────────────────────────────────────────

export const EmptyContactsState = ({ hasFilters, onClearFilters, onAddContact }) => (
  <div className="flex-grow flex items-center justify-center py-12">
    <div className="text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-10 h-10 text-gray-400"
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

      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium text-gray-800">No contacts found</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search or filters
          </p>
          <button
            onClick={onClearFilters}
            className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Clear Filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-800">No contacts yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Get started by adding your first contact
          </p>
          <button
            onClick={onAddContact}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Add Contact
          </button>
        </>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────────

export const ContactListSkeleton = ({ count = 5 }) => (
  <div className="flex-grow overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex space-x-3 items-center px-4 py-3 border-b border-slate-100 animate-pulse"
      >
        {/* Checkbox placeholder */}
        <div className="w-4 h-4 bg-gray-200 rounded" />

        {/* Avatar placeholder */}
        <div className="w-12 h-12 bg-gray-200 rounded-full" />

        {/* Text placeholders */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

export default {
  WelcomeScreen,
  EmptyContactsState,
  ContactListSkeleton,
};