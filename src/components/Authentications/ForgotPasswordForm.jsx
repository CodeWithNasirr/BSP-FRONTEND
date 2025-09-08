import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${API_BASE_URL}/forgot-password/`, { email });
    
    if (res.status === 200) {
      toast.success("Password reset link sent to your email!");
      navigate("/login"); // redirect instead of closing
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error || "Failed to send reset link. Please try again."
    );
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg bg-gray-100"
          />
          <button
            type="submit"
            className="w-full py-2 bg-[#4bb6b7] text-white rounded-lg font-bold"
          >
            Send Reset Link
          </button>
        </form>
        <button
          className="mt-4 w-full py-2 border rounded-lg"
          onClick={() => navigate('/login')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
