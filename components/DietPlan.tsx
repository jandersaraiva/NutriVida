
import React, { useState, useEffect, useMemo } from 'react';
import { DietPlan as DietPlanType, Meal, FoodItem } from '../types';
import { Clock, Plus, Trash2, Edit2, Save, X, ChefHat, Copy, Check, PieChart } from 'lucide-react';

interface DietPlanProps {
  diet?: DietPlanType;
  onUpdateDiet: (diet: DietPlanType) => void;
  patientName: string;
  patientWeight?: number;
}

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const DietPlan: React.FC<DietPlanProps> = ({ diet, onUpdateDiet, patientName, patientWeight = 70 }) => {
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
            text += `• ${item.quantity} ${item.name} (${item.calories} kcal)\n`;
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
        quantity: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
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
                    items: m.items.map(i => {
                        if (i.id === itemId) {
                            const updatedItem = { ...i, [field]: value };
                            // Auto calc logic if one of macros changed
                            if (field === 'protein' || field === 'carbs' || field === 'fats') {
                                const p = parseFloat(String(updatedItem.protein) || '0');
                                const c = parseFloat(String(updatedItem.carbs) || '0');
                                const f = parseFloat(String(updatedItem.fats) || '0');
                                updatedItem.calories = (p * 4) + (c * 4) + (f * 9);
                            }
                            return updatedItem;
                        }
                        return i;
                    })
                };
            }
            return m;
        })
    }));
  };

  const handleSave = () => {
    const sortedMeals = [...editForm.meals].sort((a, b) => a.time.localeCompare(b.time));
    onUpdateDiet({
        ...editForm,
        lastUpdated: new Date().toISOString(),
        meals: sortedMeals
    });
    setIsEditing(false);
  };

  // Cálculo dos totais
  const totals = useMemo(() => {
    const data = isEditing ? editForm : diet;
    if (!data) return { kcal: 0, p: 0, c: 0, f: 0 };

    let totalKcal = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    data.meals.forEach(meal => {
        meal.items.forEach(item => {
            totalP += Number(item.protein) || 0;
            totalC += Number(item.carbs) || 0;
            totalF += Number(item.fats) || 0;
            // Se tiver calorias definidas (mesmo que manuais), usa elas, senão calcula
            totalKcal += Number(item.calories) || ((Number(item.protein) || 0) * 4 + (Number(item.carbs) || 0) * 4 + (Number(item.fats) || 0) * 9);
        });
    });

    return { kcal: totalKcal, p: totalP, c: totalC, f: totalF };
  }, [diet, editForm, isEditing]);

  // Componente da Barra de Macros
  const MacroSummary = () => {
    if (totals.kcal === 0) return null;

    // Calcula porcentagens calóricas (P=4, C=4, F=9) para a barra
    const calFromP = totals.p * 4;
    const calFromC = totals.c * 4;
    const calFromF = totals.f * 9;
    
    // Evita divisão por zero se a soma for zero, usa o totalKcal como base
    const validTotal = (calFromP + calFromC + calFromF) || totals.kcal || 1; 

    const pctP = Math.round((calFromP / validTotal) * 100);
    const pctC = Math.round((calFromC / validTotal) * 100);
    const pctF = Math.round((calFromF / validTotal) * 100);

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <PieChart size={20} />
                </div>
                <div>
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Diário</span>
                     <div className="text-xl font-bold text-slate-800 flex items-baseline gap-1">
                        {Math.round(totals.kcal).toLocaleString()} 
                        <span className="text-sm font-medium text-slate-500">kcal</span>
                     </div>
                </div>
                <div className="ml-auto text-xs text-slate-400">
                   Baseado em {patientWeight}kg
                </div>
            </div>

            {/* Segmented Bar */}
            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex mb-3">
                <div style={{ width: `${pctP}%` }} className="h-full bg-rose-500 transition-all duration-500" title={`Proteínas: ${pctP}%`}></div>
                <div style={{ width: `${pctC}%` }} className="h-full bg-blue-500 transition-all duration-500" title={`Carboidratos: ${pctC}%`}></div>
                <div style={{ width: `${pctF}%` }} className="h-full bg-amber-400 transition-all duration-500" title={`Gorduras: ${pctF}%`}></div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-rose-600 font-bold text-lg">{pctP}%</div>
                    <div className="text-slate-600 text-sm font-medium">{totals.p.toFixed(0)}g</div>
                    <div className="text-slate-400 text-xs">{(totals.p / patientWeight).toFixed(2)}g/kg</div>
                    <div className="text-rose-600 text-xs font-semibold mt-1">Proteínas</div>
                </div>
                <div className="border-x border-slate-200">
                    <div className="text-blue-600 font-bold text-lg">{pctC}%</div>
                    <div className="text-slate-600 text-sm font-medium">{totals.c.toFixed(0)}g</div>
                    <div className="text-slate-400 text-xs">{(totals.c / patientWeight).toFixed(2)}g/kg</div>
                    <div className="text-blue-600 text-xs font-semibold mt-1">Carboidratos</div>
                </div>
                <div>
                    <div className="text-amber-500 font-bold text-lg">{pctF}%</div>
                    <div className="text-slate-600 text-sm font-medium">{totals.f.toFixed(0)}g</div>
                    <div className="text-slate-400 text-xs">{(totals.f / patientWeight).toFixed(2)}g/kg</div>
                    <div className="text-amber-500 text-xs font-semibold mt-1">Gorduras</div>
                </div>
            </div>
        </div>
    );
  };

  if (isEditing) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-5xl mx-auto">
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

            <MacroSummary />

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

                        <div className="space-y-3 pl-0 sm:pl-4 sm:border-l-2 sm:border-slate-200">
                             {/* Header Row for Items */}
                             {meal.items.length > 0 && (
                                <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-slate-400 uppercase mb-1 px-1">
                                    <div className="col-span-2">Qtd</div>
                                    <div className="col-span-4">Alimento</div>
                                    <div className="col-span-1 text-center text-rose-500">P(g)</div>
                                    <div className="col-span-1 text-center text-blue-500">C(g)</div>
                                    <div className="col-span-1 text-center text-amber-500">G(g)</div>
                                    <div className="col-span-2 text-center">Kcal</div>
                                    <div className="col-span-1"></div>
                                </div>
                             )}

                            {meal.items.map((item) => (
                                <div key={item.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-center bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200 shadow-sm sm:shadow-none">
                                    {/* Mobile Labels are handled by placeholders */}
                                    <div className="col-span-2 w-full">
                                        <input 
                                            type="text" 
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'quantity', e.target.value)}
                                            placeholder="Qtd"
                                            className="w-full bg-white text-slate-900 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-4 w-full">
                                        <input 
                                            type="text" 
                                            value={item.name}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'name', e.target.value)}
                                            placeholder="Alimento"
                                            className="w-full bg-white text-slate-900 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    
                                    {/* Macros Inputs */}
                                    <div className="col-span-3 grid grid-cols-3 gap-2 w-full">
                                        <input 
                                            type="number" 
                                            value={item.protein || ''}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'protein', e.target.value)}
                                            placeholder="P"
                                            className="w-full bg-rose-50 text-rose-900 px-1 py-1.5 text-sm text-center rounded-lg border border-rose-100 focus:ring-1 focus:ring-rose-500 outline-none"
                                            title="Proteínas (g)"
                                        />
                                        <input 
                                            type="number" 
                                            value={item.carbs || ''}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'carbs', e.target.value)}
                                            placeholder="C"
                                            className="w-full bg-blue-50 text-blue-900 px-1 py-1.5 text-sm text-center rounded-lg border border-blue-100 focus:ring-1 focus:ring-blue-500 outline-none"
                                            title="Carboidratos (g)"
                                        />
                                        <input 
                                            type="number" 
                                            value={item.fats || ''}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'fats', e.target.value)}
                                            placeholder="G"
                                            className="w-full bg-amber-50 text-amber-900 px-1 py-1.5 text-sm text-center rounded-lg border border-amber-100 focus:ring-1 focus:ring-amber-500 outline-none"
                                            title="Gorduras (g)"
                                        />
                                    </div>

                                    <div className="col-span-2 w-full">
                                         <div className="bg-slate-100 text-slate-600 px-2 py-1.5 text-sm text-center rounded-lg font-mono font-medium">
                                            {item.calories ? Math.round(item.calories) : 0}
                                         </div>
                                    </div>

                                    <div className="col-span-1 text-right w-full sm:w-auto">
                                        <button 
                                            onClick={() => handleRemoveItem(meal.id, item.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
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
        
        {/* Macro Summary Display */}
        <MacroSummary />

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
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-400">
                                    {meal.items.reduce((acc, i) => acc + (Number(i.calories) || 0), 0).toFixed(0)} kcal
                                </span>
                                <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                    {meal.items.length} itens
                                </span>
                             </div>
                        </div>
                        
                        <ul className="space-y-2">
                            {meal.items.map((item) => (
                                <li key={item.id} className="flex justify-between items-start text-sm group/item">
                                    <div className="flex items-start">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 mr-3 shrink-0"></span>
                                        <span className="font-semibold text-slate-700 mr-1.5">{item.quantity}</span>
                                        <span className="text-slate-600">{item.name}</span>
                                    </div>
                                    {(item.calories > 0 || item.protein > 0) && (
                                        <div className="text-xs text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity flex gap-2">
                                            {item.protein > 0 && <span className="text-rose-400">P:{item.protein}</span>}
                                            {item.carbs > 0 && <span className="text-blue-400">C:{item.carbs}</span>}
                                            {item.fats > 0 && <span className="text-amber-400">G:{item.fats}</span>}
                                            <span className="font-semibold text-slate-500">{item.calories?.toFixed(0)}kcal</span>
                                        </div>
                                    )}
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