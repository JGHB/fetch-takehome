import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  // useState hook for form handling
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // useNavigate hook for redirection
  let navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://frontend-take-home-service.fetch.com/auth/login', {
        name: name,
        email: email,
      }, {withCredentials: true});

      if (response.status === 200) {
        // redirect to Home page or wherever you want after successful login
        navigate("/");
      }
    } catch (error) {
      console.error('Failed to login:', error);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginPage;