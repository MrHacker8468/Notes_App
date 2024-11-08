import React, { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import { Link, useNavigate } from 'react-router-dom';
import Passwordinput from '../../components/Input/Passwordinput';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); 

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)){
      setError("Please Enter a Valid Email address.");
      return;
    }

    if (!password){
      setError("Please Enter a The Passward.");
      return;
    }

    setError("");

    // Login API call
    try {
      const response = await axiosInstance.post('/login', {
          email: email,
          password: password,
      });

      // Check if the response contains accessToken
      if (response.data && response.data.accessToken) {
          localStorage.setItem("token", response.data.accessToken); // Corrected typo: "date" to "data"
          navigate("/dashboard"); // Redirect to the dashboard after successful login
      }
    } catch (error) {
      // Handle error response
      if (error.response && error.response.data && error.response.data.message) {
          setError(error.response.data.message);
      } else {
          setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className='flex items-center justify-center mt-28'>
        <div className='w-96 border rounded bg-white px-7 py-10'>
          <form onSubmit={handleLogin}>
            <h4 className='text-2xl mb-7'>Login</h4>

            <input 
            type="text" 
            placeholder='Email' 
            className='input-box'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />

            <Passwordinput 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

            <button type='submit' className='btn-primary'>
              Login
            </button>

            <p className='text-sm text-center mt-4'>
              Not registerend yet?{" "}
              <Link to="/SignUp" className='font-medium text-primary underline'>
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>

    </>

  );
};

export default Login
