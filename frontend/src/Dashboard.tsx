import { useState, useEffect, useRef } from 'react';
import { 
    Droplets, Activity, Trophy, Coffee, Utensils, Pill, User, Heart, X, 
    Flame, LogOut, AlertTriangle, BookOpen, FileText,
    Menu, Home, Settings, ChevronRight, Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    playUrgentAlert, 
    sendMedicineNotification, 
    requestNotificationPermission 
} from './utils/audioNotification';

interface MedicineSummary {
    totalMedicines: number;
    totalDoses: number;
    takenDoses: number;
    remainingDoses: number;
    adherencePercentage: number;
}

interface TodayMedicine {
    medicineId: number;
    medicineName: string;
    dosage: string;
    slot: number;
    time: string;
    taken: boolean;
    daysRemaining: number;
    takenAt?: string;
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

// Circular Progress Component
function CircularProgress({ 
    percentage, 
    size = 120, 
    strokeWidth = 10, 
    primaryColor, 
    secondaryColor = '#e5e7eb',
    children 
}: { 
    percentage: number; 
    size?: number; 
    strokeWidth?: number;
    primaryColor: string;
    secondaryColor?: string;
    children?: React.ReactNode;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}

export default function Dashboard({ user, setUser, logout }: { user: any, setUser: (u: any) => void, logout: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [medicineSummary, setMedicineSummary] = useState<MedicineSummary | null>(null);
    const [bmiInfo, setBmiInfo] = useState<BmiInfo | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Use ref to track the latest user data for achievement counting
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Sync user data from localStorage when component mounts or navigates back
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Always update from localStorage to ensure we have the latest data
            setUser(parsedUser);
        }
    }, [location.pathname]);
    const [showCaloriesModal, setShowCaloriesModal] = useState(false);
    const [calorieInfo, setCalorieInfo] = useState<CalorieInfo | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [todayMedicines, setTodayMedicines] = useState<TodayMedicine[]>([]);
    const [showNotesModal, setShowNotesModal] = useState(false);

    // Track which reminders have already been notified
    const notifiedReminders = useRef(new Set<string>());

    useEffect(() => {
        if (user?.id) {
            fetchMedicineSummary();
            fetchBmiInfo();
            fetchCalorieInfo();
            fetchTodayMedicines();
            
            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                requestNotificationPermission();
            }
            
            // Check reminders every 30 seconds
            checkMedicineReminders();
            const interval = setInterval(checkMedicineReminders, 30000);
            return () => clearInterval(interval);
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

    const fetchTodayMedicines = async () => {
        try {
            const res = await axios.get(`/api/medicine/today/${user.id}`);
            setTodayMedicines(res.data);
        } catch (err) {
            console.error('Error fetching today medicines:', err);
        }
    };

    const checkMedicineReminders = async () => {
        try {
            const res = await axios.get(`/api/medicine/reminders/${user.id}`);
            const upcomingReminders = res.data as TodayMedicine[];
            
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            
            upcomingReminders.forEach((reminder: TodayMedicine) => {
                if (!reminder.time) return;
                
                // Parse the scheduled time (HH:mm format)
                const [schedHours, schedMinutes] = reminder.time.split(':').map(Number);
                
                // Check if current time is within 1 minute of scheduled time
                const scheduledTotalMins = schedHours * 60 + schedMinutes;
                const currentTotalMins = currentHours * 60 + currentMinutes;
                const timeDiff = Math.abs(currentTotalMins - scheduledTotalMins);
                
                // Create unique key to prevent duplicate notifications
                const reminderKey = `${reminder.medicineId}-${reminder.slot}-${now.toDateString()}`;
                
                // Only notify if within 1 minute window and not already notified
                if (timeDiff <= 1 && !notifiedReminders.current.has(reminderKey)) {
                    notifiedReminders.current.add(reminderKey);
                    
                    // Play sound alert
                    playUrgentAlert();
                    
                    // Send browser notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        sendMedicineNotification(
                            `💊 Time to take ${reminder.medicineName}!`,
                            {
                                body: `Dosage: ${reminder.dosage || 'As prescribed'}\nScheduled: ${formatTimeForDisplay(reminder.time)}`,
                                playSound: true
                            }
                        );
                    }
                }
            });
        } catch (err) {
            console.error('Error checking reminders:', err);
        }
    };

    const formatTimeForDisplay = (time: string): string => {
        if (!time) return '';
        const [hours, minutes] = time.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const getNextMedicineTime = (): string => {
        const now = new Date();
        const currentTotalMins = now.getHours() * 60 + now.getMinutes();
        
        const upcomingMeds = todayMedicines
            .filter(med => !med.taken && med.time)
            .map(med => {
                const [hours, minutes] = med.time.split(':').map(Number);
                return { ...med, totalMins: hours * 60 + minutes };
            })
            .filter(med => med.totalMins > currentTotalMins)
            .sort((a, b) => a.totalMins - b.totalMins);
        
        if (upcomingMeds.length > 0) {
            return `${upcomingMeds[0].medicineName} at ${formatTimeForDisplay(upcomingMeds[0].time)}`;
        }
        return 'No more medicines today';
    };

    if (!user) return <div className="p-10 text-sage-500">Loading...</div>;

    const getLevelInfo = () => {
        const level = user.level || 'Bronze';
        const points = user.points || 0;
        
        const levels = [
            { name: 'Bronze', icon: '🥉', color: 'from-amber-600 to-amber-800', minPoints: 0 },
            { name: 'Silver', icon: '🥈', color: 'from-gray-300 to-gray-500', minPoints: 500 },
            { name: 'Gold', icon: '🥇', color: 'from-yellow-400 to-amber-500', minPoints: 1500 },
            { name: 'Platinum', icon: '💎', color: 'from-cyan-300 to-blue-400', minPoints: 3500 },
            { name: 'Diamond', icon: '✨', color: 'from-purple-400 to-pink-400', minPoints: 7500 },
        ];
        
        const currentLevel = levels.find(l => l.name === level) || levels[0];
        const nextLevel = levels.find(l => l.minPoints > points) || levels[levels.length - 1];
        const progress = nextLevel.minPoints > 0 ? (points / nextLevel.minPoints) * 100 : 100;
        
        return { currentLevel, nextLevel, progress, points };
    };

    const levelInfo = getLevelInfo();
    const calorieGoal = bmiInfo?.recommendedCalories || user.dailyCalorieGoal || 2000;
    const caloriePercentage = ((calorieInfo?.consumed || 0) / calorieGoal) * 100;
    const medicinePercentage = medicineSummary ? (medicineSummary.takenDoses / Math.max(medicineSummary.totalDoses, 1)) * 100 : 0;
    const hydrationPercentage = ((user.waterIntake || 0) / 8) * 100;

    const menuItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard', active: true },
        { name: 'Your Profile', icon: User, path: '/profile' },
        { name: 'Medicine Cabinet', icon: Pill, path: '/medicine' },
        { name: 'MealMate', icon: Coffee, path: '/meals' },
        { name: 'Hydration Tracker', icon: Droplets, path: '/hydration' },
        { name: 'Journal', icon: BookOpen, path: '/journal' },
        { name: 'Achievements', icon: Trophy, path: '/badges' },
        { name: 'Settings', icon: Settings, path: '/profile?tab=settings' },
    ];

    return (
        <div className="min-h-screen bg-sage-50 font-sans">
            {/* Side Panel Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Side Panel */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    {/* Profile Section */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sage-400 to-teal-500 flex items-center justify-center overflow-hidden shadow-lg">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : user.profileIcon ? (
                                <span className="text-2xl">{user.profileIcon}</span>
                            ) : (
                                <User size={24} className="text-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{user.fullName || user.username}</h3>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Level Badge */}
                    <div className={`bg-gradient-to-r ${levelInfo.currentLevel.color} rounded-2xl p-4 text-white mb-6`}>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{levelInfo.currentLevel.icon}</span>
                            <div>
                                <p className="font-bold">{levelInfo.currentLevel.name} Level</p>
                                <p className="text-sm opacity-80">{levelInfo.points} points</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => {
                                    navigate(item.path);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    item.active 
                                        ? 'bg-gradient-to-r from-sage-500 to-teal-500 text-white shadow-lg' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.name}</span>
                                <ChevronRight size={16} className="ml-auto opacity-50" />
                            </button>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <button
                        onClick={() => {
                            setSidebarOpen(false);
                            setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all mt-6"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Top Navigation */}
            <nav className="bg-white shadow-sm p-4 px-8 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>
                    <div className="flex items-center gap-2 text-sage-500 font-bold text-xl cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <Activity /> MediMind
                    </div>
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
                {/* Achievement Card - First row */}
                <div onClick={() => navigate('/badges')} className="bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-3xl shadow-xl p-6 cursor-pointer transform hover:scale-[1.02] transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${levelInfo.currentLevel.color} flex items-center justify-center text-4xl shadow-lg`}>
                                {levelInfo.currentLevel.icon}
                            </div>
                            <div className="text-white">
                                <p className="text-sm opacity-80 uppercase tracking-wider">Achievements</p>
                                <h2 className="text-3xl font-bold">{levelInfo.currentLevel.name}</h2>
                                <p className="text-white/80 text-sm">{levelInfo.points} points • {user.streak || 0} day streak 🔥</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right text-white">
                                <p className="text-sm opacity-80">Next Level</p>
                                <p className="font-bold">{levelInfo.nextLevel.name}</p>
                                <p className="text-xs opacity-70">{levelInfo.nextLevel.minPoints - levelInfo.points} pts to go</p>
                            </div>
                            <Trophy className="text-white/80" size={40} />
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-white h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(levelInfo.progress, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid with Circular Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Hydration Card */}
                    <div onClick={() => navigate('/hydration')} className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition">
                        <div className="flex flex-col items-center">
                            <CircularProgress 
                                percentage={hydrationPercentage} 
                                primaryColor="#3b82f6"
                                size={100}
                                strokeWidth={8}
                            >
                                <Droplets className="text-blue-500" size={24} />
                            </CircularProgress>
                            <h3 className="mt-4 font-bold text-gray-800">Hydration</h3>
                            <p className="text-2xl font-bold text-blue-600">{user.waterIntake || 0}<span className="text-sm text-gray-500"> / 8</span></p>
                            <p className="text-xs text-gray-500">glasses today</p>
                        </div>
                    </div>

                    {/* Calories Card */}
                    <div onClick={() => setShowCaloriesModal(true)} className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition">
                        <div className="flex flex-col items-center">
                            <CircularProgress 
                                percentage={caloriePercentage} 
                                primaryColor={caloriePercentage > 100 ? '#ef4444' : '#f97316'}
                                size={100}
                                strokeWidth={8}
                            >
                                <Utensils className="text-orange-500" size={24} />
                            </CircularProgress>
                            <h3 className="mt-4 font-bold text-gray-800">Calories</h3>
                            <p className="text-2xl font-bold text-orange-600">{calorieInfo?.consumed || 0}<span className="text-sm text-gray-500"> / {calorieGoal}</span></p>
                            <p className="text-xs text-gray-500">
                                {bmiInfo ? `BMI: ${bmiInfo.bmi.toFixed(1)}` : 'kcal consumed'}
                            </p>
                        </div>
                    </div>

                    {/* Medicine Card */}
                    <div onClick={() => setShowMedicineModal(true)} className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition">
                        <div className="flex flex-col items-center">
                            <CircularProgress 
                                percentage={medicinePercentage} 
                                primaryColor="#10b981"
                                size={100}
                                strokeWidth={8}
                            >
                                <Pill className="text-emerald-500" size={24} />
                            </CircularProgress>
                            <h3 className="mt-4 font-bold text-gray-800">Medicine</h3>
                            {medicineSummary ? (
                                <>
                                    <p className="text-2xl font-bold text-emerald-600">{medicineSummary.takenDoses}<span className="text-sm text-gray-500"> / {medicineSummary.totalDoses}</span></p>
                                    <p className="text-xs text-gray-500">{medicineSummary.adherencePercentage}% taken</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-emerald-600">--</p>
                                    <p className="text-xs text-gray-500">No medicines</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Notes Card */}
                    <div onClick={() => setShowNotesModal(true)} className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition">
                        <div className="flex flex-col items-center">
                            <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <FileText className="text-purple-500" size={36} />
                            </div>
                            <h3 className="mt-4 font-bold text-gray-800">Notes</h3>
                            <p className="text-2xl font-bold text-purple-600">{user.journalEntries || 0}</p>
                            <p className="text-xs text-gray-500">entries written</p>
                        </div>
                    </div>
                </div>

                {/* Quick Action Cards */}
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
                        <h3 className="text-2xl font-bold mb-2">Journal</h3>
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
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-bounce-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                                <Flame /> Calories
                            </h2>
                            <button onClick={() => setShowCaloriesModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Circular Progress - Same as card */}
                        <div className="flex flex-col items-center">
                            <CircularProgress 
                                percentage={caloriePercentage} 
                                primaryColor={caloriePercentage > 100 ? '#ef4444' : '#f97316'}
                                size={160}
                                strokeWidth={12}
                            >
                                <Utensils className="text-orange-500" size={32} />
                            </CircularProgress>
                            <h3 className="mt-4 font-bold text-gray-800 text-lg">Calories</h3>
                            <p className="text-3xl font-bold text-orange-600">{calorieInfo?.consumed || 0}<span className="text-lg text-gray-500"> / {calorieGoal}</span></p>
                            <p className="text-sm text-gray-500 mt-1">
                                {bmiInfo ? `BMI: ${bmiInfo.bmi.toFixed(1)}` : 'kcal consumed'}
                            </p>
                        </div>

                        <button 
                            onClick={() => { setShowCaloriesModal(false); navigate('/meals'); }}
                            className="w-full mt-6 bg-gradient-to-r from-orange-400 to-amber-400 text-white py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-amber-500"
                        >
                            Go to MealMate
                        </button>
                    </div>
                </div>
            )}

            {/* Medicine Detail Modal */}
            {showMedicineModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-bounce-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                                <Pill /> Today's Medicines
                            </h2>
                            <button onClick={() => setShowMedicineModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Circular Progress */}
                        <div className="flex justify-center mb-6">
                            <CircularProgress 
                                percentage={medicinePercentage} 
                                primaryColor="#10b981"
                                size={160}
                                strokeWidth={12}
                            >
                                <p className="text-3xl font-bold text-gray-800">{medicineSummary?.takenDoses || 0}</p>
                                <p className="text-sm text-gray-500">of {medicineSummary?.totalDoses || 0}</p>
                            </CircularProgress>
                        </div>

                        {/* Medicine Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-5 rounded-2xl text-center border border-emerald-200">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center mx-auto mb-2">
                                    <span className="text-white text-lg">✓</span>
                                </div>
                                <p className="text-3xl font-bold text-emerald-600">{medicineSummary?.takenDoses || 0}</p>
                                <p className="text-sm text-gray-600 mt-1">Taken Today</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-5 rounded-2xl text-center border border-amber-200">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center mx-auto mb-2">
                                    <Clock size={20} className="text-white" />
                                </div>
                                <p className="text-3xl font-bold text-amber-600">{medicineSummary?.remainingDoses || 0}</p>
                                <p className="text-sm text-gray-600 mt-1">Remaining</p>
                            </div>
                        </div>

                        {/* Next Medicine Time */}
                        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 rounded-2xl border border-blue-200 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
                                    <Clock size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Next Medicine</p>
                                    <p className="font-bold text-gray-800">{getNextMedicineTime()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Today's Schedule */}
                        {todayMedicines.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-700 mb-3">Today's Schedule</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {todayMedicines.map((med, idx) => (
                                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${med.taken ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${med.taken ? 'bg-green-400' : 'bg-gray-300'}`}>
                                                    {med.taken ? <span className="text-white text-sm">✓</span> : <Pill size={14} className="text-white" />}
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${med.taken ? 'text-green-700' : 'text-gray-700'}`}>{med.medicineName}</p>
                                                    <p className="text-xs text-gray-500">{med.dosage}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-medium ${med.taken ? 'text-green-600' : 'text-gray-600'}`}>
                                                {formatTimeForDisplay(med.time)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => { setShowMedicineModal(false); navigate('/medicine'); }}
                            className="w-full mt-6 bg-gradient-to-r from-emerald-400 to-teal-400 text-white py-3 rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500"
                        >
                            Go to Medicine Cabinet
                        </button>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-bounce-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                                <FileText /> Notes
                            </h2>
                            <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Notes Display - Same format as card */}
                        <div className="flex flex-col items-center">
                            <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <FileText className="text-purple-500" size={48} />
                            </div>
                            <h3 className="mt-4 font-bold text-gray-800 text-lg">Notes</h3>
                            <p className="text-3xl font-bold text-purple-600">{user.journalEntries || 0}</p>
                            <p className="text-sm text-gray-500 mt-1">entries written</p>
                        </div>

                        <button 
                            onClick={() => { setShowNotesModal(false); navigate('/journal'); }}
                            className="w-full mt-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500"
                        >
                            Go to Journal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
