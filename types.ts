export interface CheckIn {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  height: number; // meters
  weight: number; // kg
  imc: number;
  bodyFat: number; // %
  muscleMass: number; // %
  bmr: number; // Kcal
  age: number; // years
  visceralFat: number; // level
}

export type ViewState = 'dashboard' | 'history' | 'add_entry' | 'profile';

export interface MetricConfig {
  key: keyof CheckIn;
  label: string;
  unit: string;
  inverse?: boolean; // if true, lower is better (e.g. visceral fat)
}