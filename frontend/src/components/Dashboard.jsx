import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
  }, [navigate]);

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

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Age</p>
              <p className="font-medium">{user.age}</p>
            </div>
            <div>
              <p className="text-gray-600">Weight</p>
              <p className="font-medium">{user.weight} kg</p>
            </div>
            <div>
              <p className="text-gray-600">Allergies</p>
              <p className="font-medium">{user.allergies || 'None'}</p>
            </div>
            <div>
              <p className="text-gray-600">Chronic Conditions</p>
              <p className="font-medium">{user.chronicConditions || 'None'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medicine Tracker */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">MyMedicine</h3>
            <p className="text-gray-600">Track your medications and set reminders.</p>
            <button
              onClick={() => navigate('/medicine')}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Manage Medicines
            </button>
          </div>

          {/* Meal Planner */}
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
    </div>
  );
}
