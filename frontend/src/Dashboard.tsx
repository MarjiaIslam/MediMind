import { Droplets, Activity, Trophy, Coffee, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user, logout }: { user: any, logout: () => void }) {
    const navigate = useNavigate();
    if (!user) return <div className="p-10 text-sage-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-sage-50 font-sans">
            <nav className="bg-white shadow-sm p-4 px-8 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sage-500 font-bold text-xl cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <Activity /> MediMind
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/profile')} className="font-semibold text-gray-700 hover:text-sage-500">Hi, {user.fullName}</button>
                    <button onClick={logout} className="text-red-400 text-sm hover:underline">Logout</button>
                </div>
            </nav>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 cursor-pointer">
                    <div onClick={() => navigate('/badges')} className="bg-gradient-to-br from-lavender-200 to-lavender-400 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition">
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

                    <div onClick={() => navigate('/meals')} className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 hover:shadow-md transition">
                        <div className="flex justify-between text-orange-400"><span className="text-gray-500 font-medium">Calories</span><Utensils /></div>
                        <div className="mt-2"><span className="text-3xl font-bold text-gray-700">1,200</span><span className="text-gray-400"> / {user.dailyCalorieGoal}</span></div>
                    </div>
                </div>

                {/* Main Action Areas */}
                <div className="grid grid-cols-1 gap-8">
                    
                    {/* Meal Card */}
                    <div onClick={() => navigate('/meals')} className="bg-gradient-to-br from-sage-300 to-sage-500 text-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition flex flex-col justify-center text-center">
                        <Coffee className="mx-auto mb-4 opacity-80" size={40} />
                        <h3 className="text-2xl font-bold mb-2">Plan Your Meal</h3>
                        <p className="opacity-90 text-sm">Get smart recommendations based on your health profile and cuisine preferences.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}