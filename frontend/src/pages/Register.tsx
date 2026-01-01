import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ setUser }: { setUser: any }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', fullName: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      if (res.data.success) {
        // Auto login after register
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/dashboard');
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-sage-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-96 border-t-4 border-lavender-500">
        <h2 className="text-2xl font-bold mb-6 text-sage-700">Join MediMind</h2>
        
        <input className="w-full p-2 mb-4 border rounded" placeholder="Full Name" 
          onChange={e => setFormData({...formData, fullName: e.target.value})} required />
        <input className="w-full p-2 mb-4 border rounded" placeholder="Username" 
          onChange={e => setFormData({...formData, username: e.target.value})} required />
        <input className="w-full p-2 mb-4 border rounded" type="email" placeholder="Email" 
          onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input className="w-full p-2 mb-4 border rounded" type="password" placeholder="Password" 
          onChange={e => setFormData({...formData, password: e.target.value})} required />

        <button className="w-full bg-sage-500 text-white p-2 rounded hover:bg-sage-700 transition">Register</button>
        <p className="mt-4 text-center">Already have an account? <Link to="/login" className="text-lavender-700">Login</Link></p>
      </form>
    </div>
  );
}