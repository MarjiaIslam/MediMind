import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Scale, Ruler, Calendar, Activity, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

const profileIcons = ['👤', '😊', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦉', '🐙', '🌸', '⭐', '🌈', '🎮', '🎨', '🎵'];
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
    { value: 'extra', label: 'Extra Active', desc: 'Very hard exercise & physical job' },
];

interface ProfileSetupProps {
    user: any;
    setUser: (user: any) => void;
}

export default function ProfileSetup({ user, setUser }: ProfileSetupProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: user.fullName || '',
        profileIcon: user.profileIcon || '😊',
        age: user.age || '',
        gender: user.gender || '',
        height: user.height || '',
        weight: user.weight || '',
        targetWeight: user.targetWeight || '',
        activityLevel: user.activityLevel || 'moderate',
        conditions: user.conditions || '',
        allergies: user.allergies || '',
    });

    const totalSteps = 4;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep = (): boolean => {
        setError('');
        switch (step) {
            case 1:
                if (!formData.fullName.trim()) {
                    setError('Please enter your full name');
                    return false;
                }
                break;
            case 2:
                if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
                    setError('Please enter a valid age (1-120)');
                    return false;
                }
                if (!formData.gender) {
                    setError('Please select your gender');
                    return false;
                }
                break;
            case 3:
                if (!formData.height || parseFloat(formData.height) < 50 || parseFloat(formData.height) > 300) {
                    setError('Please enter a valid height (50-300 cm)');
                    return false;
                }
                if (!formData.weight || parseFloat(formData.weight) < 10 || parseFloat(formData.weight) > 500) {
                    setError('Please enter a valid weight (10-500 kg)');
                    return false;
                }
                break;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < totalSteps) {
                setStep(step + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            const updateData = {
                id: user.id,
                fullName: formData.fullName,
                profileIcon: formData.profileIcon,
                age: parseInt(formData.age),
                gender: formData.gender,
                height: parseFloat(formData.height),
                weight: parseFloat(formData.weight),
                targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
                activityLevel: formData.activityLevel,
                conditions: formData.conditions,
                allergies: formData.allergies,
                profileSetupComplete: true,
            };

            const res = await axios.put('/api/user/update', updateData);
            const updatedUser = { ...user, ...res.data, profileSetupComplete: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                            s === step
                                ? 'bg-gradient-to-r from-sage-500 to-teal-500 text-white scale-110 shadow-lg'
                                : s < step
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                        }`}
                    >
                        {s < step ? '✓' : s}
                    </div>
                    {s < totalSteps && (
                        <div
                            className={`w-12 h-1 mx-1 transition-all ${
                                s < step ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome to MediMind!</h2>
                <p className="text-gray-600 mt-2">Let's set up your profile to personalize your experience</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 transition outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Profile Icon</label>
                    <div className="grid grid-cols-8 gap-2 p-4 bg-gray-50 rounded-xl">
                        {profileIcons.map((icon) => (
                            <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, profileIcon: icon })}
                                className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 ${
                                    formData.profileIcon === icon
                                        ? 'bg-gradient-to-r from-sage-500 to-teal-500 shadow-lg scale-110'
                                        : 'hover:bg-gray-200'
                                }`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                <p className="text-gray-600 mt-2">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 transition outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                        {genderOptions.map((gender) => (
                            <button
                                key={gender}
                                type="button"
                                onClick={() => setFormData({ ...formData, gender })}
                                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                                    formData.gender === gender
                                        ? 'bg-gradient-to-r from-sage-500 to-teal-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {gender}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scale className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Body Measurements</h2>
                <p className="text-gray-600 mt-2">This helps us calculate your health metrics</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                placeholder="170"
                                min="50"
                                max="300"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 transition outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                        <div className="relative">
                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="70"
                                min="10"
                                max="500"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 transition outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg) - <span className="text-gray-500">Optional</span></label>
                    <input
                        type="number"
                        name="targetWeight"
                        value={formData.targetWeight}
                        onChange={handleChange}
                        placeholder="Your goal weight"
                        min="10"
                        max="500"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 transition outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                    <div className="space-y-2">
                        {activityLevels.map((level) => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                                className={`w-full py-3 px-4 rounded-xl text-left transition-all ${
                                    formData.activityLevel === level.value
                                        ? 'bg-gradient-to-r from-sage-500 to-teal-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <p className="font-medium">{level.label}</p>
                                <p className={`text-sm ${formData.activityLevel === level.value ? 'text-white/80' : 'text-gray-500'}`}>
                                    {level.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Health Information</h2>
                <p className="text-gray-600 mt-2">Optional but helps us give better recommendations</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Conditions <span className="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                        name="conditions"
                        value={formData.conditions}
                        onChange={handleChange}
                        placeholder="e.g., Diabetes, Hypertension, Asthma..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 transition outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergies <span className="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        placeholder="e.g., Peanuts, Shellfish, Penicillin..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 transition outline-none resize-none"
                    />
                </div>

                <div className="bg-gradient-to-r from-sage-100 to-teal-100 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                        <Sparkles className="text-sage-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <p className="font-medium text-sage-800">Almost done!</p>
                            <p className="text-sm text-sage-700">Your profile will help us provide personalized meal suggestions, health tracking, and medicine reminders.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-sage-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                {renderStepIndicator()}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-shake">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                )}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                <div className="flex gap-4 mt-8">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={loading}
                        className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-sage-500 to-teal-500 text-white font-semibold hover:from-sage-600 hover:to-teal-600 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : step === totalSteps ? (
                            <>
                                Complete Setup <Sparkles size={18} />
                            </>
                        ) : (
                            <>
                                Continue <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Step {step} of {totalSteps}
                </p>
            </div>
        </div>
    );
}
