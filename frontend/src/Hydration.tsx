import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Droplets, Plus, Minus, Trophy, Target } from 'lucide-react';

export default function Hydration({ user, setUser }: { user: any, setUser: any }) {
    const [waterIntake, setWaterIntake] = useState(user.waterIntake || 0);
    const [message, setMessage] = useState('');
    
    // Use ref to track the latest user data for achievement counting
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const dailyGoal = 8; // 8 glasses minimum goal
    const maxDisplay = 16; // Max glasses for visual display
    const glassSize = 250; // ml per glass
    const currentMl = waterIntake * glassSize;
    const goalMl = dailyGoal * glassSize;
    const progressPercentage = Math.min((waterIntake / dailyGoal) * 100, 100);
    const extraGlasses = Math.max(0, waterIntake - dailyGoal);

    const handleAddWater = async () => {
        const newIntake = waterIntake + 1;
        setWaterIntake(newIntake);
        await saveWaterIntake(newIntake, true);
        if (newIntake === dailyGoal) {
            setMessage('🎉 Great! You reached your daily water goal!');
            setTimeout(() => setMessage(''), 3000);
        } else if (newIntake > dailyGoal) {
            setMessage('💪 Amazing! You\'re going beyond your goal!');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleRemoveWater = async () => {
        if (waterIntake > 0) {
            const newIntake = waterIntake - 1;
            setWaterIntake(newIntake);
            await saveWaterIntake(newIntake, false);
        }
    };

    const saveWaterIntake = async (intake: number, isAdding: boolean) => {
        try {
            // Use ref to get latest user data
            const currentUser = userRef.current;
            
            // Track time of day for morning/evening achievements
            const hour = new Date().getHours();
            const isMorning = hour >= 5 && hour < 12;
            const isEvening = hour >= 18 && hour < 24;
            
            const updateData: any = { 
                id: currentUser.id,
                waterIntake: intake 
            };
            
            // Increment totalWaterLogs only when adding water
            if (isAdding) {
                updateData.totalWaterLogs = (currentUser.totalWaterLogs || 0) + 1;
                
                // Track morning/evening logs
                if (isMorning) {
                    updateData.morningLogs = (currentUser.morningLogs || 0) + 1;
                }
                if (isEvening) {
                    updateData.eveningLogs = (currentUser.eveningLogs || 0) + 1;
                }
            }
            
            const res = await axios.put('/api/user/update', updateData);
            const updatedUser = { ...currentUser, ...res.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            userRef.current = updatedUser;
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
                            {/* Progress circle - shows progress up to goal */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={waterIntake >= dailyGoal ? '#10b981' : '#3b82f6'}
                                strokeWidth="8"
                                strokeDasharray={`${progressPercentage * 2.83} 283`}
                                strokeLinecap="round"
                                className="transition-all duration-300"
                            />
                            {/* Extra progress circle - shows beyond goal */}
                            {waterIntake > dailyGoal && (
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="38"
                                    fill="none"
                                    stroke="#06b6d4"
                                    strokeWidth="4"
                                    strokeDasharray={`${Math.min((extraGlasses / dailyGoal) * 100, 100) * 2.39} 239`}
                                    strokeLinecap="round"
                                    className="transition-all duration-300"
                                />
                            )}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-4xl font-bold text-blue-600">{waterIntake}</p>
                            <p className="text-gray-600 text-sm">glasses</p>
                            {waterIntake >= dailyGoal && (
                                <div className="flex items-center gap-1 mt-1">
                                    <Trophy size={14} className="text-yellow-500" />
                                    <span className="text-xs text-green-600 font-medium">Goal reached!</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Goal indicator */}
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                            <Target size={16} className="text-blue-500" />
                            <span className="text-gray-600">Goal: <strong>{dailyGoal}</strong> glasses</span>
                        </div>
                        {waterIntake > dailyGoal && (
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                +{extraGlasses} extra 🎯
                            </div>
                        )}
                    </div>

                    {/* Volume Display */}
                    <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                        <p className="text-gray-600 text-sm mb-1">Current Intake</p>
                        <p className="text-2xl font-bold text-blue-600">{currentMl} ml</p>
                        <p className="text-gray-500 text-xs">
                            {waterIntake >= dailyGoal 
                                ? `${currentMl - goalMl} ml beyond goal!` 
                                : `${goalMl - currentMl} ml to reach goal`}
                        </p>
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
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Add Glass
                        </button>
                    </div>

                    {/* Quick Add Buttons */}
                    <div className="flex gap-2 mb-6">
                        {[2, 3, 4].map((count) => (
                            <button
                                key={count}
                                onClick={async () => {
                                    const newIntake = waterIntake + count;
                                    setWaterIntake(newIntake);
                                    await saveWaterIntake(newIntake, true);
                                    if (newIntake >= dailyGoal && waterIntake < dailyGoal) {
                                        setMessage('🎉 You reached your daily water goal!');
                                        setTimeout(() => setMessage(''), 3000);
                                    }
                                }}
                                className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-200 transition text-sm"
                            >
                                +{count} 🥤
                            </button>
                        ))}
                    </div>

                    {/* Message */}
                    {message && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-4 font-semibold animate-bounce">
                            {message}
                        </div>
                    )}

                    {/* Progress Milestones */}
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 mb-4">
                        <p className="font-bold text-blue-700 mb-3">🏆 Hydration Milestones</p>
                        <div className="flex justify-between">
                            {[4, 8, 12, 16].map((milestone) => (
                                <div 
                                    key={milestone}
                                    className={`flex flex-col items-center ${waterIntake >= milestone ? 'opacity-100' : 'opacity-40'}`}
                                >
                                    <div 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                            waterIntake >= milestone 
                                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {milestone}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600">
                                        {milestone === 8 ? '🎯' : milestone === 16 ? '🏆' : '💧'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

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
