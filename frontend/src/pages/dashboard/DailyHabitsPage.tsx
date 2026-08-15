import { PatientForm } from '@/components/dashboard/PatientForm';
import { useHealthPlanStore } from '@/store/healthPlanStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const DailyHabitsPage = () => {
    const { fetchHealthPlan } = useHealthPlanStore();
    const navigate = useNavigate();

    const handleFormSubmit = async () => {
        console.log("📝 DailyHabitsPage - Form submitted, refreshing health plan...");
        toast.success("Habits saved! Generating your personalized plan...");

        // Refresh the health plan after habits are saved
        await fetchHealthPlan();

        // Redirect to dashboard to see the new plan
        toast.success("Plan generated! Redirecting to dashboard...");
        setTimeout(() => {
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Daily Habits</h1>
                <p className="text-gray-600">Update your daily health metrics.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <PatientForm onSubmit={handleFormSubmit} />
            </div>
        </div>
    );
};
