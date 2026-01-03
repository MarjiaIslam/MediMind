import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MealMate() {
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    foodItems: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
    fetchMealHistory(storedUser.id);
    fetchSuggestions(storedUser.id);
  }, [navigate]);

  const fetchMealHistory = async (userId) => {
    try {
      const response = await fetch(`/api/meals/history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
    }
  };

  const fetchSuggestions = async (userId) => {
    try {
      const response = await fetch(`/api/meals/suggestions/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

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
      const response = await fetch(`/api/meals/log?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ mealType: 'breakfast', foodItems: '', notes: '' });
        fetchMealHistory(user.id); // Refresh list
      } else {
        setError('Failed to log meal.');
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
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            ← Back to Dashboard
          </button>
        </header>

        {/* Log Meal Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Log a New Meal</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
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
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700"
            >
              Log Meal
            </button>
          </form>
        </div>

        {/* Meal History */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Meal History</h2>
          {meals.length === 0 ? (
            <p className="text-gray-600">No meals logged yet.</p>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{meal.mealType}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(meal.loggedAt).toLocaleString()}
                    </span>
                  </div>
                  <p>{meal.foodItems}</p>
                  {meal.notes && <p className="text-sm text-gray-600 italic">{meal.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meal Suggestions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Smart Meal Suggestions</h2>
          {suggestions.length === 0 ? (
            <p className="text-gray-600">No suggestions available.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {suggestions.map((sug, index) => (
                <li key={index}>{sug.name} ({sug.mealType})</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}