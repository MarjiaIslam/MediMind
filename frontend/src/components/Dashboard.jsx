import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [mood, setMood] = useState(3);
  const [moodMessage, setMoodMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [points, setPoints] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    timeOfDay: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Helper to get token safely
  const getToken = () => localStorage.getItem('token');

  // Fetch medicines
  const fetchMedicines = async (userId) => {
    try {
      const token = getToken();
      // FIX: Ensure we use the userId in the URL if the backend requires it, 
      // or rely on the token if your backend supports it. 
      // Based on your previous backend code, passing the ID in the path is safest:
      const response = await fetch(`http://localhost:8080/api/medicines/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedicines(data);

        // Calculate Streak
        const today = new Date();
        let currentStreak = 0;
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const isoDate = checkDate.toISOString().split('T')[0];
          
          const takenOnDate = data.some(med =>
            med.takenToday && 
            new Date(med.loggedAt).toISOString().split('T')[0] === isoDate
          );
          
          if (takenOnDate) currentStreak++;
          else break;
        }
        setStreak(currentStreak);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load medicines.');
    }
  };

  useEffect(() => {
    const initializeDashboard = () => {
      const storedUser = localStorage.getItem('user');
      const token = getToken();
      
      if (!storedUser || !token) {
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Fetch data using the user's ID
      if (parsedUser.id) {
        fetchMedicines(parsedUser.id);
      }
    };

    initializeDashboard();

    // Medicine Reminders
    const checkReminder = () => {
      const now = new Date();
      if (now.getMinutes() === 0) {
        const hour = now.getHours();
        if (hour === 9) alert("⏰ Morning Meds!");
        if (hour === 13) alert("⏰ Afternoon Meds!");
        if (hour === 20) alert("⏰ Evening Meds!");
      }
    };
    
    // Check immediately and then every minute
    checkReminder();
    const interval = setInterval(checkReminder, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
        setError("User not identified. Please login again.");
        return;
    }

    try {
      const token = getToken();
      // --- CRITICAL FIX ---
      // We append ?userId=... to match your MedicineController.java
      const response = await fetch(`http://localhost:8080/api/medicines/add?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newMedicine = await response.json();
        setMedicines([...medicines, newMedicine]);
        setFormData({ name: '', dosage: '', frequency: '', timeOfDay: '' });
        setShowAddModal(false); // Close the beautiful form
      } else {
        setError('Failed to add medicine.');
      }
    } catch (err) {
      console.error(err);
      setError('Server connection failed.');
    }
  };

  const markAsTaken = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/api/medicines/mark-taken/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
          // Update UI instantly
          setMedicines(prev => prev.map(m => m.id === id ? { ...m, takenToday: true } : m));
          setPoints(p => p + 10);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logMood = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8080/api/mood/log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moodRating: mood, message: "Dashboard Log" })
      });
      if (response.ok) {
        const data = await response.json();
        setMoodMessage(data.empathyMessage);
        setTimeout(() => setMoodMessage(''), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-indigo-700">MediMind</h1>
          <div className="flex gap-4 items-center">
            <span className="bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-yellow-200">
              🎯 {points} Points
            </span>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1"><p className="text-sm text-gray-500 uppercase tracking-wide">Name</p><p className="text-lg font-medium text-gray-900">{user.name || "N/A"}</p></div>
            <div className="space-y-1"><p className="text-sm text-gray-500 uppercase tracking-wide">Email</p><p className="text-lg font-medium text-gray-900">{user.email || "N/A"}</p></div>
            <div className="space-y-1"><p className="text-sm text-gray-500 uppercase tracking-wide">Age</p><p className="text-lg font-medium text-gray-900">{user.age || "N/A"}</p></div>
            <div className="space-y-1"><p className="text-sm text-gray-500 uppercase tracking-wide">Weight</p><p className="text-lg font-medium text-gray-900">{user.weight ? `${user.weight} kg` : "N/A"}</p></div>
            <div className="space-y-1"><p className="text-sm text-gray-500 uppercase tracking-wide">Allergies</p><p className="text-lg font-medium text-gray-900">{user.allergies || "None"}</p></div>
            <div className="space-y-1"><p className="text-sm text-gray-500 uppercase tracking-wide">Chronic Conditions</p><p className="text-lg font-medium text-gray-900">{user.chronicConditions || "None"}</p></div>
          </div>
        </div>

        {/* Mood Tracker */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How are you feeling?</h2>
          <div className="bg-gray-50 p-6 rounded-xl">
            <input
              type="range"
              min="1"
              max="5"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              // FIX IS HERE: Removing appearance-none and bg-gray-200 to show default blue slider
              className="w-full h-2 cursor-pointer accent-indigo-600 mb-4"
            />
            <div className="flex justify-between text-sm font-medium text-gray-500 mb-6">
              <span>😔 Sad (1)</span>
              <span>😐 Neutral (3)</span>
              <span>😊 Happy (5)</span>
            </div>
            <button
              onClick={logMood}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Log Mood
            </button>
            {moodMessage && (
              <div className="mt-4 p-4 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 animate-fade-in">
                {moodMessage}
              </div>
            )}
          </div>
        </div>

        {/* Streak Badge */}
        {streak >= 1 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-center shadow-sm">
            <span className="text-2xl mr-3">🏆</span>
            <div>
                <p className="font-bold text-yellow-800 text-lg">{streak}-Day Streak!</p>
                <p className="text-yellow-700 text-sm">You are doing great! Keep it up!</p>
            </div>
          </div>
        )}

        {/* Medicine Manager */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Medicines</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <span>+</span> Add Medicine
            </button>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}
          
          {medicines.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No medicines added yet.</p>
                <p className="text-sm text-gray-400 mt-1">Click the button above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicines.map((med) => (
                <div key={med.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-all">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="font-bold text-gray-800 text-lg">{med.name}</h3>
                    <div className="flex gap-2 text-sm text-gray-600 mt-1">
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{med.dosage}</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{med.frequency}</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{med.timeOfDay}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsTaken(med.id)}
                    disabled={med.takenToday}
                    className={`px-6 py-2 rounded-lg font-medium transition-all w-full sm:w-auto ${
                      med.takenToday
                        ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                    }`}
                  >
                    {med.takenToday ? '✅ Taken Today' : 'Mark as Taken'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MealMate Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold mb-2">MealMate</h3>
            <p className="text-emerald-100">Get personalized healthy meal plans based on your profile.</p>
          </div>
          <button
            onClick={() => navigate('/meals')}
            className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Plan Meals →
          </button>
        </div>

        {/* Beautiful Add Medicine Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
              <div className="bg-indigo-600 p-6 text-white">
                 <h3 className="text-xl font-bold">Add New Medicine</h3>
                 <p className="text-indigo-200 text-sm mt-1">Set up your medication schedule</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g., Paracetamol"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                        <input
                          type="text"
                          name="dosage"
                          placeholder="e.g., 500mg"
                          value={formData.dosage}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <input
                          type="text"
                          name="frequency"
                          placeholder="e.g., Daily"
                          value={formData.frequency}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day</label>
                    <select
                      name="timeOfDay"
                      value={formData.timeOfDay}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      required
                    >
                      <option value="">Select Time</option>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Add Medicine
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}