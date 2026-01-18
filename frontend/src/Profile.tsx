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
        <div className="min-h-screen bg-lavender-50 p-6">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-lavender-600 font-bold">← Back to Dashboard</button>
            
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center gap-6">
                    {/* Profile Picture/Icon */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lavender-300 to-sage-300 flex items-center justify-center overflow-hidden">
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : formData.profileIcon ? (
                                <span className="text-5xl">{formData.profileIcon}</span>
                            ) : (
                                <User size={48} className="text-white" />
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex gap-1">
                            <label className="bg-lavender-400 text-white p-2 rounded-full cursor-pointer hover:bg-lavender-500">
                                <Camera size={16} />
                                <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
                            </label>
                            <button 
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="bg-sage-400 text-white p-2 rounded-full hover:bg-sage-500"
                            >
                                😊
                            </button>
                        </div>
                        {/* Icon Picker Dropdown */}
                        {showIconPicker && (
                            <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl p-3 z-10 w-64">
                                <p className="text-sm text-gray-500 mb-2">Choose an icon</p>
                                <div className="grid grid-cols-8 gap-1">
                                    {profileIcons.map(icon => (
                                        <button 
                                            key={icon}
                                            onClick={() => selectIcon(icon)}
                                            className="text-2xl p-1 hover:bg-lavender-100 rounded"
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">{user.fullName || user.username}</h1>
                        <p className="text-gray-500">@{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className="p-3 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                        <Settings size={24} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'profile' ? 'bg-lavender-400 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                    Profile
                </button>
                <button 
                    onClick={() => setActiveTab('journal')}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'journal' ? 'bg-lavender-400 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                    Mood Journal
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'settings' ? 'bg-lavender-400 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                    Settings
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Edit Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold text-lg mb-4 text-gray-700">Health Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400">Full Name</label>
                                <input type="text" value={formData.fullName || ''} onChange={e=>setFormData({...formData, fullName: e.target.value})} placeholder="Enter your full name" className="w-full p-2 border rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400">Age</label>
                                    <input type="number" value={formData.age || ''} onChange={e=>setFormData({...formData, age: parseInt(e.target.value) || null})} placeholder="Age" className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Gender</label>
                                    <select value={formData.gender || ''} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full p-2 border rounded">
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400">Height (cm)</label>
                                    <input type="number" value={formData.height || ''} onChange={e=>setFormData({...formData, height: parseFloat(e.target.value) || null})} className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Weight (kg)</label>
                                    <input type="number" value={formData.weight || ''} onChange={e=>setFormData({...formData, weight: parseFloat(e.target.value) || null})} className="w-full p-2 border rounded" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Target Weight (kg)</label>
                                <input type="number" value={formData.targetWeight || ''} onChange={e=>setFormData({...formData, targetWeight: parseFloat(e.target.value) || null})} placeholder="Your goal weight" className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Allergies</label>
                                <input placeholder="Peanuts, Shellfish, Seafood..." value={formData.allergies || ''} onChange={e=>setFormData({...formData, allergies: e.target.value})} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Chronic Conditions</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2 flex-wrap mb-2">
                                        {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid'].map(cond => (
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
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${formData.conditions?.includes(cond) ? 'bg-sage-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                            >
                                                {cond}
                                            </button>
                                        ))}
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Or type custom conditions (comma-separated)"
                                        value={formData.conditions || ''} 
                                        onChange={e=>setFormData({...formData, conditions: e.target.value})} 
                                        className="w-full p-2 border rounded" 
                                    />
                                </div>
                            </div>
                            <button onClick={handleUpdate} className="w-full bg-lavender-400 text-white font-bold py-2 rounded hover:bg-lavender-600 transition">Save Changes</button>
                            {msg && <p className="text-green-500 text-center text-sm">{msg}</p>}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* BMI Card */}
                        {bmiInfo && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="font-bold text-lg mb-4 text-gray-700 flex items-center gap-2">
                                    <Scale size={20} /> BMI & Health Info
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-lavender-50 rounded-xl">
                                        <p className={`text-4xl font-bold ${getBmiColor(bmiInfo.category)}`}>
                                            {bmiInfo.bmi.toFixed(1)}
                                        </p>
                                        <p className={`text-sm font-medium ${getBmiColor(bmiInfo.category)}`}>
                                            {bmiInfo.category}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-sage-50 rounded-xl">
                                        <p className="text-4xl font-bold text-sage-600">{bmiInfo.recommendedCalories}</p>
                                        <p className="text-sm text-gray-500">Daily Calories</p>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600">
                                        <strong>Ideal Weight Range:</strong> {bmiInfo.idealWeightMin.toFixed(1)} - {bmiInfo.idealWeightMax.toFixed(1)} kg
                                    </p>
                                    {bmiInfo.weightToLose > 0 && (
                                        <p className="text-sm text-orange-600 mt-1">
                                            💪 To reach ideal: Lose {bmiInfo.weightToLose.toFixed(1)} kg
                                        </p>
                                    )}
                                    {bmiInfo.weightToGain > 0 && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            🍎 To reach ideal: Gain {bmiInfo.weightToGain.toFixed(1)} kg
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mood Tracker */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h3 className="font-bold text-lg mb-4 text-gray-700">Empathy Engine</h3>
                            <p className="mb-2 text-gray-500">How are you feeling today?</p>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {moods.map(m => (
                                    <button key={m} onClick={() => setFormData({...formData, mood: m})} 
                                        className={`text-2xl p-2 rounded-lg transition ${formData.mood === m ? 'bg-lavender-200 scale-110' : 'hover:bg-gray-100 grayscale opacity-50'}`}
                                        title={m.split(' ')[0]}
                                    >
                                        {m.split(' ')[1]}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-lavender-50 p-4 rounded-xl border border-lavender-200 text-center">
                                <p className="text-lavender-600 font-serif italic text-lg">"{currentQuote}"</p>
                            </div>
                            <button 
                                onClick={() => setCurrentQuote(getRandomQuote(formData.mood || 'Happy 😊'))}
                                className="mt-2 text-sm text-lavender-500 hover:text-lavender-700"
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
                    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
                        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                            <Search size={18} className="text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by keyword..." 
                                value={journalSearch}
                                onChange={e => setJournalSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchJournal()}
                                className="bg-transparent outline-none flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-gray-400" />
                            <input 
                                type="date" 
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                className="p-2 border rounded-lg"
                            />
                        </div>
                        <button onClick={searchJournal} className="bg-lavender-400 text-white px-4 py-2 rounded-lg hover:bg-lavender-500">
                            Search
                        </button>
                        <button onClick={() => { setJournalSearch(''); setDateFilter(''); fetchJournal(); }} className="text-gray-500 hover:text-gray-700">
                            Clear
                        </button>
                        <button 
                            onClick={() => setShowJournalForm(true)}
                            className="bg-sage-400 text-white px-4 py-2 rounded-lg hover:bg-sage-500 flex items-center gap-2"
                        >
                            <Plus size={18} /> New Entry
                        </button>
                    </div>

                    {/* Journal Entries */}
                    <div className="space-y-4">
                        {journal.length > 0 ? journal.map(entry => (
                            <div key={entry.id} className="bg-white rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">{entry.title}</h4>
                                        <p className="text-sm text-gray-400">
                                            {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{entry.mood?.split(' ')[1] || '😊'}</span>
                                        <button 
                                            onClick={() => { setEditingEntry(entry); setNewEntry(entry); setShowJournalForm(true); }}
                                            className="text-lavender-400 hover:text-lavender-600"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => deleteJournalEntry(entry.id)}
                                            className="text-red-300 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 whitespace-pre-wrap">{entry.content}</p>
                                {entry.tags && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {entry.tags.split(',').map((tag, i) => (
                                            <span key={i} className="bg-lavender-100 text-lavender-600 px-2 py-1 rounded-full text-xs">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400">
                                <p className="mb-4">No journal entries yet.</p>
                                <button 
                                    onClick={() => setShowJournalForm(true)}
                                    className="text-lavender-500 font-medium"
                                >
                                    + Write your first entry
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Journal Form Modal */}
                    {showJournalForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-lavender-600">
                                        {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
                                    </h2>
                                    <button onClick={() => { setShowJournalForm(false); setEditingEntry(null); setNewEntry({ title: '', content: '', mood: 'Happy 😊', tags: '' }); }} className="text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input 
                                            value={newEntry.title}
                                            onChange={e => setNewEntry({...newEntry, title: e.target.value})}
                                            placeholder="Give your entry a title..."
                                            className="w-full p-3 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">How are you feeling?</label>
                                        <div className="flex flex-wrap gap-2">
                                            {moods.map(m => (
                                                <button 
                                                    key={m}
                                                    onClick={() => setNewEntry({...newEntry, mood: m})}
                                                    className={`px-3 py-1 rounded-full text-sm ${newEntry.mood === m ? 'bg-lavender-400 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">What's on your mind?</label>
                                        <textarea 
                                            value={newEntry.content}
                                            onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                                            placeholder="Write your thoughts..."
                                            rows={6}
                                            className="w-full p-3 border rounded-lg resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                        <input 
                                            value={newEntry.tags}
                                            onChange={e => setNewEntry({...newEntry, tags: e.target.value})}
                                            placeholder="gratitude, work, health..."
                                            className="w-full p-3 border rounded-lg"
                                        />
                                    </div>
                                    <button 
                                        onClick={saveJournalEntry}
                                        className="w-full bg-gradient-to-r from-lavender-400 to-sage-400 text-white py-3 rounded-lg font-semibold hover:from-lavender-500 hover:to-sage-500"
                                    >
                                        {editingEntry ? 'Save Changes' : 'Save Entry'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="font-bold text-lg text-gray-700">Notification Settings</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell className="text-lavender-500" />
                                    <div>
                                        <p className="font-medium">Medicine Reminders</p>
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
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-lavender-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Sound</label>
                                <select 
                                    value={formData.notificationSound || 'default'}
                                    onChange={e => setFormData({...formData, notificationSound: e.target.value})}
                                    className="w-full p-3 border rounded-lg"
                                >
                                    {notificationSounds.map(sound => (
                                        <option key={sound.id} value={sound.id}>{sound.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="font-bold text-lg text-gray-700">Account</h3>
                        </div>
                        <div className="divide-y">
                            <button 
                                onClick={handleLogout}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut className="text-gray-500" />
                                    <span>Log Out</span>
                                </div>
                                <ChevronRight className="text-gray-400" />
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full p-4 flex items-center justify-between hover:bg-red-50 text-red-500"
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 />
                                    <span>Delete Account</span>
                                </div>
                                <ChevronRight />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleUpdate}
                        className="w-full bg-lavender-400 text-white font-bold py-3 rounded-xl hover:bg-lavender-500"
                    >
                        Save All Settings
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account?</h2>
                        <p className="text-gray-600 mb-6">
                            This action cannot be undone. All your data including medicines, meals, and journal entries will be permanently deleted.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}