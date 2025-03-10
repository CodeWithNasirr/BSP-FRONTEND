import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate=useNavigate();
 
  const [errors,setErrors]=useState({});

  useEffect(() => {
    // Check if token exists in localStorage
    const authToken = localStorage.getItem("authToken");
    
    if (authToken) {
        // 💕 Remove the token if the user manually navigates to the login page
        localStorage.removeItem("authToken");
        console.log("Auth token removed. Redirecting to login...");
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
    console.log(formData)

    const handleSubmit = async (e) => {
        e.preventDefault();
       try{
        const response = await axios.post("http://127.0.0.1:8000/login/",formData)
        // alert(`${response.data.Message}`);
        // console.log(response.data.Message)
        localStorage.setItem("authToken", response.data.Token);
        navigate('/dashboard')
       }
       catch (error) {
        if (error.response && error.response.data.errors) {
            setErrors(error.response.data.errors);
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
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 mb-4">Login</h2>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <input type="text" required name='username' value={formData.username} onChange={handleChange} className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" placeholder="Username" />
          <input type="password"  required name='password' value={formData.password} onChange={handleChange} className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" placeholder="Password" />
          <div className="flex items-center justify-between flex-wrap">
            <label htmlFor="remember-me" className="text-sm text-gray-900 cursor-pointer">
              <input type="checkbox" id="remember-me" className="mr-2" />
              Remember me
            </label>
            <a href="#" className="text-sm text-blue-500 hover:underline mb-0.5">Forgot password?</a>
            <p className="text-gray-900 mt-4"> Don't have an account? <span  onClick={()=>navigate('/register')} className="text-sm text-blue-500 -200 hover:underline mt-4">Signup</span></p>
          </div>
          <button type="submit" className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150">Login</button>
          <div className="mt-4 text-center">
          
          {errors.username  &&(
            <p style={{ color: "red" }}>{errors.username[0]}</p>
          )}
          {errors.password &&(
              <p style={{ color: "red" }}>{errors.password[0]}</p>
            )}
            </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
