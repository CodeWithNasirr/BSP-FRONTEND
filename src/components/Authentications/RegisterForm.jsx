import axios from 'axios';
import React,{useState} from 'react';
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify'

const RegisterForm = ({ isActive }) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
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

  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return strongPasswordRegex.test(password);
  };

  


  const handleSubmit = async (e) => {
    e.preventDefault();

     // Strong password check
    if (!validatePassword(formData.password)) {
      toast.error(
        "Password must be 8+ characters with uppercase, lowercase, number and special character."
      );
      return;
    }

    try{
      const response = await axios.post(`${API_BASE_URL}/register/`,formData)
      toast.success(response.data.Message)
      setFormData({ username: "", email: "", password: "" })
      navigate('/login')
    }
    catch (error) {
      const errData = error.response?.data;
      if (errData && errData.errors) {
        if (errData.errors.username?.[0]) toast.error(errData.errors.username[0]);
        if (errData.errors.email?.[0]) toast.error(errData.errors.email[0]);
      } else if (errData?.detail) {
        toast.error(errData.detail);
      } else {
        alert("An unexpected error occurred.");
      }
      setFormData({ username: "", email: "", password: "" });
    }
  }

  return (
    <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-600 ease-in-out
      ${isActive ? 'transform translate-x-full opacity-100 z-50' : 'opacity-0 z-10'}`}>
      <form 
        onSubmit={handleSubmit} 
        className="bg-white flex items-center justify-center flex-col px-12 h-full text-center text-sm sm:text-base"
      >
        <h1 className="font-bold text-2xl mb-4">SIGN UP</h1>

        <input required
          value={formData.username} onChange={handleChange}
          type="text"
          name='username'
          placeholder="Username" 
          className="bg-gray-200 rounded-lg border-none p-3 my-2 w-full text-sm sm:text-base"
        />

        <input required
          value={formData.email} onChange={handleChange}
          type="email"
          name='email'
          placeholder="Email" 
          className="bg-gray-200 rounded-lg border-none p-3 my-2 w-full text-sm sm:text-base"
        />

        <div className="relative w-full my-2">
          <input required
            value={formData.password} onChange={handleChange}
            type={showPassword ? "text" : "password"}
            name='password'
            placeholder="Password" 
            className="bg-gray-200 rounded-lg border-none p-3 w-full pr-10 text-sm sm:text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button type='submit' className="rounded-2xl border cursor-pointer border-[#4bb6b7] bg-[#4bb6b7] text-white font-bold my-2 px-5 py-3 uppercase text-sm sm:text-base">
          Register
        </button>
      </form>
    </div>
  );
};
  
export default RegisterForm;
