import { Droplets, Activity, Trophy, Coffee, Utensils } from 'lucide-react';

export default function Dashboard({ user, logout }: { user: any, logout: () => void }) {
    if (!user) return <div className="p-10 text-sage-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-sage-50 font-sans">
            <nav className="bg-white shadow-sm p-4 px-8 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sage-500 font-bold text-xl">
                    <Activity /> MediMind
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-gray-400">Hello,</p>
                        <p className="font-semibold text-gray-700">{user.fullName}</p>
                    </div>
                    <button onClick={logout} className="bg-lavender-100 text-lavender-600 px-4 py-2 rounded-lg hover:bg-lavender-200 transition">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-lavender-200 to-lavender-400 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-start">
                            <div><p className="opacity-80 text-sm uppercase">Status</p><h2 className="text-3xl font-bold">{user.level}</h2></div>
                            <Trophy className="opacity-80" size={32} />
                        </div>
                        <p className="text-xs mt-4 opacity-90">{user.points} points earned</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 flex flex-col justify-between">
                        <div className="flex justify-between text-blue-400"><span className="text-gray-500 font-medium">Hydration</span><Droplets /></div>
                        <div className="mt-2"><span className="text-3xl font-bold text-gray-700">{user.waterIntake}</span><span className="text-gray-400"> / 8</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 flex flex-col justify-between">
                        <div className="flex justify-between text-orange-400"><span className="text-gray-500 font-medium">Calories</span><Utensils /></div>
                        <div className="mt-2"><span className="text-3xl font-bold text-gray-700">1,240</span><span className="text-gray-400"> / {user.dailyCalorieGoal}</span></div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-sage-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-sage-500">My Medicine</h3>
                            <span className="text-xs bg-sage-100 text-sage-500 px-3 py-1 rounded-full">Today</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-sage-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-full text-sage-500 shadow-sm">💊</div>
                                    <div><h4 className="font-bold text-gray-700">Vitamin B Complex</h4><p className="text-xs text-gray-400">10:00 AM • After Breakfast</p></div>
                                </div>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Taken</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-sage-300 to-sage-500 text-white rounded-2xl shadow-lg p-6 flex flex-col justify-center text-center">
                        <Coffee className="mx-auto mb-4 opacity-80" size={40} />
                        <h3 className="text-2xl font-bold mb-2">Meal Idea</h3>
                        <p className="opacity-90 mb-4 text-sm">Suggested: <strong>Bangladeshi</strong></p>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-4 text-left">
                            <p className="font-bold text-lg">Shorshe Ilish</p>
                            <p className="text-xs opacity-75">Mustard Hilsa Fish • 450 kcal</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
