import React, { useState, useEffect } from 'react';
import { DietPlan, Meal } from '../types';
import { Check, Calendar, ChevronLeft, ChevronRight, Utensils, AlertCircle } from 'lucide-react';

interface FoodDiaryProps {
  dietPlan?: DietPlan;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({ dietPlan }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [checkedMeals, setCheckedMeals] = useState<Record<string, boolean>>({});

  // Format date as YYYY-MM-DD for storage keys
  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
  const dateKey = formatDateKey(selectedDate);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('food_diary_checks');
    if (saved) {
      setCheckedMeals(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  const toggleMeal = (mealId: string) => {
    const key = `${dateKey}_${mealId}`;
    const newState = { ...checkedMeals, [key]: !checkedMeals[key] };
    setCheckedMeals(newState);
    localStorage.setItem('food_diary_checks', JSON.stringify(newState));
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const isToday = formatDateKey(selectedDate) === formatDateKey(new Date());

  // Get meals for the selected day of week
  const dayOfWeek = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).split('-')[0]; // "Segunda", "Terça"...

  const currentMeals = React.useMemo(() => {
    if (!dietPlan) return [];
    if (dietPlan.days && dietPlan.days.length > 0) {
        const dayPlan = dietPlan.days.find(d => d.day.startsWith(capitalizedDay)); // Match "Segunda" with "Segunda-feira" if needed
        // Simple match
        const exactMatch = dietPlan.days.find(d => d.day === capitalizedDay);
        return exactMatch ? exactMatch.meals : [];
    }
    return dietPlan.meals || [];
  }, [dietPlan, capitalizedDay]);

  if (!dietPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <AlertCircle size={48} className="mb-4 opacity-50" />
        <p>Nenhum plano alimentar ativo encontrado.</p>
      </div>
    );
  }

  const completedCount = currentMeals.filter(m => checkedMeals[`${dateKey}_${m.id}`]).length;
  const progress = currentMeals.length > 0 ? (completedCount / currentMeals.length) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Utensils className="text-blue-600" /> Diário Alimentar
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Acompanhe suas refeições diárias.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
            <button onClick={handlePrevDay} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors shadow-sm">
                <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-2">
                <Calendar size={16} className="text-blue-500" />
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {isToday ? 'Hoje' : selectedDate.toLocaleDateString('pt-BR')}
                </span>
                <span className="text-xs text-slate-400 capitalize hidden sm:inline">
                    ({dayOfWeek})
                </span>
            </div>
            <button onClick={handleNextDay} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors shadow-sm" disabled={isToday}>
                <ChevronRight size={18} className={isToday ? 'opacity-30' : ''} />
            </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
            <span>Progresso do Dia</span>
            <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      <div className="space-y-4">
        {currentMeals.length > 0 ? (
            currentMeals.map((meal) => {
                const isChecked = checkedMeals[`${dateKey}_${meal.id}`];
                return (
                    <div 
                        key={meal.id}
                        onClick={() => toggleMeal(meal.id)}
                        className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
                            isChecked 
                            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                        }`}
                    >
                        <div className="p-4 flex items-start gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 ${
                                isChecked 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'border-slate-300 dark:border-slate-600 text-transparent group-hover:border-blue-400'
                            }`}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold text-lg ${isChecked ? 'text-blue-800 dark:text-blue-300 line-through opacity-70' : 'text-slate-800 dark:text-slate-100'}`}>
                                        {meal.name}
                                    </h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isChecked ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                        {meal.time}
                                    </span>
                                </div>
                                
                                <div className={`text-sm text-slate-600 dark:text-slate-400 space-y-1 ${isChecked ? 'opacity-60' : ''}`}>
                                    {meal.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                            <span>{item.quantity}{item.unit} {item.name}</span>
                                        </div>
                                    ))}
                                    {meal.items.length === 0 && (
                                        <span className="italic text-slate-400">Sem itens registrados</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Success Flash Effect */}
                        <div className={`absolute inset-0 bg-blue-500/10 pointer-events-none transition-opacity duration-300 ${isChecked ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                );
            })
        ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500">Nenhuma refeição planejada para este dia.</p>
            </div>
        )}
      </div>
    </div>
  );
};
