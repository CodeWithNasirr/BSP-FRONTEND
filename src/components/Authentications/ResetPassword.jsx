import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/reset-password/${uid}/${token}/`, {
        new_password: password,
      });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.errors || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-3 border rounded-lg bg-gray-100"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-3 border rounded-lg bg-gray-100"
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-[#4bb6b7] text-white rounded-lg font-bold"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
