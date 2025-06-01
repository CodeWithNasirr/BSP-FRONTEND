import { useState, useEffect } from 'react';
import { SiWhatsapp } from "react-icons/si";
import { assest } from '../../assets/assets';
import PricingPlans from '../Subscriptions/subscriptions';
import { Link } from 'react-router-dom';
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      id: 1,
      title: "AI Chatbot Builder",
      description: "Create feature-rich chatbots without coding. Automate customer interactions effortlessly.",
      icon: (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="text-4xl mb-4 text-white/90" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z"></path>
        </svg>
      ),
      bg: "from-green-700 to-green-600"
    },
    {
      id: 2,
      title: "WhatsApp Commerce",
      description: "Seamless e-commerce within WhatsApp. Integrate with popular platforms or custom solutions.",
      icon: (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-4xl mb-4 text-white/90" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"></path>
        </svg>
      ),
      bg: "from-emerald-600 to-emerald-500"
    },
    {
      id: 3,
      title: "Mass Messaging Hub",
      description: "Send bulk WhatsApp messages instantly. Manage team responses for incoming customer chats.",
      icon: (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="text-4xl mb-4 text-white/90" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"></path>
        </svg>
      ),
      bg: "from-teal-500 to-teal-400"
    },
    {
      id: 4,
      title: "GPT-4 AI Assistant",
      description: "Harness OpenAI's power within WhatsApp. Provide intelligent, context-aware responses.",
      icon: (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-4xl mb-4 text-white/90" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M208 0c-29.9 0-54.7 20.5-61.8 48.2-.8 0-1.4-.2-2.2-.2-35.3 0-64 28.7-64 64 0 4.8.6 9.5 1.7 14C52.5 138 32 166.6 32 200c0 12.6 3.2 24.3 8.3 34.9C16.3 248.7 0 274.3 0 304c0 33.3 20.4 61.9 49.4 73.9-.9 4.6-1.4 9.3-1.4 14.1 0 39.8 32.2 72 72 72 4.1 0 8.1-.5 12-1.2 9.6 28.5 36.2 49.2 68 49.2 39.8 0 72-32.2 72-72V64c0-35.3-28.7-64-64-64zm368 304c0-29.7-16.3-55.3-40.3-69.1 5.2-10.6 8.3-22.3 8.3-34.9 0-33.4-20.5-62-49.7-74 1-4.5 1.7-9.2 1.7-14 0-35.3-28.7-64-64-64-.8 0-1.5.2-2.2.2C422.7 20.5 397.9 0 368 0c-35.3 0-64 28.6-64 64v376c0 39.8 32.2 72 72 72 31.8 0 58.4-20.7 68-49.2 3.9.7 7.9 1.2 12 1.2 39.8 0 72-32.2 72-72 0-4.8-.5-9.5-1.4-14.1 29-12 49.4-40.6 49.4-73.9z"></path>
        </svg>
      ),
      bg: "from-green-500 to-green-400"
    }
  ];

  const integrations = [
    { name: "Shopify", logo: "/images/integrations/shopify.png" },
    { name: "WooCommerce", logo: "/images/integrations/woocommerce.webp" },
    { name: "OpenAI", logo: "/images/integrations/openai.png" },
    { name: "Zapier", logo: "/images/integrations/zapier.png" },
    { name: "Google Sheets", logo: "/images/integrations/google-sheets.png" },
    { name: "Stripe", logo: "/images/integrations/stripe.png" },
    { name: "Razorpay", logo: "/images/integrations/razorpay.png" },
    { name: "Make", logo: "/images/integrations/make.png" },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className={`fixed w-full bg-white shadow-md transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-none'} z-50`}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col xl:flex-row items-center justify-between">
            <div className="flex items-center justify-between w-full xl:w-auto mb-2 xl:mb-0">
              <a className="flex items-center w-[7rem] h-5 sm:w-[12rem]" href="/">
              <img src={assest.logo} alt="" />
                {/* <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">WhatsAppGPTX</span> */}
              </a>
              <div className="flex xl:hidden items-center gap-2">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600 hover:text-gray-800 px-2 py-1 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isMenuOpen ? (
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    ) : (
                      <path d="M3 12h18M3 6h18M3 18h18"></path>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} xl:hidden w-full py-4`}>
              <nav className="flex flex-col space-y-4">
                <a className="text-base hover:text-green-600 flex items-center px-2 py-1 transition-colors duration-200 group text-gray-600" href="#features">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 transition-colors duration-200 text-gray-600 group-hover:text-green-600">
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                  </svg>
                  Features
                </a>
                <Link className="text-base hover:text-green-600 flex items-center px-2 py-1 transition-colors duration-200 group text-gray-600" to={"/privacy"}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 transition-colors duration-200 text-gray-600 group-hover:text-green-600">
                    <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"></path>
                    <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"></path>
                    <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"></path>
                  </svg>
                  Privacy
                </Link>
                <a className="text-base hover:text-green-600 flex items-center px-2 py-1 transition-colors duration-200 group text-gray-600" href="#pricing">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 transition-colors duration-200 text-gray-600 group-hover:text-green-600">
                    <line x1="12" x2="12" y1="2" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Pricing
                </a>
                <div className="flex space-x-4 pt-4">
                  <a className="text-sm text-white px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center shadow-md" href="/login">
                    Login
                  </a>
                  <a className="text-sm text-white px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center shadow-md" href="/register">
                    Sign Up
                  </a>
                </div>
              </nav>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex flex-wrap justify-center xl:justify-start space-x-2 xl:space-x-6 mb-2 xl:mb-0">
              <a className="text-sm xl:text-base hover:text-green-600 flex items-center px-2 py-1 transition-colors duration-200 group text-gray-600" href="#features">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 transition-colors duration-200 text-gray-600 group-hover:text-green-600">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
                Features
              </a>
              <Link className="text-sm xl:text-base hover:text-green-600 flex items-center px-2 py-1 transition-colors duration-200 group text-gray-600" to={"/privacy"} >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 transition-colors duration-200 text-gray-600 group-hover:text-green-600">
                  <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"></path>
                  <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"></path>
                  <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"></path>
                </svg>
                Privacy
              </Link>
              <a className="text-sm xl:text-base hover:text-green-600 flex items-center px-2 py-1 transition-colors duration-200 group text-gray-600" href="#pricing">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 transition-colors duration-200 text-gray-600 group-hover:text-green-600">
                  <line x1="12" x2="12" y1="2" y2="22"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Pricing
              </a>
            </nav>
            <div className="hidden xl:flex items-center space-x-4">
              <a className="text-sm xl:text-base text-gray-600 hover:text-gray-800 flex items-center" href="/login">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-0.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" x2="3" y1="12" y2="12"></line>
                </svg> 
                Login
              </a>
              <a className="text-sm xl:text-base text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center shadow-md" href="/register">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 md:w-4 h-3.5 md:h-4 mr-0.5">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </header>



      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,249,157,0.3),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-green-50/80 to-white"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 -left-4 w-3/4 h-1/2 bg-gradient-to-br from-green-200/30 via-green-100/10 to-transparent rounded-full blur-2xl transform rotate-12 animate-aurora" style={{ animationDuration: '8s' }}></div>
            <div className="absolute top-1/4 -right-4 w-2/3 h-1/2 bg-gradient-to-bl from-emerald-200/20 via-green-100/10 to-transparent rounded-full blur-2xl transform -rotate-12 animate-aurora-reverse" style={{ animationDuration: '12s' }}></div>
            <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-green-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-emerald-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s' }}></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 pt-16 md:pt-24 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2 text-center lg:text-left">
              <p className="text-sm font-semibold text-green-600 tracking-wide uppercase mb-4">AI-POWERED WHATSAPP MARKETING</p>
              <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold mb-6">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 pb-[5px]">Advanced WhatsApp Automation with WhatsappGPTX</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Transform your business communications with WhatsappGPTX's powerful AI-driven WhatsApp Business API solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/register" className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center">
                  Get Started Free
                </a>
                <a href="https://wa.link/kymjyg" className="bg-white text-gray-800 px-6 py-3 rounded-full text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-colors inline-flex items-center justify-center">
                  Book a Demo
                </a>
              </div>
              <div className="mt-8 inline-flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm text-gray-600">Trusted by 100+ businesses</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative">
                  <img 
                    src={assest.Dashboard}
                    alt="WhatsAppGPTX Dashboard Preview" 
                    className="relative z-10 rounded-xl shadow-xl border border-gray-200" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 tracking-wide uppercase">POWERFUL FEATURES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Everything You Need for WhatsApp Marketing</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className={`relative group rounded-2xl overflow-hidden bg-gradient-to-br ${feature.bg} p-6 text-white h-full min-h-[280px] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg`}>
                <div>
                  {feature.icon}
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/90 text-base leading-relaxed">{feature.description}</p>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                  {feature.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
          
      {/* Price Section */}
      <section id='pricing'>
        <PricingPlans/>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <span className="text-5xl font-bold text-gray-900">5</span>
                <span className="text-2xl font-bold text-orange-500">+</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 mt-2">EMPLOYEES</h3>
              <p className="text-gray-600 mt-2 max-w-xs mx-auto">Dedicated to developing perfect WhatsApp automation technology</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <span className="text-5xl font-bold text-gray-900">100</span>
                <span className="text-2xl font-bold text-orange-500">+</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 mt-2">BUSINESSES</h3>
              <p className="text-gray-600 mt-2 max-w-xs mx-auto">Trust WhatsAppGPTX to grow their customer engagement</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <span className="text-5xl font-bold text-gray-900">30</span>
                <span className="text-2xl font-bold text-orange-500">+</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 mt-2">INTEGRATIONS</h3>
              <p className="text-gray-600 mt-2 max-w-xs mx-auto">Seamlessly connect with your existing business tools</p>
            </div>
          </div>
        </div>
      </section>



      {/* Integrations Section */}
      {/* <section id="integrations" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Native Integrations</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Connect WhatsAppGPTX with your favorite tools and services</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            {integrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <img 
                  src={integration.logo} 
                  alt={integration.name} 
                  className="w-auto h-12 object-contain grayscale hover:grayscale-0 transition-all duration-300" 
                />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Feature Details Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {/* Feature 1 */}
            <div className="bg-green-50 rounded-2xl overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center py-8 px-6 lg:px-12">
                <div className="lg:w-1/2 mb-8 lg:mb-0">
                  <img 
                    src={assest.chats}
                    alt="Multi-Agent Chat Inbox" 
                    className="w-full h-auto rounded-lg shadow-md" 
                  />
                </div>
                <div className="lg:w-1/2 lg:px-12 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-4xl text-green-700" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M567.938 243.908L462.25 85.374A48.003 48.003 0 0 0 422.311 64H153.689a48 48 0 0 0-39.938 21.374L8.062 243.908A47.994 47.994 0 0 0 0 270.533V400c0 26.51 21.49 48 48 48h480c26.51 0 48-21.49 48-48V270.533a47.994 47.994 0 0 0-8.062-26.625zM162.252 128h251.497l85.333 128H376l-32 64H232l-32-64H76.918l85.334-128z"></path>
                      </svg>
                      <span className="text-sm font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full">Team Inbox</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Multi-Agent Chat Inbox</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    With WhatsAppGPTX Connect CRM, you can enable a multi-agent chat system for seamless sales and support. Multiple agents can respond to incoming messages with access control and performance monitoring.
                  </p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li className="text-lg text-gray-700">WhatsApp-like interface for seamless communication</li>
                    <li className="text-lg text-gray-700">CRM-specific features for sales/support business chat</li>
                    <li className="text-lg text-gray-700">Assign, reassign agents, teams & add tags</li>
                    <li className="text-lg text-gray-700">Override the bot and assign chatbots dynamically</li>
                  </ul>
                  <a href="#features">
                    <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full transition-colors duration-300 text-lg font-semibold hover:shadow-lg mt-4">
                      Learn More
                    </button>
                  </a>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="flex flex-col lg:flex-row-reverse items-center py-8 px-6 lg:px-12">
                <div className="lg:w-1/2 mb-8 lg:mb-0">
                  <img 
                    src={assest.chat_flows}
                    alt="No-Code Chatbot Builder" 
                    className="w-full h-auto rounded-lg shadow-md" 
                  />
                </div>
                <div className="lg:w-1/2 lg:px-12 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="text-4xl text-green-600" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z"></path>
                      </svg>
                      <span className="text-sm font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full">ChatBot Builder</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">No-Code Chatbot Builder</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Build advanced chatbots for WhatsApp without any coding skills. Our no-code chatbot builder allows anyone to automate interactions and provide real-time responses to users.
                  </p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li className="text-lg text-gray-700">The most advanced no-code builder for WhatsApp</li>
                    <li className="text-lg text-gray-700">Media, interactive lists & buttons, catalog support</li>
                    <li className="text-lg text-gray-700">API & webhooks for real-time communication</li>
                    <li className="text-lg text-gray-700">Powerful add-ons like OpenAI, Zapier, Google Apps</li>
                  </ul>
                  <a href="#features">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors duration-300 text-lg font-semibold hover:shadow-lg mt-4">
                      Learn More
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url('/pattern.svg')", backgroundSize: "30px" }}></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-6">
            <div className="flex-1 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ lineHeight: '1.2' }}>Ready to transform your WhatsApp marketing?</h2>
              <p className="text-lg text-green-50 max-w-xl">Join thousands of businesses already growing with WhatsAppGPTX</p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center text-sm text-green-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></div>
                  No credit card required
                </div>
                <div className="flex items-center text-sm text-green-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></div>
                  Free trial available
                </div>
              </div>
            </div>
            <div>
              <a className="inline-flex items-center gap-2 bg-white text-[#075E54] px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-50 transition-colors duration-300 shadow-lg hover:shadow-xl" href="/register">
                Get Started with WhatsAppGPTX
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-5 h-5">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-white">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.1),rgba(16,185,129,0.05))]"></div>
        </div>
        <div className="relative z-10 pt-16 pb-8">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 w-full max-w-6xl">
              <div className="space-y-6">
                <div className="flex items-center w-[7rem] h-5 sm:w-[12rem]">
                 
                  <img src={assest.logo} alt="" />
                    {/* <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">WhatsAppGPTX</span> */} 
                 
                </div>
                <p className="text-gray-600">WhatsApp Business Solution Provider</p>
                <div className="flex space-x-4">
                  <a target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-all duration-300" href="https://facebook.com">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
                    </svg>
                  </a>
                  <a target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-all duration-300" href="https://www.instagram.com/thedailysparkx/">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                    </svg>
                  </a>
                  <a target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-all duration-300" href="https://youtube.com">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                    </svg>
                  </a>
                  <a target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-all duration-300" href="https://wa.link/kymjyg">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* <div className="">
                <h3 className="text-lg font-semibold mb-6">Explore</h3>
                <ul className="space-y-4">
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 flex items-center group" href="/features"><span className="group-hover:translate-x-1 transition-transform duration-300">Features</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 flex items-center group" href="/pricing"><span className="group-hover:translate-x-1 transition-transform duration-300">Pricing</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 flex items-center group" href="/integrations"><span className="group-hover:translate-x-1 transition-transform duration-300">Integrations</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 flex items-center group" href="/api"><span className="group-hover:translate-x-1 transition-transform duration-300">API Documentation</span></a></li>
                </ul>
              </div> */}
{/*               
              <div className="">
                <h3 className="text-lg font-semibold mb-6">Resources</h3>
                <ul className="space-y-4">
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 group" href="/blog"><span className="group-hover:translate-x-1 transition-transform duration-300">Blog</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 group" href="/help-center"><span className="group-hover:translate-x-1 transition-transform duration-300">Help Center</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 group" href="/webinars"><span className="group-hover:translate-x-1 transition-transform duration-300">Webinars</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 group" href="/status"><span className="group-hover:translate-x-1 transition-transform duration-300">System Status</span></a></li>
                </ul>
              </div>
              
              <div className="">
                <h3 className="text-lg font-semibold mb-6">Company</h3>
                <ul className="space-y-4">
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 group" href="/about"><span className="group-hover:translate-x-1 transition-transform duration-300">About Us</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 group" href="/careers"><span className="group-hover:translate-x-1 transition-transform duration-300">Careers</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 group" href="/contact"><span className="group-hover:translate-x-1 transition-transform duration-300">Contact Us</span></a></li>
                  <li><a className="text-gray-600 hover:text-green-500 transition-all duration-300 group" href="/partners"><span className="group-hover:translate-x-1 transition-transform duration-300">Partners</span></a></li>
                </ul>
              </div> */}
            </div>
            
            {/* WhatsApp Float Button */}
            <div className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-50 scale-75 lg:scale-100 origin-bottom-right">
              <a target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 lg:space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-full hover:shadow-lg transition-all duration-300 group text-sm lg:text-base" href="https://wa.link/kymjyg">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                  <SiWhatsapp color='green' className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <div>
                  <div className="font-medium">Support Team</div>
                  <div className="text-xs lg:text-sm opacity-90 flex items-center">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-300 rounded-full mr-1.5 lg:mr-2 animate-pulse"></span>
                    Online
                  </div>
                </div>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-full"></span>
              </a>
            </div>
            
            <div className="border-t border-gray-200/50 pt-8 mt-8 w-full">
              <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 w-full max-w-6xl">
                <p className="text-gray-500 text-sm">© {new Date().getFullYear()} WhatsAppGPTX. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}