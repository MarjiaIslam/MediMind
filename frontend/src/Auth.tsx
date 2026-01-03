import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

interface AuthProps { setUser: (user: any) => void; }

export default function Auth({ setUser }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = `http://localhost:8080/api/auth/${isLogin ? 'login' : 'register'}`;
            const payload = isLogin ? { identifier: formData.username, password: formData.password } : formData;
            const res = await axios.post(url, payload);
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate('/dashboard');
        } catch (err) { alert('Authentication failed. Please check your details.'); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-sage-50">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-sage-100">
                <div className="flex justify-center mb-6 text-sage-500">
                    <HeartPulse size={48} />
                </div>
                <h2 className="text-3xl font-bold text-center text-sage-500 mb-2">
                    {isLogin ? 'Welcome Back' : 'Start Your Journey'}
                </h2>
                <p className="text-center text-gray-400 mb-8">Your digital health companion</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <input name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-3 bg-sage-50 rounded-lg border-none focus:ring-2 focus:ring-lavender-400 outline-none" required />
                            <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-3 bg-sage-50 rounded-lg border-none focus:ring-2 focus:ring-lavender-400 outline-none" required />
                        </>
                    )}
                    <input name="username" placeholder={isLogin ? "Username or Email" : "Username"} onChange={handleChange} className="w-full p-3 bg-sage-50 rounded-lg border-none focus:ring-2 focus:ring-lavender-400 outline-none" required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-3 bg-sage-50 rounded-lg border-none focus:ring-2 focus:ring-lavender-400 outline-none" required />
                    <button type="submit" className="w-full bg-sage-300 text-white font-bold p-3 rounded-lg hover:bg-sage-500 transition shadow-md">
                        {isLogin ? 'Log In' : 'Create Account'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-lavender-600 font-semibold hover:underline">
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}
