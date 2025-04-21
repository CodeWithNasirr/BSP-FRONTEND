import { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify'
import API_BASE_URL from '../config';
export default function ConnectWhatsAppForm() {
    const token = localStorage.getItem("authToken")
  const [formData, setFormData] = useState({
    business_id: "",
    waba_id: "",
    business_name: "",
    business_email: "",
    phone_id: "",
    access_token: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // replace with your real API endpoint
      const response = await axios.post(`${API_BASE_URL}/api/whatsapp/connect/`, formData,{
        headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
      });
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Connection Failed!");
    }
  };

  return (
    <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block font-medium text-sm">Business ID</label>
            <input type="text" name="business_id" value={formData.business_id} onChange={handleChange} className="w-full border rounded-md px-3 py-2 mt-1" required />
          </div>

          <div>
            <label className="block font-medium text-sm">WABA ID</label>
            <input type="text" name="waba_id" value={formData.waba_id} onChange={handleChange} className="w-full border rounded-md px-3 py-2 mt-1" required />
          </div>

          <div>
            <label className="block font-medium text-sm">Business Name</label>
            <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="w-full border rounded-md px-3 py-2 mt-1" />
          </div>

          <div>
            <label className="block font-medium text-sm">Business Email</label>
            <input type="email" name="business_email" value={formData.business_email} onChange={handleChange} className="w-full border rounded-md px-3 py-2 mt-1" />
          </div>

          <div>
            <label className="block font-medium text-sm">Phone ID</label>
            <input type="text" name="phone_id" value={formData.phone_id} onChange={handleChange} className="w-full border rounded-md px-3 py-2 mt-1" required />
          </div>

          <div>
            <label className="block font-medium text-sm">Access Token</label>
            <textarea name="access_token" value={formData.access_token} onChange={handleChange} className="w-full border rounded-md px-3 py-2 mt-1" rows={3} required />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Submit & Connect
          </button>
        </form>
    </div>
  );
}
