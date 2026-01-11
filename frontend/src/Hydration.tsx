import { useState, useEffect } from 'react';
import axios from 'axios';
import { Droplets, Plus, Minus } from 'lucide-react';

export default function Hydration({ user, setUser }: { user: any, setUser: any }) {
    const [waterIntake, setWaterIntake] = useState(user.waterIntake || 0);
    const [message, setMessage] = useState('');

    const dailyGoal = 8; // 8 glasses
    const glassSize = 250; // ml per glass
    const currentMl = waterIntake * glassSize;
    const goalMl = dailyGoal * glassSize;

    const handleAddWater = async () => {
        if (waterIntake < dailyGoal) {
            const newIntake = waterIntake + 1;
            setWaterIntake(newIntake);
            await saveWaterIntake(newIntake);
            if (newIntake === dailyGoal) {
                setMessage('🎉 Great! You reached your daily water goal!');
                setTimeout(() => setMessage(''), 3000);
            }
        }
    };

    const handleRemoveWater = async () => {
        if (waterIntake > 0) {
            const newIntake = waterIntake - 1;
            setWaterIntake(newIntake);
            await saveWaterIntake(newIntake);
        }
    };

    const saveWaterIntake = async (intake: number) => {
        try {
            const res = await axios.put('/api/user/update', { ...user, waterIntake: intake });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.error('Failed to save water intake:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
            <button 
                onClick={() => window.history.back()} 
                className="mb-4 text-blue-600 font-bold hover:text-blue-800"
            >
                ← Back
            </button>

            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <Droplets className="text-blue-500" size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">Hydration Tracker</h1>
                    <p className="text-gray-600 mb-8">Stay hydrated for better health!</p>

                    {/* Water Progress Circle */}
                    <div className="relative w-48 h-48 mx-auto mb-8">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                            {/* Progress circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="8"
                                strokeDasharray={`${(waterIntake / dailyGoal) * 283} 283`}
                                strokeLinecap="round"
                                className="transition-all duration-300"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-4xl font-bold text-blue-600">{waterIntake}</p>
                            <p className="text-gray-600 text-sm">of {dailyGoal} glasses</p>
                        </div>
                    </div>

                    {/* Volume Display */}
                    <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                        <p className="text-gray-600 text-sm mb-1">Current Intake</p>
                        <p className="text-2xl font-bold text-blue-600">{currentMl} ml</p>
                        <p className="text-gray-500 text-xs">Goal: {goalMl} ml</p>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={handleRemoveWater}
                            disabled={waterIntake === 0}
                            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:bg-gray-300 transition flex items-center justify-center gap-2"
                        >
                            <Minus size={20} /> Remove
                        </button>
                        <button
                            onClick={handleAddWater}
                            disabled={waterIntake >= dailyGoal}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Add Glass
                        </button>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-4 font-semibold">
                            {message}
                        </div>
                    )}

                    {/* Tips */}
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 text-left">
                        <p className="font-bold text-blue-700 mb-2">💡 Hydration Tips:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                            <li>• Drink a glass when you wake up</li>
                            <li>• Have water before every meal</li>
                            <li>• Keep a water bottle handy</li>
                            <li>• Drink more on hot days or after exercise</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
