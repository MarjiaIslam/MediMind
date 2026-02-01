import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, CheckCircle, Circle, Plus, Clock, Bell, Calendar, X, Edit2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    playMedicineAlert, 
    playUrgentAlert, 
    sendMedicineNotification, 
    sendSuccessNotification,
    requestNotificationPermission 
} from './utils/audioNotification';

interface Medicine {
    id: number;
    name: string;
    dosage: string;
    time1: string;
    time2: string;
    time3: string;
    taken1: boolean;
    taken2: boolean;
    taken3: boolean;
    durationDays: number;
    startDate: string;
    endDate: string;
    active: boolean;
    time1TakenAt?: string;
    time2TakenAt?: string;
    time3TakenAt?: string;
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

interface MedicineSummary {
    totalMedicines: number;
    totalDoses: number;
    takenDoses: number;
    remainingDoses: number;
    adherencePercentage: number;
}

// Track which reminders have already been notified to avoid duplicate alerts
const notifiedReminders = new Set<string>();

export default function MyMedicine({ user, setUser }: { user: any, setUser: (u: any) => void }) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [todayMeds, setTodayMeds] = useState<TodayMedicine[]>([]);
    const [summary, setSummary] = useState<MedicineSummary | null>(null);
    const [reminders, setReminders] = useState<TodayMedicine[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMed, setEditingMed] = useState<Medicine | null>(null);
    const [newMed, setNewMed] = useState({ 
        name: '', 
        dosage: '', 
        time1: '', 
        time2: '', 
        time3: '', 
        durationDays: 30 
    });
    const [tab, setTab] = useState<'today' | 'all'>('today');
    const [validationErrors, setValidationErrors] = useState<string>('');
    const navigate = useNavigate();
    
    // Use ref to track the latest user data for achievement counting
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => { 
        fetchAll();
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            requestNotificationPermission();
        }
        // Check reminders every 30 seconds for more accurate timing
        checkReminders();
        const interval = setInterval(checkReminders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAll = async () => {
        try {
            const [medsRes, todayRes, summaryRes, remindersRes] = await Promise.all([
                axios.get(`/api/medicine/${user.id}`),
                axios.get(`/api/medicine/today/${user.id}`),
                axios.get(`/api/medicine/summary/${user.id}`),
                axios.get(`/api/medicine/reminders/${user.id}`)
            ]);
            setMedicines(medsRes.data);
            setTodayMeds(todayRes.data);
            setSummary(summaryRes.data);
            setReminders(remindersRes.data);
        } catch (err) {
            console.error('Error fetching medicines:', err);
        }
    };

    const checkReminders = async () => {
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
                if (timeDiff <= 1 && !notifiedReminders.has(reminderKey)) {
                    notifiedReminders.add(reminderKey);
                    
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

    const addMedicine = async () => {
        // Validation: Check that at least one time slot is provided
        if (!newMed.name) {
            setValidationErrors('Medicine name is required');
            return;
        }
        
        const hasAtLeastOneTime = (newMed.time1 && newMed.time1.trim() !== '') ||
                                  (newMed.time2 && newMed.time2.trim() !== '') ||
                                  (newMed.time3 && newMed.time3.trim() !== '');
        if (!hasAtLeastOneTime) {
            setValidationErrors('At least one time slot must be provided');
            return;
        }
        
        setValidationErrors('');
        
        try {
            const response = await axios.post('/api/medicine/add', { 
                ...newMed, 
                userId: user.id,
                time1: formatTimeFor24h(newMed.time1),
                time2: newMed.time2 ? formatTimeFor24h(newMed.time2) : null,
                time3: newMed.time3 ? formatTimeFor24h(newMed.time3) : null
            });
            
            if (response.status === 200 || response.status === 201) {
                // Play success sound
                playMedicineAlert('success');
                sendSuccessNotification(`${newMed.name} added successfully!`);
                
                setNewMed({ name: '', dosage: '', time1: '', time2: '', time3: '', durationDays: 30 });
                setShowAddForm(false);
                fetchAll();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error adding medicine';
            setValidationErrors(errorMessage);
            console.error('Error adding medicine:', err);
        }
    };

    const updateMedicine = async () => {
        if (!editingMed) return;
        try {
            await axios.put(`/api/medicine/${editingMed.id}`, editingMed);
            setEditingMed(null);
            fetchAll();
        } catch (err) {
            console.error('Error updating medicine:', err);
        }
    };

    const toggleSlot = async (medicineId: number, slot: number) => {
        try {
            await axios.put(`/api/medicine/toggle/${medicineId}/${slot}`);
            // Play success sound when medicine is marked as taken
            playMedicineAlert('success');
            sendSuccessNotification('Medicine marked as taken ✓');
            
            // Check if all medicines for today are now taken and update achievements
            await checkAndUpdateMedicineAchievements();
            
            fetchAll();
        } catch (err) {
            console.error('Error toggling medicine:', err);
        }
    };

    const checkAndUpdateMedicineAchievements = async () => {
        try {
            // Fetch latest summary to check if all doses are taken
            const summaryRes = await axios.get(`/api/medicine/summary/${user.id}`);
            const latestSummary = summaryRes.data;
            
            // If all doses are taken for today, increment perfectMedicineDays
            if (latestSummary.totalDoses > 0 && latestSummary.takenDoses === latestSummary.totalDoses) {
                const today = new Date().toDateString();
                const lastPerfectMedicineDay = localStorage.getItem('lastPerfectMedicineDay');
                
                // Only count once per day
                if (lastPerfectMedicineDay !== today) {
                    localStorage.setItem('lastPerfectMedicineDay', today);
                    
                    // Use ref to get latest user data
                    const currentUser = userRef.current;
                    
                    const updateData = {
                        id: currentUser.id,
                        perfectMedicineDays: (currentUser.perfectMedicineDays || 0) + 1
                    };
                    
                    const res = await axios.put('/api/user/update', updateData);
                    const updatedUser = { ...currentUser, ...res.data };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    userRef.current = updatedUser;
                }
            }
        } catch (err) {
            console.error('Error updating medicine achievements:', err);
        }
    };

    const deleteMed = async (id: number) => {
        if (!confirm('Are you sure you want to delete this medicine?')) return;
        try {
            await axios.delete(`/api/medicine/${id}`);
            fetchAll();
        } catch (err) {
            console.error('Error deleting medicine:', err);
        }
    };

    const formatTimeFor24h = (time: string) => {
        if (!time) return '';
        return time;
    };

    const formatTimeForDisplay = (time: string) => {
        if (!time) return '';
        try {
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        } catch {
            return time;
        }
    };

    const getAdherenceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    // Calculate time difference between scheduled time and when taken
    const getTimeDifference = (scheduledTime: string, takenAt?: string) => {
        if (!takenAt) return null;
        
        const now = new Date();
        const [schedHours, schedMins] = scheduledTime.split(':').map(Number);
        const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), schedHours, schedMins);
        const takenDate = new Date(takenAt);
        
        // Get current time for comparison if taken today
        const takenTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), takenDate.getHours(), takenDate.getMinutes());
        
        const diffMs = takenTime.getTime() - scheduledDate.getTime();
        const diffMins = Math.abs(Math.round(diffMs / 60000));
        
        if (diffMins < 5) return { text: 'On time', color: 'text-green-500', icon: '✓' };
        
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        let timeText = '';
        if (hours > 0 && mins > 0) {
            timeText = `${hours}h ${mins}m`;
        } else if (hours > 0) {
            timeText = `${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            timeText = `${mins} min${mins > 1 ? 's' : ''}`;
        }
        
        if (diffMs < 0) {
            return { text: `${timeText} early`, color: 'text-blue-500', icon: '⏰' };
        } else {
            return { text: `${timeText} late`, color: 'text-orange-500', icon: '⏰' };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sage-50 via-lavender-50 to-sage-100 p-6">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-sage-600 font-bold hover:text-sage-800 flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl hover:bg-white/80 transition">
                <Activity size={18} /> ← Back to Dashboard
            </button>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-sage-400 via-lavender-400 to-sage-400 rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <span className="text-4xl">💊</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Medicine Cabinet</h1>
                        <p className="text-white/80">Track your medications & stay healthy</p>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            {summary && (
                <div className="bg-gradient-to-r from-white to-lavender-50 rounded-xl shadow-lg p-6 mb-6 border border-lavender-100">
                    <h2 className="text-lg font-semibold text-sage-600 mb-4">Today's Progress</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-sage-400 to-lavender-400 transition-all"
                                    style={{ width: `${summary.adherencePercentage}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {summary.takenDoses} of {summary.totalDoses} doses taken
                            </p>
                        </div>
                        <div className={`text-3xl font-bold ${getAdherenceColor(summary.adherencePercentage)}`}>
                            {summary.adherencePercentage}%
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                        <div className="bg-gradient-to-br from-sage-100 to-sage-200 p-3 rounded-lg border border-sage-200">
                            <p className="text-2xl font-bold text-sage-700">{summary.totalMedicines}</p>
                            <p className="text-xs text-sage-600 font-medium">Active Medicines</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-3 rounded-lg border border-green-200">
                            <p className="text-2xl font-bold text-green-700">{summary.takenDoses}</p>
                            <p className="text-xs text-green-600 font-medium">Taken</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-100 to-amber-200 p-3 rounded-lg border border-orange-200">
                            <p className="text-2xl font-bold text-orange-700">{summary.remainingDoses}</p>
                            <p className="text-xs text-orange-600 font-medium">Remaining</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Reminders */}
            {reminders.length > 0 && (
                <div className="bg-gradient-to-r from-lavender-100 to-sage-100 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Bell className="text-lavender-600" size={20} />
                        <h3 className="font-semibold text-lavender-700">Upcoming Reminders</h3>
                    </div>
                    <div className="space-y-2">
                        {reminders.slice(0, 3).map((r, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/60 rounded-lg p-2">
                                <span className="font-medium">{r.medicineName}</span>
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Clock size={14} /> {formatTimeForDisplay(r.time)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button 
                    onClick={() => setTab('today')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition shadow-md ${tab === 'today' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-white text-sage-600 hover:bg-sage-100 border border-sage-200'}`}
                >
                    📅 Today's Schedule
                </button>
                <button 
                    onClick={() => setTab('all')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition shadow-md ${tab === 'all' ? 'bg-gradient-to-r from-lavender-400 to-purple-500 text-white' : 'bg-white text-sage-600 hover:bg-sage-100 border border-sage-200'}`}
                >
                    💊 All Medicines
                </button>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="ml-auto bg-gradient-to-r from-orange-400 to-amber-500 text-white px-5 py-2.5 rounded-xl font-medium hover:from-orange-500 hover:to-amber-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus size={18} /> Add Medicine
                </button>
            </div>

            {/* Add Medicine Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-white via-sage-50 to-lavender-50 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-lavender-100">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-lavender-400 flex items-center justify-center">
                                    <span className="text-xl">💊</span>
                                </div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-sage-600 to-lavender-600 bg-clip-text text-transparent">Add New Medicine</h2>
                            </div>
                            <button onClick={() => { setShowAddForm(false); setValidationErrors(''); }} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full hover:bg-gray-100 transition">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Validation Error Display */}
                        {validationErrors && (
                            <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
                                <p className="text-red-700 font-medium text-sm">⚠️ {validationErrors}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-sage-700 mb-1">Medicine Name *</label>
                                <input 
                                    placeholder="e.g., Vitamin B Complex" 
                                    value={newMed.name} 
                                    onChange={e => setNewMed({...newMed, name: e.target.value})} 
                                    className="w-full p-3 border-2 border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:border-sage-400 focus:outline-none bg-white/80" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-sage-700 mb-1">Dosage</label>
                                <input 
                                    placeholder="e.g., 500mg, 1 tablet" 
                                    value={newMed.dosage} 
                                    onChange={e => setNewMed({...newMed, dosage: e.target.value})} 
                                    className="w-full p-3 border-2 border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-lavender-400 focus:outline-none bg-white/80" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-sage-700 mb-1">Duration (days) *</label>
                                <input 
                                    type="number" 
                                    placeholder="30" 
                                    value={newMed.durationDays} 
                                    onChange={e => setNewMed({...newMed, durationDays: parseInt(e.target.value) || 30})} 
                                    className="w-full p-3 border-2 border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:border-sage-400 focus:outline-none bg-white/80" 
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-green-600 mb-1">
                                        🌅 Morning
                                    </label>
                                    <input 
                                        type="time" 
                                        value={newMed.time1} 
                                        onChange={e => setNewMed({...newMed, time1: e.target.value})} 
                                        className="w-full p-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none bg-green-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-amber-600 mb-1">☀️ Afternoon</label>
                                    <input 
                                        type="time" 
                                        value={newMed.time2} 
                                        onChange={e => setNewMed({...newMed, time2: e.target.value})} 
                                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none bg-amber-50/50" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-600 mb-1">🌙 Evening</label>
                                    <input 
                                        type="time" 
                                        value={newMed.time3} 
                                        onChange={e => setNewMed({...newMed, time3: e.target.value})} 
                                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none bg-indigo-50/50" 
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={addMedicine} 
                                className="w-full bg-gradient-to-r from-sage-400 via-lavender-400 to-sage-400 text-white py-3 rounded-xl font-semibold hover:from-sage-500 hover:via-lavender-500 hover:to-sage-500 shadow-lg hover:shadow-xl transition-all"
                            >
                                ✨ Add Medicine
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Medicine Modal */}
            {editingMed && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-white via-lavender-50 to-sage-50 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-sage-100">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender-400 to-sage-400 flex items-center justify-center">
                                    <Edit2 size={18} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-lavender-600 to-sage-600 bg-clip-text text-transparent">Edit Medicine</h2>
                            </div>
                            <button onClick={() => setEditingMed(null)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full hover:bg-gray-100 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-lavender-700 mb-1">Medicine Name</label>
                                <input 
                                    value={editingMed.name} 
                                    onChange={e => setEditingMed({...editingMed, name: e.target.value})} 
                                    className="w-full p-3 border-2 border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-lavender-400 focus:outline-none bg-white/80" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-lavender-700 mb-1">Dosage</label>
                                <input 
                                    value={editingMed.dosage} 
                                    onChange={e => setEditingMed({...editingMed, dosage: e.target.value})} 
                                    className="w-full p-3 border-2 border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:border-sage-400 focus:outline-none bg-white/80" 
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-green-600 mb-1">🌅 Morning</label>
                                    <input 
                                        type="time" 
                                        value={editingMed.time1 || ''} 
                                        onChange={e => setEditingMed({...editingMed, time1: e.target.value})} 
                                        className="w-full p-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none bg-green-50/50" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-amber-600 mb-1">☀️ Afternoon</label>
                                    <input 
                                        type="time" 
                                        value={editingMed.time2 || ''} 
                                        onChange={e => setEditingMed({...editingMed, time2: e.target.value})} 
                                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none bg-amber-50/50" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-600 mb-1">🌙 Evening</label>
                                    <input 
                                        type="time" 
                                        value={editingMed.time3 || ''} 
                                        onChange={e => setEditingMed({...editingMed, time3: e.target.value})} 
                                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none bg-indigo-50/50" 
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={updateMedicine} 
                                className="w-full bg-gradient-to-r from-lavender-400 via-sage-400 to-lavender-400 text-white py-3 rounded-xl font-semibold hover:from-lavender-500 hover:via-sage-500 hover:to-lavender-500 shadow-lg hover:shadow-xl transition-all"
                            >
                                ✨ Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Today's Schedule Tab */}
            {tab === 'today' && (
                <div className="space-y-3">
                    {todayMeds.length > 0 ? (
                        todayMeds.map((med, idx) => {
                            const timeDiff = med.taken ? getTimeDifference(med.time, med.takenAt || new Date().toISOString()) : null;
                            return (
                                <div 
                                    key={`${med.medicineId}-${med.slot}-${idx}`} 
                                    className={`flex justify-between items-center p-4 rounded-xl border-2 transition ${
                                        med.taken 
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                                            : 'bg-white border-lavender-100 shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => toggleSlot(med.medicineId, med.slot)} 
                                            className={`transition-transform hover:scale-110 ${med.taken ? "text-green-500" : "text-gray-300 hover:text-green-500"}`}
                                        >
                                            {med.taken ? <CheckCircle size={32}/> : <Circle size={32}/>}
                                        </button>
                                        <div>
                                            <h3 className={`font-bold text-lg ${med.taken ? 'line-through text-gray-400' : 'text-gray-800'}`}>{med.medicineName}</h3>
                                            <p className="text-sm text-gray-500">
                                                <span className="bg-lavender-100 text-lavender-700 px-2 py-0.5 rounded-full text-xs font-medium mr-2">{med.dosage}</span>
                                                <span className="text-sage-600 font-medium">{formatTimeForDisplay(med.time)}</span>
                                                {med.daysRemaining > 0 && (
                                                    <span className="ml-2 text-lavender-600 text-xs">
                                                        ({med.daysRemaining} days left)
                                                    </span>
                                                )}
                                            </p>
                                            {med.taken && timeDiff && (
                                                <p className={`text-xs mt-1 font-medium ${timeDiff.color}`}>
                                                    {timeDiff.icon} Taken {timeDiff.text}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${med.taken ? 'bg-green-100' : 'bg-sage-100'}`}>
                                        <Clock size={16} className={med.taken ? 'text-green-500' : 'text-sage-500'} />
                                        <span className={med.taken ? 'text-green-600 font-medium' : 'text-sage-600'}>{formatTimeForDisplay(med.time)}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-lavender-200">
                            <p className="text-gray-400 mb-4">No medicines scheduled for today.</p>
                            <button 
                                onClick={() => setShowAddForm(true)}
                                className="text-lavender-500 font-medium hover:text-lavender-600"
                            >
                                + Add your first medicine
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* All Medicines Tab */}
            {tab === 'all' && (
                <div className="space-y-3">
                    {medicines.length > 0 ? (
                        medicines.map(med => (
                            <div 
                                key={med.id} 
                                className={`p-4 rounded-xl border-2 transition ${
                                    med.active 
                                        ? 'bg-white border-lavender-100 shadow-md hover:shadow-lg' 
                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                                            💊 {med.name}
                                            {!med.active && (
                                                <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">
                                                    Completed
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-lavender-600 font-medium">{med.dosage}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setEditingMed(med)} 
                                            className="text-lavender-400 hover:text-lavender-600 bg-lavender-50 p-2 rounded-lg transition hover:bg-lavender-100"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => deleteMed(med.id)} 
                                            className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition hover:bg-red-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {med.time1 && (
                                        <span className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 font-medium ${
                                            med.taken1 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-sage-100 to-sage-200 text-sage-700 border border-sage-200'
                                        }`}>
                                            <Clock size={14} /> {formatTimeForDisplay(med.time1)}
                                            {med.taken1 && <CheckCircle size={14} className="text-green-500" />}
                                        </span>
                                    )}
                                    {med.time2 && (
                                        <span className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 font-medium ${
                                            med.taken2 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-lavender-100 to-lavender-200 text-lavender-700 border border-lavender-200'
                                        }`}>
                                            <Clock size={14} /> {formatTimeForDisplay(med.time2)}
                                            {med.taken2 && <CheckCircle size={14} className="text-green-500" />}
                                        </span>
                                    )}
                                    {med.time3 && (
                                        <span className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 font-medium ${
                                            med.taken3 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                                        }`}>
                                            <Clock size={14} /> {formatTimeForDisplay(med.time3)}
                                            {med.taken3 && <CheckCircle size={14} className="text-green-500" />}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                    <span className="flex items-center gap-1 text-sage-600">
                                        <Calendar size={14} /> {med.durationDays} days
                                    </span>
                                    {med.startDate && (
                                        <span className="text-lavender-600">Started: {new Date(med.startDate).toLocaleDateString()}</span>
                                    )}
                                    {med.endDate && (
                                        <span className="text-orange-600">Ends: {new Date(med.endDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-lavender-200">
                            <p className="text-gray-400 mb-4">No medicines added yet.</p>
                            <button 
                                onClick={() => setShowAddForm(true)}
                                className="text-lavender-500 font-medium hover:text-lavender-600"
                            >
                                + Add your first medicine
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
