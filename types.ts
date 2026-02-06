
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

export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
}

export interface Meal {
  id: string;
  name: string;
  time: string; // HH:mm
  items: FoodItem[];
}

export interface DietPlan {
  id: string;
  name: string; // Ex: "Plano Hipertrofia - Fev/26"
  status: 'active' | 'archived';
  createdAt: string;
  lastUpdated: string;
  totalCalories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Meal[];
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  gender: 'Masculino' | 'Feminino';
  age: number; 
  profession: string;
  phone: string;
  instagram: string;
  address?: string; 
  birthDate: string;
  objective: string;
  avatarColor: string;
  status: 'active' | 'trash';
  checkIns: CheckIn[];
  dietPlans: DietPlan[]; // Alterado de 'diet' para array de planos
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'Consulta' | 'Retorno' | 'Avaliação';
  status: 'Agendado' | 'Concluído' | 'Cancelado';
  notes?: string;
}

export interface Nutritionist {
  name: string;
  crn: string;
  email: string;
  phone: string;
  clinicName: string;
  address: string;
}

export type ViewState = 'home' | 'patients' | 'schedule' | 'add_entry' | 'select_patient_for_entry' | 'profile_settings' | 'active_diets';

export type PatientTab = 'overview' | 'history' | 'diet' | 'profile';

export interface MetricConfig {
  key: keyof CheckIn;
  label: string;
  unit: string;
  inverse?: boolean;
}
