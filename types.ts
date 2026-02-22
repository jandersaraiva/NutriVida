
export interface CheckIn {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  height: number; // meters
  weight: number; // kg
  imc: number;
  bodyFat: number; // %
  muscleMass: number; // %
  bmr: number; // Kcal
  age: number; // years (chronological)
  bodyAge: number; // years (bioimpedance)
  visceralFat: number; // level
  waistCircumference?: number; // cm (Cintura)
  hipCircumference?: number; // cm (Quadril)
  chestCircumference?: number; // cm (Tórax)
  abdomenCircumference?: number; // cm (Abdome)
  armCircumference?: number; // cm (Braço)
  forearmCircumference?: number; // cm (Antebraço)
  wristCircumference?: number; // cm (Punho)
  thighCircumference?: number; // cm (Coxa)
  calfCircumference?: number; // cm (Panturrilha)
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
  waterTarget?: number; // Nova propriedade: Meta de água em ml
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Meal[];
  notes?: string;
}

export interface Anamnesis {
  mainComplaint: string;
  history: string;
  allergies: string;
  medications: string;
  sleepQuality: 'Ruim' | 'Regular' | 'Bom' | 'Ótimo';
  bowelFunction: 'Constipado' | 'Regular' | 'Solto';
  alcohol: string;
  smoker: boolean;
  notes: string;
}

// 1.2 (Sedentário) a 1.9 (Extremamente ativo)
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

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
  activityFactor: ActivityLevel; // Nova Propriedade Nutricional
  checkIns: CheckIn[];
  dietPlans: DietPlan[];
  anamnesis?: Anamnesis;
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
  birthDate: string;
  photo?: string; // URL ou Base64 da imagem
}

export type ViewState = 'home' | 'patients' | 'schedule' | 'add_entry' | 'select_patient_for_entry' | 'profile_settings' | 'active_diets' | 'assessment_report';

export type PatientTab = 'overview' | 'anamnesis' | 'history' | 'diet' | 'profile';

export interface MetricConfig {
  key: keyof CheckIn;
  label: string;
  unit: string;
  inverse?: boolean;
}
