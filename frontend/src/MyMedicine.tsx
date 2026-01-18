import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, CheckCircle, Circle, Plus, Clock, Bell, Calendar, X, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

interface TodayMedicine {
    medicineId: number;
    medicineName: string;
    dosage: string;
    slot: number;
    time: string;
    taken: boolean;
    daysRemaining: number;
}

interface MedicineSummary {
    totalMedicines: number;
    totalDoses: number;
    takenDoses: number;
    remainingDoses: number;
    adherencePercentage: number;
}

export default function MyMedicine({ user }: { user: any }) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [todayMeds, setTodayMeds] = useState<TodayMedicine[]>([]);
    const [summary, setSummary] = useState<MedicineSummary | null>(null);
    const [reminders, setReminders] = useState<TodayMedicine[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMed, setEditingMed] = useState<Medicine | null>(null);
    const [newMed, setNewMed] = useState({ 
        name: '', 
        dosage: '', 
        time1: '08:00', 
        time2: '', 
        time3: '', 
        durationDays: 30 
    });
    const [tab, setTab] = useState<'today' | 'all'>('today');
    const navigate = useNavigate();

    useEffect(() => { 
        fetchAll();
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        // Check reminders every minute
        const interval = setInterval(checkReminders, 60000);
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
            
            upcomingReminders.forEach((reminder: TodayMedicine) => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('💊 Medicine Reminder', {
                        body: `Time to take ${reminder.medicineName} (${reminder.dosage})`,
                        icon: '/favicon.ico',
                        tag: `med-${reminder.medicineId}-${reminder.slot}`
                    });
                }
            });
        } catch (err) {
            console.error('Error checking reminders:', err);
        }
    };

    const addMedicine = async () => {
        if (!newMed.name || !newMed.time1) return;
        try {
            await axios.post('/api/medicine/add', { 
                ...newMed, 
                userId: user.id,
                time1: formatTimeFor24h(newMed.time1),
                time2: newMed.time2 ? formatTimeFor24h(newMed.time2) : null,
                time3: newMed.time3 ? formatTimeFor24h(newMed.time3) : null
            });
            setNewMed({ name: '', dosage: '', time1: '08:00', time2: '', time3: '', durationDays: 30 });
            setShowAddForm(false);
            fetchAll();
        } catch (err) {
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
            fetchAll();
        } catch (err) {
            console.error('Error toggling medicine:', err);
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

    return (
        <div className="min-h-screen bg-sage-50 p-6">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-sage-500 font-bold">← Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-sage-500 mb-6">💊 My Medicine Cabinet</h1>

            {/* Summary Card */}
            {summary && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
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
                        <div className="bg-sage-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-sage-600">{summary.totalMedicines}</p>
                            <p className="text-xs text-gray-500">Active Medicines</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{summary.takenDoses}</p>
                            <p className="text-xs text-gray-500">Taken</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">{summary.remainingDoses}</p>
                            <p className="text-xs text-gray-500">Remaining</p>
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
                    className={`px-4 py-2 rounded-lg font-medium transition ${tab === 'today' ? 'bg-sage-400 text-white' : 'bg-white text-sage-600 hover:bg-sage-100'}`}
                >
                    Today's Schedule
                </button>
                <button 
                    onClick={() => setTab('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${tab === 'all' ? 'bg-sage-400 text-white' : 'bg-white text-sage-600 hover:bg-sage-100'}`}
                >
                    All Medicines
                </button>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="ml-auto bg-lavender-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-lavender-500 flex items-center gap-2"
                >
                    <Plus size={18} /> Add Medicine
                </button>
            </div>

            {/* Add Medicine Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-sage-600">Add New Medicine</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                                <input 
                                    placeholder="e.g., Vitamin B Complex" 
                                    value={newMed.name} 
                                    onChange={e => setNewMed({...newMed, name: e.target.value})} 
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                                <input 
                                    placeholder="e.g., 500mg, 1 tablet" 
                                    value={newMed.dosage} 
                                    onChange={e => setNewMed({...newMed, dosage: e.target.value})} 
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label>
                                <input 
                                    type="number" 
                                    placeholder="30" 
                                    value={newMed.durationDays} 
                                    onChange={e => setNewMed({...newMed, durationDays: parseInt(e.target.value) || 30})} 
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time 1 *</label>
                                    <input 
                                        type="time" 
                                        value={newMed.time1} 
                                        onChange={e => setNewMed({...newMed, time1: e.target.value})} 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time 2</label>
                                    <input 
                                        type="time" 
                                        value={newMed.time2} 
                                        onChange={e => setNewMed({...newMed, time2: e.target.value})} 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time 3</label>
                                    <input 
                                        type="time" 
                                        value={newMed.time3} 
                                        onChange={e => setNewMed({...newMed, time3: e.target.value})} 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={addMedicine} 
                                className="w-full bg-gradient-to-r from-sage-400 to-lavender-400 text-white py-3 rounded-lg font-semibold hover:from-sage-500 hover:to-lavender-500"
                            >
                                Add Medicine
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Medicine Modal */}
            {editingMed && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-sage-600">Edit Medicine</h2>
                            <button onClick={() => setEditingMed(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                                <input 
                                    value={editingMed.name} 
                                    onChange={e => setEditingMed({...editingMed, name: e.target.value})} 
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                                <input 
                                    value={editingMed.dosage} 
                                    onChange={e => setEditingMed({...editingMed, dosage: e.target.value})} 
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time 1</label>
                                    <input 
                                        type="time" 
                                        value={editingMed.time1 || ''} 
                                        onChange={e => setEditingMed({...editingMed, time1: e.target.value})} 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time 2</label>
                                    <input 
                                        type="time" 
                                        value={editingMed.time2 || ''} 
                                        onChange={e => setEditingMed({...editingMed, time2: e.target.value})} 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time 3</label>
                                    <input 
                                        type="time" 
                                        value={editingMed.time3 || ''} 
                                        onChange={e => setEditingMed({...editingMed, time3: e.target.value})} 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-400 focus:outline-none" 
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={updateMedicine} 
                                className="w-full bg-gradient-to-r from-sage-400 to-lavender-400 text-white py-3 rounded-lg font-semibold hover:from-sage-500 hover:to-lavender-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Today's Schedule Tab */}
            {tab === 'today' && (
                <div className="space-y-3">
                    {todayMeds.length > 0 ? (
                        todayMeds.map((med, idx) => (
                            <div 
                                key={`${med.medicineId}-${med.slot}-${idx}`} 
                                className={`flex justify-between items-center p-4 rounded-xl border transition ${
                                    med.taken 
                                        ? 'bg-sage-100 border-sage-200 opacity-70' 
                                        : 'bg-white border-white shadow-sm'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => toggleSlot(med.medicineId, med.slot)} 
                                        className={med.taken ? "text-green-500" : "text-gray-300 hover:text-green-500"}
                                    >
                                        {med.taken ? <CheckCircle size={28}/> : <Circle size={28}/>}
                                    </button>
                                    <div>
                                        <h3 className={`font-bold text-lg ${med.taken && 'line-through'}`}>{med.medicineName}</h3>
                                        <p className="text-sm text-gray-500">
                                            {med.dosage} • {formatTimeForDisplay(med.time)}
                                            {med.daysRemaining > 0 && (
                                                <span className="ml-2 text-lavender-600">
                                                    ({med.daysRemaining} days left)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-gray-500">{formatTimeForDisplay(med.time)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 mb-4">No medicines scheduled for today.</p>
                            <button 
                                onClick={() => setShowAddForm(true)}
                                className="text-sage-500 font-medium hover:text-sage-600"
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
                                className={`p-4 rounded-xl border transition ${
                                    med.active 
                                        ? 'bg-white border-white shadow-sm' 
                                        : 'bg-gray-100 border-gray-200 opacity-60'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {med.name}
                                            {!med.active && (
                                                <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded">
                                                    Completed
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500">{med.dosage}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setEditingMed(med)} 
                                            className="text-lavender-400 hover:text-lavender-600"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => deleteMed(med.id)} 
                                            className="text-red-300 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {med.time1 && (
                                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                            med.taken1 ? 'bg-green-100 text-green-700' : 'bg-sage-100 text-sage-700'
                                        }`}>
                                            <Clock size={12} /> {formatTimeForDisplay(med.time1)}
                                            {med.taken1 && <CheckCircle size={12} />}
                                        </span>
                                    )}
                                    {med.time2 && (
                                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                            med.taken2 ? 'bg-green-100 text-green-700' : 'bg-sage-100 text-sage-700'
                                        }`}>
                                            <Clock size={12} /> {formatTimeForDisplay(med.time2)}
                                            {med.taken2 && <CheckCircle size={12} />}
                                        </span>
                                    )}
                                    {med.time3 && (
                                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                            med.taken3 ? 'bg-green-100 text-green-700' : 'bg-sage-100 text-sage-700'
                                        }`}>
                                            <Clock size={12} /> {formatTimeForDisplay(med.time3)}
                                            {med.taken3 && <CheckCircle size={12} />}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} /> {med.durationDays} days
                                    </span>
                                    {med.startDate && (
                                        <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                                    )}
                                    {med.endDate && (
                                        <span>Ends: {new Date(med.endDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 mb-4">No medicines added yet.</p>
                            <button 
                                onClick={() => setShowAddForm(true)}
                                className="text-sage-500 font-medium hover:text-sage-600"
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
