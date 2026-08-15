// Authentication types
export interface SignUpRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    isActive: boolean;
    token: string;
    type: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isProfileComplete: boolean;
    message: string;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    isProfileComplete: boolean;
    createdAt: string;
    lastLogin?: string;
    // SimpleUser specific
    age?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    medicalHistory?: string;
    phoneNumber?: string;
    address?: string;
    // Doctor specific
    specialty?: string;
    licenseNumber?: string;
    // Pharmacy specific
    pharmacyName?: string;
    is24Hours?: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (credentials: SignInRequest) => Promise<void>;
    signUp: (data: SignUpRequest) => Promise<void>;
    verifyEmail: () => void;
    logout: () => void;
    signOut: () => void;
    setUser: (user: User) => void;
}