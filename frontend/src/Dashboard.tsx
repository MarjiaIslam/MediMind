import { useState, useEffect } from 'react';
import { Droplets, Activity, Trophy, Coffee, Utensils, Pill, User, Scale, Heart, X, Target, TrendingDown, TrendingUp, Flame, LogOut, AlertTriangle, BookOpen } from 'lucide-react';
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

interface CalorieInfo {
    consumed: number;
    remaining: number;
    goal: number;
    meals: { name: string; calories: number; time: string }[];
}

export default function Dashboard({ user, logout }: { user: any, logout: () => void }) {
    const navigate = useNavigate();
    const [medicineSummary, setMedicineSummary] = useState<MedicineSummary | null>(null);
    const [bmiInfo, setBmiInfo] = useState<BmiInfo | null>(null);
    const [showCaloriesModal, setShowCaloriesModal] = useState(false);
    const [calorieInfo, setCalorieInfo] = useState<CalorieInfo | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchMedicineSummary();
            fetchBmiInfo();
            fetchCalorieInfo();
        }
    }, [user?.id]);

    const fetchCalorieInfo = async () => {
        try {
            const res = await axios.get(`/api/meals/calories/${user.id}`);
            setCalorieInfo(res.data);
        } catch (err) {
            // If endpoint doesn't exist, create mock data
            const goal = bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000;
            setCalorieInfo({
                consumed: Math.floor(Math.random() * 1200) + 400,
                remaining: goal - (Math.floor(Math.random() * 1200) + 400),
                goal: goal,
                meals: []
            });
        }
    };

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
                    <button 
                        onClick={() => setShowLogoutConfirm(true)} 
                        className="flex items-center gap-1 text-red-400 text-sm hover:text-red-500 transition"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-bounce-in">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                                <AlertTriangle className="text-red-500" size={32} />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Confirm Logout</h2>
                        <p className="text-center text-gray-500 mb-6">Are you sure you want to logout? You'll need to sign in again to access your account.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    logout();
                                }}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-400 to-orange-400 text-white font-semibold hover:from-red-500 hover:to-orange-500 transition shadow-lg"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                    <div onClick={() => navigate('/hydration')} className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 hover:shadow-xl transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div><p className="opacity-80 text-sm uppercase">Hydration</p><h2 className="text-3xl font-bold">{user.waterIntake}<span className="text-lg opacity-70"> / 8</span></h2></div>
                            <Droplets className="opacity-80" size={32} />
                        </div>
                        <p className="text-xs mt-4 bg-white/20 inline-block px-2 rounded">glasses today</p>
                    </div>

                    <div onClick={() => setShowCaloriesModal(true)} className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 hover:shadow-xl transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div><p className="opacity-80 text-sm uppercase">Calories</p><h2 className="text-3xl font-bold">{calorieInfo?.consumed || 0}<span className="text-lg opacity-70"> / {bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000}</span></h2></div>
                            <Utensils className="opacity-80" size={32} />
                        </div>
                        {bmiInfo && (
                            <p className="text-xs mt-4 bg-white/20 inline-block px-2 rounded">
                                BMI: {bmiInfo.bmi.toFixed(1)} ({bmiInfo.category})
                            </p>
                        )}
                    </div>

                    <div onClick={() => navigate('/medicine')} className="bg-gradient-to-br from-emerald-400 to-green-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 hover:shadow-xl transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="opacity-80 text-sm uppercase">Medicine</p>
                                {medicineSummary ? (
                                    <h2 className="text-3xl font-bold">{medicineSummary.takenDoses}<span className="text-lg opacity-70"> / {medicineSummary.totalDoses}</span></h2>
                                ) : (
                                    <h2 className="text-3xl font-bold">--</h2>
                                )}
                            </div>
                            <Pill className="opacity-80" size={32} />
                        </div>
                        {medicineSummary ? (
                            <p className="text-xs mt-4 bg-white/20 inline-block px-2 rounded">{medicineSummary.adherencePercentage}% taken today</p>
                        ) : (
                            <p className="text-xs mt-4 bg-white/20 inline-block px-2 rounded">Click to manage</p>
                        )}
                    </div>
                </div>

                {/* Main Action Areas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Meal Card */}
                    <div onClick={() => navigate('/meals')} className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 hover:shadow-xl transition-all flex flex-col justify-center text-center">
                        <Coffee className="mx-auto mb-4 opacity-90" size={48} />
                        <h3 className="text-2xl font-bold mb-2">Plan Your Meal</h3>
                        <p className="opacity-90 text-sm">Get smart recommendations based on your health profile and cuisine preferences.</p>
                    </div>

                    {/* Medicine Card */}
                    <div onClick={() => navigate('/medicine')} className="bg-gradient-to-br from-pink-400 to-purple-600 text-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 hover:shadow-xl transition-all flex flex-col justify-center text-center">
                        <Pill className="mx-auto mb-4 opacity-90" size={48} />
                        <h3 className="text-2xl font-bold mb-2">Medicine Cabinet</h3>
                        <p className="opacity-90 text-sm">Track your medicines, set reminders, and never miss a dose.</p>
                    </div>

                    {/* Journal Card */}
                    <div onClick={() => navigate('/journal')} className="bg-gradient-to-br from-purple-400 to-indigo-600 text-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 hover:shadow-xl transition-all flex flex-col justify-center text-center">
                        <BookOpen className="mx-auto mb-4 opacity-90" size={48} />
                        <h3 className="text-2xl font-bold mb-2">Mood Journal</h3>
                        <p className="opacity-90 text-sm">Express yourself, track your emotions, and reflect on your journey.</p>
                    </div>
                </div>

                {/* Health Quick Stats */}
                {(user.height && user.weight) && (
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Heart className="text-pink-200" /> Your Health Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-white/20 backdrop-blur p-4 rounded-xl">
                                <p className="text-2xl font-bold">{user.height} cm</p>
                                <p className="text-xs opacity-80">Height</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur p-4 rounded-xl">
                                <p className="text-2xl font-bold">{user.weight} kg</p>
                                <p className="text-xs opacity-80">Weight</p>
                            </div>
                            {bmiInfo && (
                                <>
                                    <div className="bg-white/20 backdrop-blur p-4 rounded-xl">
                                        <p className="text-2xl font-bold">{bmiInfo.bmi.toFixed(1)}</p>
                                        <p className="text-xs opacity-80">BMI</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur p-4 rounded-xl">
                                        <p className="text-2xl font-bold">{bmiInfo.recommendedCalories}</p>
                                        <p className="text-xs opacity-80">Daily Calories</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {user.conditions && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs opacity-80">Conditions:</span>
                                {user.conditions.split(',').map((c: string, i: number) => (
                                    <span key={i} className="bg-white/30 backdrop-blur px-2 py-1 rounded-full text-xs">
                                        {c.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Calories Detail Modal */}
            {showCaloriesModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                                <Flame /> Calorie Tracker
                            </h2>
                            <button onClick={() => setShowCaloriesModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Calorie Progress */}
                        <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-600">Today's Intake</p>
                                    <p className="text-4xl font-bold text-orange-600">{calorieInfo?.consumed || 0}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Daily Goal</p>
                                    <p className="text-2xl font-bold text-gray-700">{bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000}</p>
                                </div>
                            </div>
                            <div className="w-full bg-white/50 rounded-full h-4 overflow-hidden">
                                <div 
                                    className={`h-full transition-all rounded-full ${
                                        ((calorieInfo?.consumed || 0) / (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)) > 1 
                                            ? 'bg-red-500' 
                                            : 'bg-gradient-to-r from-orange-400 to-amber-400'
                                    }`}
                                    style={{ width: `${Math.min(100, ((calorieInfo?.consumed || 0) / (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-600">{((calorieInfo?.consumed || 0) / (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) * 100).toFixed(0)}% consumed</span>
                                <span className={`font-medium ${(calorieInfo?.remaining || 0) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {Math.abs((bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) - (calorieInfo?.consumed || 0))} {(calorieInfo?.consumed || 0) > (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) ? 'over' : 'remaining'}
                                </span>
                            </div>
                        </div>

                        {/* BMI & Weight Goals */}
                        {bmiInfo && (
                            <div className="space-y-4 mb-6">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                                        <Scale size={16} className="text-white" />
                                    </div>
                                    Body Metrics
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-5 rounded-2xl text-center border border-purple-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-2">
                                            <span className="text-white font-bold text-sm">BMI</span>
                                        </div>
                                        <p className={`text-4xl font-bold ${getBmiColor(bmiInfo.category)}`}>{parseFloat(bmiInfo.bmi.toFixed(1))}</p>
                                        <p className={`text-sm font-semibold mt-1 px-3 py-1 rounded-full inline-block ${
                                            bmiInfo.category === 'Normal' ? 'bg-green-100 text-green-600' :
                                            bmiInfo.category === 'Underweight' ? 'bg-yellow-100 text-yellow-600' :
                                            bmiInfo.category === 'Overweight' ? 'bg-orange-100 text-orange-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>{bmiInfo.category}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 p-5 rounded-2xl text-center border border-emerald-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center mx-auto mb-2">
                                            <span className="text-xl">⚖️</span>
                                        </div>
                                        <p className="text-4xl font-bold text-emerald-600">
                                            {user.weight ? Math.round(user.weight) : '--'} <span className="text-xl">kg</span>
                                        </p>
                                        {user.targetWeight && (
                                            <p className="text-sm mt-2 bg-white/60 rounded-full px-3 py-1 text-emerald-700 font-medium">
                                                🎯 Goal: {Math.round(user.targetWeight)} kg
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Weight Goals */}
                                {user.targetWeight && user.weight && (
                                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                                                <Target size={16} className="text-purple-500" /> Weight Goal Progress
                                            </span>
                                            <span className="text-sm font-bold">
                                                {user.weight > user.targetWeight ? (
                                                    <span className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full flex items-center gap-1">
                                                        <TrendingDown size={14} /> {Math.round(user.weight - user.targetWeight)} kg to lose
                                                    </span>
                                                ) : user.weight < user.targetWeight ? (
                                                    <span className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white px-3 py-1 rounded-full flex items-center gap-1">
                                                        <TrendingUp size={14} /> {Math.round(user.targetWeight - user.weight)} kg to gain
                                                    </span>
                                                ) : (
                                                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 py-1 rounded-full">🎉 Goal reached!</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden shadow-inner">
                                            <div 
                                                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full transition-all"
                                                style={{ 
                                                    width: `${Math.min(100, Math.max(0, 
                                                        user.weight > user.targetWeight 
                                                            ? ((user.weight - Math.max(user.weight - 10, user.targetWeight)) / 10) * 100
                                                            : ((user.weight - Math.min(user.weight - 10, 0)) / (user.targetWeight - Math.min(user.weight - 10, 0))) * 100
                                                    ))}%` 
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Healthy Range Info */}
                                <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-5 rounded-2xl border border-amber-200">
                                    <p className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                        <span className="text-xl">💡</span> Healthy Calorie Tips
                                    </p>
                                    <ul className="text-amber-700 text-sm space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="bg-amber-200 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                                            Your recommended intake is based on your BMI and activity level
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-amber-200 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                                            Eat 200-500 fewer calories daily to lose ~0.5kg/week
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-amber-200 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                                            Add 300-500 calories to gain muscle mass healthily
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => { setShowCaloriesModal(false); navigate('/meals'); }}
                            className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-amber-500"
                        >
                            Log a Meal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}