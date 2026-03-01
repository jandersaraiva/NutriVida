import React, { useState, useEffect } from 'react';
import { CheckIn } from '../types';
import { Save, X, Calculator, Flame, Activity, Ruler } from 'lucide-react';

interface EntryFormProps {
  onSave: (data: CheckIn) => void;
  onCancel: () => void;
  lastRecord?: CheckIn;
  patientBirthDate?: string;
  initialData?: CheckIn | null;
  patientGender?: 'Masculino' | 'Feminino';
}

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

interface InputGroupProps {
  label: string;
  name: string;
  unit?: string;
  step?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

// Componente extraído para fora para evitar re-renderização e perda de foco
const InputGroup: React.FC<InputGroupProps> = ({ label, name, unit, value, onChange, readOnly, step }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <div className="relative">
        <input
          required={name === 'date' || name === 'weight' || name === 'height'} // Apenas campos essenciais obrigatórios
          readOnly={readOnly}
          type={name === 'date' ? 'date' : 'text'}
          inputMode={name === 'date' ? undefined : 'decimal'}
          step={step}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full rounded-lg border px-4 py-2.5 outline-none transition-all ${
              readOnly 
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {unit && (
          <span className="absolute right-4 top-2.5 text-slate-400 text-sm pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export const EntryForm: React.FC<EntryFormProps> = ({ onSave, onCancel, lastRecord, patientBirthDate, initialData, patientGender }) => {
  const [activeTab, setActiveTab] = useState<'bioimpedance' | 'measurements'>('bioimpedance');

  // Calcula idade baseada na data da avaliação vs data de nascimento
  const calculateAgeAtDate = (dob: string, targetDate: string) => {
    if (!dob || !targetDate) return 0;
    const birth = new Date(dob);
    const target = new Date(targetDate);
    let age = target.getFullYear() - birth.getFullYear();
    const m = target.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && target.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  // State agora usa strings para permitir edição flexível (ex: apagar o 0, digitar vírgula)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    height: lastRecord?.height?.toString() || '1.72',
    weight: lastRecord?.weight?.toString() || '',
    imc: '',
    bodyFat: '',
    muscleMass: '',
    bmr: '',
    age: patientBirthDate ? calculateAgeAtDate(patientBirthDate, new Date().toISOString().split('T')[0]).toString() : (lastRecord?.age?.toString() || '33'),
    bodyAge: lastRecord?.bodyAge?.toString() || '',
    visceralFat: '',
    waistCircumference: '',
    hipCircumference: '',
    chestCircumference: '',
    abdomenCircumference: '',
    armCircumference: '',
    forearmCircumference: '',
    wristCircumference: '',
    thighCircumference: '',
    calfCircumference: '',
  });

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
        setFormData({
            date: initialData.date || new Date().toISOString().split('T')[0],
            height: initialData.height?.toString() || '',
            weight: initialData.weight?.toString() || '',
            imc: initialData.imc?.toString() || '',
            bodyFat: initialData.bodyFat?.toString() || '',
            muscleMass: initialData.muscleMass?.toString() || '',
            bmr: initialData.bmr?.toString() || '',
            age: initialData.age?.toString() || '',
            bodyAge: initialData.bodyAge?.toString() || '',
            visceralFat: initialData.visceralFat?.toString() || '',
            waistCircumference: initialData.waistCircumference?.toString() || '',
            hipCircumference: initialData.hipCircumference?.toString() || '',
            chestCircumference: initialData.chestCircumference?.toString() || '',
            abdomenCircumference: initialData.abdomenCircumference?.toString() || '',
            armCircumference: initialData.armCircumference?.toString() || '',
            forearmCircumference: initialData.forearmCircumference?.toString() || '',
            wristCircumference: initialData.wristCircumference?.toString() || '',
            thighCircumference: initialData.thighCircumference?.toString() || '',
            calfCircumference: initialData.calfCircumference?.toString() || '',
        });
    }
  }, [initialData]);

  // Recalcula idade se a data da avaliação mudar
  useEffect(() => {
    if (patientBirthDate && formData.date) {
        const newAge = calculateAgeAtDate(patientBirthDate, formData.date);
        setFormData(prev => ({ ...prev, age: newAge.toString() }));
    }
  }, [formData.date, patientBirthDate]);

  // Helper para converter string numérica (com . ou ,) para float
  const parseNumber = (val: string) => {
      if (!val) return 0;
      return parseFloat(val.replace(',', '.'));
  };

  // Auto-calculate IMC when weight or height changes
  useEffect(() => {
    const w = parseNumber(formData.weight);
    const h = parseNumber(formData.height);
    
    if (w > 0 && h > 0) {
      const imc = w / (h * h);
      // Só atualiza se o valor calculado for diferente do atual (para evitar loop se usuário estiver editando)
      // Mas aqui é calculado, então sobrescrevemos.
      // Para evitar conflito de edição, idealmente só calculamos se o usuário não estiver editando o IMC manualmente.
      // Como o IMC é readonly ou auto-calculado, vamos assumir que sobrescrever é ok, 
      // mas vamos formatar para string com 1 casa decimal.
      setFormData(prev => ({ ...prev, imc: imc.toFixed(1).replace('.', ',') }));
    }
  }, [formData.weight, formData.height]);

  // Auto-calculate BMR (Mifflin-St Jeor)
  useEffect(() => {
    const w = parseNumber(formData.weight);
    const h = parseNumber(formData.height);
    const a = parseNumber(formData.age);

    if (w > 0 && h > 0 && a > 0 && patientGender) {
        const weightPart = 10 * w;
        const heightPart = 6.25 * (h * 100);
        const agePart = 5 * a;
        
        let bmr = 0;
        if (patientGender === 'Masculino') {
            bmr = weightPart + heightPart - agePart + 5;
        } else {
            bmr = weightPart + heightPart - agePart - 161;
        }
        
        setFormData(prev => ({ ...prev, bmr: Math.round(bmr).toString() }));
    }
  }, [formData.weight, formData.height, formData.age, patientGender]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    if (name === 'date') {
        setFormData(prev => ({ ...prev, [name]: value }));
        return;
    }

    // Fix: Remove leading zero if user types a number after 0 (e.g., "05" -> "5")
    // Keeps "0," or "0." as valid
    if (value.length > 1 && value.startsWith('0') && !['.', ','].includes(value[1])) {
        value = value.substring(1);
    }

    // Validação para permitir apenas números, ponto e vírgula
    // Permite string vazia para apagar o campo
    if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converte de volta para o formato CheckIn (números)
    const payload: CheckIn = {
      id: initialData?.id || generateId(),
      date: formData.date,
      height: parseNumber(formData.height),
      weight: parseNumber(formData.weight),
      imc: parseNumber(formData.imc),
      bodyFat: parseNumber(formData.bodyFat),
      muscleMass: parseNumber(formData.muscleMass),
      bmr: parseNumber(formData.bmr),
      age: parseNumber(formData.age),
      bodyAge: parseNumber(formData.bodyAge),
      visceralFat: parseNumber(formData.visceralFat),
      waistCircumference: parseNumber(formData.waistCircumference),
      hipCircumference: parseNumber(formData.hipCircumference),
      chestCircumference: parseNumber(formData.chestCircumference),
      abdomenCircumference: parseNumber(formData.abdomenCircumference),
      armCircumference: parseNumber(formData.armCircumference),
      forearmCircumference: parseNumber(formData.forearmCircumference),
      wristCircumference: parseNumber(formData.wristCircumference),
      thighCircumference: parseNumber(formData.thighCircumference),
      calfCircumference: parseNumber(formData.calfCircumference),
    };

    onSave(payload);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialData ? 'Editar Avaliação' : 'Nova Avaliação Física'}
          </h2>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data da Avaliação (Comum) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputGroup label="Data da Avaliação" name="date" type="date" value={formData.date} onChange={handleChange} />
             <InputGroup label="Altura" name="height" unit="m" step="0.01" value={formData.height} onChange={handleChange} />
          </div>

          {/* Abas de Navegação */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('bioimpedance')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'bioimpedance'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Activity size={18} />
              Bioimpedância
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('measurements')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'measurements'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Ruler size={18} />
              Medidas Corporais
            </button>
          </div>

          {/* Conteúdo da Aba: Bioimpedância */}
          {activeTab === 'bioimpedance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Peso" name="weight" unit="kg" value={formData.weight} onChange={handleChange} />
                
                <div className="relative">
                   <InputGroup label="IMC" name="imc" step="0.1" value={formData.imc} onChange={handleChange} />
                   <div className="absolute top-0 right-0">
                      <span className="text-[10px] text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Calculator size={10} /> Auto
                      </span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup label="Gordura Corporal" name="bodyFat" unit="%" value={formData.bodyFat} onChange={handleChange} />
                <InputGroup label="Massa Muscular" name="muscleMass" unit="%" value={formData.muscleMass} onChange={handleChange} />
                <InputGroup label="Gordura Visceral" name="visceralFat" step="1" value={formData.visceralFat} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                    <InputGroup label="Taxa Metabólica Basal" name="bmr" unit="Kcal" step="1" value={formData.bmr} onChange={handleChange} />
                    <div className="absolute top-0 right-0">
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/40 px-2 py-0.5 rounded-full flex items-center gap-1" title="Calculado via Mifflin-St Jeor">
                            <Flame size={10} /> Auto
                        </span>
                    </div>
                </div>
                <InputGroup label="Idade Corporal" name="bodyAge" unit="anos" step="1" value={formData.bodyAge} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Conteúdo da Aba: Medidas Corporais */}
          {activeTab === 'measurements' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Tórax" name="chestCircumference" unit="cm" step="0.5" value={formData.chestCircumference} onChange={handleChange} />
                <InputGroup label="Abdome" name="abdomenCircumference" unit="cm" step="0.5" value={formData.abdomenCircumference} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Cintura" name="waistCircumference" unit="cm" step="0.5" value={formData.waistCircumference} onChange={handleChange} />
                <InputGroup label="Quadril" name="hipCircumference" unit="cm" step="0.5" value={formData.hipCircumference} onChange={handleChange} />
              </div>

              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide pt-2 border-t border-slate-100 dark:border-slate-700">Membros Superiores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup label="Braço" name="armCircumference" unit="cm" step="0.5" value={formData.armCircumference} onChange={handleChange} />
                <InputGroup label="Antebraço" name="forearmCircumference" unit="cm" step="0.5" value={formData.forearmCircumference} onChange={handleChange} />
                <InputGroup label="Punho" name="wristCircumference" unit="cm" step="0.5" value={formData.wristCircumference} onChange={handleChange} />
              </div>

              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide pt-2 border-t border-slate-100 dark:border-slate-700">Membros Inferiores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Coxa" name="thighCircumference" unit="cm" step="0.5" value={formData.thighCircumference} onChange={handleChange} />
                <InputGroup label="Panturrilha" name="calfCircumference" unit="cm" step="0.5" value={formData.calfCircumference} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
            >
              <Save size={18} /> {initialData ? 'Salvar Alterações' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};