import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import { assest } from "../../assets/assets";
const Overlay = ({ isRightPanelActive, setIsRightPanelActive }) => {
  const navigate = useNavigate();
    return (
      <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-100
        ${isRightPanelActive ? '-translate-x-full' : ''}`}>
        <div 
          className={`bg-cover bg-no-repeat relative -left-full h-full w-[200%] transform transition-transform duration-600 ease-in-out
            ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}
          style={{ backgroundImage: `url(${assest.hero_bg2})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(46,94,109,0.4)] to-transparent"></div>
          
          <div className={`absolute flex flex-col items-center justify-center px-10 text-center top-0 h-full w-1/2 transition-transform duration-600 ease-in-out text-white
            ${isRightPanelActive ? 'translate-x-0' : '-translate-x-1/5'}`}>
            <h1 className="text-5xl font-bold leading-tight mb-5 shadow-text">Hello <br /> friends</h1>
            <p className="text-sm font-medium mb-8 shadow-text">If you have an account, login here and have fun</p>
            <button 
              onMouseDown={()=>navigate("/login")}
    
              className="bg-[rgba(225,225,225,0.2)] border-2 cursor-pointer border-white text-white font-bold px-20 py-3 rounded-2xl uppercase flex items-center"
            >
              Login
              <i className="lni lni-arrow-left ml-2 transition-opacity duration-300 opacity-0 hover:opacity-100"></i>
            </button>
          </div>
  
          <div className={`absolute flex flex-col items-center justify-center px-10 text-center top-0 right-0 h-full w-1/2 transition-transform duration-600 ease-in-out text-white
            ${isRightPanelActive ? 'translate-x-1/5' : 'translate-x-0'}`}>
            <h1 className="text-5xl font-bold leading-tight mb-5 shadow-text">Start your <br /> journey now</h1>
            <p className="text-sm font-medium mb-8 shadow-text">If you don't have an account yet, join us and start your journey.</p>
            <button 
              onMouseDown={()=>navigate("/register")}
              
              className="bg-[rgba(225,225,225,0.2)] border-2 cursor-pointer border-white text-white font-bold px-20 py-3 rounded-2xl uppercase flex items-center"
            >
              Register
              <i className="lni lni-arrow-right ml-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default Overlay;