export const phoneError = (value: string) => /^\d{11}$/.test(value) ? '' : 'Phone number must be exactly 11 digits.';
export const emailError = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim()) ? '' : 'Enter a valid email address.';
export const requiredError = (label: string, value: string) => value.trim() ? '' : `${label} is required.`;
export const exerciseError = (name: string, sets: number, reps: number) => name.trim() && Number.isInteger(sets) && sets > 0 && Number.isInteger(reps) && reps > 0 ? '' : 'Enter an exercise name, sets, and reps.';
