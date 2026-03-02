import { useState, useEffect } from 'react';
import { SiWhatsapp } from "react-icons/si";
import { assest } from '../../assets/assets';
import Subscriptions from '../Subscriptions/Subscription';
import { Link } from 'react-router-dom';
import { useReferralContext } from '../context/ReferralContext';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());

  // ═══════════════════════════════════════════════════════════════════════════
  // REFERRAL: Read client branding from context
  // ═══════════════════════════════════════════════════════════════════════════
  const { client, refCode, isReferred, isLoading: refLoading } = useReferralContext();

  // ── Derived branding values (fallback to defaults) ─────────────────────
  const brandName   = client?.name || "WhatsappGptx";
  const brandLogo   = client?.logo || assest.logo;
  const brandPhone  = client?.phone || "";
  const brandColor  = client?.theme_color || "";
  const brandTagline = client?.tagline || "";

  // WhatsApp link: referred → client's number, default → your alvo.chat
  const whatsappLink = brandPhone
    ? `https://wa.me/${brandPhone}`
    : "https://alvo.chat/6l4J";

  // Demo link: same logic
  const demoLink = whatsappLink;

  // Signup link: preserve ref param so it's captured on registration
  const signupLink = refCode ? `/register?ref=${refCode}` : "/register";
  const loginLink  = refCode ? `/login?ref=${refCode}` : "/login";

  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ── Dynamic theme override via CSS variable ────────────────────────────
  const themeStyle = brandColor
    ? { '--brand-primary': brandColor, '--brand-dark': brandColor }
    : {};

  const features = [
    {
      id: 1,
      title: "AI Chatbot Builder",
      description: "Create feature-rich chatbots without coding. Automate customer interactions effortlessly with intelligent conversation flows.",
      icon: (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="w-7 h-7" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: "WhatsApp Commerce",
      description: "Seamless e-commerce within WhatsApp. Integrate with Shopify, WooCommerce, or custom solutions instantly.",
      icon: (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="w-7 h-7" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: "Mass Messaging Hub",
      description: "Send bulk WhatsApp messages instantly. Manage team responses for incoming customer chats at scale.",
      icon: (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="w-7 h-7" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z" />
        </svg>
      ),
    },
    {
      id: 4,
      title: "GPT-4 AI Assistant",
      description: "Harness OpenAI's power within WhatsApp. Provide intelligent, context-aware responses 24/7.",
      icon: (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="w-7 h-7" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M208 0c-29.9 0-54.7 20.5-61.8 48.2-.8 0-1.4-.2-2.2-.2-35.3 0-64 28.7-64 64 0 4.8.6 9.5 1.7 14C52.5 138 32 166.6 32 200c0 12.6 3.2 24.3 8.3 34.9C16.3 248.7 0 274.3 0 304c0 33.3 20.4 61.9 49.4 73.9-.9 4.6-1.4 9.3-1.4 14.1 0 39.8 32.2 72 72 72 4.1 0 8.1-.5 12-1.2 9.6 28.5 36.2 49.2 68 49.2 39.8 0 72-32.2 72-72V64c0-35.3-28.7-64-64-64zm368 304c0-29.7-16.3-55.3-40.3-69.1 5.2-10.6 8.3-22.3 8.3-34.9 0-33.4-20.5-62-49.7-74 1-4.5 1.7-9.2 1.7-14 0-35.3-28.7-64-64-64-.8 0-1.5.2-2.2.2C422.7 20.5 397.9 0 368 0c-35.3 0-64 28.6-64 64v376c0 39.8 32.2 72 72 72 31.8 0 58.4-20.7 68-49.2 3.9.7 7.9 1.2 12 1.2 39.8 0 72-32.2 72-72 0-4.8-.5-9.5-1.4-14.1 29-12 49.4-40.6 49.4-73.9z" />
        </svg>
      ),
    },
    {
      id: 5,
      title: "Analytics Dashboard",
      description: "Track message delivery, open rates, and engagement metrics with real-time analytics and reporting.",
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3v18h18M9 17V9m4 8V5m4 12v-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ),
    },
    {
      id: 6,
      title: "Template Manager",
      description: "Create, manage, and get WhatsApp message templates approved faster with our intuitive template builder.",
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ),
    },
  ];

  const testimonials = [
    { name: "Rahul Sharma", role: "Founder, ShopEasy", avatar: "RS", rating: 5, text: "Numlockitsolutions transformed how we engage with customers. Our response rate improved by 340% and sales increased by 60% in just 3 months." },
    { name: "Priya Patel", role: "Marketing Head, FreshMart", avatar: "PP", rating: 5, text: "The chatbot builder is incredibly powerful yet simple. We automated 80% of our customer queries and our team can now focus on complex issues." },
    { name: "Amit Verma", role: "CEO, TechNova Solutions", avatar: "AV", rating: 5, text: "Best WhatsApp marketing platform we've used. The mass messaging feature alone saved us 20+ hours per week. Highly recommended!" },
    { name: "Sarah Khan", role: "Operations Manager, StyleHub", avatar: "SK", rating: 5, text: "The multi-agent inbox is a game-changer. Our support team efficiency doubled and customer satisfaction scores are at an all-time high." },
    { name: "David Chen", role: "Director, GlobalTrade Co.", avatar: "DC", rating: 5, text: "We integrated Numlockitsolutions with our Shopify store seamlessly. The WhatsApp commerce features drive 35% of our total online revenue now." },
  ];

  const affiliatePerks = [
    { title: "20% Recurring Commission", description: "Earn 20% on every payment your referrals make — not just the first month, but every single month they stay subscribed.", icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
    { title: "90-Day Cookie Window", description: "Your referral link stays active for 90 days. If someone clicks today and signs up in 3 months, you still get credit.", icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
    { title: "Real-Time Dashboard", description: "Track clicks, conversions, and earnings in real-time. See exactly how much you're earning with full transparency.", icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
    { title: "Marketing Resources", description: "Get access to banners, email templates, and pre-written content to help you promote and maximize conversions.", icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
  ];

  const commissionTiers = [
    { referrals: "1–10", rate: "20%", bonus: "—" },
    { referrals: "11–50", rate: "25%", bonus: "₹5,000 bonus" },
    { referrals: "51–100", rate: "30%", bonus: "₹15,000 bonus" },
    { referrals: "100+", rate: "35%", bonus: "Custom deal" },
  ];

  const partners = [
    { name: "Shopify", logo: "/images/integrations/shopify.png" },
    { name: "WooCommerce", logo: "/images/integrations/woocommerce.webp" },
    { name: "OpenAI", logo: "/images/integrations/openai.png" },
    { name: "Zapier", logo: "/images/integrations/zapier.png" },
    { name: "Google Sheets", logo: "/images/integrations/google-sheets.png" },
    { name: "Stripe", logo: "/images/integrations/stripe.png" },
    { name: "Razorpay", logo: "/images/integrations/razorpay.png" },
    { name: "Make", logo: "/images/integrations/make.png" },
  ];

  const sectionClass = (id) =>
    `transition-all duration-700 ${visibleSections.has(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  // ═══════════════════════════════════════════════════════════════════════════
  // REFERRAL BANNER — shown when page loaded via ?ref=
  // ═══════════════════════════════════════════════════════════════════════════
  const ReferralBanner = () => {
    if (!isReferred) return null;
    return (
      <div className="bg-[#25D366]/10 border-b border-[#25D366]/20 py-2 px-4 text-center text-sm">
        <span className="text-[#075E54] font-medium">
          You were referred by{' '}
          <strong>{brandName}</strong>
          {brandPhone && (
            <> — <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#128C7E]">Chat on WhatsApp</a></>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", ...themeStyle }}>

      {/* ── REFERRAL BANNER ── */}
      <ReferralBanner />

      {/* ──────────────── HEADER ──────────────── */}
      <header className={`fixed w-full bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${isScrolled ? 'border-gray-200 shadow-sm' : 'border-transparent'} z-50 ${isReferred ? 'top-[36px]' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo — dynamic */}
            <a className="flex items-center shrink-0" href="/">
              <img src={brandLogo}  alt={brandName} className="h-24 sm:h-12 w-auto" />
              {isReferred && !client?.logo && (
                <span className="ml-2 text-lg font-bold text-[#075E54]">{brandName}</span>
              )}
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'Pricing', href: '#pricing' },
                ...(!isReferred ? [{ label: 'Affiliates', href: '#affiliates' }] : []),
                { label: 'Contact', to: '/contact-us' },
              ].map((item) =>
                item.to ? (
                  <Link key={item.label} to={item.to} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#075E54] rounded-lg hover:bg-gray-50 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#075E54] rounded-lg hover:bg-gray-50 transition-colors">
                    {item.label}
                  </a>
                )
              )}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a href={loginLink} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#075E54] transition-colors">Log in</a>
              <a href={signupLink} className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}>
                Start Free Trial
              </a>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                {isMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[500px] pb-6' : 'max-h-0'}`}>
            <nav className="flex flex-col gap-1 pt-2">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'Pricing', href: '#pricing' },
                ...(!isReferred ? [{ label: 'Affiliates', href: '#affiliates' }] : []),
                { label: 'Contact', to: '/contact-us' },
                { label: 'Privacy', to: '/privacy' },
                { label: 'Terms', to: '/terms-policy' },
              ].map((item) =>
                item.to ? (
                  <Link key={item.label} to={item.to} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#075E54] hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>{item.label}</Link>
                ) : (
                  <a key={item.label} href={item.href} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#075E54] hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>{item.label}</a>
                )
              )}
              <div className="flex gap-3 pt-3 px-4">
                <a href={loginLink} className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-[#075E54] border border-[#075E54] rounded-lg hover:bg-[#075E54]/5 transition-colors">Log in</a>
                <a href={signupLink} className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}>Sign Up</a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ──────────────── HERO ──────────────── */}
      <section className={`relative overflow-hidden ${isReferred ? 'pt-[calc(7rem+36px)]' : 'pt-28'} lg:${isReferred ? 'pt-[calc(9rem+36px)]' : 'pt-36'} pb-20 lg:pb-28`}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#075E54]/[0.03] via-white to-[#25D366]/[0.04]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#25D366]/[0.06] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#075E54]/[0.04] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #075E54 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366]/10 text-[#075E54] text-xs font-semibold tracking-wide uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                {isReferred ? `Recommended by ${brandName}` : 'Official WhatsApp Business API Partner'}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-gray-900 leading-tight tracking-tight mb-6">
                Automate, Engage &{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #075E54, #25D366)' }}>
                  Grow on WhatsApp
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                {isReferred
                  ? `${brandName} uses this platform to send bulk campaigns, build AI chatbots, and manage conversations — all through WhatsApp Business API.`
                  : 'The all-in-one platform to send bulk campaigns, build AI chatbots, and manage team conversations — all through WhatsApp Business API.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href={signupLink} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-xl shadow-lg shadow-[#075E54]/20 hover:shadow-xl hover:shadow-[#075E54]/25 transition-all duration-200" style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}>
                  Get Started Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <a href={demoLink} target={brandPhone ? "_blank" : "_self"} rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-[#075E54] bg-white border-2 border-[#075E54]/15 rounded-xl hover:border-[#075E54]/30 hover:bg-[#075E54]/[0.02] transition-all duration-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  {isReferred ? `Chat with ${brandName}` : 'Book a Demo'}
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start mt-8 text-sm text-gray-500">
                {['Free 7-day trial', 'credit card needed only when You want the Bulk-Campaigns', 'Cancel anytime'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#25D366]/20 to-[#075E54]/20 rounded-2xl blur-2xl opacity-40" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-200/60">
                <img src={assest.Dashboard} alt={`${brandName} Dashboard Preview`} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── STATS ──────────────── */}
      <section className="py-14 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100+', label: 'Active Businesses' },
              { value: '2M+', label: 'Messages Sent' },
              { value: '30+', label: 'Integrations' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold text-[#075E54]">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FEATURES ──────────────── */}
      <section id="features" data-animate className={`py-20 lg:py-28 ${sectionClass('features')}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#128C7E] mb-3">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Everything you need for WhatsApp marketing</h2>
            <p className="mt-4 text-lg text-gray-500">Powerful tools to automate conversations, drive sales, and delight customers — all from one dashboard.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.id} className="group relative rounded-2xl border border-gray-200 bg-white p-7 hover:border-[#25D366]/40 hover:shadow-lg hover:shadow-[#25D366]/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white" style={{ background: 'linear-gradient(135deg, #075E54 0%, #25D366 100%)' }}>{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FEATURE DETAILS ──────────────── */}
      <section className="py-20 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          <div id="detail1" data-animate className={`flex flex-col lg:flex-row items-center gap-12 ${sectionClass('detail1')}`}>
            <div className="lg:w-1/2">
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-gray-900/5 border border-gray-200/60">
                <img src={assest.chats} alt="Multi-Agent Chat Inbox" className="w-full h-auto" />
              </div>
            </div>
            <div className="lg:w-1/2 space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#075E54]/10 text-[#075E54]">Team Inbox</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Multi-Agent Chat Inbox</h3>
              <p className="text-gray-600 leading-relaxed">Enable seamless collaboration between sales and support teams. Multiple agents can respond to incoming WhatsApp messages with full access control.</p>
              <ul className="space-y-3">
                {['WhatsApp-native interface for seamless communication', 'CRM-grade features for sales and support workflows', 'Assign, reassign agents, teams & custom tagging', 'Override bots and assign chatbots dynamically'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <svg className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div id="detail2" data-animate className={`flex flex-col lg:flex-row-reverse items-center gap-12 ${sectionClass('detail2')}`}>
            <div className="lg:w-1/2">
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-gray-900/5 border border-gray-200/60">
                <img src={assest.chat_flows} alt="No-Code Chatbot Builder" className="w-full h-auto" />
              </div>
            </div>
            <div className="lg:w-1/2 space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#25D366]/10 text-[#075E54]">Chatbot Builder</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">No-Code Chatbot Builder</h3>
              <p className="text-gray-600 leading-relaxed">Build advanced WhatsApp chatbots without writing a single line of code. Automate interactions, collect leads, and provide instant responses.</p>
              <ul className="space-y-3">
                {['The most advanced no-code builder for WhatsApp', 'Media, interactive lists, buttons & catalog support', 'API & webhooks for real-time integration', 'Powerful add-ons: OpenAI, Zapier, Google Apps'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <svg className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section id="testimonials" data-animate className={`py-20 lg:py-28 bg-white ${sectionClass('testimonials')}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#128C7E] mb-3">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Trusted by businesses that grow on WhatsApp</h2>
          </div>
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((t, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:border-[#25D366]/30 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, idx) => (
                    <svg key={idx} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-[15px]">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #075E54, #25D366)' }}>{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile carousel */}
          <div className="md:hidden">
            <div className="rounded-2xl border border-gray-200 bg-white p-7">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, idx) => (
                  <svg key={idx} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">"{testimonials[activeTestimonial].text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #075E54, #25D366)' }}>{testimonials[activeTestimonial].avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{testimonials[activeTestimonial].name}</div>
                  <div className="text-xs text-gray-500">{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-[#075E54] w-6' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── INTEGRATIONS ──────────────── */}
      <section id="integrations" data-animate className={`py-16 bg-gray-50/70 border-y border-gray-100 ${sectionClass('integrations')}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#128C7E] mb-3">Integrations</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Connect with your favorite tools</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 max-w-3xl mx-auto">
            {partners.map((p, i) => (
              <div key={i} className="flex items-center justify-center p-5 bg-white rounded-xl border border-gray-200 hover:border-[#25D366]/30 hover:shadow-md transition-all duration-300">
                <img src={p.logo} alt={p.name} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── PRICING ──────────────── */}
      <section id="pricing" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#128C7E] mb-3">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-500">Start free, scale as you grow. No hidden fees.</p>
          </div> */}
          <Subscriptions />
        </div>
      </section>

      {/* ──────────────── AFFILIATE PROGRAM (hidden for referred visitors) ──────────────── */}
      {!isReferred && (
        <section id="affiliates" data-animate className={`py-20 lg:py-28 relative overflow-hidden ${sectionClass('affiliates')}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#075E54] to-[#128C7E]" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-semibold tracking-wide uppercase mb-4">Partner Program</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Earn recurring income as an affiliate</h2>
              <p className="mt-4 text-lg text-white/70">Refer businesses to Numlockitsolutions and earn up to 35% commission on every payment — month after month.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
              {affiliatePerks.map((perk, i) => (
                <div key={i} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-6 hover:bg-white/15 transition-colors duration-300">
                  <div className="text-[#25D366] mb-4">{perk.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{perk.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{perk.description}</p>
                </div>
              ))}
            </div>
            {/* <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white text-center mb-6">Commission Tiers</h3>
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <table className="w-full">
                  <thead><tr className="bg-white/10">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">Referrals</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">Bonus</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/10">
                    {commissionTiers.map((tier, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white text-sm font-medium">{tier.referrals}</td>
                        <td className="px-6 py-4"><span className="inline-flex px-2.5 py-1 rounded-full bg-[#25D366]/20 text-[#25D366] text-sm font-bold">{tier.rate}</span></td>
                        <td className="px-6 py-4 text-white/70 text-sm">{tier.bonus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-8">
                <a href={signupLink} className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-[#075E54] bg-white rounded-xl hover:bg-gray-50 shadow-lg transition-all duration-200">
                  Join Affiliate Program
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            </div> */}
          </div>
        </section>
      )}

      {/* ──────────────── CTA ──────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">Ready to transform your WhatsApp marketing?</h2>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            {isReferred
              ? `Join ${brandName} and 100+ businesses already growing their revenue. Start your free trial today.`
              : 'Join 100+ businesses already growing their revenue with Numlockitsolutions. Start your free trial today.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={signupLink} className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg shadow-[#075E54]/20 hover:shadow-xl transition-all duration-200" style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}>
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href={demoLink} target={brandPhone ? "_blank" : "_self"} rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-[#075E54] border-2 border-[#075E54]/15 rounded-xl hover:border-[#075E54]/30 transition-all duration-200">
              {isReferred ? `Talk to ${brandName}` : 'Talk to Sales'}
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1 space-y-5">
              <img src={brandLogo} alt={brandName} className="h-20 w-auto" />
              {isReferred && !client?.logo && (
                <p className="text-base font-bold text-[#075E54]">{brandName}</p>
              )}
              <p className="text-sm text-gray-500 leading-relaxed">
                {isReferred
                  ? `${brandName} — Powered by Numlockitsolutions. Official WhatsApp Business API Solution.`
                  : 'Official WhatsApp Business API Solution Provider. Powering automated messaging for 100+ businesses worldwide.'
                }
              </p>
              <div className="flex gap-3">
                {[
                  { href: "https://www.facebook.com/share/1C4Q7heRr8/", icon: <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />, vb: "0 0 320 512" },
                  { href: "https://www.instagram.com/marketingbhaix", icon: <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />, vb: "0 0 448 512" },
                  { href: "https://youtube.com/@marketingbhaix", icon: <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />, vb: "0 0 576 512" },
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-200/60 flex items-center justify-center text-gray-500 hover:bg-[#25D366]/10 hover:text-[#25D366] transition-all duration-200">
                    <svg fill="currentColor" viewBox={social.vb} className="w-4 h-4">{social.icon}</svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3">
                {[{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Integrations', href: '#integrations' }].map((item) => (
                  <li key={item.label}><a href={item.href} className="text-sm text-gray-500 hover:text-[#075E54] transition-colors">{item.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                {[{ label: 'Privacy Policy', to: '/privacy' }, { label: 'Terms & Conditions', to: '/terms-policy' }, { label: 'Shipping & Delivery', to: '/shipping-policy' }, { label: 'Cancellation & Refund', to: '/refund-policy' }].map((item) => (
                  <li key={item.label}><Link to={item.to} className="text-sm text-gray-500 hover:text-[#075E54] transition-colors">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-3">
                <li><Link to="/contact-us" className="text-sm text-gray-500 hover:text-[#075E54] transition-colors">Contact Us</Link></li>
                <li><a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#075E54] transition-colors">WhatsApp Support</a></li>
                <li><a href={demoLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#075E54] transition-colors">Book a Demo</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
              {isReferred && <span className="text-gray-300"> · Powered by WhatsappGptx</span>}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              WhatsApp Business API Partner
            </div>
          </div>
        </div>
      </footer>

      {/* ──────────────── FLOATING WHATSAPP ──────────────── */}
      <div className="fixed bottom-5 right-5 lg:bottom-8 lg:right-8 z-50">
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#25D366] text-white pl-4 pr-5 py-2.5 rounded-full shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all duration-300 group">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
            <SiWhatsapp className="w-5 h-5 text-[#25D366]" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-tight">
              {isReferred ? `Chat with ${brandName}` : 'Chat with us'}
            </div>
            <div className="text-[11px] text-white/75 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse" />
              Typically replies instantly
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}