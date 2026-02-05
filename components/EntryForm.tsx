
import React, { useState, useEffect } from 'react';
import { CheckIn } from '../types';
import { Save, X, Calculator } from 'lucide-react';

interface EntryFormProps {
  onSave: (data: CheckIn) => void;
  onCancel: () => void;
  lastRecord?: CheckIn;
}

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const EntryForm: React.FC<EntryFormProps> = ({ onSave, onCancel, lastRecord }) => {
  const [formData, setFormData] = useState<Omit<CheckIn, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    height: lastRecord?.height || 1.72,
    weight: lastRecord?.weight || 0,
    imc: 0,
    bodyFat: 0,
    muscleMass: 0,
    bmr: 0,
    age: lastRecord?.age || 33,
    visceralFat: 0,
  });

  // Auto-calculate IMC when weight or height changes
  useEffect(() => {
    if (formData.weight > 0 && formData.height > 0) {
      const imc = formData.weight / (formData.height * formData.height);
      setFormData(prev => ({ ...prev, imc: parseFloat(imc.toFixed(1)) }));
    }
  }, [formData.weight, formData.height]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: generateId(),
    });
  };

  const InputGroup = ({ label, name, unit, step = "0.1", type = "number", value }: any) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          required
          type={type}
          id={name}
          name={name}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full bg-slate-50 rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
        {unit && (
          <span className="absolute right-4 top-2.5 text-slate-400 text-sm pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Nova Avaliação Física</h2>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Data da Avaliação" name="date" type="date" value={formData.date} />
            <InputGroup label="Idade" name="age" unit="anos" step="1" value={formData.age} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputGroup label="Altura" name="height" unit="m" step="0.01" value={formData.height} />
            <InputGroup label="Peso" name="weight" unit="kg" value={formData.weight} />
            <div className="relative">
               <InputGroup label="IMC" name="imc" step="0.1" value={formData.imc} />
               <div className="absolute top-0 right-0">
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Calculator size={10} /> Auto
                  </span>
               </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-6 border border-slate-100">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Composição Corporal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Gordura Corporal" name="bodyFat" unit="%" value={formData.bodyFat} />
              <InputGroup label="Massa Muscular" name="muscleMass" unit="%" value={formData.muscleMass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Taxa Metabólica Basal" name="bmr" unit="Kcal" step="1" value={formData.bmr} />
            <InputGroup label="Gordura Visceral" name="visceralFat" step="1" value={formData.visceralFat} />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <Save size={18} /> Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
