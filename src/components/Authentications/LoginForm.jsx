import axios from 'axios';
import React,{useEffect,useState} from 'react';
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify'

const LoginForm = ({ isActive }) => {


  const navigate=useNavigate();
 
  const [errors,setErrors]=useState({});

  useEffect(() => {
    // Check if token exists in localStorage
    const authToken = localStorage.getItem("authToken");
    
    if (authToken) {
        // 💕 Remove the token if the user manually navigates to the login page
        localStorage.removeItem("authToken");
        // console.log("Auth token removed. Redirecting to login...");
    }
}, []);

  const [formData, setFormData] =useState({
        username: "",
        password: "",
    });

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setFormData((prevData)=>({ 
            ...prevData,
            [name]: value
        }))
    }
    // console.log(formData)

    const handleSubmit = async (e) => {
        e.preventDefault();
       try{
        const response = await axios.post(`${API_BASE_URL}/login/`,formData)
        toast.success(response.data.Message) 
        localStorage.setItem("authToken", response.data.Token);
        navigate('/dashboard')
       }
       catch (error) {
        if (error.response && error.response.data.errors) {
          toast.error(error.response.data.errors)
            setFormData({
                username: "",
                password: "",
            })
        } else {
            alert("An unexpected error occurred.");
            setFormData({
                username: "",
                password: "",
            })
        }
    }
    }


    return (
      <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out
        ${isActive ? 'transform translate-x-full' : ''} z-20`}>
        <form onSubmit={handleSubmit} className="bg-white flex items-center justify-center flex-col px-12 h-full text-center">
          <h1 className="font-bold text-2xl mb-4">SIGN IN</h1>
          <input 
            type="text" required
            name='username'
            placeholder="Username"
            value={formData.username} onChange={handleChange}
            className="bg-gray-200 rounded-lg border-none p-3 my-2 w-full"
          />
          <input 
            type="password" required
            name='password' 
            value={formData.password} onChange={handleChange}
            placeholder="Password" 
            className="bg-gray-200 rounded-lg border-none p-3 my-2 w-full"
          />
          <div className="flex w-full h-12 items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="checkbox" className="w-3 h-3 text-gray-800" />
              <label htmlFor="checkbox" className="text-sm pl-1">Remember me</label>
            </div>
            <a href="#" className="text-sm text-gray-600 hover:text-[#4bb6b7]">Forgot password?</a>
          </div>
          <button type='submit' className="rounded-2xl border cursor-pointer border-[#4bb6b7] bg-[#4bb6b7] text-white font-bold my-2 px-20 py-3 uppercase">
            Login
          </button>
          <span className="text-sm mt-6">or use your account</span>
          <div className="flex mt-5">
            <a href="#" className="border rounded-full w-10 h-10 flex items-center justify-center mx-2 hover:border-[#4bb6b7]">
              <i className="lni lni-facebook-fill"></i>
            </a>
            <a href="#" className="border rounded-full w-10 h-10 flex items-center justify-center mx-2 hover:border-[#4bb6b7]">
              <i className="lni lni-google"></i>
            </a>
            <a href="#" className="border rounded-full w-10 h-10 flex items-center justify-center mx-2 hover:border-[#4bb6b7]">
              <i className="lni lni-linkedin-original"></i>
            </a>
          </div>
        </form>
      </div>
    );
  };
  
  export default LoginForm;