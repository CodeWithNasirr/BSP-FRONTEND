// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/ExportModal.jsx
// VCF Export modal + Export History panel
// Matches existing modal patterns (ClipboardModal-style overlay + animation)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, memo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MODAL — one-click VCF export
// ─────────────────────────────────────────────────────────────────────────────

const EXPORT_OPTIONS = [
  {
    key: "ALL",
    label: "Export All Contacts",
    description: "Download every contact as VCF",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100",
  },
  {
    key: "NEW",
    label: "Export New Only",
    description: "Only contacts not yet exported",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
];

export const ExportModal = memo(
  ({ isOpen, onClose, onExport, isExporting, selectedCount = 0 }) => {
    if (!isOpen) return null;

    const handleExport = async (exportType) => {
      const result = await onExport({ export_type: exportType });
      if (result) {
        onClose();
      }
    };

    const handleExportSelected = async () => {
      // The parent passes selectedIds through the onExport callback
      const result = await onExport({ export_type: "SELECTED" });
      if (result) {
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          style={{ animation: "fadeIn 0.2s ease-out" }}
        />

        {/* Modal */}
        <div
          className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ animation: "slideUp 0.25s ease-out" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">
                Export Contacts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              Export contacts as a .VCF file. Import it on your phone to save all
              contacts instantly.
            </p>

            {/* Export options */}
            {EXPORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleExport(opt.key)}
                disabled={isExporting}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${opt.color}`}
              >
                <span className="flex-shrink-0">{opt.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-xs opacity-70">{opt.description}</div>
                </div>
                {isExporting && (
                  <div className="ml-auto w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                )}
              </button>
            ))}

            {/* Export Selected (only when contacts are selected) */}
            {selectedCount > 0 && (
              <button
                onClick={handleExportSelected}
                disabled={isExporting}
                className="w-full flex items-center gap-3 p-4 rounded-xl border text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <div className="text-sm font-medium">
                    Export {selectedCount} Selected
                  </div>
                  <div className="text-xs opacity-70">
                    Only your current selection
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center">
              VCF files are compatible with Android and iPhone
            </p>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }
);

ExportModal.displayName = "ExportModal";

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT HISTORY PANEL — list of past exports with re-download
// ─────────────────────────────────────────────────────────────────────────────

export const ExportHistoryPanel = memo(
  ({ exports, isLoading, onDownload, onClose }) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getTypeBadge = (type) => {
      const config = {
        ALL: "bg-slate-100 text-slate-700",
        NEW: "bg-blue-100 text-blue-700",
        FILTERED: "bg-purple-100 text-purple-700",
        SELECTED: "bg-indigo-100 text-indigo-700",
      };
      return config[type] || config.ALL;
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">
              Export History
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Close
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : exports.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <p className="text-sm text-gray-500">No exports yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Your VCF exports will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {exports.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getTypeBadge(
                          exp.export_type
                        )}`}
                      >
                        {exp.export_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {exp.contact_count} contacts
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">
                      {formatDate(exp.created_at)}
                    </p>
                  </div>

                  <button
                    onClick={() => onDownload(exp.id)}
                    className="flex-shrink-0 ml-3 flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ExportHistoryPanel.displayName = "ExportHistoryPanel";

export default { ExportModal, ExportHistoryPanel };