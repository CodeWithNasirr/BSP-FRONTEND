// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ClipboardModal.jsx — Clipboard Modal Component
// ═══════════════════════════════════════════════════════════════════════════════
//
// Features:
// ✅ List all clipboard items with type filtering
// ✅ Search within clipboard
// ✅ Click to select item for insertion
// ✅ Delete items
// ✅ Add new text items directly
// ✅ Responsive design with animations
// ✅ Keyboard navigation support
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentIcon,
  TrashIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { ClipboardDocumentIcon as ClipboardSolidIcon } from "@heroicons/react/24/solid";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const TYPE_CONFIG = {
  text: {
    icon: DocumentTextIcon,
    label: "Text",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  image: {
    icon: PhotoIcon,
    label: "Image",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  video: {
    icon: VideoCameraIcon,
    label: "Video",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  audio: {
    icon: MusicalNoteIcon,
    label: "Audio",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  document: {
    icon: DocumentIcon,
    label: "Document",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

const FILTER_TYPES = [
  { key: "all", label: "All" },
  { key: "text", label: "Text" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
  { key: "audio", label: "Audio" },
  { key: "document", label: "Docs" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CLIPBOARD ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ClipboardItem = memo(({ item, onSelect, onDelete, isDeleting }) => {
  const config = TYPE_CONFIG[item.item_type] || TYPE_CONFIG.text;
  const IconComponent = config.icon;

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(item.id);
    },
    [item.id, onDelete]
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group relative p-3 rounded-xl border cursor-pointer
                  transition-all duration-200 hover:shadow-md hover:scale-[1.01]
                  ${config.borderColor} ${config.bgColor} hover:border-emerald-400`}
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center
                   rounded-full bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100
                   hover:bg-red-100 hover:text-red-600 transition-all z-10
                   disabled:opacity-50"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="flex items-start gap-3">
        {/* Icon or Thumbnail */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                      ${config.bgColor} border ${config.borderColor}`}
        >
          {item.item_type === "image" && item.file_url ? (
            <img
              src={item.file_url}
              alt=""
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <IconComponent className={`w-5 h-5 ${config.color}`} />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* Preview Text */}
          <p className="text-sm text-gray-800 line-clamp-2 break-words">
            {item.content || item.original_filename || `[${config.label}]`}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
                          ${config.bgColor} ${config.color}`}
            >
              <IconComponent className="w-3 h-3" />
              {config.label}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatDate(item.updated_at)}
            </span>
            {item.use_count > 0 && (
              <span className="text-[10px] text-gray-400">
                • Used {item.use_count}x
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ClipboardItem.displayName = "ClipboardItem";

// ═══════════════════════════════════════════════════════════════════════════════
// ADD TEXT FORM
// ═══════════════════════════════════════════════════════════════════════════════

const AddTextForm = memo(({ onAdd, onCancel, isAdding }) => {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!text.trim()) return;
      onAdd({ content: text.trim(), category: category.trim() });
    },
    [text, category, onAdd]
  );

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100 bg-gray-50">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to save to clipboard..."
        rows={3}
        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg
                   resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        maxLength={2000}
      />

      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          maxLength={50}
        />
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 
                     hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!text.trim() || isAdding}
          className="px-4 py-1.5 text-sm font-medium bg-emerald-500 text-white rounded-lg
                     hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors flex items-center gap-1"
        >
          {isAdding ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckIcon className="w-4 h-4" />
          )}
          Save
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mt-1.5">
        {text.length}/2000 characters
      </p>
    </form>
  );
});

AddTextForm.displayName = "AddTextForm";



// ═══════════════════════════════════════════════════════════════════════════════
// ADD MEDIA FORM
// ═══════════════════════════════════════════════════════════════════════════════

const AddMediaForm = memo(({ onAdd, onCancel, isAdding }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const detectMediaType = (mimeType) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "document";
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    // Generate preview for images
    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onAdd({
      file,
      caption: caption.trim(),
      category: category.trim(),
      itemType: detectMediaType(file.type),
    });
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100 bg-purple-50">
      {/* File Input */}
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center 
                     cursor-pointer hover:border-purple-400 hover:bg-purple-100/50 transition-colors"
        >
          <PhotoIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-purple-600 font-medium">Click to select file</p>
          <p className="text-xs text-purple-400 mt-1">Image, Video, Audio, or Document</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-purple-200">
          {preview ? (
            <img src={preview} alt="" className="w-14 h-14 object-cover rounded-lg" />
          ) : (
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-purple-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="p-1.5 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Caption */}
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        className="w-full mt-3 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        maxLength={500}
      />

      {/* Category + Actions */}
      <div className="flex items-center gap-2 mt-3">
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          maxLength={50}
        />
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 
                     hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!file || isAdding}
          className="px-4 py-1.5 text-sm font-medium bg-purple-500 text-white rounded-lg
                     hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors flex items-center gap-1"
        >
          {isAdding ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckIcon className="w-4 h-4" />
          )}
          Upload
        </button>
      </div>
    </form>
  );
});

AddMediaForm.displayName = "AddMediaForm";






// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ClipboardModal = ({ isOpen, onClose, onSelect }) => {
  // State
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
 
  const [showMediaForm, setShowMediaForm] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("authToken");
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH ITEMS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchItems = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (activeFilter !== "all") params.append("type", activeFilter);
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(
        `${API_BASE_URL}/api/clipboard/?${params.toString()}`,
        { headers: { Authorization: `Token ${token}` } }
      );

      if (response.data.success) {
        setItems(response.data.items || []);
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch clipboard:", error);
      toast.error("Failed to load clipboard");
    } finally {
      setIsLoading(false);
    }
  }, [token, activeFilter, selectedCategory, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      // Focus search input after modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, fetchItems]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSelect = useCallback(
    async (item) => {
      try {
        // Mark as used
        await axios.post(
          `${API_BASE_URL}/api/clipboard/${item.id}/use/`,
          {},
          { headers: { Authorization: `Token ${token}` } }
        );
      } catch (error) {
        // Non-critical, just log
        console.error("Failed to mark item as used:", error);
      }

      // Call the onSelect callback
      onSelect(item);
      onClose();
    },
    [token, onSelect, onClose]
  );

  const handleDelete = useCallback(
    async (itemId) => {
      if (!confirm("Delete this clipboard item?")) return;

      setDeletingId(itemId);

      try {
        await axios.delete(`${API_BASE_URL}/api/clipboard/${itemId}/`, {
          headers: { Authorization: `Token ${token}` },
        });

        setItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Item deleted");
      } catch (error) {
        console.error("Failed to delete:", error);
        toast.error("Failed to delete item");
      } finally {
        setDeletingId(null);
      }
    },
    [token]
  );

  const handleAddText = useCallback(
    async ({ content, category }) => {
      setIsAdding(true);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/clipboard/`,
          {
            item_type: "text",
            content,
            category,
          },
          { headers: { Authorization: `Token ${token}` } }
        );

        if (response.data.success) {
          setItems((prev) => [response.data.item, ...prev]);
          setShowAddForm(false);
          toast.success("Saved to clipboard");

          // Add category if new
          if (category && !categories.includes(category)) {
            setCategories((prev) => [...prev, category]);
          }
        }
      } catch (error) {
        console.error("Failed to add:", error);
        toast.error("Failed to save to clipboard");
      } finally {
        setIsAdding(false);
      }
    },
    [token, categories]
  );


const handleAddMedia = useCallback(
  async ({ file, caption, category, itemType }) => {
    setIsAdding(true);

    try {
      const formData = new FormData();
      formData.append("item_type", itemType);
      formData.append("file", file);
      formData.append("content", caption);
      formData.append("category", category);
      formData.append("original_filename", file.name);

      const response = await axios.post(
        `${API_BASE_URL}/api/clipboard/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setItems((prev) => [response.data.item, ...prev]);
        setShowMediaForm(false);
        toast.success("Media saved to clipboard");

        if (category && !categories.includes(category)) {
          setCategories((prev) => [...prev, category]);
        }
      }
    } catch (error) {
      console.error("Failed to add media:", error);
      toast.error("Failed to upload media");
    } finally {
      setIsAdding(false);
    }
  },
  [token, categories]
);

  // ═══════════════════════════════════════════════════════════════════════════
  // KEYBOARD HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        if (showAddForm) {
          setShowAddForm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showAddForm, onClose]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTERED ITEMS
  // ═══════════════════════════════════════════════════════════════════════════

  const filteredItems = useMemo(() => {
    return items; // Server already filters, but we could add client-side filtering here
  }, [items]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full sm:w-[480px] max-h-[85vh] sm:max-h-[600px] 
                   bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden
                   flex flex-col animate-slideUp"
      >
        {/* ════════════════════════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardSolidIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Clipboard</h2>
            <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Button */}
            <button
            onClick={() => {
                setShowAddForm(!showAddForm);
                setShowMediaForm(false);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg
                        transition-colors ${
                        showAddForm
                            ? "bg-gray-200 text-gray-700"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                        }`}
            >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Text</span>
            </button>

            {/* Add Media Button */}
            <button
            onClick={() => {
                setShowMediaForm(!showMediaForm);
                setShowAddForm(false);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg
                        transition-colors ${
                        showMediaForm
                            ? "bg-purple-200 text-purple-700"
                            : "bg-purple-500 text-white hover:bg-purple-600"
                        }`}
            >
            <PhotoIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Media</span>
            </button>
            

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full
                         text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            ADD FORM (Conditional)
        ════════════════════════════════════════════════════════════════════ */}
        {showAddForm && (
          <AddTextForm
            onAdd={handleAddText}
            onCancel={() => setShowAddForm(false)}
            isAdding={isAdding}
          />
        )}

        {showMediaForm && (
        <AddMediaForm
            onAdd={handleAddMedia}
            onCancel={() => setShowMediaForm(false)}
            isAdding={isAdding}
        />
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SEARCH & FILTERS
        ════════════════════════════════════════════════════════════════════ */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clipboard..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white"
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_TYPES.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all
                  ${
                    activeFilter === filter.key
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Category Filter (if categories exist) */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-2 py-1.5
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            ITEMS LIST
        ════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-sm text-gray-500">Loading...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardDocumentIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 text-center">
                {searchQuery || activeFilter !== "all"
                  ? "No matching items found"
                  : "Your clipboard is empty"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Save messages or add text to get started
              </p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 py-2 text-sm font-medium bg-emerald-500 text-white 
                             rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Add your first item
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <ClipboardItem
                key={item.id}
                item={item}
                onSelect={handleSelect}
                onDelete={handleDelete}
                isDeleting={deletingId === item.id}
              />
            ))
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════════════ */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Click an item to insert it into your message
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════════════════════════════════ */}
      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.25s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  );
};

export default ClipboardModal;