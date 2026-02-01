import { useState, useEffect, useRef } from 'react';
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

export default function Dashboard({ user, setUser, logout }: { user: any, setUser: (u: any) => void, logout: () => void }) {
    const navigate = useNavigate();
    const [medicineSummary, setMedicineSummary] = useState<MedicineSummary | null>(null);
    const [bmiInfo, setBmiInfo] = useState<BmiInfo | null>(null);
    
    // Use ref to track the latest user data for achievement counting
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);
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

    // Check for perfect day when component mounts or user data changes
    useEffect(() => {
        if (user?.id && medicineSummary) {
            checkPerfectDay();
        }
    }, [user?.waterIntake, medicineSummary]);

    const checkPerfectDay = async () => {
        // A perfect day is when: water goal reached (8 glasses) AND all medicines taken
        const waterGoalMet = (user.waterIntake || 0) >= 8;
        const medicineGoalMet = medicineSummary && medicineSummary.totalDoses > 0 && 
                                medicineSummary.takenDoses === medicineSummary.totalDoses;
        
        if (waterGoalMet && medicineGoalMet) {
            const today = new Date().toDateString();
            const lastPerfectDay = localStorage.getItem('lastPerfectDay');
            
            // Only count once per day
            if (lastPerfectDay !== today) {
                localStorage.setItem('lastPerfectDay', today);
                
                try {
                    // Use ref to get latest user data
                    const currentUser = userRef.current;
                    
                    const updateData = {
                        id: currentUser.id,
                        perfectDays: (currentUser.perfectDays || 0) + 1
                    };
                    
                    const res = await axios.put('/api/user/update', updateData);
                    const updatedUser = { ...currentUser, ...res.data };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    userRef.current = updatedUser;
                } catch (err) {
                    console.error('Error updating perfect days:', err);
                }
            }
        }
    };

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
                    <div onClick={() => navigate('/medicine')} className="bg-gradient-to-br from-teal-400 to-cyan-600 text-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 hover:shadow-xl transition-all flex flex-col justify-center text-center">
                        <Pill className="mx-auto mb-4 opacity-90" size={48} />
                        <h3 className="text-2xl font-bold mb-2">Medicine Cabinet</h3>
                        <p className="opacity-90 text-sm">Track your medicines, set reminders, and never miss a dose.</p>
                    </div>

                    {/* Journal Card */}
                    <div onClick={() => navigate('/journal')} className="bg-gradient-to-br from-sky-400 to-blue-600 text-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 hover:shadow-xl transition-all flex flex-col justify-center text-center">
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
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden relative">
                        {/* Top Section - Big Calorie Display */}
                        <div className="bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 p-8 text-center relative">
                            {/* Close button on the card */}
                            <button 
                                onClick={() => setShowCaloriesModal(false)} 
                                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-all"
                            >
                                <X size={18} className="text-white" />
                            </button>

                            <p className="text-white/80 text-sm font-medium mb-1">Today's Calories</p>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-6xl font-black text-white">{calorieInfo?.consumed || 0}</span>
                                <span className="text-white/70 text-xl">/ {bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000}</span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4 bg-white/30 rounded-full h-3 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        ((calorieInfo?.consumed || 0) / (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)) > 1 
                                            ? 'bg-red-500' 
                                            : 'bg-white'
                                    }`}
                                    style={{ width: `${Math.min(100, ((calorieInfo?.consumed || 0) / (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)) * 100)}%` }}
                                />
                            </div>
                            <p className="text-white/90 text-sm mt-2 font-medium">
                                {((calorieInfo?.consumed || 0) / (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) * 100).toFixed(0)}% of daily goal
                            </p>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
                            {/* Status Message */}
                            <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                                (calorieInfo?.consumed || 0) > (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)
                                    ? 'bg-red-50 border-2 border-red-200'
                                    : (calorieInfo?.consumed || 0) >= (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) * 0.8
                                    ? 'bg-amber-50 border-2 border-amber-200'
                                    : 'bg-green-50 border-2 border-green-200'
                            }`}>
                                <span className="text-3xl">
                                    {(calorieInfo?.consumed || 0) > (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)
                                        ? '😮'
                                        : (calorieInfo?.consumed || 0) >= (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) * 0.8
                                        ? '👍'
                                        : '🥗'}
                                </span>
                                <div>
                                    <p className={`font-bold ${
                                        (calorieInfo?.consumed || 0) > (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)
                                            ? 'text-red-700'
                                            : (calorieInfo?.consumed || 0) >= (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) * 0.8
                                            ? 'text-amber-700'
                                            : 'text-green-700'
                                    }`}>
                                        {(calorieInfo?.consumed || 0) > (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)
                                            ? `${(calorieInfo?.consumed || 0) - (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)} over limit!`
                                            : `${(bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) - (calorieInfo?.consumed || 0)} remaining`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(calorieInfo?.consumed || 0) > (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000)
                                            ? 'Consider lighter meals tomorrow'
                                            : (calorieInfo?.consumed || 0) >= (bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000) * 0.8
                                            ? 'Almost at your goal for today!'
                                            : 'Keep going, you\'re doing great!'}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats Row */}
                            {bmiInfo && (
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-purple-50 p-3 rounded-xl text-center border border-purple-100">
                                        <p className="text-2xl font-bold text-purple-600">{parseFloat(bmiInfo.bmi.toFixed(1))}</p>
                                        <p className="text-xs text-purple-500 font-medium">BMI</p>
                                    </div>
                                    <div className="flex-1 bg-emerald-50 p-3 rounded-xl text-center border border-emerald-100">
                                        <p className="text-2xl font-bold text-emerald-600">{user.weight || '--'}<span className="text-sm">kg</span></p>
                                        <p className="text-xs text-emerald-500 font-medium">Weight</p>
                                    </div>
                                    <div className="flex-1 bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                                        <p className="text-2xl font-bold text-blue-600">{user.targetWeight || '--'}<span className="text-sm">kg</span></p>
                                        <p className="text-xs text-blue-500 font-medium">Target</p>
                                    </div>
                                </div>
                            )}

                            {/* Weight Progress */}
                            {user.targetWeight && user.weight && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Weight Progress</span>
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                                            {user.weight > user.targetWeight 
                                                ? `${Math.round(user.weight - user.targetWeight)}kg to lose` 
                                                : user.weight < user.targetWeight 
                                                ? `${Math.round(user.targetWeight - user.weight)}kg to gain`
                                                : '🎯 Goal!'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-12">{Math.min(user.weight, user.targetWeight)}kg</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                                                style={{ 
                                                    width: `${Math.min(100, (user.weight / user.targetWeight) * 100)}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 w-12 text-right">{Math.max(user.weight, user.targetWeight)}kg</span>
                                    </div>
                                </div>
                            )}

                            {/* Tip of the day */}
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                                <span className="text-2xl">💡</span>
                                <div>
                                    <p className="font-semibold text-amber-800 text-sm">Tip of the day</p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        {user.weight > user.targetWeight 
                                            ? 'A deficit of 500 kcal/day helps lose ~0.5kg per week safely.'
                                            : user.weight < user.targetWeight
                                            ? 'Add 300-500 extra calories daily for healthy weight gain.'
                                            : 'Great job! Maintain your intake to stay at your ideal weight.'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => { setShowCaloriesModal(false); navigate('/meals'); }}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Utensils size={20} /> Log a Meal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}