import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Heart, Droplets, Coffee, Footprints, Dumbbell, Clock, Moon, Briefcase, Activity } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { healthHabitsAPI } from "@/api/healthHabits.api";
import toast from "react-hot-toast";

const patientFormSchema = z.object({
    bpSystolic: z.coerce.number().min(70, "Min 70").max(250, "Max 250"),
    bpDiastolic: z.coerce.number().min(40, "Min 40").max(150, "Max 150"),
    cafeJour: z.coerce.number().min(0, "Min 0").max(20, "Max 20"),
    dailySteps: z.coerce.number().min(0, "Min 0").max(100000, "Max 100000"),
    exerciseHoursPerWeek: z.coerce.number().min(0, "Min 0").max(40, "Max 40"),
    heuresTravailJour: z.coerce.number().min(0, "Min 0").max(24, "Max 24"),
    hoursOfSleep: z.coerce.number().min(0, "Min 0").max(24, "Max 24"),
    litresEauJour: z.coerce.number().min(0, "Min 0").max(10, "Max 10"),
    bedtimeHour: z.string().min(1, "Bedtime is required"),
    activityStatus: z.string().min(1, "Activity status is required"),
    jobType: z.string().min(1, "Job type is required"),
}).refine((data) => data.bpSystolic > data.bpDiastolic, {
    message: "Systolic BP must be higher than Diastolic BP",
    path: ["bpSystolic"],
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
    onSubmit?: (data: any) => void;
    onCancel?: () => void;
}

export const PatientForm = ({ onSubmit, onCancel }: PatientFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            bpSystolic: undefined,
            bpDiastolic: undefined,
            cafeJour: undefined,
            dailySteps: undefined,
            exerciseHoursPerWeek: undefined,
            heuresTravailJour: undefined,
            hoursOfSleep: undefined,
            litresEauJour: undefined,
            bedtimeHour: "",
            activityStatus: "",
            jobType: "",
        },
    });

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const habits = await healthHabitsAPI.getMyHabits();
                if (habits) {
                    reset(habits);
                }
            } catch (error) {
                console.error("Failed to fetch habits:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHabits();
    }, [reset]);

    const onFormSubmit = async (data: PatientFormData) => {
        if (!user?.id) {
            toast.error("User not authenticated");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ...data,
                userId: user.id
            };

            const response = await healthHabitsAPI.createOrUpdate(payload);

            toast.success("Health data saved successfully!");

            if (onSubmit) {
                onSubmit(response);
            }
        } catch (error: any) {
            console.error("❌ Failed to save habits:", error);
            console.error("❌ Error details:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);
            toast.error("Failed to save habits. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Blood Pressure */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        BP Systolic (mmHg)
                    </label>
                    <Input 
                        type="number" 
                        {...register("bpSystolic")} 
                        error={errors.bpSystolic?.message}
                    />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        BP Diastolic (mmHg)
                    </label>
                    <Input 
                        type="number" 
                        {...register("bpDiastolic")} 
                        error={errors.bpDiastolic?.message}
                    />
                </div>
            </div>

            {/* Hydration & Coffee */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        Water (L/day)
                    </label>
                    <Input 
                        type="number" 
                        step="0.1" 
                        {...register("litresEauJour")} 
                        error={errors.litresEauJour?.message}
                    />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Coffee className="h-4 w-4 text-amber-700" />
                        Coffee (cups/day)
                    </label>
                    <Input 
                        type="number" 
                        {...register("cafeJour")} 
                        error={errors.cafeJour?.message}
                    />
                </div>
            </div>

            {/* Activity */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Footprints className="h-4 w-4 text-green-600" />
                        Daily Steps
                    </label>
                    <Input 
                        type="number" 
                        {...register("dailySteps")} 
                        error={errors.dailySteps?.message}
                    />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Dumbbell className="h-4 w-4 text-purple-600" />
                        Exercise (hrs/week)
                    </label>
                    <Input 
                        type="number" 
                        step="0.5" 
                        {...register("exerciseHoursPerWeek")} 
                        error={errors.exerciseHoursPerWeek?.message}
                    />
                </div>
            </div>

            {/* Work & Sleep */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="h-4 w-4 text-gray-600" />
                        Work Hours/Day
                    </label>
                    <Input 
                        type="number" 
                        step="0.5" 
                        {...register("heuresTravailJour")} 
                        error={errors.heuresTravailJour?.message}
                    />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Moon className="h-4 w-4 text-indigo-500" />
                        Sleep (hrs/night)
                    </label>
                    <Input 
                        type="number" 
                        step="0.5" 
                        {...register("hoursOfSleep")} 
                        error={errors.hoursOfSleep?.message}
                    />
                </div>
            </div>

            {/* Bedtime */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    Bedtime
                </label>
                <Input 
                    type="time" 
                    {...register("bedtimeHour")} 
                    error={errors.bedtimeHour?.message}
                />
            </div>

            {/* Activity Status & Job Type */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Activity className="h-4 w-4 text-orange-500" />
                        Activity Status
                    </label>
                    <select
                        {...register("activityStatus")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">Select status</option>
                        <option value="Sédentaire">Sedentary</option>
                        <option value="Actif">Active</option>
                        <option value="Très actif">Very Active</option>
                    </select>
                    {errors.activityStatus && (
                        <p className="text-sm text-red-600 mt-1">{errors.activityStatus.message}</p>
                    )}
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="h-4 w-4 text-gray-600" />
                        Job Type
                    </label>
                    <select
                        {...register("jobType")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">Select type</option>
                        <option value="Manuel">Manual</option>
                        <option value="Bureau">Office</option>
                        <option value="Mixte">Mixed</option>
                        <option value="Télétravail">Remote</option>
                    </select>
                    {errors.jobType && (
                        <p className="text-sm text-red-600 mt-1">{errors.jobType.message}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" variant="primary" className="flex-1 sm:flex-none" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Health Data"}
                </Button>
            </div>
        </form>
    );
};
