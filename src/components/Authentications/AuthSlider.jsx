import { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { assest } from '../../assets/assets';

const AuthSlider = () => {
  const [isRegister, setIsRegister] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/register') setIsRegister(true);
    else if (location.pathname === '/login') setIsRegister(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-[#25D366]/10 rounded-full blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* ── Card Container ── */}
      <div className="relative w-full max-w-[1000px] h-[580px] rounded-3xl overflow-hidden shadow-2xl shadow-black/30">

        {/* ── Form Layer (sits behind the branding panel on desktop) ── */}
        <div className="absolute inset-0 flex">
          {/* Login – always on the LEFT half */}
          <div
            className={`hidden lg:flex w-1/2 bg-white items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRegister ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            <div className="w-full max-w-[370px] px-8">
              <LoginForm />
            </div>
          </div>

          {/* Register – always on the RIGHT half */}
          <div
            className={`hidden lg:flex w-1/2 bg-white items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isRegister ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="w-full max-w-[370px] px-8">
              <RegisterForm />
            </div>
          </div>
        </div>

        {/* ── Mobile Form (single column, crossfade) ── */}
        <div className="lg:hidden absolute inset-0 bg-white flex items-center justify-center">
          <div className="w-full max-w-[400px] px-6 py-10 sm:px-10">
            {/* Mobile logo */}
            <div className="flex justify-center mb-6">
              <img src={assest.logo} alt="Numlockitsolutions" className="h-7 w-auto" />
            </div>

            {/* Crossfade wrapper */}
            <div className="relative">
              <div
                className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isRegister
                    ? 'opacity-0 translate-x-[-20px] pointer-events-none absolute inset-0'
                    : 'opacity-100 translate-x-0'
                }`}
              >
                <LoginForm />
              </div>
              <div
                className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isRegister
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-[20px] pointer-events-none absolute inset-0'
                }`}
              >
                <RegisterForm />
              </div>
            </div>

            {/* Mobile toggle */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-gray-400">or</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => navigate(isRegister ? '/login' : '/register')}
                  className="ml-1.5 font-semibold text-[#075E54] hover:text-[#128C7E] transition-colors"
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* ── Branding Panel (slides left ↔ right on desktop) ── */}
        <div
          className="hidden lg:block absolute top-0 w-[45%] h-full z-30 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: isRegister ? '0%' : '55%',
          }}
        >
          <div
            className="relative w-full h-full flex flex-col items-center justify-center text-white p-10 overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #075E54 0%, #128C7E 50%, #0a6b5e 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute top-8 left-8 w-20 h-20 border border-white/10 rounded-full" />
            <div className="absolute bottom-12 right-10 w-32 h-32 border border-white/10 rounded-full" />
            <div className="absolute top-1/3 right-8 w-3 h-3 bg-[#25D366]/40 rounded-full" />
            <div className="absolute bottom-1/3 left-12 w-2 h-2 bg-white/20 rounded-full" />

            {/* Logo */}
            <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <img
                src={assest.logo}
                alt="Numlockitsolutions"
                className="h-8 w-auto brightness-0 invert"
              />
            </div>

            {/* Content – crossfade between states */}
            <div className="relative w-full flex items-center justify-center">
              {/* "Already have an account?" (visible when register) */}
              <div
                className={`flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isRegister
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none absolute'
                }`}
              >
                <h2 className="text-3xl font-bold mb-3 text-center leading-tight">
                  Already have an<br />account?
                </h2>
                <p className="text-white/70 text-center text-sm leading-relaxed mb-8 max-w-[260px]">
                  Sign in to access your dashboard and manage your WhatsApp campaigns.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-10 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 text-sm uppercase tracking-wide"
                >
                  Sign In
                </button>
              </div>

              {/* "New here?" (visible when login) */}
              <div
                className={`flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  !isRegister
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none absolute'
                }`}
              >
                <h2 className="text-3xl font-bold mb-3 text-center leading-tight">
                  New here?
                </h2>
                <p className="text-white/70 text-center text-sm leading-relaxed mb-8 max-w-[260px]">
                  Create an account and start automating your WhatsApp marketing today.
                </p>
                <button
                  onClick={() => navigate('/register')}
                  className="px-10 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 text-sm uppercase tracking-wide"
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* WhatsApp icon watermark */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-[0.06]">
              <svg viewBox="0 0 448 512" fill="white" className="w-32 h-32">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSlider;