import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';
import { assest } from '../../assets/assets';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/reset-password/${uid}/${token}/`, {
        new_password: password,
      });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.errors || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordInput = ({ value, onChange, placeholder, show, onToggle }) => (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
      >
        {show ? (
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
  );

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

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #075E54 0%, #25D366 100%)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Set new password</h2>
        <p className="text-sm text-gray-400 text-center mb-7">
          Your new password must be different from previously used passwords.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
            />
            {/* Match indicator */}
            {confirmPassword && (
              <div className="flex items-center gap-1.5 mt-1.5">
                {password === confirmPassword ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-[#25D366]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[11px] text-[#25D366] font-medium">Passwords match</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[11px] text-red-400 font-medium">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
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
              'Reset Password'
            )}
          </button>
        </form>

        <button
          onClick={() => navigate('/login')}
          className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#075E54] transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;