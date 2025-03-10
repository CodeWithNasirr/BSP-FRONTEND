import { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Overlay from './Overlay';
import { useLocation } from "react-router-dom";
import API_BASE_URL from "../../config";

const AuthSlider = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const location=useLocation();

  useEffect(()=>{
    if (location.pathname ==='/register'){
      setIsRightPanelActive(true)
    }
    else if (location.pathname ==='/login'){
      setIsRightPanelActive(false)
    }
  },[location.pathname])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" 
         style={{ backgroundImage: `url("${API_BASE_URL}/media/static_media/hero-bg.jpg")` }}>
      <div 
        className={`container relative w-[768px] max-w-full min-h-[500px] bg-white rounded-[25px] shadow-2xl overflow-hidden transition-all duration-600 ease-in-out
          ${isRightPanelActive ? 'right-panel-active' : ''}`}
      >
        <RegisterForm isActive={isRightPanelActive} />
        <LoginForm isActive={isRightPanelActive} /> 
        <Overlay 
          isRightPanelActive={isRightPanelActive}
          setIsRightPanelActive={setIsRightPanelActive}
        />
      </div>
    </div>
  );
};

export default AuthSlider;