import { useState, useEffect } from 'react';
import { Droplets, Activity, Trophy, Coffee, Utensils, Pill, User, Scale, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface MedicineSummary {
    totalMedicines: number;
    totalDoses: number;
    takenDoses: number;
    remainingDoses: number;
    adherencePercentage: number;
}

interface BmiInfo {
    bmi: number;
    category: string;
    recommendedCalories: number;
}

export default function Dashboard({ user, logout }: { user: any, logout: () => void }) {
    const navigate = useNavigate();
    const [medicineSummary, setMedicineSummary] = useState<MedicineSummary | null>(null);
    const [bmiInfo, setBmiInfo] = useState<BmiInfo | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchMedicineSummary();
            fetchBmiInfo();
        }
    }, [user?.id]);

    const fetchMedicineSummary = async () => {
        try {
            const res = await axios.get(`/api/medicine/summary/${user.id}`);
            setMedicineSummary(res.data);
        } catch (err) {
            console.error('Error fetching medicine summary:', err);
        }
    };

    const fetchBmiInfo = async () => {
        try {
            const res = await axios.get(`/api/user/bmi/${user.id}`);
            setBmiInfo(res.data);
        } catch (err) {
            console.error('Error fetching BMI info:', err);
        }
    };

    if (!user) return <div className="p-10 text-sage-500">Loading...</div>;

    const getBmiColor = (category: string) => {
        switch (category) {
            case 'Underweight': return 'text-blue-500';
            case 'Normal': return 'text-green-500';
            case 'Overweight': return 'text-yellow-500';
            case 'Obese': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-sage-50 font-sans">
            <nav className="bg-white shadow-sm p-4 px-8 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sage-500 font-bold text-xl cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <Activity /> MediMind
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/profile')} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-sage-500">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lavender-300 to-sage-300 flex items-center justify-center overflow-hidden">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : user.profileIcon ? (
                                <span className="text-lg">{user.profileIcon}</span>
                            ) : (
                                <User size={16} className="text-white" />
                            )}
                        </div>
                        {user.fullName || user.username}
                    </button>
                    <button onClick={logout} className="text-red-400 text-sm hover:underline">Logout</button>
                </div>
            </nav>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div onClick={() => navigate('/badges')} className="bg-gradient-to-br from-lavender-200 to-lavender-400 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div><p className="opacity-80 text-sm uppercase">Level</p><h2 className="text-3xl font-bold">{user.level}</h2></div>
                            <Trophy className="opacity-80" size={32} />
                        </div>
                        <p className="text-xs mt-4 bg-white/20 inline-block px-2 rounded">{user.points} Points</p>
                    </div>

                    <div onClick={() => navigate('/hydration')} className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between text-blue-400"><span className="text-gray-500 font-medium">Hydration</span><Droplets /></div>
                        <div className="mt-2"><span className="text-3xl font-bold text-gray-700">{user.waterIntake}</span><span className="text-gray-400"> / 8</span></div>
                        <p className="text-xs text-gray-500 mt-2">Click to log water</p>
                    </div>

                    <div onClick={() => navigate('/profile')} className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between text-orange-400"><span className="text-gray-500 font-medium">Calories</span><Utensils /></div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-gray-700">{bmiInfo?.recommendedCalories || user.dailyCalorieGoal || '~'}</span>
                            <span className="text-gray-400 text-sm"> /day</span>
                        </div>
                        {bmiInfo && (
                            <p className={`text-xs mt-2 font-medium ${getBmiColor(bmiInfo.category)}`}>
                                BMI: {bmiInfo.bmi.toFixed(1)} ({bmiInfo.category})
                            </p>
                        )}
                    </div>

                    <div onClick={() => navigate('/medicine')} className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between text-sage-400"><span className="text-gray-500 font-medium">Medicine</span><Pill /></div>
                        {medicineSummary ? (
                            <>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold text-gray-700">{medicineSummary.takenDoses}</span>
                                    <span className="text-gray-400"> / {medicineSummary.totalDoses}</span>
                                </div>
                                <div className="mt-2">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-sage-400"
                                            style={{ width: `${medicineSummary.adherencePercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{medicineSummary.adherencePercentage}% taken today</p>
                                </div>
                            </>
                        ) : (
                            <div className="mt-2">
                                <span className="text-3xl font-bold text-gray-700">--</span>
                                <p className="text-xs text-gray-500 mt-2">Click to manage</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Action Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Meal Card */}
                    <div onClick={() => navigate('/meals')} className="bg-gradient-to-br from-sage-300 to-sage-500 text-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition flex flex-col justify-center text-center">
                        <Coffee className="mx-auto mb-4 opacity-80" size={40} />
                        <h3 className="text-2xl font-bold mb-2">Plan Your Meal</h3>
                        <p className="opacity-90 text-sm">Get smart recommendations based on your health profile and cuisine preferences.</p>
                    </div>

                    {/* Medicine Card */}
                    <div onClick={() => navigate('/medicine')} className="bg-gradient-to-br from-lavender-300 to-lavender-500 text-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition flex flex-col justify-center text-center">
                        <Pill className="mx-auto mb-4 opacity-80" size={40} />
                        <h3 className="text-2xl font-bold mb-2">Medicine Cabinet</h3>
                        <p className="opacity-90 text-sm">Track your medicines, set reminders, and never miss a dose.</p>
                    </div>
                </div>

                {/* Health Quick Stats */}
                {(user.height && user.weight) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6">
                        <h3 className="font-bold text-lg text-gray-700 mb-4 flex items-center gap-2">
                            <Heart className="text-red-400" /> Your Health Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-sage-50 p-4 rounded-xl">
                                <p className="text-2xl font-bold text-sage-600">{user.height} cm</p>
                                <p className="text-xs text-gray-500">Height</p>
                            </div>
                            <div className="bg-sage-50 p-4 rounded-xl">
                                <p className="text-2xl font-bold text-sage-600">{user.weight} kg</p>
                                <p className="text-xs text-gray-500">Weight</p>
                            </div>
                            {bmiInfo && (
                                <>
                                    <div className="bg-sage-50 p-4 rounded-xl">
                                        <p className={`text-2xl font-bold ${getBmiColor(bmiInfo.category)}`}>{bmiInfo.bmi.toFixed(1)}</p>
                                        <p className="text-xs text-gray-500">BMI</p>
                                    </div>
                                    <div className="bg-sage-50 p-4 rounded-xl">
                                        <p className="text-2xl font-bold text-orange-500">{bmiInfo.recommendedCalories}</p>
                                        <p className="text-xs text-gray-500">Daily Calories</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {user.conditions && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs text-gray-500">Conditions:</span>
                                {user.conditions.split(',').map((c: string, i: number) => (
                                    <span key={i} className="bg-lavender-100 text-lavender-600 px-2 py-1 rounded-full text-xs">
                                        {c.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}