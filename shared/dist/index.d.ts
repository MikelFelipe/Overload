export type WeightUnit = 'kg' | 'lb';
export type SplitType = 'full_body' | 'upper' | 'lower' | 'anterior' | 'posterior' | 'push' | 'pull' | 'legs' | 'custom';
export interface User {
    userId: string;
    name: string;
    email: string;
    unitPreference: 'kg' | 'lbs';
}
export interface RegisterPayload {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phoneNumber: string;
    password: string;
}
export interface Exercise {
    id: string;
    name: string;
    targetSets: number;
    targetReps: number;
}
export interface Split {
    id: string;
    name: string;
    color: string;
    splitType?: SplitType;
    exercises: Exercise[];
    isActive: boolean;
}
export interface SessionExercise {
    exerciseId: string;
    name: string;
    weight: number;
    weightUnit: WeightUnit;
    reps: number;
    weightDelta: number;
    repsDelta: number;
}
export interface SessionRecord {
    id: string;
    splitId: string;
    date: string;
    time: string;
    notes?: string;
    exercises: SessionExercise[];
}
export interface Gym {
    id: string;
    name: string;
    location: string;
    status: 'Open' | 'Closed';
    hours: string;
    distanceKm: number;
}
export interface WeeklyStreak {
    current: number;
    best: number;
    completedWeeks: number;
    target: number;
}
export interface DashboardData {
    splits: Split[];
    sessions: SessionRecord[];
    gyms: Gym[];
    weeklyStreak?: WeeklyStreak;
    stats?: {
        weeklyStreak?: WeeklyStreak;
    };
}
export type SplitPayload = Omit<Split, 'id'>;
export interface CreateSessionPayload {
    splitId: string;
    date: string;
    notes?: string;
    exercises: Array<{
        exerciseId: string;
        weight: number;
        weightUnit: WeightUnit;
        reps: number;
    }>;
}
export interface OtpVerifyResponse {
    user: User;
    token?: string;
}
export interface ProfilePreferences {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber: string;
    unitPreference: 'kg' | 'lbs';
    weeklyTarget: number;
    timezone: string;
    theme: 'system' | 'light' | 'dark';
    notificationsEnabled: boolean;
}
export interface ProfilePreferencesUpdate {
    name: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber: string;
    unitPreference: 'kg' | 'lbs';
    weeklyTarget: number;
    timezone: string;
    theme: 'system' | 'light' | 'dark';
    notificationsEnabled: boolean;
}
