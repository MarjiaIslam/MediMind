import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Plus, Save, X, Search, Calendar, Tag, Smile, Meh, Frown, Heart, Star, Trash2, Edit2, ChevronDown } from 'lucide-react';
import axios from 'axios';

interface JournalEntry {
    id?: number;
    userId: number;
    title: string;
    content: string;
    mood: string;
    tags: string;
    createdAt?: string;
    updatedAt?: string;
}

const MOODS = [
    { name: 'Happy', emoji: '😊', color: 'from-yellow-400 to-amber-400' },
    { name: 'Excited', emoji: '🤩', color: 'from-pink-400 to-rose-400' },
    { name: 'Calm', emoji: '😌', color: 'from-green-400 to-emerald-400' },
    { name: 'Grateful', emoji: '🙏', color: 'from-purple-400 to-violet-400' },
    { name: 'Tired', emoji: '😴', color: 'from-blue-400 to-indigo-400' },
    { name: 'Anxious', emoji: '😰', color: 'from-orange-400 to-red-400' },
    { name: 'Sad', emoji: '😢', color: 'from-slate-400 to-gray-500' },
    { name: 'Angry', emoji: '😤', color: 'from-red-500 to-red-600' },
];

export default function Journal({ user, setUser }: { user: any, setUser: (u: any) => void }) {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    
    // Use ref to track the latest user data for achievement counting
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMood, setFilterMood] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    
    const [newEntry, setNewEntry] = useState<JournalEntry>({
        userId: user.id,
        title: '',
        content: '',
        mood: '',
        tags: ''
    });

    useEffect(() => {
        fetchEntries();
    }, [user.id]);

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/journal/${user.id}`);
            setEntries(res.data);
        } catch (err) {
            console.error('Failed to fetch journal entries:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const saveEntry = async () => {
        if (!newEntry.content.trim()) {
            alert('Please write something in your journal entry!');
            return;
        }
        
        try {
            const entryToSave = {
                ...newEntry,
                userId: user.id,
                title: newEntry.title || `Journal Entry - ${new Date().toLocaleDateString()}`
            };
            
            const res = await axios.post('/api/journal/add', entryToSave);
            
            // Add the new entry to the list immediately
            const savedEntry = res.data;
            setEntries(prevEntries => [savedEntry, ...prevEntries]);
            
            // Reset form
            setNewEntry({ userId: user.id, title: '', content: '', mood: '', tags: '' });
            setShowAddForm(false);
            
            // Show success message
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            
            // Use ref to get latest user data for accurate counting
            const currentUser = userRef.current;
            
            // Update user's journal entry count and persist to backend
            const hour = new Date().getHours();
            const isMorning = hour >= 5 && hour < 12;
            const isEvening = hour >= 18 && hour < 24;
            
            const updateData: any = { 
                id: currentUser.id,
                journalEntries: (currentUser.journalEntries || 0) + 1 
            };
            
            // Track morning/evening logs
            if (isMorning) {
                updateData.morningLogs = (currentUser.morningLogs || 0) + 1;
            }
            if (isEvening) {
                updateData.eveningLogs = (currentUser.eveningLogs || 0) + 1;
            }
            
            const userRes = await axios.put('/api/user/update', updateData);
            const updatedUser = { ...currentUser, ...userRes.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            userRef.current = updatedUser;
            
            // Refresh entries list from server to ensure sync
            fetchEntries();
        } catch (err) {
            console.error('Failed to save entry:', err);
            alert('Failed to save your journal entry. Please try again.');
        }
    };

    const updateEntry = async () => {
        if (!editingEntry || !editingEntry.content.trim()) return;
        
        try {
            const res = await axios.put(`/api/journal/${editingEntry.id}`, editingEntry);
            setEntries(entries.map(e => e.id === editingEntry.id ? res.data : e));
            setEditingEntry(null);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to update entry:', err);
            alert('Failed to update your journal entry. Please try again.');
        }
    };

    const deleteEntry = async (id: number) => {
        try {
            await axios.delete(`/api/journal/${id}`);
            setEntries(entries.filter(e => e.id !== id));
            setDeleteConfirm(null);
            
            // Show delete success message
            setDeleteSuccess(true);
            setTimeout(() => setDeleteSuccess(false), 3000);
            // Note: We don't decrement journalEntries for achievements - 
            // achievements track lifetime activity, not current count
        } catch (err) {
            console.error('Failed to delete entry:', err);
            alert('Failed to delete the journal entry. Please try again.');
        }
    };

    const getMoodInfo = (moodName: string) => {
        return MOODS.find(m => m.name === moodName) || { name: moodName, emoji: '📝', color: 'from-gray-400 to-gray-500' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = !searchQuery || 
            entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.tags?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMood = !filterMood || entry.mood === filterMood;
        return matchesSearch && matchesMood;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
                    ✅ Journal entry saved successfully!
                </div>
            )}
            
            {/* Delete Success Toast */}
            {deleteSuccess && (
                <div className="fixed top-4 right-4 bg-gradient-to-r from-red-400 to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
                    🗑️ Journal entry deleted!
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm !== null && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                                <Trash2 className="text-red-500" size={32} />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Delete Entry?</h2>
                        <p className="text-center text-gray-500 mb-6">Are you sure you want to delete this journal entry? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => deleteEntry(deleteConfirm)}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 text-white font-semibold hover:from-red-500 hover:to-pink-600 transition shadow-lg"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => navigate('/dashboard')} className="mb-4 text-purple-600 font-bold hover:text-purple-800 flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl hover:bg-white/80 transition">
                <Activity size={18} /> ← Back to Dashboard
            </button>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <BookOpen className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Mood Journal</h1>
                            <p className="text-white/80">Express yourself & track your emotional journey</p>
                        </div>
                    </div>
                    <div className="text-right text-white">
                        <p className="text-3xl font-bold">{entries.length}</p>
                        <p className="text-sm opacity-80">Total Entries</p>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-4 mb-6">
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                    <Plus size={20} /> Write New Entry
                </button>
                
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search your journal..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none bg-white"
                    />
                </div>
                
                <select
                    value={filterMood}
                    onChange={e => setFilterMood(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none bg-white font-medium"
                >
                    <option value="">All Moods</option>
                    {MOODS.map(mood => (
                        <option key={mood.name} value={mood.name}>{mood.emoji} {mood.name}</option>
                    ))}
                </select>
            </div>

            {/* Add/Edit Entry Modal */}
            {(showAddForm || editingEntry) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                    <BookOpen className="text-white" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
                                </h2>
                            </div>
                            <button 
                                onClick={() => { setShowAddForm(false); setEditingEntry(null); }} 
                                className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full hover:bg-gray-100 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">Title (optional)</label>
                                <input
                                    placeholder="Give your entry a title..."
                                    value={editingEntry ? editingEntry.title : newEntry.title}
                                    onChange={e => editingEntry 
                                        ? setEditingEntry({...editingEntry, title: e.target.value})
                                        : setNewEntry({...newEntry, title: e.target.value})
                                    }
                                    className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none text-lg"
                                />
                            </div>
                            
                            {/* Mood Selector */}
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">How are you feeling?</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {MOODS.map(mood => (
                                        <button
                                            key={mood.name}
                                            onClick={() => editingEntry 
                                                ? setEditingEntry({...editingEntry, mood: mood.name})
                                                : setNewEntry({...newEntry, mood: mood.name})
                                            }
                                            className={`p-3 rounded-xl text-center transition-all transform hover:scale-105 ${
                                                (editingEntry ? editingEntry.mood : newEntry.mood) === mood.name
                                                    ? `bg-gradient-to-r ${mood.color} text-white shadow-lg`
                                                    : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                                            }`}
                                        >
                                            <span className="text-2xl">{mood.emoji}</span>
                                            <p className="text-xs mt-1 font-medium">{mood.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">What's on your mind? *</label>
                                <textarea
                                    placeholder="Write your thoughts, feelings, and reflections here..."
                                    value={editingEntry ? editingEntry.content : newEntry.content}
                                    onChange={e => editingEntry 
                                        ? setEditingEntry({...editingEntry, content: e.target.value})
                                        : setNewEntry({...newEntry, content: e.target.value})
                                    }
                                    rows={8}
                                    className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none resize-none"
                                />
                            </div>
                            
                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">
                                    <Tag size={14} className="inline mr-1" /> Tags (comma-separated)
                                </label>
                                <input
                                    placeholder="e.g., health, exercise, gratitude, work"
                                    value={editingEntry ? editingEntry.tags : newEntry.tags}
                                    onChange={e => editingEntry 
                                        ? setEditingEntry({...editingEntry, tags: e.target.value})
                                        : setNewEntry({...newEntry, tags: e.target.value})
                                    }
                                    className="w-full p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                />
                            </div>
                            
                            {/* Save Button */}
                            <button
                                onClick={editingEntry ? updateEntry : saveEntry}
                                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={24} /> {editingEntry ? 'Update Entry' : 'Save Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Entries List */}
            {isLoading ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-purple-600">Loading your journal...</p>
                </div>
            ) : filteredEntries.length > 0 ? (
                <div className="space-y-4">
                    {filteredEntries.map(entry => {
                        const moodInfo = getMoodInfo(entry.mood);
                        return (
                            <div 
                                key={entry.id} 
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-purple-400"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${moodInfo.color} flex items-center justify-center text-2xl`}>
                                            {moodInfo.emoji}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{entry.title || 'Untitled Entry'}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar size={14} /> {entry.createdAt ? formatDate(entry.createdAt) : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingEntry(entry)}
                                            className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition"
                                            title="Edit entry"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(entry.id!)}
                                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                                            title="Delete entry"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-gray-700 whitespace-pre-wrap mb-4 leading-relaxed">
                                    {entry.content.length > 300 ? entry.content.substring(0, 300) + '...' : entry.content}
                                </p>
                                
                                {entry.tags && (
                                    <div className="flex flex-wrap gap-2">
                                        {entry.tags.split(',').map((tag, i) => (
                                            <span 
                                                key={i} 
                                                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                                            >
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-purple-200">
                    <BookOpen className="mx-auto text-purple-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">
                        {searchQuery || filterMood ? 'No entries found' : 'Your journal is empty'}
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {searchQuery || filterMood 
                            ? 'Try adjusting your search or filters'
                            : 'Start writing your first entry to track your mood and thoughts!'
                        }
                    </p>
                    {!searchQuery && !filterMood && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                            <Plus size={20} className="inline mr-2" /> Write Your First Entry
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
