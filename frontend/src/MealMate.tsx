import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Plus, Trash2, Edit2, Clock, ArrowLeft, Save, X, Loader } from 'lucide-react';

interface Meal {
    id: number;
    mealType: string;
    foodItems: string;
    notes: string;
    loggedAt: string;
}

export default function MealMate({ user, setUser }: { user: any, setUser: any }) {
    const navigate = useNavigate();
    const [step, setStep] = useState('menu'); // menu, select-items, select-cuisine, suggestions, history, edit, manual-log
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    
    // Selection state
    const [selectedFoodItems, setSelectedFoodItems] = useState<string[]>([]);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [availableFoodItems, setAvailableFoodItems] = useState<string[]>([]);
    const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
    
    // Food items pagination
    const [foodItemsPage, setFoodItemsPage] = useState(0);
    const itemsPerPage = 4;
    
    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState({
        mealType: '',
        foodItems: '',
        notes: ''
    });

    // Manual meal form
    const [formData, setFormData] = useState({
        mealType: 'breakfast',
        foodItems: '',
        notes: ''
    });

    useEffect(() => {
        if (user?.id) {
            fetchMealHistory();
            fetchAvailableOptions();
        }
    }, [user?.id]);

    const fetchMealHistory = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const res = await axios.get(`/api/meals/history/${user.id}`);
            setMeals(res.data);
        } catch (err) {
            console.error('Failed to fetch meals:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableOptions = async () => {
        try {
            const [foodRes, cuisineRes] = await Promise.all([
                axios.get('/api/meals/suggestions/food-items'),
                axios.get('/api/meals/suggestions/cuisines')
            ]);
            setAvailableFoodItems(foodRes.data);
            setAvailableCuisines(cuisineRes.data);
        } catch (err) {
            console.error('Failed to fetch options:', err);
        }
    };

    const handleGetSuggestions = async () => {
        if (selectedFoodItems.length === 0) {
            alert('Please select at least one food item');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`/api/meals/suggestions/recommended?userId=${user.id}`, {
                foodItems: selectedFoodItems,
                cuisines: selectedCuisines
            });
            setSuggestions(res.data);
            setStep('suggestions');
        } catch (err) {
            console.error('Failed to get suggestions:', err);
            alert('Failed to get meal suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleLogSuggestion = async (mealName: string) => {
        try {
            setLoading(true);
            await axios.post(`/api/meals/suggestions/log?userId=${user.id}&mealName=${encodeURIComponent(mealName)}`);
            alert('Meal logged successfully!');
            await fetchMealHistory();
            setStep('history');
            // Reset selections
            setSelectedFoodItems([]);
            setSelectedCuisines([]);
        } catch (err) {
            console.error('Failed to log meal:', err);
            alert('Failed to log meal');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.foodItems.trim()) {
            alert('Please enter food items');
            return;
        }
        try {
            setLoading(true);
            await axios.post(`/api/meals/log?userId=${user.id}`, formData);
            setFormData({ mealType: 'breakfast', foodItems: '', notes: '' });
            await fetchMealHistory();
            alert('Meal logged successfully!');
            setStep('history');
        } catch (err) {
            console.error('Failed to log meal:', err);
            alert('Failed to log meal');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (mealId: number) => {
        if (!window.confirm('Are you sure you want to delete this meal?')) return;
        try {
            setLoading(true);
            await axios.delete(`/api/meals/${mealId}`);
            await fetchMealHistory();
            alert('Meal deleted successfully!');
        } catch (err) {
            console.error('Failed to delete meal:', err);
            alert('Failed to delete meal');
        } finally {
            setLoading(false);
        }
    };

    const handleEditStart = (meal: Meal) => {
        setEditingId(meal.id);
        setEditFormData({
            mealType: meal.mealType,
            foodItems: meal.foodItems,
            notes: meal.notes
        });
    };

    const handleEditSave = async (mealId: number) => {
        if (!editFormData.foodItems.trim()) {
            alert('Please enter food items');
            return;
        }
        try {
            setLoading(true);
            await axios.put(`/api/meals/${mealId}`, editFormData);
            setEditingId(null);
            await fetchMealHistory();
            alert('Meal updated successfully!');
        } catch (err) {
            console.error('Failed to update meal:', err);
            alert('Failed to update meal');
        } finally {
            setLoading(false);
        }
    };

    const toggleFoodItem = (item: string) => {
        setSelectedFoodItems(prev => 
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines(prev => 
            prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const paginatedFoodItems = availableFoodItems.slice(foodItemsPage * itemsPerPage, (foodItemsPage + 1) * itemsPerPage);
    const totalPages = Math.ceil(availableFoodItems.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-teal-50 font-sans">
            <nav className="bg-white shadow-sm p-4 px-8 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
                    <button 
                        onClick={() => {
                            if (step !== 'menu') {
                                setStep('menu');
                                setSelectedFoodItems([]);
                                setSelectedCuisines([]);
                            } else {
                                navigate('/dashboard');
                            }
                        }}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    🍽️ MealMate - Smart Nutrition Planner
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-400">Logged in as</p>
                    <p className="font-semibold text-gray-700">{user?.fullName}</p>
                </div>
            </nav>

            <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">

                {/* Main Menu */}
                {step === 'menu' && (
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg p-8 text-center space-y-6">
                        <h2 className="text-4xl font-bold text-white">Welcome to MealMate!</h2>
                        <p className="text-lg text-white/90">Get personalized meal suggestions or log your meals manually</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <button
                                onClick={() => {
                                    setSelectedFoodItems([]);
                                    setSelectedCuisines([]);
                                    setFoodItemsPage(0);
                                    setStep('select-items');
                                }}
                                className="bg-white text-emerald-600 font-bold py-4 rounded-xl hover:shadow-lg transition text-lg flex items-center justify-center gap-2"
                            >
                                ✨ Get Smart Suggestions <ChevronRight />
                            </button>

                            <button
                                onClick={() => setStep('manual-log')}
                                className="bg-white text-teal-600 font-bold py-4 rounded-xl hover:shadow-lg transition text-lg flex items-center justify-center gap-2"
                            >
                                ✍️ Log Meal Manually <ChevronRight />
                            </button>

                            <button
                                onClick={() => setStep('history')}
                                className="bg-white text-cyan-600 font-bold py-4 rounded-xl hover:shadow-lg transition text-lg flex items-center justify-center gap-2"
                            >
                                📋 View Meal History <ChevronRight />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1: Select Food Items */}
                {step === 'select-items' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-emerald-600 mb-2">Step 1: What food items do you crave?</h3>
                            <p className="text-gray-600">Select one or more ingredients you'd like to include</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {paginatedFoodItems.map(item => (
                                <button
                                    key={item}
                                    onClick={() => toggleFoodItem(item)}
                                    className={`p-4 rounded-xl font-semibold transition border-2 ${
                                        selectedFoodItems.includes(item)
                                            ? 'bg-emerald-500 text-white border-emerald-600'
                                            : 'bg-emerald-50 text-gray-700 border-emerald-200 hover:border-emerald-400'
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setFoodItemsPage(Math.max(0, foodItemsPage - 1))}
                                    disabled={foodItemsPage === 0}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                                >
                                    ← Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {foodItemsPage + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setFoodItemsPage(Math.min(totalPages - 1, foodItemsPage + 1))}
                                    disabled={foodItemsPage === totalPages - 1}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg disabled:opacity-50"
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={() => setStep('select-cuisine')}
                                disabled={selectedFoodItems.length === 0 || loading}
                                className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Next: Choose Cuisine →'}
                            </button>
                            <button
                                onClick={() => setStep('menu')}
                                className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <p className="text-sm text-blue-700">💡 <strong>Selected:</strong> {selectedFoodItems.join(', ') || 'None'}</p>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Cuisine */}
                {step === 'select-cuisine' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-teal-600 mb-2">Step 2: What cuisine are you craving?</h3>
                            <p className="text-gray-600">Select one or more cuisines (or skip to get all suggestions)</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableCuisines.map(cuisine => (
                                <button
                                    key={cuisine}
                                    onClick={() => toggleCuisine(cuisine)}
                                    className={`p-4 rounded-xl font-semibold transition border-2 ${
                                        selectedCuisines.includes(cuisine)
                                            ? 'bg-teal-500 text-white border-teal-600'
                                            : 'bg-teal-50 text-gray-700 border-teal-200 hover:border-teal-400'
                                    }`}
                                >
                                    {cuisine}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleGetSuggestions}
                                disabled={loading}
                                className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : '✨'} Get Recommendations
                            </button>
                            <button
                                onClick={() => setStep('select-items')}
                                className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
                            >
                                Back
                            </button>
                        </div>

                        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                            <p className="text-sm text-purple-700">🍴 <strong>Cuisines:</strong> {selectedCuisines.length > 0 ? selectedCuisines.join(', ') : 'Any (will show all matches)'}</p>
                        </div>
                    </div>
                )}

                {/* Step 3: Show Suggestions */}
                {step === 'suggestions' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-emerald-600 mb-2">✨ Smart Recommendations</h3>
                                <p className="text-gray-600">Based on your preferences and health profile (Height: {user.height}cm, Weight: {user.weight}kg)</p>
                            </div>
                            <button
                                onClick={() => setStep('select-items')}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <Loader className="animate-spin mx-auto mb-4" size={32} />
                                <p className="text-gray-500">Generating personalized suggestions...</p>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                No meals found matching your criteria. Try different selections.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Allergy Warning Banner */}
                                {suggestions.some(s => s.hasAllergyRisk) && (
                                    <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">⚠️</span>
                                            <div>
                                                <p className="font-bold text-red-700">Allergy Warning</p>
                                                <p className="text-sm text-red-600">Some meal suggestions below may contain ingredients you're allergic to. Please check the warnings carefully.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestions.map((meal, idx) => (
                                    <div
                                        key={idx}
                                        className={`bg-gradient-to-br p-6 rounded-xl border-2 transition ${
                                            meal.hasAllergyRisk 
                                                ? 'from-red-50 to-orange-50 border-red-300 hover:border-red-400' 
                                                : 'from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-400'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-emerald-700 mb-1 flex items-center gap-2">
                                                    {meal.name}
                                                    {meal.hasAllergyRisk && <span className="text-red-500">⚠️</span>}
                                                </h4>
                                                <p className="text-sm text-gray-600">{meal.description}</p>
                                            </div>
                                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ml-2">
                                                {meal.calories} kcal
                                            </span>
                                        </div>

                                        {/* Allergy Warnings */}
                                        {meal.allergyWarnings && meal.allergyWarnings.length > 0 && (
                                            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-xs font-bold text-red-700 mb-1">⚠️ ALLERGY WARNING</p>
                                                <ul className="text-xs text-red-600 space-y-1">
                                                    {meal.allergyWarnings.map((warning: string, i: number) => (
                                                        <li key={i}>• {warning}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Health Warnings */}
                                        {meal.healthWarnings && meal.healthWarnings.length > 0 && (
                                            <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <p className="text-xs font-bold text-yellow-700 mb-1">⚡ Health Consideration</p>
                                                <ul className="text-xs text-yellow-700 space-y-1">
                                                    {meal.healthWarnings.map((warning: string, i: number) => (
                                                        <li key={i}>• {warning}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="mb-3 space-y-1">
                                            <p className="text-xs text-gray-600"><strong>Cuisine:</strong> {meal.cuisine}</p>
                                            <p className="text-xs text-gray-600"><strong>Category:</strong> {meal.mainIngredient}</p>
                                        </div>

                                        {/* Health Compatibility */}
                                        <div className="mb-4 bg-white rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-gray-700">Health Match</span>
                                                <span className={`text-sm font-bold ${
                                                    meal.compatibility >= 70 ? 'text-green-600' : 
                                                    meal.compatibility >= 40 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>{meal.compatibility}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${
                                                        meal.compatibility >= 70 ? 'bg-green-500' : 
                                                        meal.compatibility >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${meal.compatibility}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Dietary Flags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {meal.dietaryFlags.map((flag: string) => (
                                                <span
                                                    key={flag}
                                                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                                                >
                                                    {flag}
                                                </span>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (meal.hasAllergyRisk) {
                                                    if (!confirm('⚠️ WARNING: This meal contains ingredients you may be allergic to. Are you sure you want to log this meal?')) {
                                                        return;
                                                    }
                                                }
                                                handleLogSuggestion(meal.name);
                                            }}
                                            disabled={loading}
                                            className={`w-full font-bold py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                                                meal.hasAllergyRisk 
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                            }`}
                                        >
                                            {loading ? <Loader className="animate-spin" size={16} /> : <Plus size={16} />}
                                            {meal.hasAllergyRisk ? 'Log Anyway (Caution)' : 'Log This Meal'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            </div>
                        )}

                        <button
                            onClick={() => setStep('menu')}
                            className="w-full bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
                        >
                            Back to Menu
                        </button>
                    </div>
                )}

                {/* Manual Meal Logging */}
                {step === 'manual-log' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-emerald-600 mb-2">✍️ Log Your Meal</h3>
                                <p className="text-gray-600">Quickly log any meal you've eaten</p>
                            </div>
                            <button
                                onClick={() => setStep('menu')}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Type</label>
                                <select
                                    value={formData.mealType}
                                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 outline-none transition"
                                >
                                    <option value="breakfast">🌅 Breakfast</option>
                                    <option value="lunch">🍽️ Lunch</option>
                                    <option value="dinner">🌙 Dinner</option>
                                    <option value="snack">🍿 Snack</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Food Items *</label>
                                <textarea
                                    value={formData.foodItems}
                                    onChange={(e) => setFormData({ ...formData, foodItems: e.target.value })}
                                    placeholder="e.g., Grilled chicken, brown rice, steamed broccoli"
                                    rows={3}
                                    className="w-full p-3 bg-gray-50 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 outline-none transition"
                                />
                                <p className="text-xs text-gray-500 mt-1">Describe the foods you ate in detail</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="e.g., Portion size, cooking method, how you felt after eating..."
                                    rows={2}
                                    className="w-full p-3 bg-gray-50 rounded-lg border-2 border-gray-200 focus:border-teal-500 outline-none transition"
                                />
                            </div>

                            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded">
                                <p className="text-sm text-emerald-700">💡 <strong>Tip:</strong> Be as detailed as possible about ingredients to get better health insights!</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
                                    {loading ? 'Logging...' : 'Log This Meal'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('menu');
                                        setFormData({ mealType: 'breakfast', foodItems: '', notes: '' });
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* History View */}
                {step === 'history' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-cyan-600 flex items-center gap-2">
                                <Clock size={28} /> Meal History
                            </h2>
                            <button
                                onClick={() => setStep('menu')}
                                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                            >
                                ← Back to Menu
                            </button>
                        </div>

                        {loading && meals.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">Loading meals...</div>
                        ) : meals.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">No meals logged yet. Start by getting smart suggestions!</div>
                        ) : (
                            <div className="space-y-4">
                                {meals.map((meal) => (
                                    <div key={meal.id} className="p-4 bg-cyan-50 rounded-xl border border-cyan-200 hover:border-emerald-300 transition">
                                        {editingId === meal.id ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Type</label>
                                                        <select
                                                            value={editFormData.mealType}
                                                            onChange={(e) => setEditFormData({ ...editFormData, mealType: e.target.value })}
                                                            className="w-full p-2 bg-emerald-50 rounded-lg border border-emerald-200 outline-none"
                                                        >
                                                            <option value="breakfast">Breakfast</option>
                                                            <option value="lunch">Lunch</option>
                                                            <option value="dinner">Dinner</option>
                                                            <option value="snack">Snack</option>
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Food Items</label>
                                                        <input
                                                            type="text"
                                                            value={editFormData.foodItems}
                                                            onChange={(e) => setEditFormData({ ...editFormData, foodItems: e.target.value })}
                                                            className="w-full p-2 bg-emerald-50 rounded-lg border border-emerald-200 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                                    <textarea
                                                        value={editFormData.notes}
                                                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                                        rows={2}
                                                        className="w-full p-2 bg-emerald-50 rounded-lg border border-emerald-200 outline-none"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditSave(meal.id)}
                                                        className="flex-1 bg-green-500 text-white font-bold p-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                                                    >
                                                        <Save size={18} /> Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="flex-1 bg-gray-400 text-white font-bold p-2 rounded-lg hover:bg-gray-500 transition flex items-center justify-center gap-2"
                                                    >
                                                        <X size={18} /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="inline-block bg-cyan-100 text-cyan-600 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                                                            {meal.mealType}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{formatDate(meal.loggedAt)}</span>
                                                    </div>
                                                    <p className="text-gray-700 font-semibold mb-1">{meal.foodItems}</p>
                                                    {meal.notes && <p className="text-sm text-gray-500 italic">{meal.notes}</p>}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditStart(meal)}
                                                        className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(meal.id)}
                                                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}