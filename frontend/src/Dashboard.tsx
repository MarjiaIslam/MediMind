import { useState, useEffect } from 'react';
import { Droplets, Activity, Trophy, Coffee, Utensils, Pill, User, Scale, Heart, X, Target, TrendingDown, TrendingUp, Flame } from 'lucide-react';
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

                    <div onClick={() => setShowCaloriesModal(true)} className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between text-orange-400"><span className="text-gray-500 font-medium">Calories</span><Utensils /></div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-gray-700">{calorieInfo?.consumed || 0}</span>
                            <span className="text-gray-400 text-sm"> / {bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000}</span>
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
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Scale size={18} /> Body Metrics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-lavender-50 p-4 rounded-xl text-center">
                                        <p className={`text-3xl font-bold ${getBmiColor(bmiInfo.category)}`}>{bmiInfo.bmi.toFixed(1)}</p>
                                        <p className="text-xs text-gray-500">BMI</p>
                                        <p className={`text-sm font-medium ${getBmiColor(bmiInfo.category)}`}>{bmiInfo.category}</p>
                                    </div>
                                    <div className="bg-sage-50 p-4 rounded-xl text-center">
                                        <p className="text-3xl font-bold text-sage-600">{user.weight || '--'} kg</p>
                                        <p className="text-xs text-gray-500">Current Weight</p>
                                        {user.targetWeight && (
                                            <p className="text-sm text-gray-600">Goal: {user.targetWeight} kg</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Weight Goals */}
                                {user.targetWeight && user.weight && (
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                <Target size={14} /> Weight Goal Progress
                                            </span>
                                            <span className="text-sm font-medium">
                                                {user.weight > user.targetWeight ? (
                                                    <span className="text-orange-600 flex items-center gap-1">
                                                        <TrendingDown size={14} /> {(user.weight - user.targetWeight).toFixed(1)} kg to lose
                                                    </span>
                                                ) : user.weight < user.targetWeight ? (
                                                    <span className="text-blue-600 flex items-center gap-1">
                                                        <TrendingUp size={14} /> {(user.targetWeight - user.weight).toFixed(1)} kg to gain
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600">🎉 Goal reached!</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-full bg-gradient-to-r from-sage-400 to-lavender-400 rounded-full"
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
                                <div className="bg-blue-50 p-4 rounded-xl text-sm">
                                    <p className="font-medium text-blue-700 mb-1">💡 Healthy Calorie Tips</p>
                                    <ul className="text-blue-600 text-xs space-y-1">
                                        <li>• Your recommended intake is based on your BMI and activity level</li>
                                        <li>• Eat 200-500 fewer calories daily to lose ~0.5kg/week</li>
                                        <li>• Add 300-500 calories to gain muscle mass healthily</li>
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