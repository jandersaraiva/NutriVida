import React, { useState, useEffect } from 'react';
import { Anamnesis } from '../types';
import { Save, FileText, AlertCircle, Coffee, Moon, Pill, Stethoscope, CheckCircle } from 'lucide-react';

interface AnamnesisFormProps {
  initialData?: Anamnesis;
  onSave: (data: Anamnesis) => void;
}

export const AnamnesisForm: React.FC<AnamnesisFormProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<Anamnesis>(initialData || {
    mainComplaint: '',
    history: '',
    allergies: '',
    medications: '',
    sleepQuality: 'Regular',
    bowelFunction: 'Regular',
    alcohol: '',
    smoker: false,
    notes: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
            <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Stethoscope size={20} className="text-blue-600 dark:text-blue-400" />
                    Anamnese Clínica
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Registro do histórico de saúde e hábitos do paciente.</p>
            </div>
            {isSaved && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                    <CheckCircle size={14} /> Salvo
                </span>
            )}
        </div>

        <div className="p-6 md:p-8 space-y-8">
            
            {/* Seção 1: Queixa Principal */}
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Queixa Principal / Objetivo Específico</label>
                <textarea 
                    name="mainComplaint"
                    value={formData.mainComplaint}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
                    placeholder="Ex: Sente muito cansaço à tarde; quer perder gordura abdominal..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna Esquerda: Saúde */}
                <div className="space-y-6">
                    <h4 className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                        <AlertCircle size={14} /> Histórico de Saúde
                    </h4>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patologias / Histórico Familiar</label>
                        <textarea 
                            name="history"
                            value={formData.history}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                            placeholder="Diabetes, Hipertensão, Colesterol..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alergias / Intolerâncias</label>
                        <input 
                            type="text"
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                            placeholder="Glúten, Lactose, Camarão..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Medicamentos / Suplementos em uso</label>
                        <div className="relative">
                            <Pill className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <textarea 
                                name="medications"
                                value={formData.medications}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                                placeholder="Lista de medicamentos..."
                            />
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Hábitos */}
                <div className="space-y-6">
                    <h4 className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                        <Coffee size={14} /> Estilo de Vida
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Qualidade do Sono</label>
                            <div className="relative">
                                <Moon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select 
                                    name="sleepQuality"
                                    value={formData.sleepQuality}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-slate-100"
                                >
                                    <option value="Ruim">Ruim</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Bom">Bom</option>
                                    <option value="Ótimo">Ótimo</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Intestino</label>
                            <select 
                                name="bowelFunction"
                                value={formData.bowelFunction}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                            >
                                <option value="Constipado">Constipado</option>
                                <option value="Regular">Regular</option>
                                <option value="Solto">Solto</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Consumo de Álcool</label>
                        <input 
                            type="text"
                            name="alcohol"
                            value={formData.alcohol}
                            onChange={handleChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                            placeholder="Frequência e quantidade..."
                        />
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <input 
                            type="checkbox" 
                            id="smoker" 
                            name="smoker" 
                            checked={formData.smoker}
                            onChange={(e) => setFormData(prev => ({...prev, smoker: e.target.checked}))}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <label htmlFor="smoker" className="text-sm font-medium text-slate-700 dark:text-slate-300">Tabagismo (Fumante)</label>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Observações Gerais</label>
                <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                    placeholder="Outras informações relevantes..."
                />
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end">
             <button 
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none font-bold"
            >
                <Save size={18} /> Salvar Anamnese
            </button>
        </div>
      </form>
    </div>
  );
};