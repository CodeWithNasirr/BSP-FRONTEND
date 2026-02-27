// import axios from 'axios';
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API_BASE_URL from '../../config';
// import { toast } from 'react-toastify';

// const RegisterForm = () => {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });


//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validatePassword = (password) => {
//     return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
//   };
//   const passwordsMatch =
//   formData.password &&
//   formData.confirmPassword &&
//   formData.password === formData.confirmPassword;


//   // Password strength indicator
//   const getPasswordStrength = (password) => {
//     if (!password) return { level: 0, label: '', color: '' };
//     let score = 0;
//     if (password.length >= 8) score++;
//     if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
//     if (/\d/.test(password)) score++;
//     if (/[@$!%*?&]/.test(password)) score++;

//     if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
//     if (score === 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
//     if (score === 3) return { level: 3, label: 'Good', color: '#22c55e' };
//     return { level: 4, label: 'Strong', color: '#25D366' };
//   };

//   const strength = getPasswordStrength(formData.password);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validatePassword(formData.password)) {
//       toast.error('Password must be 8+ characters with uppercase, lowercase, number and special character.');
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match.');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/register/`, formData);
//       toast.success(response.data.Message);
//       setFormData({
//         username: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//       });

//       navigate('/login');
//     } catch (error) {
//       const errData = error.response?.data;
//       if (errData?.errors) {
//         if (errData.errors.username?.[0]) toast.error(errData.errors.username[0]);
//         if (errData.errors.email?.[0]) toast.error(errData.errors.email[0]);
//       } else if (errData?.detail) {
//         toast.error(errData.detail);
//       } else {
//         toast.error('An unexpected error occurred.');
//       }
//       setFormData({ username: '', email: '', password: '',confirmPassword: '' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
//       <p className="text-sm text-gray-400 mb-7">Start your free trial today</p>

//       <form onSubmit={handleSubmit} className="space-y-3.5">
//         {/* Username */}
//         <div>
//           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
//             Username
//           </label>
//           <div className="relative">
//             <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
//               <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
//                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
//                 <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </div>
//             <input
//               required
//               type="text"
//               name="username"
//               placeholder="Choose a username"
//               value={formData.username}
//               onChange={handleChange}
//               className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
//             />
//           </div>
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
//             Email
//           </label>
//           <div className="relative">
//             <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
//               <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
//                 <rect x="2" y="4" width="20" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
//                 <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </div>
//             <input
//               required
//               type="email"
//               name="email"
//               placeholder="you@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
//             />
//           </div>
//         </div>

//         {/* Password */}
//         <div>
//           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
//             Password
//           </label>
//           <div className="relative">
//             <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
//               <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
//                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
//                 <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </div>
//             <input
//               required
//               type={showPassword ? 'text' : 'password'}
//               name="password"
//               placeholder="Min. 8 characters"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
//             >
//               {showPassword ? (
//                 <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
//                   <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
//                   <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               ) : (
//                 <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
//                   <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
//                   <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               )}
//             </button>
//           </div>
//           {/* Password strength bar */}
//           {formData.password && (
//             <div className="mt-2">
//               <div className="flex gap-1">
//                 {[1, 2, 3, 4].map((i) => (
//                   <div
//                     key={i}
//                     className="h-1 flex-1 rounded-full transition-all duration-300"
//                     style={{
//                       backgroundColor: i <= strength.level ? strength.color : '#e5e7eb',
//                     }}
//                   />
//                 ))}
//               </div>
//               <p className="text-[11px] mt-1 font-medium" style={{ color: strength.color }}>
//                 {strength.label}
//               </p>
//             </div>
//           )}
//         </div>
//                  {/* Confirm Password */}
// <div>
//   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
//     Confirm Password
//   </label>
//   <div className="relative">
//     <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
//       <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
//         <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
//         <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>
//     </div>

//     <input
//       required
//       type={showPassword ? 'text' : 'password'}
//       name="confirmPassword"
//       placeholder="Re-enter password"
//       value={formData.confirmPassword}
//       onChange={handleChange}
//       className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
//     />
//   </div>

//   {/* Match indicator */}
//   {formData.confirmPassword && (
//     <p
//       className="text-[11px] mt-1 font-medium"
//       style={{ color: passwordsMatch ? '#22c55e' : '#ef4444' }}
//     >
//       {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
//     </p>
//   )}
// </div>

//         {/* Terms */}
//         <div className="pt-0.5">
//           <label className="flex items-start gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               required
//               className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]/30 cursor-pointer"
//             />
//             <span className="text-xs text-gray-500 leading-relaxed">
//               I agree to the{' '}
//               <a href="/terms-policy" className="text-[#075E54] font-medium hover:underline">Terms of Service</a>
//               {' '}and{' '}
//               <a href="/privacy" className="text-[#075E54] font-medium hover:underline">Privacy Policy</a>
//             </span>
//           </label>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full py-3 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}
//         >
//           {isLoading ? (
//             <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//             </svg>
//           ) : (
//             'Create Account'
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default RegisterForm;

import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';
import { loadFromStorage } from '../../utils/useReferral';

// ═══════════════════════════════════════════════════════════════════════════════
// RegisterForm — with referral tracking
// ═══════════════════════════════════════════════════════════════════════════════
//
// Captures referral code from 3 sources (in priority order):
//   1. ?ref= URL param on the register page itself
//   2. localStorage cache (set when user visited landing page with ?ref=)
//   3. null (organic signup)
//
// Sends `referral_code` in the registration payload so the backend can
// credit the affiliate.
// ═══════════════════════════════════════════════════════════════════════════════

const RegisterForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Resolve referral code ──────────────────────────────────────────────
  const urlRef = searchParams.get('ref');
  const cachedRef = loadFromStorage()?.refCode || null;
  const referralCode = urlRef || cachedRef || null;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { level: 3, label: 'Good', color: '#22c55e' };
    return { level: 4, label: 'Strong', color: '#25D366' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(formData.password)) {
      toast.error('Password must be 8+ characters with uppercase, lowercase, number and special character.');
      return;
    }
    setIsLoading(true);
    try {
      // ── Include referral_code in payload ──
      const payload = {
        ...formData,
        ...(referralCode ? { referral_code: referralCode } : {}),
      };

      const response = await axios.post(`${API_BASE_URL}/register/`, payload);
      toast.success(response.data.Message);
      setFormData({ username: '', email: '', password: '' });

      // Redirect to login, preserve ref
      navigate(referralCode ? `/login?ref=${referralCode}` : '/login');
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.errors) {
        if (errData.errors.username?.[0]) toast.error(errData.errors.username[0]);
        if (errData.errors.email?.[0]) toast.error(errData.errors.email[0]);
      } else if (errData?.detail) {
        toast.error(errData.detail);
      } else {
        toast.error('An unexpected error occurred.');
      }
      setFormData({ username: '', email: '', password: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
      <p className="text-sm text-gray-400 mb-7">
        {referralCode
          ? `You were referred — sign up to get started!`
          : 'Start your free trial today'
        }
      </p>

      {/* Referral badge */}
      {referralCode && (
        <div className="flex items-center gap-2 px-3 py-2 mb-5 rounded-lg bg-[#25D366]/10 text-[#075E54] text-xs font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Referral applied: <strong>{referralCode}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input required type="text" name="username" placeholder="Choose a username" value={formData.username} onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input required type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input required type={showPassword ? 'text' : 'password'} name="password" placeholder="Min. 8 characters" value={formData.password} onChange={handleChange}
              className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5">
              {showPassword ? (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: i <= strength.level ? strength.color : '#e5e7eb' }} />
                ))}
              </div>
              <p className="text-[11px] mt-1 font-medium" style={{ color: strength.color }}>{strength.label}</p>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="pt-0.5">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]/30 cursor-pointer" />
            <span className="text-xs text-gray-500 leading-relaxed">
              I agree to the <a href="/terms-policy" className="text-[#075E54] font-medium hover:underline">Terms of Service</a> and <a href="/privacy" className="text-[#075E54] font-medium hover:underline">Privacy Policy</a>
            </span>
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="w-full py-3 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}>
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;