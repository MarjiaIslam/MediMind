import { useState } from 'react';
import { Award, Star, Zap, Heart, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Badges({ user }: { user: any }) {
    const navigate = useNavigate();
    const points = user.points || 0;
    const level = user.level || 'Bronze';

    const badges = [
        { id: 1, name: 'Bronze', icon: '🥉', color: '#CD7F32', level: 'bronze', minPoints: 0, unlocked: true, description: 'Starting your health journey' },
        { id: 2, name: 'Silver', icon: '🥈', color: '#C0C0C0', level: 'silver', minPoints: 100, unlocked: points >= 100, description: 'Consistent in tracking health' },
        { id: 3, name: 'Gold', icon: '🥇', color: '#FFD700', level: 'gold', minPoints: 250, unlocked: points >= 250, description: 'Expert health manager' },
        { id: 4, name: 'Platinum', icon: '💎', color: '#E5E4E2', level: 'platinum', minPoints: 500, unlocked: points >= 500, description: 'Master of wellness' },
        { id: 5, name: 'Diamond', icon: '✨', color: '#B9F2FF', level: 'diamond', minPoints: 1000, unlocked: points >= 1000, description: 'Ultimate health champion' },
    ];

    const achievements = [
        { id: 1, name: 'Hydration Master', icon: '💧', description: 'Log water 10 times', color: 'from-blue-400 to-cyan-400' },
        { id: 2, name: 'Meal Tracker', icon: '🍽️', description: 'Log 20 meals', color: 'from-orange-400 to-red-400' },
        { id: 3, name: 'Health Profile', icon: '👤', description: 'Complete health profile', color: 'from-green-400 to-emerald-400' },
        { id: 4, name: 'Consistency Win', icon: '🏆', description: '7-day streak', color: 'from-yellow-400 to-amber-400' },
        { id: 5, name: 'Wellness Expert', icon: '🎓', description: '50 points earned', color: 'from-purple-400 to-pink-400' },
        { id: 6, name: 'Perfect Day', icon: '🌟', description: 'All health goals met', color: 'from-indigo-400 to-blue-400' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
            <button 
                onClick={() => navigate('/dashboard')} 
                className="mb-4 text-amber-600 font-bold hover:text-amber-800"
            >
                ← Back to Dashboard
            </button>

            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-amber-700 mb-2">🏆 Your Badges & Achievements</h1>
                <p className="text-gray-600 mb-8">Earn badges as you progress on your health journey</p>

                {/* Level Progress */}
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="text-6xl">{badges.find(b => b.level === level.toLowerCase())?.icon}</div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-800">{level} Level</h2>
                            <p className="text-gray-600 mb-3">{badges.find(b => b.level === level.toLowerCase())?.description}</p>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div 
                                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-4 rounded-full transition-all duration-300"
                                    style={{width: `${(points % 250) / 2.5}%`}}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{points} / {Math.ceil(points / 250) * 250} points to next level</p>
                        </div>
                    </div>
                </div>

                {/* Level Progression */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-amber-700 mb-4">📈 Level Progression</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {badges.map(badge => (
                            <div 
                                key={badge.id}
                                className={`rounded-2xl p-6 text-center transition transform ${
                                    badge.unlocked 
                                        ? 'bg-white shadow-lg scale-100' 
                                        : 'bg-gray-100 opacity-50 scale-95'
                                }`}
                            >
                                <div className="text-5xl mb-3">{badge.icon}</div>
                                <h4 className="font-bold text-gray-800 mb-1">{badge.name}</h4>
                                <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                                <p className={`text-sm font-bold ${badge.unlocked ? 'text-green-600' : 'text-gray-500'}`}>
                                    {badge.unlocked ? '✓ Unlocked' : `${badge.minPoints} points`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements */}
                <div>
                    <h3 className="text-2xl font-bold text-amber-700 mb-4">🎯 Achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map(achievement => (
                            <div 
                                key={achievement.id}
                                className={`bg-gradient-to-br ${achievement.color} rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition cursor-pointer`}
                            >
                                <div className="text-4xl mb-3">{achievement.icon}</div>
                                <h4 className="font-bold text-lg mb-1">{achievement.name}</h4>
                                <p className="text-sm opacity-90">{achievement.description}</p>
                                <div className="mt-4 bg-white/20 rounded-full h-2 w-full">
                                    <div className="bg-white/50 h-2 rounded-full" style={{width: '45%'}}></div>
                                </div>
                                <p className="text-xs mt-2 opacity-75">45% Progress</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <Star className="text-yellow-500 mx-auto mb-3" size={32} />
                        <p className="text-gray-600 text-sm">Total Points</p>
                        <p className="text-3xl font-bold text-gray-800">{points}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <Award className="text-purple-500 mx-auto mb-3" size={32} />
                        <p className="text-gray-600 text-sm">Current Level</p>
                        <p className="text-3xl font-bold text-gray-800">{level}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <Flame className="text-red-500 mx-auto mb-3" size={32} />
                        <p className="text-gray-600 text-sm">Days Streak</p>
                        <p className="text-3xl font-bold text-gray-800">5</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
