import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile({ user, setUser }: { user: any, setUser: any }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(user);
    const [msg, setMsg] = useState('');

    const moods = ['Happy 😊', 'Stressed 😫', 'Calm 😌', 'Tired 😴', 'Sad 😢'];
    
    const quotes: any = {
        'Happy 😊': "Keep shining! Your positivity is contagious.",
        'Stressed 😫': "Take a deep breath. One step at a time.",
        'Calm 😌': "Peace comes from within. Enjoy this moment.",
        'Tired 😴': "Rest is productive too. Recharge yourself.",
        'Sad 😢': "This too shall pass. You are stronger than you know."
    };

    const handleUpdate = async () => {
        const res = await axios.put('/api/user/update', formData);
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setMsg('Profile Updated Successfully!');
        setTimeout(() => setMsg(''), 3000);
    };

    return (
        <div className="min-h-screen bg-lavender-50 p-6">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-lavender-600 font-bold">← Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-lavender-600 mb-6">👤 My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Edit Form */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Health Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400">Full Name</label>
                            <input type="text" value={formData.fullName || ''} onChange={e=>setFormData({...formData, fullName: e.target.value})} placeholder="Enter your full name" className="w-full p-2 border rounded" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400">Height (cm)</label>
                                <input type="number" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Weight (kg)</label>
                                <input type="number" value={formData.weight} onChange={e=>setFormData({...formData, weight: e.target.value})} className="w-full p-2 border rounded" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Allergies</label>
                            <input placeholder="Peanuts, Shellfish..." value={formData.allergies} onChange={e=>setFormData({...formData, allergies: e.target.value})} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Chronic Conditions</label>
                            <div className="space-y-2">
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid'].map(cond => (
                                        <button
                                            key={cond}
                                            onClick={() => {
                                                const current = formData.conditions ? formData.conditions.split(',').map((c: string) => c.trim()) : [];
                                                if (current.includes(cond)) {
                                                    setFormData({...formData, conditions: current.filter((c: string) => c !== cond).join(', ')});
                                                } else {
                                                    setFormData({...formData, conditions: [...current, cond].join(', ')});
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${formData.conditions?.includes(cond) ? 'bg-sage-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                        >
                                            {cond}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    type="text"
                                    placeholder="Or type custom conditions (comma-separated)"
                                    value={formData.conditions} 
                                    onChange={e=>setFormData({...formData, conditions: e.target.value})} 
                                    className="w-full p-2 border rounded" 
                                />
                            </div>
                        </div>
                        <button onClick={handleUpdate} className="w-full bg-lavender-400 text-white font-bold py-2 rounded hover:bg-lavender-600 transition">Save Changes</button>
                        {msg && <p className="text-green-500 text-center text-sm">{msg}</p>}
                    </div>
                </div>

                {/* Mood Tracker */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold text-lg mb-4 text-gray-700">Empathy Engine</h3>
                        <p className="mb-2 text-gray-500">How are you feeling today?</p>
                        <div className="flex justify-between mb-6">
                            {moods.map(m => (
                                <button key={m} onClick={() => setFormData({...formData, mood: m})} 
                                    className={`text-2xl p-2 rounded-full transition ${formData.mood === m ? 'bg-lavender-200 scale-125' : 'grayscale opacity-50'}`}>
                                    {m.split(' ')[1]}
                                </button>
                            ))}
                        </div>
                        <div className="bg-lavender-50 p-4 rounded-xl border border-lavender-200 text-center">
                            <p className="text-lavender-600 font-serif italic text-lg">"{quotes[formData.mood] || quotes['Happy 😊']}"</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold text-lg">✨ Your Rewards</h3>
                        <p className="text-sm opacity-90 mb-4">Keep healthy to earn badges!</p>
                        <div className="flex gap-4">
                            <div className="bg-white/20 p-2 rounded text-center w-16">
                                <span className="text-2xl">🥉</span>
                                <p className="text-xs font-bold">Bronze</p>
                            </div>
                             {/* Logic to show locked badges can be added here */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}