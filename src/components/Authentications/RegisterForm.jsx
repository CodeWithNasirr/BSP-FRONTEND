import axios from 'axios';
import React,{useEffect,useState} from 'react';
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify'

const RegisterForm = ({ isActive }) => {

  const navigate = useNavigate();
    const [errors,setErrors]=useState({});

 
    const [formData, setFormData] =useState({
        username: "",
        email: "",
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
        const response = await axios.post(`${API_BASE_URL}/register/`,formData)
        toast.success(response.data.Message)
        
        setFormData({
            username: "",
            email: "",
            password: "",
        })
        navigate('/login')
       }
       catch (error) {
        if (error.response && error.response.data.errors) {
            toast.error(error.response.data.errors.username[0])
            toast.error(error.response.data.errors.email[0])
            setFormData({
                username: "",
                email: "",
                password: "",
            })
        } else {
            alert("An unexpected error occurred.");
            setFormData({
                username: "",
                email: "",
                password: "",
            })
        }
    }
    }


    return (
      <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out
        ${isActive ? 'transform translate-x-full opacity-100 z-50' : 'opacity-0 z-10'}`}>
        <form onSubmit={handleSubmit} className="bg-white flex items-center justify-center flex-col px-12 h-full text-center">
          <h1 className="font-bold text-2xl mb-4">SIGN UP</h1>
          <input required
            value={formData.username} onChange={handleChange}
            type="text"
            name='username'
            placeholder="Username" 
            className="bg-gray-200 rounded-lg border-none p-3 my-2 w-full"
          />
          <input required
            value={formData.email} onChange={handleChange}
            type="email"
            name='email'
            placeholder="Email" 
            className="bg-gray-200 rounded-lg border-none p-3 my-2 w-full"
          />
          <input required
            value={formData.password} onChange={handleChange}
            type="password"
            name='password'
            placeholder="Password" 
            className="bg-gray-200 rounded-lg border-none p-3 my-2 w-full"
          />
          <button type='submit' className="rounded-2xl border cursor-pointer border-[#4bb6b7] bg-[#4bb6b7] text-white font-bold my-2 px-20 py-3 uppercase">
            Register
          </button>
          {/* <div className="mt-4 text-center">
          {errors.username &&(
            <p style={{ color: "red" }}>{errors.username[0]}</p>
          )}
          
          {errors.email &&(
            <p style={{ color: "red" }}>{errors.email[0]}</p>
          )}
          {errors.password &&(
              <p style={{ color: "red" }}>{errors.password[0]}</p>
            )}
            </div> */}
          {/* <span className="text-sm mt-6">or use your account</span>
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
          </div> */}
        </form>
      </div>
    );
  };
  
  export default RegisterForm;