export type WeightUnit = 'kg' | 'lb';

export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
}

export interface WorkoutSplit {
  id: string;
  userId: string;
  name: string;
  color: string;
  exercises: Exercise[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  userId: string;
  splitId: string;
  date: string;
  time: string;
  exercises: SessionExercise[];
  createdAt: string;
}

export interface Gym {
  id: string;
  name: string;
  location: string;
  status: 'Open' | 'Closed';
  hours: string;
  distanceKm: number;
}
