import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
    fetchMedicines(storedUser.id);
  }, [navigate]);

  const fetchMedicines = async (userId) => {
    try {
      const response = await fetch(`/api/medicines/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      } else {
        setError('Failed to load medicines.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  const markAsTaken = async (medicineId) => {
    try {
      const response = await fetch(`/api/medicines/mark-taken/${medicineId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const updatedMedicine = await response.json();
        setMedicines(prev =>
          prev.map(med =>
            med.id === updatedMedicine.id ? updatedMedicine : med
          )
        );
      }
    } catch (err) {
      console.error('Error marking medicine as taken:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">MediMind</h1>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </header>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="text-gray-600">Name</p><p>{user.name}</p></div>
            <div><p className="text-gray-600">Email</p><p>{user.email}</p></div>
            <div><p className="text-gray-600">Age</p><p>{user.age}</p></div>
            <div><p className="text-gray-600">Weight</p><p>{user.weight} kg</p></div>
            <div><p className="text-gray-600">Allergies</p><p>{user.allergies || 'None'}</p></div>
            <div><p className="text-gray-600">Chronic Conditions</p><p>{user.chronicConditions || 'None'}</p></div>
          </div>
        </div>

        {/* Medicine Manager */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">MyMedicine</h2>
            <button
              onClick={() => alert('Add medicine form coming soon!')}
              className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700"
            >
              + Add Medicine
            </button>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          {medicines.length === 0 ? (
            <p className="text-gray-600">No medicines added yet.</p>
          ) : (
            <div className="space-y-4">
              {medicines.map((med) => (
                <div key={med.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="font-medium">{med.name}</h3>
                    <p className="text-sm text-gray-600">{med.dosage} • {med.frequency} • {med.timeOfDay}</p>
                  </div>
                  <button
                    onClick={() => markAsTaken(med.id)}
                    disabled={med.takenToday}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      med.takenToday
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {med.takenToday ? '✅ Taken' : 'Mark as Taken'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MealMate */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">MealMate</h3>
          <p className="text-gray-600">Plan healthy meals based on your profile.</p>
          <button
            onClick={() => navigate('/meals')}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Plan Meals
          </button>
        </div>
      </div>
    </div>
  );
}