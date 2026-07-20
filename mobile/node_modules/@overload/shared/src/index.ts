export type WeightUnit = 'kg' | 'lb';
export interface User { userId: string; name: string; email: string; unitPreference: 'kg' | 'lbs'; }
export interface RegisterPayload { firstName: string; lastName: string; middleName?: string; email: string; phoneNumber: string; password: string; }
export interface Exercise { id: string; name: string; targetSets: number; targetReps: number; }
export interface Split { id: string; name: string; color: string; exercises: Exercise[]; isActive: boolean; }
export interface SessionExercise { exerciseId: string; name: string; weight: number; weightUnit: WeightUnit; reps: number; weightDelta: number; repsDelta: number; }
export interface SessionRecord { id: string; splitId: string; date: string; time: string; exercises: SessionExercise[]; }
export interface Gym { id: string; name: string; location: string; status: 'Open' | 'Closed'; hours: string; distanceKm: number; }
export interface DashboardData { splits: Split[]; sessions: SessionRecord[]; gyms: Gym[]; }
export type SplitPayload = Omit<Split, 'id'>;
export interface CreateSessionPayload { splitId: string; date: string; exercises: Array<{ exerciseId: string; weight: number; weightUnit: WeightUnit; reps: number }>; }
export interface OtpVerifyResponse { user: User; token?: string; }
