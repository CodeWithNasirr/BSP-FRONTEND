import axios from "axios";
import API_BASE_URL from "../../config";

/**
 * Meta WhatsApp media constraints
 */
const MEDIA_RULES = {
  image: {
    mimeTypes: ["image/jpeg", "image/png"],
    maxSize: 5 * 1024 * 1024,
  },
  video: {
    mimeTypes: ["video/mp4", "video/3gpp"],
    maxSize: 16 * 1024 * 1024,
  },
  audio: {
    mimeTypes: [
      "audio/aac",
      "audio/mpeg",
      "audio/ogg",
      "audio/opus",
      "audio/mp4",
      "audio/x-m4a",
    ],
    maxSize: 16 * 1024 * 1024,
  },

  // ✅ NEW
  document: {
    mimeTypes: [
      "application/pdf",
      "application/x-pdf",
    ],
    maxSize: 100 * 1024 * 1024, // WhatsApp allows large docs
  },
};

/**
 * Determine media category from MIME type
 */
const getMediaCategory = (file) => {
  const mimeType = file.type;
  const name = file.name.toLowerCase();

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";

  if (
    mimeType === "application/pdf" ||
    mimeType === "application/x-pdf" ||
    name.endsWith(".pdf")
  ) {
    return "document";
  }

  return null;
};

export async function uploadFlowMedia(file) {
  if (!file) {
    throw new Error("No file selected");
  }

  const token = localStorage.getItem("authToken");

  // ─────────────────────────────────────────────
  // META VALIDATION
  // ─────────────────────────────────────────────
  const category = getMediaCategory(file);


  if (!category || !MEDIA_RULES[category]) {
    throw new Error("Unsupported media type for WhatsApp");
  }

  const { mimeTypes, maxSize } = MEDIA_RULES[category];

  if (
    file.type &&
    !mimeTypes.includes(file.type)
  ) {
    throw new Error(
      `Invalid ${category} format. Allowed: ${mimeTypes.join(", ")}`
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      `${category.toUpperCase()} exceeds max size of ${Math.floor(
        maxSize / (1024 * 1024)
      )} MB`
    );
  }

  // ─────────────────────────────────────────────
  // UPLOAD
  // ─────────────────────────────────────────────
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${API_BASE_URL}/api/flows/upload-media/`,
    formData,
    {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data; // { url, media_type }
}
