import React, { useState, useEffect } from 'react';
import { Zap, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * TriggerPanel — UI for setting flow trigger config.
 *
 * Embedded in FlowBuilder top-left Panel. Edits state in-memory;
 * persisted when the user hits "Save" on the flow.
 *
 * Props:
 *   triggerConfig — { trigger_type, trigger_keywords, trigger_keyword_mode, is_enabled }
 *   onChange      — callback(newConfig)
 */
const RESERVED = new Set([
  'start', 'end', 'stop', 'unsubscribe', 'opt out', 'opt-out',
  'cancel', 'quit', 'subscribe', 'resume',
]);

const TriggerPanel = ({ triggerConfig, onChange }) => {
  const [open, setOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const config = {
    trigger_type: 'any',
    trigger_keywords: [],
    trigger_keyword_mode: 'contains',
    is_enabled: true,
    ...triggerConfig,
  };

  const updateField = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  const addKeyword = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw) return;

    if (RESERVED.has(kw)) {
      toast.error(`'${kw}' is reserved and cannot be used as a trigger keyword`);
      return;
    }

    if (config.trigger_keywords.includes(kw)) {
      toast.warning(`Keyword '${kw}' already added`);
      return;
    }

    if (kw.length > 100) {
      toast.error('Keyword too long (max 100 characters)');
      return;
    }

    updateField('trigger_keywords', [...config.trigger_keywords, kw]);
    setNewKeyword('');
  };

  const removeKeyword = (kw) => {
    updateField(
      'trigger_keywords',
      config.trigger_keywords.filter((k) => k !== kw)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const triggerLabel = {
    any: 'Any Message',
    keyword: 'Keyword',
    new_lead: 'New Lead',
    disabled: 'Disabled',
  }[config.trigger_type];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${
          config.is_enabled
            ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'
            : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-500'
        }`}
        title="Trigger settings"
      >
        <Zap size={12} />
        Trigger: {triggerLabel}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 w-72 bg-white border border-gray-200 rounded-md shadow-lg p-3 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold">Trigger Settings</h4>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>

          {/* Enabled toggle */}
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={config.is_enabled}
              onChange={(e) => updateField('is_enabled', e.target.checked)}
            />
            <span>Flow is enabled</span>
          </label>

          {/* Trigger type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start this flow when:
            </label>
            <select
              value={config.trigger_type}
              onChange={(e) => updateField('trigger_type', e.target.value)}
              className="w-full text-xs p-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="any">Any message arrives (default)</option>
              <option value="keyword">User sends a keyword</option>
              <option value="new_lead">New contact is created</option>
              <option value="disabled">Never (manual start only)</option>
            </select>
          </div>

          {/* Keyword config — only shown if type=keyword */}
          {config.trigger_type === 'keyword' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Match mode:
                </label>
                <select
                  value={config.trigger_keyword_mode}
                  onChange={(e) => updateField('trigger_keyword_mode', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-200 rounded"
                >
                  <option value="contains">Contains keyword</option>
                  <option value="exact">Exact match (entire message)</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Exact-match flows take priority over contains-match flows.
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Keywords:
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. help"
                    className="flex-1 text-xs p-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="bg-amber-500 text-white text-xs px-2 rounded hover:bg-amber-600 flex items-center"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {config.trigger_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {config.trigger_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {kw}
                        <button
                          onClick={() => removeKeyword(kw)}
                          className="hover:text-amber-900"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {config.trigger_keywords.length === 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Add at least one keyword to enable this trigger.
                  </div>
                )}
              </div>
            </>
          )}

          {config.trigger_type === 'new_lead' && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
              This flow will start automatically the first time a new contact is created
              (typically when they send their first WhatsApp message to your number).
            </div>
          )}

          {config.trigger_type === 'disabled' && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
              This flow will not auto-trigger. Start it manually via the API
              or trigger it from another flow.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TriggerPanel;