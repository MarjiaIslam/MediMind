import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, CheckCircle, Circle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyMedicine({ user }: { user: any }) {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '' });
    const navigate = useNavigate();

    useEffect(() => { fetchMedicines(); }, []);

    const fetchMedicines = async () => {
        const res = await axios.get(`/api/medicine/${user.id}`);
        setMedicines(res.data);
    };

    const addMedicine = async () => {
        if(!newMed.name) return;
        await axios.post('/api/medicine/add', { ...newMed, userId: user.id });
        setNewMed({ name: '', dosage: '', time: '' });
        fetchMedicines();
    };

    const toggleTaken = async (id: number) => {
        await axios.put(`/api/medicine/toggle/${id}`);
        fetchMedicines();
    };

    const deleteMed = async (id: number) => {
        await axios.delete(`/api/medicine/${id}`);
        fetchMedicines();
    };

    return (
        <div className="min-h-screen bg-sage-50 p-6">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-sage-500 font-bold">← Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-sage-500 mb-6">💊 My Medicine Cabinet</h1>

            {/* Add Form */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-2">
                <input placeholder="Medicine Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="p-2 border rounded flex-1" />
                <input placeholder="Dosage (e.g. 500mg)" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="p-2 border rounded w-32" />
                <input placeholder="Time (e.g. 10 AM)" value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} className="p-2 border rounded w-32" />
                <button onClick={addMedicine} className="bg-sage-300 text-white px-4 py-2 rounded hover:bg-sage-500"><Plus/></button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {medicines.map(med => (
                    <div key={med.id} className={`flex justify-between items-center p-4 rounded-xl border transition ${med.isTaken ? 'bg-sage-100 border-sage-200 opacity-70' : 'bg-white border-white shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => toggleTaken(med.id)} className={med.isTaken ? "text-green-500" : "text-gray-300 hover:text-green-500"}>
                                {med.isTaken ? <CheckCircle size={28}/> : <Circle size={28}/>}
                            </button>
                            <div>
                                <h3 className={`font-bold text-lg ${med.isTaken && 'line-through'}`}>{med.name}</h3>
                                <p className="text-sm text-gray-500">{med.dosage} • {med.time}</p>
                            </div>
                        </div>
                        <button onClick={() => deleteMed(med.id)} className="text-red-300 hover:text-red-500"><Trash2/></button>
                    </div>
                ))}
                {medicines.length === 0 && <p className="text-center text-gray-400 mt-10">No medicines added yet.</p>}
            </div>
        </div>
    );
}