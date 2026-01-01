import React from 'react';
import { Droplets, Activity, Utensils, Award } from 'lucide-react';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-sage-100 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-sage-700">Hello, {user.fullName || 'User'} 👋</h1>
          <p className="text-gray-600">Here is your daily health overview.</p>
        </div>
        <button onClick={logout} className="bg-red-400 text-white px-4 py-2 rounded">Logout</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-400">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500">Hydration</h3>
            <Droplets className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold mt-2">1.2 / 2.5 L</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-400">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500">Calories</h3>
            <Utensils className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold mt-2">1200 / 2200 kcal</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-400">
           <div className="flex justify-between items-center">
            <h3 className="text-gray-500">Medicines</h3>
            <Activity className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold mt-2">2 Remaining</p>
        </div>
         <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-400">
           <div className="flex justify-between items-center">
            <h3 className="text-gray-500">Level</h3>
            <Award className="text-yellow-400" />
          </div>
          <p className="text-2xl font-bold mt-2">Silver Badge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-sage-700 mb-4">Today's Medicine Schedule</h2>
          <ul className="space-y-3">
            <li className="flex justify-between p-3 bg-gray-50 rounded">
              <span>💊 Vitamin B</span>
              <span className="text-sage-700 font-bold">10:00 AM (Taken)</span>
            </li>
            <li className="flex justify-between p-3 bg-red-50 rounded border border-red-100">
              <span>💊 Metformin</span>
              <span className="text-red-500 font-bold">02:00 PM (Missed)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}