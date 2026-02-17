import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assest } from '../../assets/assets';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/forgot-password/`, { email });
      if (res.status === 200) {
        toast.success('Password reset link sent to your email!');
        setIsSent(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl shadow-black/20 p-8 sm:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={assest.logo} alt="Numlockitsolutions" className="h-7 w-auto" />
        </div>

        {!isSent ? (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #075E54 0%, #25D366 100%)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Forgot your password?</h2>
            <p className="text-sm text-gray-400 text-center mb-7">
              No worries! Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                  />
                </div>
              </div>

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
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-4">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#25D366]/10">
                <svg className="w-8 h-8 text-[#25D366]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-400 mb-6">
              We've sent a password reset link to <span className="font-medium text-gray-600">{email}</span>
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}
            >
              Back to Sign In
            </button>
          </div>
        )}

        {!isSent && (
          <button
            onClick={() => navigate('/login')}
            className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#075E54] transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;