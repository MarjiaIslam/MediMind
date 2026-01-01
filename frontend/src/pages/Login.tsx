import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setUser }: { setUser: any }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', formData);
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-sage-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-96 border-t-4 border-sage-500">
        <h2 className="text-2xl font-bold mb-6 text-sage-700">Welcome Back</h2>
        <input className="w-full p-2 mb-4 border rounded" type="email" placeholder="Email" 
          onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input className="w-full p-2 mb-4 border rounded" type="password" placeholder="Password" 
          onChange={e => setFormData({...formData, password: e.target.value})} required />
        <button className="w-full bg-lavender-500 text-white p-2 rounded hover:bg-lavender-700 transition">Login</button>
        <p className="mt-4 text-center">New here? <Link to="/register" className="text-sage-700">Register</Link></p>
      </form>
    </div>
  );
}