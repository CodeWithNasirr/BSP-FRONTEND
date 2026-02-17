import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';
import { Context } from '../context/Context';

const LoginForm = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useContext(Context);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) localStorage.removeItem('authToken');
  }, []);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login/`, formData);
      const token = response.data.Token;
      localStorage.setItem('authToken', token);

      const profileResponse = await axios.get(`${API_BASE_URL}/user/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const { username, role } = profileResponse.data;
      setUserInfo({ username, role });

      toast.success(response.data.Message, { autoClose: 2000 });

      if (role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        toast.error(error.response.data.errors);
      } else {
        toast.error('An unexpected error occurred.');
      }
      setFormData((prev) => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-sm text-gray-400 mb-8">Sign in to your account to continue</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Username
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type="text"
              required
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            >
              {showPassword ? (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]/30 cursor-pointer"
            />
            <span className="text-xs text-gray-500">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-xs font-medium text-[#075E54] hover:text-[#128C7E] transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;