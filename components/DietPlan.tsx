import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DietPlan as DietPlanType, Meal, FoodItem } from '../types';
import { Clock, Plus, Trash2, Edit2, Save, X, ChefHat, Copy, Check, PieChart, Search, Zap } from 'lucide-react';

interface DietPlanProps {
  diet?: DietPlanType;
  onUpdateDiet: (diet: DietPlanType) => void;
  patientName: string;
  patientWeight?: number;
}

// --- BANCO DE DADOS DE ALIMENTOS (Baseado na TACO/TBCA - Por 100g) ---
const FOOD_DATABASE = [
  // --- PROTEÍNAS ANIMAIS ---
  { name: 'Peito de Frango Grelhado', protein: 32.0, carbs: 0.0, fats: 2.5, calories: 159 },
  { name: 'Peito de Frango Cozido', protein: 31.5, carbs: 0.0, fats: 3.2, calories: 163 },
  { name: 'Sobrecoxa de Frango Assada (sem pele)', protein: 26.0, carbs: 0.0, fats: 11.0, calories: 230 },
  { name: 'Carne Moída (Patinho) Refogada', protein: 35.9, carbs: 0.0, fats: 7.3, calories: 219 },
  { name: 'Alcatra Grelhada (sem gordura)', protein: 31.9, carbs: 0.0, fats: 11.6, calories: 241 },
  { name: 'Contrafilé Grelhado (sem gordura)', protein: 32.4, carbs: 0.0, fats: 15.5, calories: 278 },
  { name: 'Tilápia Grelhada', protein: 26.0, carbs: 0.0, fats: 2.7, calories: 128 },
  { name: 'Salmão Grelhado', protein: 24.0, carbs: 0.0, fats: 14.0, calories: 220 },
  { name: 'Atum em Conserva (Água)', protein: 26.0, carbs: 0.0, fats: 1.0, calories: 116 },
  
  // --- OVOS ---
  { name: 'Ovo de Galinha Cozido (Inteiro)', protein: 13.3, carbs: 0.6, fats: 9.5, calories: 146 },
  { name: 'Ovo de Galinha Frito (Inteiro)', protein: 15.6, carbs: 1.2, fats: 18.6, calories: 240 },
  { name: 'Ovo Mexido (simples)', protein: 14.0, carbs: 1.5, fats: 12.0, calories: 170 },
  { name: 'Clara de Ovo Cozida', protein: 13.0, carbs: 0.0, fats: 0.0, calories: 54 },
  
  // --- CARBOIDRATOS / CEREAIS / TUBÉRCULOS ---
  { name: 'Arroz Branco Cozido', protein: 2.5, carbs: 28.1, fats: 0.2, calories: 128 },
  { name: 'Arroz Integral Cozido', protein: 2.6, carbs: 25.8, fats: 1.0, calories: 124 },
  { name: 'Feijão Carioca Cozido', protein: 4.8, carbs: 13.6, fats: 0.5, calories: 76 },
  { name: 'Feijão Preto Cozido', protein: 4.5, carbs: 14.0, fats: 0.5, calories: 77 },
  { name: 'Batata Inglesa Cozida', protein: 1.2, carbs: 11.9, fats: 0.0, calories: 52 },
  { name: 'Batata Doce Cozida', protein: 0.6, carbs: 18.4, fats: 0.1, calories: 77 },
  { name: 'Mandioca Cozida', protein: 0.6, carbs: 30.1, fats: 0.3, calories: 125 },
  { name: 'Macarrão Cozido (Trigo)', protein: 5.8, carbs: 30.0, fats: 0.9, calories: 157 },
  { name: 'Aveia em Flocos', protein: 13.9, carbs: 66.6, fats: 8.5, calories: 394 },
  { name: 'Tapioca (Goma Hidratada)', protein: 0.0, carbs: 54.0, fats: 0.0, calories: 240 },
  { name: 'Cuscuz de Milho Cozido', protein: 2.2, carbs: 25.0, fats: 0.7, calories: 113 },
  
  // --- PANIFICADOS ---
  { name: 'Pão Francês', protein: 8.0, carbs: 58.0, fats: 3.0, calories: 300 },
  { name: 'Pão de Forma Integral', protein: 9.4, carbs: 49.0, fats: 3.7, calories: 253 },
  
  // --- LATICÍNIOS ---
  { name: 'Leite Integral (Vaca)', protein: 3.2, carbs: 4.7, fats: 3.0, calories: 60 },
  { name: 'Leite Desnatado (Vaca)', protein: 3.0, carbs: 4.9, fats: 0.0, calories: 35 },
  { name: 'Iogurte Natural', protein: 4.0, carbs: 5.0, fats: 3.0, calories: 60 },
  { name: 'Queijo Minas Frescal', protein: 17.4, carbs: 3.2, fats: 20.2, calories: 264 },
  { name: 'Queijo Muçarela', protein: 22.6, carbs: 3.0, fats: 21.6, calories: 300 },
  { name: 'Queijo Cottage', protein: 11.0, carbs: 3.4, fats: 4.3, calories: 98 },
  { name: 'Requeijão Cremoso', protein: 9.6, carbs: 2.4, fats: 26.0, calories: 280 },
  
  // --- FRUTAS ---
  { name: 'Banana Prata', protein: 1.3, carbs: 26.0, fats: 0.1, calories: 98 },
  { name: 'Banana Nanica', protein: 1.4, carbs: 24.0, fats: 0.1, calories: 92 },
  { name: 'Maçã Fuji (com casca)', protein: 0.3, carbs: 15.0, fats: 0.2, calories: 56 },
  { name: 'Mamão Papaya', protein: 0.5, carbs: 10.0, fats: 0.1, calories: 40 },
  { name: 'Abacaxi Pérola', protein: 0.9, carbs: 12.3, fats: 0.1, calories: 48 },
  { name: 'Abacate', protein: 1.2, carbs: 6.0, fats: 8.4, calories: 96 },
  { name: 'Morango', protein: 0.9, carbs: 6.8, fats: 0.3, calories: 30 },
  { name: 'Melancia', protein: 0.9, carbs: 8.1, fats: 0.0, calories: 33 },
  { name: 'Laranja Pera', protein: 1.0, carbs: 8.9, fats: 0.1, calories: 37 },
  { name: 'Uva Rubi', protein: 0.6, carbs: 12.7, fats: 0.2, calories: 49 },

  // --- LEGUMES E VERDURAS ---
  { name: 'Alface', protein: 1.3, carbs: 2.9, fats: 0.2, calories: 14 },
  { name: 'Tomate', protein: 1.1, carbs: 3.1, fats: 0.2, calories: 15 },
  { name: 'Brócolis Cozido', protein: 2.1, carbs: 4.4, fats: 0.5, calories: 25 },
  { name: 'Cenoura Crua', protein: 1.3, carbs: 7.7, fats: 0.2, calories: 34 },
  { name: 'Beterraba Cozida', protein: 1.3, carbs: 7.2, fats: 0.1, calories: 32 },
  { name: 'Abobrinha Italiana Cozida', protein: 1.1, carbs: 3.0, fats: 0.2, calories: 15 },

  // --- GORDURAS E OLEAGINOSAS ---
  { name: 'Azeite de Oliva', protein: 0.0, carbs: 0.0, fats: 100.0, calories: 884 },
  { name: 'Manteiga (com sal)', protein: 0.4, carbs: 0.0, fats: 83.0, calories: 726 },
  { name: 'Pasta de Amendoim (Integral)', protein: 25.0, carbs: 20.0, fats: 50.0, calories: 590 },
  { name: 'Castanha do Pará', protein: 14.0, carbs: 12.0, fats: 66.0, calories: 656 },
  
  // --- SUPLEMENTOS E OUTROS ---
  { name: 'Whey Protein (Concentrado Padrão)', protein: 80.0, carbs: 5.0, fats: 2.0, calories: 360 },
  { name: 'Creatina', protein: 0.0, carbs: 0.0, fats: 0.0, calories: 0 },
  { name: 'Chocolate 70% Cacau', protein: 8.0, carbs: 34.0, fats: 42.0, calories: 580 },
];

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const DietPlan: React.FC<DietPlanProps> = ({ diet, onUpdateDiet, patientName, patientWeight = 70 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Estado para controlar o autocomplete
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  
  // Helper function to create a default meal structure
  const createDefaultMeals = (): Meal[] => [
    { id: generateId(), name: 'Café da Manhã', time: '07:30', items: [] },
    { id: generateId(), name: 'Almoço', time: '12:30', items: [] },
    { id: generateId(), name: 'Lanche da Tarde', time: '16:00', items: [] },
    { id: generateId(), name: 'Jantar', time: '20:00', items: [] },
  ];

  // Local state for editing form
  const [editForm, setEditForm] = useState<DietPlanType>(() => diet || {
    id: generateId(),
    lastUpdated: new Date().toISOString(),
    meals: createDefaultMeals(),
    notes: ''
  });

  // Reset form when entering edit mode if diet prop changed
  useEffect(() => {
    if (diet) {
      setEditForm(diet);
    } else {
      // Se não houver dieta (Novo Plano), inicializa com o template padrão
      setEditForm({
        id: generateId(),
        lastUpdated: new Date().toISOString(),
        meals: createDefaultMeals(),
        notes: ''
      });
    }
  }, [diet, isEditing]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = () => setActiveSuggestionId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCopyDiet = () => {
    if (!diet) return;
    
    let text = `📅 Plano Alimentar - ${patientName}\n\n`;
    diet.meals.forEach(meal => {
        text += `⏰ ${meal.time} - ${meal.name}\n`;
        meal.items.forEach(item => {
            text += `• ${item.quantity} ${item.name} (${item.calories.toFixed(0)} kcal)\n`;
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

  // --- LÓGICA DE CÁLCULO AUTOMÁTICO ---
  const calculateNutrition = (currentName: string, currentQtyStr: string, currentItem: FoodItem): Partial<FoodItem> => {
    // 1. Tenta achar o alimento no banco
    const foodDB = FOOD_DATABASE.find(f => f.name.toLowerCase() === currentName.toLowerCase());
    
    if (!foodDB) return {}; // Se não achar, não muda os macros (permite edição manual)

    // 2. Extrai apenas os números da quantidade (ex: "150g" -> 150)
    const qtyNumber = parseFloat(currentQtyStr.replace(/[^0-9.]/g, ''));
    
    if (!qtyNumber || isNaN(qtyNumber)) return {};

    // 3. Calcula (BaseDB / 100 * QtdInserida)
    const factor = qtyNumber / 100;

    return {
        protein: parseFloat((foodDB.protein * factor).toFixed(1)),
        carbs: parseFloat((foodDB.carbs * factor).toFixed(1)),
        fats: parseFloat((foodDB.fats * factor).toFixed(1)),
        calories: parseFloat((foodDB.calories * factor).toFixed(1))
    };
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
                            let updatedItem = { ...i, [field]: value };
                            
                            // Se alterou NOME ou QUANTIDADE, tenta recalcular
                            if (field === 'name' || field === 'quantity') {
                                // Se for alteração de nome, checa se tem match exato para auto-calcular
                                // Se for quantidade, usa o nome atual
                                const nameToUse = field === 'name' ? value : updatedItem.name;
                                const qtyToUse = field === 'quantity' ? value : updatedItem.quantity;
                                
                                const autoMacros = calculateNutrition(nameToUse, qtyToUse, updatedItem);
                                updatedItem = { ...updatedItem, ...autoMacros };
                            }

                            // Se alterou MACROS manualmente, recalcula calorias (fallback)
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

    if (field === 'name') {
        setActiveSuggestionId(value.length > 2 ? itemId : null);
    }
  };

  const handleSelectSuggestion = (mealId: string, itemId: string, food: typeof FOOD_DATABASE[0]) => {
    // Ao selecionar, preenche o nome
    // Se já tiver quantidade, calcula. Se não, deixa zerado ou põe "100g" padrão?
    // Vamos manter a quantidade atual se existir, ou por 100g padrão.
    
    setEditForm(prev => {
        const currentMeal = prev.meals.find(m => m.id === mealId);
        const currentItem = currentMeal?.items.find(i => i.id === itemId);
        const currentQty = currentItem?.quantity || '100g';
        
        // Extrai número para calcular inicial
        const qtyNumber = parseFloat(currentQty.replace(/[^0-9.]/g, '')) || 100;
        const factor = qtyNumber / 100;

        return {
            ...prev,
            meals: prev.meals.map(m => {
                if (m.id === mealId) {
                    return {
                        ...m,
                        items: m.items.map(i => {
                            if (i.id === itemId) {
                                return {
                                    ...i,
                                    name: food.name,
                                    quantity: currentQty, // Mantém o que estava ou 100g
                                    protein: parseFloat((food.protein * factor).toFixed(1)),
                                    carbs: parseFloat((food.carbs * factor).toFixed(1)),
                                    fats: parseFloat((food.fats * factor).toFixed(1)),
                                    calories: parseFloat((food.calories * factor).toFixed(1))
                                };
                            }
                            return i;
                        })
                    };
                }
                return m;
            })
        };
    });
    setActiveSuggestionId(null);
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
            totalKcal += Number(item.calories) || ((Number(item.protein) || 0) * 4 + (Number(item.carbs) || 0) * 4 + (Number(item.fats) || 0) * 9);
        });
    });

    return { kcal: totalKcal, p: totalP, c: totalC, f: totalF };
  }, [diet, editForm, isEditing]);

  // Componente da Barra de Macros
  const MacroSummary = () => {
    // Show summary even if total is 0 when in editing mode, to show targets/empty state
    if (totals.kcal === 0 && !isEditing) return null;

    const calFromP = totals.p * 4;
    const calFromC = totals.c * 4;
    const calFromF = totals.f * 9;
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

            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex mb-3">
                <div style={{ width: `${pctP}%` }} className="h-full bg-rose-500 transition-all duration-500" title={`Proteínas: ${pctP}%`}></div>
                <div style={{ width: `${pctC}%` }} className="h-full bg-blue-500 transition-all duration-500" title={`Carboidratos: ${pctC}%`}></div>
                <div style={{ width: `${pctF}%` }} className="h-full bg-amber-400 transition-all duration-500" title={`Gorduras: ${pctF}%`}></div>
            </div>

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
                                    <div className="col-span-2">Qtd (g)</div>
                                    <div className="col-span-4">Alimento</div>
                                    <div className="col-span-1 text-center text-rose-500">P(g)</div>
                                    <div className="col-span-1 text-center text-blue-500">C(g)</div>
                                    <div className="col-span-1 text-center text-amber-500">G(g)</div>
                                    <div className="col-span-2 text-center">Kcal</div>
                                    <div className="col-span-1"></div>
                                </div>
                             )}

                            {meal.items.map((item) => (
                                <div key={item.id} className="relative flex flex-col sm:grid sm:grid-cols-12 gap-2 items-center bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200 shadow-sm sm:shadow-none z-20">
                                    {/* Mobile Labels are handled by placeholders */}
                                    <div className="col-span-2 w-full">
                                        <input 
                                            type="text" 
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'quantity', e.target.value)}
                                            placeholder="Ex: 100g"
                                            className="w-full bg-white text-slate-900 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-4 w-full relative">
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={item.name}
                                                onFocus={() => item.name.length >= 2 && setActiveSuggestionId(item.id)}
                                                onChange={(e) => handleItemChange(meal.id, item.id, 'name', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="Busque o alimento..."
                                                className="w-full bg-white text-slate-900 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                autoComplete="off"
                                            />
                                            {/* AutoComplete Icon Indicator */}
                                            {item.name.length === 0 && (
                                                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            )}
                                        </div>

                                        {/* Suggestions Dropdown */}
                                        {activeSuggestionId === item.id && (
                                            <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-xl border border-slate-100 mt-1 max-h-48 overflow-y-auto z-50">
                                                {FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(item.name.toLowerCase())).length > 0 ? (
                                                    FOOD_DATABASE
                                                    .filter(f => f.name.toLowerCase().includes(item.name.toLowerCase()))
                                                    .map((food, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectSuggestion(meal.id, item.id, food);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 flex justify-between items-center"
                                                        >
                                                            <span>{food.name}</span>
                                                            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{food.calories}kcal/100g</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-2 text-sm text-slate-400 italic">Nenhum alimento encontrado</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Macros Inputs */}
                                    <div className="col-span-3 grid grid-cols-3 gap-2 w-full">
                                        <input 
                                            type="number" 
                                            value={item.protein || ''}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'protein', e.target.value)}
                                            placeholder="P"
                                            className="w-full bg-rose-50 text-rose-900 px-1 py-1.5 text-sm text-center rounded-lg border border-rose-100 focus:ring-1 focus:ring-rose-500 outline-none font-medium"
                                            title="Proteínas (g)"
                                        />
                                        <input 
                                            type="number" 
                                            value={item.carbs || ''}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'carbs', e.target.value)}
                                            placeholder="C"
                                            className="w-full bg-blue-50 text-blue-900 px-1 py-1.5 text-sm text-center rounded-lg border border-blue-100 focus:ring-1 focus:ring-blue-500 outline-none font-medium"
                                            title="Carboidratos (g)"
                                        />
                                        <input 
                                            type="number" 
                                            value={item.fats || ''}
                                            onChange={(e) => handleItemChange(meal.id, item.id, 'fats', e.target.value)}
                                            placeholder="G"
                                            className="w-full bg-amber-50 text-amber-900 px-1 py-1.5 text-sm text-center rounded-lg border border-amber-100 focus:ring-1 focus:ring-amber-500 outline-none font-medium"
                                            title="Gorduras (g)"
                                        />
                                    </div>

                                    <div className="col-span-2 w-full">
                                         <div className="bg-slate-100 text-slate-600 px-2 py-1.5 text-sm text-center rounded-lg font-mono font-bold flex items-center justify-center gap-1">
                                            {item.calories ? Math.round(item.calories) : 0}
                                            <span className="text-[10px] font-normal text-slate-400">kcal</span>
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