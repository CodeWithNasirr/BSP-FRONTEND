import axios from 'axios';
import API_BASE_URL from '../../config';
export async function uploadFlowMedia(file) {
  const formData = new FormData();
  const token = localStorage.getItem("authToken");

  formData.append("file", file);

  const res = await axios.post(`${API_BASE_URL}/api/flows/upload-media/`, formData, {
    headers: { Authorization: `Token ${token}`,"Content-Type": "multipart/form-data" },
  });

  return res.data; // { url, media_type }
}
