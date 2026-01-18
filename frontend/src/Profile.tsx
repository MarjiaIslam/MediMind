import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, Trash2, Camera, User, Bell, LogOut, ChevronRight, Scale, Heart, Calendar, Search, Plus, X } from 'lucide-react';

interface JournalEntry {
    id: number;
    title: string;
    content: string;
    mood: string;
    tags: string;
    createdAt: string;
}

interface BmiInfo {
    bmi: number;
    category: string;
    recommendedCalories: number;
    idealWeightMin: number;
    idealWeightMax: number;
    weightToLose: number;
    weightToGain: number;
}

const profileIcons = ['👤', '😊', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦉', '🐙', '🌸', '⭐', '🌈', '🎮', '🎨', '🎵'];
const notificationSounds = [
    { id: 'default', name: 'Default' },
    { id: 'gentle', name: 'Gentle Chime' },
    { id: 'bell', name: 'Bell' },
    { id: 'melody', name: 'Soft Melody' },
    { id: 'none', name: 'Silent' }
];

export default function Profile({ user, setUser }: { user: any, setUser: any }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(user);
    const [msg, setMsg] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [bmiInfo, setBmiInfo] = useState<BmiInfo | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'journal' | 'settings'>('profile');
    
    // Journal states
    const [journal, setJournal] = useState<JournalEntry[]>([]);
    const [showJournalForm, setShowJournalForm] = useState(false);
    const [journalSearch, setJournalSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'Happy 😊', tags: '' });
    const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

    const moods = ['Happy 😊', 'Stressed 😫', 'Calm 😌', 'Tired 😴', 'Sad 😢', 'Excited 🎉', 'Anxious 😰', 'Grateful 🙏'];
    
    const quotesCollection: { [key: string]: string[] } = {
        'Happy 😊': [
            "Keep shining! Your positivity is contagious.",
            "Happiness looks gorgeous on you!",
            "Your smile can change the world.",
            "Joy is the simplest form of gratitude."
        ],
        'Stressed 😫': [
            "Take a deep breath. One step at a time.",
            "You've survived 100% of your worst days.",
            "Stress is temporary, your strength is permanent.",
            "Even the darkest night will end."
        ],
        'Calm 😌': [
            "Peace comes from within. Enjoy this moment.",
            "Serenity is not freedom from the storm.",
            "In the midst of chaos, there is also opportunity.",
            "Be still and know that you are enough."
        ],
        'Tired 😴': [
            "Rest is productive too. Recharge yourself.",
            "Even superheroes need sleep.",
            "Tomorrow is a new day with new energy.",
            "Your body is telling you to slow down. Listen."
        ],
        'Sad 😢': [
            "This too shall pass. You are stronger than you know.",
            "Tears water the seeds of your future happiness.",
            "It's okay to not be okay sometimes.",
            "Every storm runs out of rain eventually."
        ],
        'Excited 🎉': [
            "Channel that energy into something amazing!",
            "Your enthusiasm is your superpower.",
            "Great things are coming your way!",
            "Let your excitement fuel your dreams."
        ],
        'Anxious 😰': [
            "You are braver than you believe.",
            "Anxiety is a liar. You've got this.",
            "Focus on what you can control.",
            "This feeling is temporary."
        ],
        'Grateful 🙏': [
            "Gratitude turns what we have into enough.",
            "A thankful heart is a magnet for miracles.",
            "Count your blessings, not your problems.",
            "Gratitude is the healthiest of all emotions."
        ]
    };

    const getRandomQuote = (mood: string) => {
        const quotes = quotesCollection[mood] || quotesCollection['Happy 😊'];
        return quotes[Math.floor(Math.random() * quotes.length)];
    };

    const [currentQuote, setCurrentQuote] = useState(getRandomQuote(user.mood || 'Happy 😊'));

    useEffect(() => {
        fetchBmiInfo();
        fetchJournal();
    }, []);

    useEffect(() => {
        setCurrentQuote(getRandomQuote(formData.mood || 'Happy 😊'));
    }, [formData.mood]);

    const fetchBmiInfo = async () => {
        try {
            const res = await axios.get(`/api/user/bmi/${user.id}`);
            setBmiInfo(res.data);
        } catch (err) {
            console.error('Error fetching BMI info:', err);
        }
    };

    const fetchJournal = async () => {
        try {
            const res = await axios.get(`/api/journal/${user.id}`);
            setJournal(res.data);
        } catch (err) {
            console.error('Error fetching journal:', err);
        }
    };

    const searchJournal = async () => {
        try {
            if (journalSearch) {
                const res = await axios.get(`/api/journal/${user.id}/search?keyword=${encodeURIComponent(journalSearch)}`);
                setJournal(res.data);
            } else if (dateFilter) {
                const res = await axios.get(`/api/journal/${user.id}/date?date=${dateFilter}`);
                setJournal(res.data);
            } else {
                fetchJournal();
            }
        } catch (err) {
            console.error('Error searching journal:', err);
        }
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.put('/api/user/update', formData);
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            setMsg('Profile Updated Successfully!');
            setTimeout(() => setMsg(''), 3000);
            fetchBmiInfo();
        } catch (err) {
            console.error('Error updating profile:', err);
            setMsg('Error updating profile');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`/api/user/${user.id}`);
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
        } catch (err) {
            console.error('Error deleting account:', err);
        }
    };

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setFormData({ ...formData, profilePicture: base64, profileIcon: null });
            };
            reader.readAsDataURL(file);
        }
    };

    const selectIcon = (icon: string) => {
        setFormData({ ...formData, profileIcon: icon, profilePicture: null });
        setShowIconPicker(false);
    };

    const saveJournalEntry = async () => {
        try {
            if (editingEntry) {
                await axios.put(`/api/journal/${editingEntry.id}`, {
                    ...editingEntry,
                    ...newEntry,
                    userId: user.id
                });
            } else {
                await axios.post('/api/journal', {
                    ...newEntry,
                    userId: user.id
                });
            }
            setNewEntry({ title: '', content: '', mood: 'Happy 😊', tags: '' });
            setShowJournalForm(false);
            setEditingEntry(null);
            fetchJournal();
        } catch (err) {
            console.error('Error saving journal entry:', err);
        }
    };

    const deleteJournalEntry = async (id: number) => {
        if (!confirm('Delete this journal entry?')) return;
        try {
            await axios.delete(`/api/journal/${id}`);
            fetchJournal();
        } catch (err) {
            console.error('Error deleting journal entry:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-purple-600 font-bold hover:text-purple-800 flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl hover:bg-white/80 transition">
                ← Back to Dashboard
            </button>
            
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center gap-6">
                    {/* Profile Picture/Icon */}
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-xl">
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : formData.profileIcon ? (
                                <span className="text-6xl">{formData.profileIcon}</span>
                            ) : (
                                <User size={56} className="text-white" />
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex gap-1">
                            <label className="bg-white text-purple-500 p-2 rounded-full cursor-pointer hover:bg-purple-100 shadow-lg transition-all hover:scale-110">
                                <Camera size={18} />
                                <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
                            </label>
                            <button 
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="bg-white text-pink-500 p-2 rounded-full hover:bg-pink-100 shadow-lg transition-all hover:scale-110"
                            >
                                😊
                            </button>
                        </div>
                        {/* Icon Picker Dropdown */}
                        {showIconPicker && (
                            <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl p-4 z-10 w-72 border border-purple-100">
                                <p className="text-sm font-medium text-gray-600 mb-3">Choose an icon</p>
                                <div className="grid grid-cols-8 gap-2">
                                    {profileIcons.map(icon => (
                                        <button 
                                            key={icon}
                                            onClick={() => selectIcon(icon)}
                                            className="text-2xl p-2 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all hover:scale-110"
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-white">
                        <h1 className="text-3xl font-bold">{user.fullName || user.username}</h1>
                        <p className="text-white/80 text-lg">@{user.username}</p>
                        <p className="text-white/60 text-sm mt-1">{user.email}</p>
                        <div className="flex gap-3 mt-3">
                            <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm">Level {user.level || 1}</span>
                            <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm">🔥 {user.streak || 0} day streak</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className="p-4 bg-white/20 backdrop-blur rounded-2xl hover:bg-white/30 transition-all hover:scale-105"
                    >
                        <Settings size={28} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${activeTab === 'profile' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'}`}
                >
                    👤 Profile
                </button>
                <button 
                    onClick={() => setActiveTab('journal')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${activeTab === 'journal' ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'}`}
                >
                    📔 Mood Journal
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${activeTab === 'settings' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'}`}
                >
                    ⚙️ Settings
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Edit Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                                <Heart size={20} className="text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Health Details</span>
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">Full Name</label>
                                <input type="text" value={formData.fullName || ''} onChange={e=>setFormData({...formData, fullName: e.target.value})} placeholder="Enter your full name" className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-700 mb-2">Age</label>
                                    <input type="number" value={formData.age || ''} onChange={e=>setFormData({...formData, age: parseInt(e.target.value) || null})} placeholder="Age" className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-700 mb-2">Gender</label>
                                    <select value={formData.gender || ''} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none">
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-cyan-700 mb-2">Height (cm)</label>
                                    <input type="number" value={formData.height || ''} onChange={e=>setFormData({...formData, height: parseFloat(e.target.value) || null})} className="w-full p-3 border-2 border-cyan-200 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-700 mb-2">Weight (kg)</label>
                                    <input type="number" value={formData.weight || ''} onChange={e=>setFormData({...formData, weight: parseFloat(e.target.value) || null})} className="w-full p-3 border-2 border-cyan-200 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-emerald-700 mb-2">Target Weight (kg)</label>
                                <input type="number" value={formData.targetWeight || ''} onChange={e=>setFormData({...formData, targetWeight: parseFloat(e.target.value) || null})} placeholder="Your goal weight" className="w-full p-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">Allergies</label>
                                <input placeholder="Peanuts, Shellfish, Seafood..." value={formData.allergies || ''} onChange={e=>setFormData({...formData, allergies: e.target.value})} className="w-full p-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-rose-700 mb-2">Chronic Conditions</label>
                                <div className="space-y-3">
                                    <div className="flex gap-2 flex-wrap mb-2">
                                        {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid'].map((cond, idx) => {
                                            const colors = [
                                                'from-blue-400 to-indigo-500',
                                                'from-red-400 to-pink-500',
                                                'from-cyan-400 to-teal-500',
                                                'from-rose-400 to-red-500',
                                                'from-purple-400 to-violet-500'
                                            ];
                                            return (
                                            <button
                                                key={cond}
                                                onClick={() => {
                                                    const current = formData.conditions ? formData.conditions.split(',').map((c: string) => c.trim()) : [];
                                                    if (current.includes(cond)) {
                                                        setFormData({...formData, conditions: current.filter((c: string) => c !== cond).join(', ')});
                                                    } else {
                                                        setFormData({...formData, conditions: [...current, cond].join(', ')});
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${formData.conditions?.includes(cond) ? `bg-gradient-to-r ${colors[idx]} text-white shadow-md` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {cond}
                                            </button>
                                        );})}
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Or type custom conditions (comma-separated)"
                                        value={formData.conditions || ''} 
                                        onChange={e=>setFormData({...formData, conditions: e.target.value})} 
                                        className="w-full p-3 border-2 border-rose-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-200 focus:outline-none" 
                                    />
                                </div>
                            </div>
                            <button onClick={handleUpdate} className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg">✨ Save Changes</button>
                            {msg && <p className="text-emerald-600 text-center text-sm font-medium mt-2 p-2 bg-emerald-50 rounded-lg">{msg}</p>}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* BMI Card */}
                        {bmiInfo && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="font-bold text-xl mb-6 flex items-center gap-3 relative">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                                        <Scale size={20} className="text-white" />
                                    </div>
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">BMI & Health Info</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4 relative">
                                    <div className="text-center p-5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200">
                                        <p className={`text-5xl font-bold ${getBmiColor(bmiInfo.category)}`}>
                                            {bmiInfo.bmi.toFixed(1)}
                                        </p>
                                        <p className={`text-sm font-bold mt-1 ${getBmiColor(bmiInfo.category)}`}>
                                            {bmiInfo.category}
                                        </p>
                                    </div>
                                    <div className="text-center p-5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl border-2 border-emerald-200">
                                        <p className="text-5xl font-bold text-emerald-600">{bmiInfo.recommendedCalories}</p>
                                        <p className="text-sm font-medium text-emerald-700 mt-1">Daily Calories</p>
                                    </div>
                                </div>
                                <div className="mt-5 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                    <p className="text-sm text-indigo-700 font-medium">
                                        🎯 <strong>Ideal Weight Range:</strong> {bmiInfo.idealWeightMin.toFixed(1)} - {bmiInfo.idealWeightMax.toFixed(1)} kg
                                    </p>
                                    {bmiInfo.weightToLose > 0 && (
                                        <p className="text-sm text-orange-600 mt-2 font-medium bg-orange-50 p-2 rounded-lg">
                                            💪 To reach ideal: Lose {bmiInfo.weightToLose.toFixed(1)} kg
                                        </p>
                                    )}
                                    {bmiInfo.weightToGain > 0 && (
                                        <p className="text-sm text-blue-600 mt-2 font-medium bg-blue-50 p-2 rounded-lg">
                                            🍎 To reach ideal: Gain {bmiInfo.weightToGain.toFixed(1)} kg
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mood Tracker */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full -translate-y-1/2 -translate-x-1/2"></div>
                            <h3 className="font-bold text-xl mb-2 flex items-center gap-3 relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-400 to-orange-400 flex items-center justify-center">
                                    <span className="text-xl">🧠</span>
                                </div>
                                <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">Empathy Engine</span>
                            </h3>
                            <p className="mb-4 text-gray-500 ml-13 relative">How are you feeling today?</p>
                            <div className="grid grid-cols-4 gap-3 mb-4 relative">
                                {moods.map(m => (
                                    <button key={m} onClick={() => setFormData({...formData, mood: m})} 
                                        className={`text-3xl p-3 rounded-xl transition-all transform ${formData.mood === m ? 'bg-gradient-to-br from-pink-200 to-orange-200 scale-110 shadow-md' : 'hover:bg-gray-100 hover:scale-105 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}
                                        title={m.split(' ')[0]}
                                    >
                                        {m.split(' ')[1]}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-5 rounded-xl border-2 border-pink-200 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 text-6xl opacity-10">✨</div>
                                <p className="text-pink-700 font-serif italic text-lg relative">"{currentQuote}"</p>
                            </div>
                            <button 
                                onClick={() => setCurrentQuote(getRandomQuote(formData.mood || 'Happy 😊'))}
                                className="mt-3 text-sm text-pink-500 hover:text-pink-700 font-medium transition-colors flex items-center gap-1 mx-auto"
                            >
                                ↻ Get another quote
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Journal Tab */}
            {activeTab === 'journal' && (
                <div className="space-y-6">
                    {/* Search and Filter */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-purple-100 flex flex-wrap gap-3 items-center">
                        <div className="flex-1 flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-4 py-3 border border-purple-200">
                            <Search size={18} className="text-purple-400" />
                            <input 
                                type="text" 
                                placeholder="Search by keyword..." 
                                value={journalSearch}
                                onChange={e => setJournalSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchJournal()}
                                className="bg-transparent outline-none flex-1 text-purple-700 placeholder:text-purple-300"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl px-4 py-3 border border-pink-200">
                            <Calendar size={18} className="text-pink-400" />
                            <input 
                                type="date" 
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                className="bg-transparent outline-none text-pink-700"
                            />
                        </div>
                        <button onClick={searchJournal} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:scale-105 transform">
                            🔍 Search
                        </button>
                        <button onClick={() => { setJournalSearch(''); setDateFilter(''); fetchJournal(); }} className="text-gray-500 hover:text-purple-600 font-medium transition-colors">
                            ✕ Clear
                        </button>
                        <button 
                            onClick={() => setShowJournalForm(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:scale-105 transform flex items-center gap-2"
                        >
                            <Plus size={18} /> New Entry
                        </button>
                    </div>

                    {/* Journal Entries */}
                    <div className="space-y-4">
                        {journal.length > 0 ? journal.map(entry => (
                            <div key={entry.id} className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:scale-[1.01] transform">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">{entry.title}</h4>
                                        <p className="text-sm text-gray-400">
                                            {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{entry.mood?.split(' ')[1] || '😊'}</span>
                                        <button 
                                            onClick={() => { setEditingEntry(entry); setNewEntry(entry); setShowJournalForm(true); }}
                                            className="text-purple-400 hover:text-purple-600 font-medium transition-colors"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            onClick={() => deleteJournalEntry(entry.id)}
                                            className="text-red-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                                {entry.tags && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {entry.tags.split(',').map((tag, i) => {
                                            const tagColors = ['from-purple-400 to-pink-400', 'from-cyan-400 to-teal-400', 'from-orange-400 to-red-400', 'from-emerald-400 to-green-400', 'from-indigo-400 to-blue-400'];
                                            return (
                                            <span key={i} className={`bg-gradient-to-r ${tagColors[i % tagColors.length]} text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
                                                #{tag.trim()}
                                            </span>
                                        );})}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-purple-100">
                                <div className="text-6xl mb-4">📔</div>
                                <p className="mb-4 text-gray-500">No journal entries yet.</p>
                                <button 
                                    onClick={() => setShowJournalForm(true)}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-md hover:scale-105 transform"
                                >
                                    ✍️ Write your first entry
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Journal Form Modal */}
                    {showJournalForm && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                                        {editingEntry ? '✏️ Edit Entry' : '✨ New Journal Entry'}
                                    </h2>
                                    <button onClick={() => { setShowJournalForm(false); setEditingEntry(null); setNewEntry({ title: '', content: '', mood: 'Happy 😊', tags: '' }); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-purple-700 mb-2">Title</label>
                                        <input 
                                            value={newEntry.title}
                                            onChange={e => setNewEntry({...newEntry, title: e.target.value})}
                                            placeholder="Give your entry a title..."
                                            className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-pink-700 mb-2">How are you feeling?</label>
                                        <div className="flex flex-wrap gap-2">
                                            {moods.map(m => (
                                                <button 
                                                    key={m}
                                                    onClick={() => setNewEntry({...newEntry, mood: m})}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${newEntry.mood === m ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-md' : 'bg-gray-100 hover:bg-pink-100'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-indigo-700 mb-2">What's on your mind?</label>
                                        <textarea 
                                            value={newEntry.content}
                                            onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                                            placeholder="Write your thoughts..."
                                            rows={6}
                                            className="w-full p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-teal-700 mb-2">Tags (comma separated)</label>
                                        <input 
                                            value={newEntry.tags}
                                            onChange={e => setNewEntry({...newEntry, tags: e.target.value})}
                                            placeholder="gratitude, work, health..."
                                            className="w-full p-4 border-2 border-teal-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                                        />
                                    </div>
                                    <button 
                                        onClick={saveJournalEntry}
                                        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
                                    >
                                        {editingEntry ? '💾 Save Changes' : '✨ Save Entry'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Account Information */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100">
                        <div className="p-5 bg-gradient-to-r from-purple-500 to-indigo-500">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">👤 Account Information</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">Email Address</label>
                                <input 
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    placeholder="your@email.com"
                                    className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-400 focus:outline-none"
                                />
                                <p className="text-xs text-purple-500 mt-2">📧 Used for account recovery and notifications</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">Username</label>
                                <input 
                                    type="text"
                                    value={formData.username || ''}
                                    disabled
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-2">🔒 Username cannot be changed</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100">
                        <div className="p-5 bg-gradient-to-r from-pink-500 to-orange-500">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">🔔 Notification Settings</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-400 to-orange-400 flex items-center justify-center">
                                        <Bell className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Medicine Reminders</p>
                                        <p className="text-sm text-gray-500">Get notified for your scheduled medicines</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.notificationsEnabled !== false}
                                        onChange={e => setFormData({...formData, notificationsEnabled: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md"></div>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-pink-700 mb-2">🎵 Notification Sound</label>
                                <select 
                                    value={formData.notificationSound || 'default'}
                                    onChange={e => setFormData({...formData, notificationSound: e.target.value})}
                                    className="w-full p-4 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 focus:outline-none"
                                >
                                    {notificationSounds.map(sound => (
                                        <option key={sound.id} value={sound.id}>{sound.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="p-5 bg-gradient-to-r from-gray-600 to-gray-800">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">⚡ Quick Actions</h3>
                        </div>
                        <div className="divide-y">
                            <button 
                                onClick={handleLogout}
                                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                                        <LogOut className="text-gray-600" size={20} />
                                    </div>
                                    <span className="font-medium text-gray-700">Log Out</span>
                                </div>
                                <ChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full p-5 flex items-center justify-between hover:bg-red-50 text-red-500 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                                        <Trash2 size={20} />
                                    </div>
                                    <span className="font-medium">Delete Account</span>
                                </div>
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleUpdate}
                        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                        ✨ Save All Settings
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-100">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-500" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-red-600">Delete Account?</h2>
                        </div>
                        <p className="text-gray-600 mb-6 text-center leading-relaxed">
                            This action <span className="font-bold text-red-500">cannot be undone</span>. All your data including medicines, meals, and journal entries will be permanently deleted.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:opacity-90 font-medium transition-all shadow-lg"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}