import axios from "axios";
import API_BASE_URL from "../../config";

/**
 * Meta WhatsApp media constraints
 */
const MEDIA_RULES = {
  image: {
    mimeTypes: ["image/jpeg", "image/png"],
    maxSize: 5 * 1024 * 1024, // 5 MB
  },
  video: {
    mimeTypes: ["video/mp4", "video/3gpp"],
    maxSize: 16 * 1024 * 1024, // 16 MB
  },
  audio: {
    mimeTypes: [
      "audio/aac",
      "audio/mpeg",
      "audio/ogg",
      "audio/opus",
    ],
    maxSize: 16 * 1024 * 1024, // 16 MB
  },
};

/**
 * Determine media category from MIME type
 */
const getMediaCategory = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
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
  const category = getMediaCategory(file.type);

  if (!category || !MEDIA_RULES[category]) {
    throw new Error("Unsupported media type for WhatsApp");
  }

  const { mimeTypes, maxSize } = MEDIA_RULES[category];

  if (!mimeTypes.includes(file.type)) {
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
