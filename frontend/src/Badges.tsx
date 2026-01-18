import { useState, useEffect } from 'react';
import { Award, Star, Zap, Heart, Flame, Target, Gift, CheckCircle, Lock, TrendingUp, Calendar, Droplets, Pill, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Achievement {
    id: number;
    name: string;
    icon: string;
    description: string;
    color: string;
    requirement: number;
    current: number;
    points: number;
    category: string;
}

interface DailyStreak {
    currentStreak: number;
    lastClaimDate: string | null;
    canClaimToday: boolean;
    streakBonus: number;
}

export default function Badges({ user, setUser }: { user: any, setUser: any }) {
    const navigate = useNavigate();
    const [points, setPoints] = useState(user.points || 0);
    const [level, setLevel] = useState(user.level || 'Bronze');
    const [showClaimAnimation, setShowClaimAnimation] = useState(false);
    const [dailyStreak, setDailyStreak] = useState<DailyStreak>({
        currentStreak: user.streak || 0,
        lastClaimDate: user.lastClaimDate || null,
        canClaimToday: true,
        streakBonus: 0
    });
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    const badges = [
        { id: 1, name: 'Bronze', icon: '🥉', color: 'from-amber-600 to-amber-800', level: 'bronze', minPoints: 0, unlocked: true, description: 'Starting your health journey' },
        { id: 2, name: 'Silver', icon: '🥈', color: 'from-gray-300 to-gray-500', level: 'silver', minPoints: 500, unlocked: points >= 500, description: 'Consistent health tracker' },
        { id: 3, name: 'Gold', icon: '🥇', color: 'from-yellow-400 to-amber-500', level: 'gold', minPoints: 1500, unlocked: points >= 1500, description: 'Expert health manager' },
        { id: 4, name: 'Platinum', icon: '💎', color: 'from-cyan-300 to-blue-400', level: 'platinum', minPoints: 3500, unlocked: points >= 3500, description: 'Master of wellness' },
        { id: 5, name: 'Diamond', icon: '✨', color: 'from-purple-400 to-pink-400', level: 'diamond', minPoints: 7500, unlocked: points >= 7500, description: 'Ultimate health champion' },
    ];

    // More challenging achievements with tracking
    const achievements: Achievement[] = [
        { id: 1, name: 'Hydration Hero', icon: '💧', description: 'Log water 50 times', color: 'from-blue-400 to-cyan-400', requirement: 50, current: Math.min(user.totalWaterLogs || 12, 50), points: 100, category: 'water' },
        { id: 2, name: 'Meal Master', icon: '🍽️', description: 'Log 100 meals', color: 'from-orange-400 to-red-400', requirement: 100, current: Math.min(user.totalMealsLogged || 23, 100), points: 150, category: 'meals' },
        { id: 3, name: 'Profile Pro', icon: '👤', description: 'Complete all health profile fields', color: 'from-green-400 to-emerald-400', requirement: 10, current: calculateProfileCompletion(user), points: 75, category: 'profile' },
        { id: 4, name: 'Streak Legend', icon: '🔥', description: 'Maintain 30-day streak', color: 'from-red-400 to-orange-400', requirement: 30, current: Math.min(dailyStreak.currentStreak, 30), points: 300, category: 'streak' },
        { id: 5, name: 'Week Warrior', icon: '⚡', description: 'Complete 7-day streak', color: 'from-yellow-400 to-amber-400', requirement: 7, current: Math.min(dailyStreak.currentStreak, 7), points: 50, category: 'streak' },
        { id: 6, name: 'Medicine Champion', icon: '💊', description: 'Take all medicines on time for 14 days', color: 'from-sage-400 to-green-400', requirement: 14, current: Math.min(user.perfectMedicineDays || 5, 14), points: 200, category: 'medicine' },
        { id: 7, name: 'Wellness Expert', icon: '🎓', description: 'Earn 500 points', color: 'from-purple-400 to-pink-400', requirement: 500, current: Math.min(points, 500), points: 100, category: 'points' },
        { id: 8, name: 'Perfect Day Master', icon: '🌟', description: 'Complete all health goals 10 times', color: 'from-indigo-400 to-blue-400', requirement: 10, current: Math.min(user.perfectDays || 2, 10), points: 250, category: 'goals' },
        { id: 9, name: 'Early Bird', icon: '🌅', description: 'Log morning activities 20 times', color: 'from-pink-400 to-rose-400', requirement: 20, current: Math.min(user.morningLogs || 8, 20), points: 75, category: 'activity' },
        { id: 10, name: 'Night Owl', icon: '🦉', description: 'Complete evening routines 20 times', color: 'from-indigo-500 to-purple-500', requirement: 20, current: Math.min(user.eveningLogs || 6, 20), points: 75, category: 'activity' },
        { id: 11, name: 'Health Scholar', icon: '📚', description: 'Write 25 journal entries', color: 'from-teal-400 to-cyan-400', requirement: 25, current: Math.min(user.journalEntries || 4, 25), points: 125, category: 'journal' },
        { id: 12, name: 'Consistency King', icon: '👑', description: 'Maintain 60-day streak', color: 'from-amber-400 to-yellow-500', requirement: 60, current: Math.min(dailyStreak.currentStreak, 60), points: 500, category: 'streak' },
    ];

    function calculateProfileCompletion(user: any): number {
        let completed = 0;
        if (user.fullName) completed++;
        if (user.email) completed++;
        if (user.height > 0) completed++;
        if (user.weight > 0) completed++;
        if (user.age > 0) completed++;
        if (user.gender) completed++;
        if (user.allergies) completed++;
        if (user.conditions) completed++;
        if (user.targetWeight > 0) completed++;
        if (user.profilePicture || user.profileIcon) completed++;
        return completed;
    }

    useEffect(() => {
        checkDailyStreak();
    }, []);

    const checkDailyStreak = () => {
        const today = new Date().toDateString();
        const lastClaim = user.lastClaimDate ? new Date(user.lastClaimDate).toDateString() : null;
        
        const canClaim = lastClaim !== today;
        
        // Check if streak should be reset (more than 1 day since last claim)
        let currentStreak = user.streak || 0;
        if (lastClaim) {
            const lastClaimDate = new Date(user.lastClaimDate);
            const daysSinceLastClaim = Math.floor((Date.now() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLastClaim > 1) {
                currentStreak = 0;
            }
        }

        // Calculate streak bonus
        let bonus = 5; // Base points
        if (currentStreak >= 7) bonus = 15;
        if (currentStreak >= 14) bonus = 25;
        if (currentStreak >= 30) bonus = 50;
        if (currentStreak >= 60) bonus = 100;

        setDailyStreak({
            currentStreak,
            lastClaimDate: lastClaim,
            canClaimToday: canClaim,
            streakBonus: bonus
        });
    };

    const claimDailyStreak = async () => {
        if (!dailyStreak.canClaimToday) return;

        setShowClaimAnimation(true);
        
        const newStreak = dailyStreak.currentStreak + 1;
        let bonus = 5;
        if (newStreak >= 7) bonus = 15;
        if (newStreak >= 14) bonus = 25;
        if (newStreak >= 30) bonus = 50;
        if (newStreak >= 60) bonus = 100;

        const newPoints = points + bonus;
        const newLevel = calculateLevel(newPoints);

        try {
            const res = await axios.put('/api/user/update', {
                ...user,
                id: user.id,
                points: newPoints,
                level: newLevel,
                streak: newStreak,
                lastClaimDate: new Date().toISOString()
            });
            
            setPoints(newPoints);
            setLevel(newLevel);
            setDailyStreak({
                ...dailyStreak,
                currentStreak: newStreak,
                canClaimToday: false,
                lastClaimDate: new Date().toDateString(),
                streakBonus: bonus
            });
            
            // Update parent user state
            setUser({ ...user, points: newPoints, level: newLevel, streak: newStreak, lastClaimDate: new Date().toISOString() });
            localStorage.setItem('user', JSON.stringify({ ...user, points: newPoints, level: newLevel, streak: newStreak, lastClaimDate: new Date().toISOString() }));

            setTimeout(() => setShowClaimAnimation(false), 2000);
        } catch (err) {
            console.error('Error claiming streak:', err);
            setShowClaimAnimation(false);
        }
    };

    const calculateLevel = (pts: number): string => {
        if (pts >= 7500) return 'Diamond';
        if (pts >= 3500) return 'Platinum';
        if (pts >= 1500) return 'Gold';
        if (pts >= 500) return 'Silver';
        return 'Bronze';
    };

    const getNextLevelPoints = (): number => {
        if (points >= 7500) return 10000;
        if (points >= 3500) return 7500;
        if (points >= 1500) return 3500;
        if (points >= 500) return 1500;
        return 500;
    };

    const getProgressPercentage = (current: number, requirement: number): number => {
        return Math.min(100, Math.round((current / requirement) * 100));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
            <button 
                onClick={() => navigate('/dashboard')} 
                className="mb-4 text-amber-600 font-bold hover:text-amber-800 flex items-center gap-2"
            >
                ← Back to Dashboard
            </button>

            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">🏆 Badges & Achievements</h1>
                <p className="text-gray-600 mb-8">Earn badges and claim daily rewards on your health journey</p>

                {/* Daily Streak Claim Section */}
                <div className={`bg-gradient-to-r ${dailyStreak.canClaimToday ? 'from-amber-400 to-orange-500' : 'from-gray-400 to-gray-500'} rounded-3xl shadow-xl p-6 mb-8 relative overflow-hidden`}>
                    {showClaimAnimation && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 animate-pulse">
                            <div className="text-center">
                                <div className="text-6xl mb-2">🎉</div>
                                <p className="text-2xl font-bold text-amber-600">+{dailyStreak.streakBonus} Points!</p>
                                <p className="text-gray-600">Streak: {dailyStreak.currentStreak + 1} days</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <Flame size={32} className={dailyStreak.currentStreak >= 7 ? 'animate-pulse' : ''} />
                                <h2 className="text-2xl font-bold">Daily Streak</h2>
                            </div>
                            <p className="text-white/80 mb-2">Come back daily to claim points and build your streak!</p>
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 px-4 py-2 rounded-xl">
                                    <p className="text-3xl font-bold">{dailyStreak.currentStreak}</p>
                                    <p className="text-xs text-white/80">Day Streak</p>
                                </div>
                                <div className="bg-white/20 px-4 py-2 rounded-xl">
                                    <p className="text-3xl font-bold">+{dailyStreak.streakBonus}</p>
                                    <p className="text-xs text-white/80">Today's Bonus</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={claimDailyStreak}
                            disabled={!dailyStreak.canClaimToday}
                            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform ${
                                dailyStreak.canClaimToday 
                                    ? 'bg-white text-amber-600 hover:scale-105 hover:shadow-lg cursor-pointer animate-bounce' 
                                    : 'bg-white/30 text-white/70 cursor-not-allowed'
                            }`}
                        >
                            {dailyStreak.canClaimToday ? (
                                <span className="flex items-center gap-2"><Gift size={24} /> Claim Now!</span>
                            ) : (
                                <span className="flex items-center gap-2"><CheckCircle size={24} /> Claimed Today</span>
                            )}
                        </button>
                    </div>
                    
                    {/* Streak Milestones */}
                    <div className="mt-4 flex gap-2">
                        {[7, 14, 30, 60].map(milestone => (
                            <div 
                                key={milestone}
                                className={`flex-1 p-2 rounded-lg text-center text-xs ${
                                    dailyStreak.currentStreak >= milestone 
                                        ? 'bg-white/30 text-white' 
                                        : 'bg-white/10 text-white/50'
                                }`}
                            >
                                <p className="font-bold">{milestone} Days</p>
                                <p>{milestone === 7 ? '+15pts' : milestone === 14 ? '+25pts' : milestone === 30 ? '+50pts' : '+100pts'}</p>
                                {dailyStreak.currentStreak >= milestone && <CheckCircle size={14} className="mx-auto mt-1" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Level Progress */}
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
                    <div className="flex items-center gap-6 mb-6">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${badges.find(b => b.level === level.toLowerCase())?.color} flex items-center justify-center text-5xl shadow-lg`}>
                            {badges.find(b => b.level === level.toLowerCase())?.icon}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-800">{level} Level</h2>
                            <p className="text-gray-600 mb-3">{badges.find(b => b.level === level.toLowerCase())?.description}</p>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-4 rounded-full transition-all duration-500"
                                    style={{width: `${Math.min(100, (points / getNextLevelPoints()) * 100)}%`}}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-600">{points} points</span>
                                <span className="text-amber-600 font-medium">{getNextLevelPoints() - points} to {badges.find(b => b.minPoints === getNextLevelPoints())?.name || 'Max'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Level Progression */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-amber-700 mb-4 flex items-center gap-2">
                        <TrendingUp /> Level Progression
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {badges.map(badge => (
                            <div 
                                key={badge.id}
                                className={`rounded-2xl p-5 text-center transition-all transform ${
                                    badge.unlocked 
                                        ? `bg-gradient-to-br ${badge.color} text-white shadow-lg scale-100` 
                                        : 'bg-gray-100 text-gray-400 scale-95'
                                }`}
                            >
                                <div className="text-4xl mb-2">{badge.icon}</div>
                                <h4 className="font-bold mb-1">{badge.name}</h4>
                                <p className="text-xs opacity-80 mb-2">{badge.description}</p>
                                <p className={`text-sm font-bold ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>
                                    {badge.unlocked ? (
                                        <span className="flex items-center justify-center gap-1"><CheckCircle size={14} /> Unlocked</span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1"><Lock size={14} /> {badge.minPoints} pts</span>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements with Progress */}
                <div>
                    <h3 className="text-2xl font-bold text-amber-700 mb-4 flex items-center gap-2">
                        <Target /> Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map(achievement => {
                            const progress = getProgressPercentage(achievement.current, achievement.requirement);
                            const isComplete = progress >= 100;
                            return (
                                <div 
                                    key={achievement.id}
                                    onClick={() => setSelectedAchievement(achievement)}
                                    className={`bg-gradient-to-br ${isComplete ? achievement.color : 'from-gray-100 to-gray-200'} rounded-2xl p-5 ${isComplete ? 'text-white' : 'text-gray-700'} shadow-lg transform hover:scale-105 transition cursor-pointer relative overflow-hidden`}
                                >
                                    {isComplete && (
                                        <div className="absolute top-2 right-2 bg-white/30 rounded-full p-1">
                                            <CheckCircle size={20} />
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className={`text-3xl ${!isComplete && 'grayscale opacity-60'}`}>{achievement.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg mb-1">{achievement.name}</h4>
                                            <p className={`text-sm ${isComplete ? 'opacity-90' : 'text-gray-500'}`}>{achievement.description}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className={`w-full h-3 rounded-full ${isComplete ? 'bg-white/30' : 'bg-gray-300'} overflow-hidden`}>
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-white/70' : 'bg-gradient-to-r ' + achievement.color}`}
                                                style={{width: `${progress}%`}}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-sm">
                                            <span className={isComplete ? 'text-white/80' : 'text-gray-500'}>
                                                {achievement.current} / {achievement.requirement}
                                            </span>
                                            <span className={`font-bold ${isComplete ? 'text-white' : 'text-amber-600'}`}>
                                                {isComplete ? '✓ Complete' : `${achievement.requirement - achievement.current} to go`}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Points Badge */}
                                    <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${isComplete ? 'bg-white/30' : 'bg-amber-100 text-amber-700'}`}>
                                        🎁 +{achievement.points} points
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Achievement Detail Modal */}
                {selectedAchievement && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAchievement(null)}>
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                            <div className={`bg-gradient-to-br ${selectedAchievement.color} rounded-xl p-6 text-white text-center mb-4`}>
                                <div className="text-5xl mb-2">{selectedAchievement.icon}</div>
                                <h2 className="text-2xl font-bold">{selectedAchievement.name}</h2>
                                <p className="opacity-80">{selectedAchievement.description}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Your Progress</p>
                                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full bg-gradient-to-r ${selectedAchievement.color}`}
                                            style={{width: `${getProgressPercentage(selectedAchievement.current, selectedAchievement.requirement)}%`}}
                                        />
                                    </div>
                                    <p className="text-right text-sm mt-1 font-medium text-gray-700">
                                        {selectedAchievement.current} / {selectedAchievement.requirement}
                                    </p>
                                </div>
                                
                                <div className="bg-amber-50 p-4 rounded-xl">
                                    <p className="text-amber-700 font-medium flex items-center gap-2">
                                        <Gift size={18} /> Reward: <span className="font-bold">+{selectedAchievement.points} points</span>
                                    </p>
                                </div>
                                
                                {selectedAchievement.current < selectedAchievement.requirement && (
                                    <div className="bg-blue-50 p-4 rounded-xl">
                                        <p className="text-blue-700 text-sm">
                                            💡 <strong>Tip:</strong> {getAchievementTip(selectedAchievement)}
                                        </p>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => setSelectedAchievement(null)}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-white rounded-2xl p-5 shadow-lg text-center border-2 border-yellow-200">
                        <Star className="text-yellow-500 mx-auto mb-2" size={28} />
                        <p className="text-gray-600 text-xs">Total Points</p>
                        <p className="text-2xl font-bold text-gray-800">{points}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg text-center border-2 border-purple-200">
                        <Award className="text-purple-500 mx-auto mb-2" size={28} />
                        <p className="text-gray-600 text-xs">Current Level</p>
                        <p className="text-2xl font-bold text-gray-800">{level}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg text-center border-2 border-red-200">
                        <Flame className="text-red-500 mx-auto mb-2" size={28} />
                        <p className="text-gray-600 text-xs">Day Streak</p>
                        <p className="text-2xl font-bold text-gray-800">{dailyStreak.currentStreak}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-lg text-center border-2 border-green-200">
                        <Target className="text-green-500 mx-auto mb-2" size={28} />
                        <p className="text-gray-600 text-xs">Achievements</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {achievements.filter(a => a.current >= a.requirement).length}/{achievements.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getAchievementTip(achievement: Achievement): string {
    switch(achievement.category) {
        case 'water': return 'Log your water intake in the Hydration section daily to progress!';
        case 'meals': return 'Use MealMate to log your meals and get closer to this achievement!';
        case 'profile': return 'Complete all fields in your Profile settings to unlock this.';
        case 'streak': return 'Come back every day and claim your daily streak to keep it going!';
        case 'medicine': return 'Take all your medicines at the scheduled times to earn perfect days!';
        case 'points': return 'Keep using the app daily to earn more points!';
        case 'goals': return 'Complete all daily health goals - water, meals, and medicine!';
        case 'journal': return 'Write about your health journey in the Mood Journal!';
        case 'activity': return 'Log your activities at the right time of day!';
        default: return 'Keep using MediMind to progress towards this achievement!';
    }
}
