// ─────────────────────────────────────────────────────────────────────────────
// EmptyStates.jsx — Premium empty states
// src/components/Contact/components/EmptyStates.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Link } from "react-router-dom";
import DownloadCSVTemplate from "../Sample_csv";
import ExportContactsButton from "../Export_Contact";

// ── WELCOME SCREEN ────────────────────────────────────────────────────────────
export const WelcomeScreen = ({ onAddContact }) => (
  <div className="hidden md:flex md:flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center p-8">
    <div className="max-w-sm w-full text-center">
      {/* Illustration */}
      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
        <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Manage your contacts</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Select a contact to view details, or add new contacts to get started.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddContact}
          className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white rounded-xl transition-all shadow-sm hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Contact
        </button>
        <Link
          to="/bulk-upload"
          className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Bulk Upload
        </Link>
        <div className="col-span-1"><DownloadCSVTemplate /></div>
        <div className="col-span-1"><ExportContactsButton /></div>
      </div>
    </div>
  </div>
);

// ── CONTACT LIST SKELETON ─────────────────────────────────────────────────────
export const ContactListSkeleton = ({ count = 6 }) => (
  <div className="flex-grow overflow-hidden">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 animate-pulse">
        <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default { WelcomeScreen, ContactListSkeleton };