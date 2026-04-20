import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Filter, Plus, Pencil, Trash2, X } from 'lucide-react';
import { nanoid } from 'nanoid';

/**
 * KeywordListenerNode — in-flow routing by user-typed text.
 *
 * Behavior (confirmed with backend):
 *   - Pure routing node. No send. No WhatsApp API call.
 *   - Session parks here. Next inbound message is matched against
 *     keyword groups. The matched group's handle edge is followed.
 *   - No match → "fallback" handle is followed.
 *   - Matching: exact > contains > longest > first-declared group.
 *
 * Data shape persisted in flow_data:
 *   {
 *     keyword_groups: [
 *       { id: "grp_<nanoid>", handle: "group_<nanoid>",
 *         label: "Pricing", keywords: ["price", "pricing", "plan"] },
 *       ...
 *     ]
 *   }
 *
 * Why stable handles (group_<nanoid>) instead of index-based:
 *   If you delete group 2, index-based handles would shift group 3 → 2
 *   and every edge connected to the old "group2" handle would silently
 *   attach to a different keyword group. nanoid handles survive deletes.
 *
 * The "fallback" handle is always rendered — no config needed, it's
 * the last handle, and it fires when no keyword group matches.
 */

const MAX_GROUPS = 10;
const MAX_KEYWORDS_PER_GROUP = 20;
const MAX_KEYWORD_LENGTH = 100;

const RESERVED = new Set([
  'start', 'end', 'stop', 'unsubscribe', 'opt out', 'opt-out',
  'cancel', 'quit', 'subscribe', 'resume',
]);

// Seed one group on first render so new nodes aren't blank-scary
const makeNewGroup = (label = 'New Group') => ({
  id: `grp_${nanoid(6)}`,
  handle: `group_${nanoid(6)}`,
  label,
  keywords: [],
});

const KeywordListenerNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);

  // Hydrate from data.keyword_groups, or seed with one group if empty.
  // Don't mutate `data` during render — only on user action.
  const [groups, setGroups] = useState(() => {
    if (Array.isArray(data.keyword_groups) && data.keyword_groups.length > 0) {
      return data.keyword_groups;
    }
    return [makeNewGroup('Pricing')];
  });

  // Per-group draft input for new-keyword-to-add
  const [kwDrafts, setKwDrafts] = useState({});

  const persist = (next) => {
    setGroups(next);
    // Write straight to the React Flow node data object — matches the
    // pattern your other nodes use (e.g. TextButtonsNode.jsx line 60).
    // FlowBuilder.handleSaveFlow reads data at save time.
    data.keyword_groups = next;
  };

  const handleAddGroup = () => {
    if (groups.length >= MAX_GROUPS) return;
    persist([...groups, makeNewGroup(`Group ${groups.length + 1}`)]);
  };

  const handleDeleteGroup = (groupId) => {
    // Warn user — deleting a group orphans any edge connected to its handle.
    // We can't clean up the edge from here (FlowBuilder owns edges), but
    // React Flow will render the orphaned edge as dangling and the user
    // will see it.
    if (groups.length <= 1) {
      alert('At least one keyword group is required. Delete the node instead if you don\'t need routing.');
      return;
    }
    persist(groups.filter((g) => g.id !== groupId));
  };

  const handleUpdateLabel = (groupId, newLabel) => {
    persist(groups.map((g) => (g.id === groupId ? { ...g, label: newLabel } : g)));
  };

  const handleAddKeyword = (groupId) => {
    const draft = (kwDrafts[groupId] || '').trim().toLowerCase();
    if (!draft) return;

    if (draft.length > MAX_KEYWORD_LENGTH) {
      alert(`Keyword too long (max ${MAX_KEYWORD_LENGTH} characters)`);
      return;
    }

    if (RESERVED.has(draft)) {
      alert(
        `'${draft}' is a reserved keyword (used by start/stop/opt-out logic). ` +
        `Pick a different word.`
      );
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    if (group.keywords.includes(draft)) {
      alert(`Keyword '${draft}' already in this group`);
      return;
    }

    if (group.keywords.length >= MAX_KEYWORDS_PER_GROUP) {
      alert(`Maximum ${MAX_KEYWORDS_PER_GROUP} keywords per group`);
      return;
    }

    // Check other groups for duplicate keyword — warn but allow
    // (backend priority rules handle collisions; warn so user is aware)
    const otherGroup = groups.find(
      (g) => g.id !== groupId && g.keywords.includes(draft)
    );
    if (otherGroup) {
      const proceed = window.confirm(
        `'${draft}' is already used in group "${otherGroup.label}". ` +
        `Add it anyway? (First-declared group wins ties.)`
      );
      if (!proceed) return;
    }

    persist(
      groups.map((g) =>
        g.id === groupId ? { ...g, keywords: [...g.keywords, draft] } : g
      )
    );
    setKwDrafts({ ...kwDrafts, [groupId]: '' });
  };

  const handleRemoveKeyword = (groupId, kw) => {
    persist(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, keywords: g.keywords.filter((k) => k !== kw) }
          : g
      )
    );
  };

  const handleKeyDown = (e, groupId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword(groupId);
    }
  };

  // Count handles for positioning math
  // Groups occupy positions 0..N-1, fallback occupies position N
  const totalHandles = groups.length + 1;
  const handlePosition = (index) =>
    `${((index + 1) / (totalHandles + 1)) * 100}%`;

  return (
    <div
      className={`px-4 py-3 rounded-lg bg-node-message border ${
        selected ? 'border-purple-400' : 'border-purple-200'
      } min-w-[240px] max-w-[320px]`}
    >
      <Handle type="target" position={Position.Top} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Filter className="mr-2 text-purple-500" size={16} />
          <div className="text-sm font-medium text-purple-800">
            Keyword Router
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-purple-500 hover:text-purple-700"
        >
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        /* ── EDITOR ─────────────────────────────────────────────── */
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          <div className="text-xs text-gray-600 bg-purple-50 p-2 rounded">
            User's next typed message will be matched. Exact match wins over
            contains. Longer keyword wins. First group wins ties.
          </div>

          {groups.map((group, idx) => (
            <div
              key={group.id}
              className="border border-purple-200 rounded p-2 bg-white space-y-2"
            >
              {/* Label + delete */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={group.label}
                  onChange={(e) => handleUpdateLabel(group.id, e.target.value)}
                  className="flex-1 text-xs px-2 py-1 border border-purple-200 rounded"
                  placeholder="Group name (e.g. Pricing)"
                />
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  disabled={groups.length <= 1}
                  className={`${
                    groups.length <= 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-red-500 hover:text-red-700'
                  }`}
                  title={
                    groups.length <= 1
                      ? 'At least one group required'
                      : 'Delete group'
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Keywords list */}
              {group.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {group.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded flex items-center gap-1"
                    >
                      {kw}
                      <button
                        onClick={() => handleRemoveKeyword(group.id, kw)}
                        className="hover:text-purple-900"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add keyword */}
              <div className="flex gap-1">
                <input
                  type="text"
                  value={kwDrafts[group.id] || ''}
                  onChange={(e) =>
                    setKwDrafts({ ...kwDrafts, [group.id]: e.target.value })
                  }
                  onKeyDown={(e) => handleKeyDown(e, group.id)}
                  placeholder="Add keyword + Enter"
                  className="flex-1 text-xs px-2 py-1 border border-purple-200 rounded"
                />
                <button
                  onClick={() => handleAddKeyword(group.id)}
                  className="bg-purple-500 text-white text-xs px-2 rounded hover:bg-purple-600 flex items-center"
                >
                  <Plus size={12} />
                </button>
              </div>

              {group.keywords.length === 0 && (
                <div className="text-xs text-amber-600">
                  ⚠️ No keywords. This group will never match.
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleAddGroup}
            disabled={groups.length >= MAX_GROUPS}
            className={`flex items-center gap-1 text-xs w-full justify-center py-1.5 rounded ${
              groups.length >= MAX_GROUPS
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <Plus size={12} />
            Add Group
          </button>

          <button
            onClick={() => setEditing(false)}
            className="w-full bg-purple-500 text-white text-xs py-1.5 rounded hover:bg-purple-600"
          >
            Done
          </button>
        </div>
      ) : (
        /* ── COLLAPSED VIEW ───────────────────────────────────────── */
        <div className="space-y-1">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white text-xs p-1.5 rounded border border-purple-100 flex items-center justify-between"
            >
              <span className="font-medium text-purple-700 truncate">
                {group.label || 'Unnamed'}
              </span>
              <span className="text-gray-500 ml-2 text-[10px] shrink-0">
                {group.keywords.length}{' '}
                {group.keywords.length === 1 ? 'keyword' : 'keywords'}
              </span>
            </div>
          ))}

          <div className="bg-gray-50 text-xs p-1.5 rounded border border-gray-200 flex items-center justify-between">
            <span className="text-gray-600 italic">Fallback (no match)</span>
            <span className="text-gray-400 ml-2 text-[10px] shrink-0">
              default
            </span>
          </div>
        </div>
      )}

      {/* ── DYNAMIC SOURCE HANDLES ─────────────────────────────────
        One handle per group, positioned evenly along the bottom.
        Handle `id` is the stable group.handle — backend routes by this.
        Fallback handle rendered last.
      */}
      {groups.map((group, idx) => (
        <Handle
          key={group.handle}
          id={group.handle}
          type="source"
          position={Position.Bottom}
          style={{ left: handlePosition(idx), background: '#a855f7' }}
        />
      ))}
      <Handle
        key="fallback"
        id="fallback"
        type="source"
        position={Position.Bottom}
        style={{ left: handlePosition(groups.length), background: '#9ca3af' }}
      />
    </div>
  );
};

export default memo(KeywordListenerNode);