import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MealMate() {
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    mealType: 'Breakfast', // Capitalized to match Java enums usually
    foodItems: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 1. Helper to get the security token
  const getToken = () => localStorage.getItem('token');

  // 2. Fetch History with Token
  const fetchMealHistory = async (userId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/api/meals/history/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Pass the key
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
    }
  };

  // 3. Fetch Suggestions with Token
  const fetchSuggestions = async (userId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/api/meals/suggestions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = getToken();

    // Redirect if no user OR no token
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
    
    // We can safely call these because they are defined outside
    if (storedUser.id) {
        fetchMealHistory(storedUser.id);
        fetchSuggestions(storedUser.id);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = getToken();
      // 4. Log Meal with Token
      const response = await fetch(`http://localhost:8080/api/meals/log?userId=${user.id}`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`, // Pass the key here too!
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ mealType: 'Breakfast', foodItems: '', notes: '' });
        fetchMealHistory(user.id); // Refresh list
      } else {
        const errText = await response.text();
        setError(errText || 'Failed to log meal.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800">MealMate</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm"
          >
            ← Back to Dashboard
          </button>
        </header>

        {/* Log Meal Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Log a New Meal</h2>
          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>

            <input
              type="text"
              name="foodItems"
              placeholder="Food items (e.g., oatmeal, banana)"
              value={formData.foodItems}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            />

            <input
              type="text"
              name="notes"
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 shadow-md"
            >
              Log Meal
            </button>
          </form>
        </div>

        {/* Meal History */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Meal History</h2>
          {meals.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No meals logged yet.</p>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="border-b pb-3 hover:bg-gray-50 p-2 rounded transition">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-emerald-800 uppercase text-sm">{meal.mealType}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(meal.loggedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{meal.foodItems}</p>
                  {meal.notes && <p className="text-sm text-gray-600 italic mt-1">"{meal.notes}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>

       {/* Meal Suggestions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Smart Meal Suggestions</h2>
          {suggestions.length === 0 ? (
            <p className="text-gray-600">No safe meal suggestions found. Try updating your allergies in Settings.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="font-medium text-blue-900">{suggestion.name}</div>
                  <div className="text-xs text-blue-600 capitalize mt-1">{suggestion.mealType}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}