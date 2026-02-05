
import React, { useState, useEffect } from 'react';
import { DietPlan as DietPlanType, Meal, FoodItem } from '../types';
import { Clock, Plus, Trash2, Edit2, Save, X, ChefHat, Copy, Check } from 'lucide-react';

interface DietPlanProps {
  diet?: DietPlanType;
  onUpdateDiet: (diet: DietPlanType) => void;
  patientName: string;
}

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const DietPlan: React.FC<DietPlanProps> = ({ diet, onUpdateDiet, patientName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Local state for editing form
  const [editForm, setEditForm] = useState<DietPlanType>(() => diet || {
    id: generateId(),
    lastUpdated: new Date().toISOString(),
    meals: [],
    notes: ''
  });

  // Reset form when entering edit mode if diet prop changed
  useEffect(() => {
    if (diet) {
      setEditForm(diet);
    } else {
      // Caso não tenha dieta, reseta para template vazio seguro
      setEditForm({
        id: generateId(),
        lastUpdated: new Date().toISOString(),
        meals: [],
        notes: ''
      });
    }
  }, [diet, isEditing]);

  const handleCopyDiet = () => {
    if (!diet) return;
    
    let text = `📅 Plano Alimentar - ${patientName}\n\n`;
    diet.meals.forEach(meal => {
        text += `⏰ ${meal.time} - ${meal.name}\n`;
        meal.items.forEach(item => {
            text += `• ${item.quantity} ${item.name}\n`;
        });
        text += '\n';
    });
    
    if (diet.notes) {
        text += `📝 Observações: ${diet.notes}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMeal = () => {
    const newMeal: Meal = {
        id: generateId(),
        name: 'Nova Refeição',
        time: '08:00',
        items: []
    };
    setEditForm(prev => ({...prev, meals: [...prev.meals, newMeal]}));
  };

  const handleRemoveMeal = (mealId: string) => {
    setEditForm(prev => ({...prev, meals: prev.meals.filter(m => m.id !== mealId)}));
  };

  const handleMealChange = (mealId: string, field: keyof Meal, value: string) => {
    setEditForm(prev => ({
        ...prev,
        meals: prev.meals.map(m => m.id === mealId ? { ...m, [field]: value } : m)
    }));
  };

  const handleAddItem = (mealId: string) => {
    const newItem: FoodItem = {
        id: generateId(),
        name: '',
        quantity: ''
    };
    setEditForm(prev => ({
        ...prev,
        meals: prev.meals.map(m => m.id === mealId ? { ...m, items: [...m.items, newItem] } : m)
    }));
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    setEditForm(prev => ({
        ...prev,
        meals: prev.meals.map(m => m.id === mealId ? { ...m, items: m.items.filter(i => i.id !== itemId) } : m)
    }));
  };

  const handleItemChange = (mealId: string, itemId: string, field: keyof FoodItem, value: string) => {
    setEditForm(prev => ({
        ...prev,
        meals: prev.meals.map(m => {
            if (m.id === mealId) {
                return {
                    ...m,
                    items: m.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
                };
            }
            return m;
        })
    }));
  };

  const handleSave = () => {
    // Sort meals by time
    const sortedMeals = [...editForm.meals].sort((a, b) => a.time.localeCompare(b.time));
    onUpdateDiet({
        ...editForm,
        lastUpdated: new Date().toISOString(),
        meals: sortedMeals
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Editar Dieta</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
                    >
                        <Save size={18} /> Salvar
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {editForm.meals.map((meal, index) => (
                    <div key={meal.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex flex-wrap gap-4 items-end mb-4">
                            <div className="w-32">
                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Horário</label>
                                <input 
                                    type="time" 
                                    value={meal.time}
                                    onChange={(e) => handleMealChange(meal.id, 'time', e.target.value)}
                                    className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nome da Refeição</label>
                                <input 
                                    type="text" 
                                    value={meal.name}
                                    onChange={(e) => handleMealChange(meal.id, 'name', e.target.value)}
                                    placeholder="Ex: Café da Manhã"
                                    className="w-full bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => handleRemoveMeal(meal.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                            {meal.items.map((item) => (
                                <div key={item.id} className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(meal.id, item.id, 'quantity', e.target.value)}
                                        placeholder="Qtd (Ex: 200g)"
                                        className="w-32 bg-white text-slate-900 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    />
                                    <input 
                                        type="text" 
                                        value={item.name}
                                        onChange={(e) => handleItemChange(meal.id, item.id, 'name', e.target.value)}
                                        placeholder="Alimento (Ex: Arroz Integral)"
                                        className="flex-1 bg-white text-slate-900 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    />
                                    <button 
                                        onClick={() => handleRemoveItem(meal.id, item.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => handleAddItem(meal.id)}
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 mt-2"
                            >
                                <Plus size={16} /> Adicionar Alimento
                            </button>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={handleAddMeal}
                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-medium flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Adicionar Refeição
                </button>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observações Gerais</label>
                    <textarea 
                        rows={3}
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                        className="w-full bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        placeholder="Instruções sobre água, suplementação, etc..."
                    />
                </div>
            </div>
        </div>
    );
  }

  // View Mode
  if (!diet || !diet.meals || diet.meals.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-300 text-center p-8">
              <div className="bg-slate-50 p-4 rounded-full mb-4 text-slate-400">
                <ChefHat size={48} />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhuma dieta cadastrada</h3>
              <p className="text-slate-500 mb-6 max-w-md">Crie um plano alimentar personalizado para este paciente para acompanhar sua nutrição.</p>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                <Plus size={20} /> Criar Plano Alimentar
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Plano Alimentar Atual</h2>
                <p className="text-sm text-slate-500">
                    Última atualização: {new Date(diet.lastUpdated).toLocaleDateString('pt-BR')}
                </p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handleCopyDiet}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                   {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                   {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
                >
                    <Edit2 size={18} /> Editar
                </button>
            </div>
        </div>

        {/* Timeline View */}
        <div className="relative space-y-4">
            {/* Vertical Line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 hidden sm:block"></div>

            {diet.meals.map((meal, index) => (
                <div key={meal.id} className="relative flex flex-col sm:flex-row gap-4 sm:gap-8 group">
                    {/* Time Bubble */}
                    <div className="hidden sm:flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-emerald-100 text-emerald-700 flex flex-col items-center justify-center shadow-sm z-10 group-hover:border-emerald-500 group-hover:scale-110 transition-all">
                            <Clock size={16} className="mb-0.5" />
                            <span className="text-xs font-bold">{meal.time}</span>
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-emerald-200">
                        <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
                             <div className="sm:hidden flex items-center gap-2 text-emerald-700 font-bold mb-1">
                                <Clock size={16} />
                                {meal.time}
                             </div>
                             <h3 className="font-bold text-lg text-slate-800">{meal.name}</h3>
                             <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                {meal.items.length} itens
                             </span>
                        </div>
                        
                        <ul className="space-y-2">
                            {meal.items.map((item) => (
                                <li key={item.id} className="flex items-start text-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 mr-3 shrink-0"></span>
                                    <span className="font-semibold text-slate-700 mr-1.5">{item.quantity}</span>
                                    <span className="text-slate-600">{item.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>

        {diet.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mt-8">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    Observações
                </h4>
                <p className="text-amber-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {diet.notes}
                </p>
            </div>
        )}
    </div>
  );
};
