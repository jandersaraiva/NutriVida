
import React, { useState, useEffect, useMemo } from 'react';
import { DietPlan as DietPlanType, Meal, FoodItem } from '../types';
import { Clock, Plus, Trash2, Edit2, Save, X, ChefHat, Copy, Check, PieChart, Search, Calendar, Archive, FilePlus, ChevronLeft, Zap } from 'lucide-react';

interface DietPlanProps {
  plans: DietPlanType[];
  onUpdatePlans: (plans: DietPlanType[]) => void;
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

// Helper para remover acentos para busca
const normalizeText = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const createDefaultMeals = (): Meal[] => [
    { id: generateId(), name: 'Café da Manhã', time: '07:30', items: [] },
    { id: generateId(), name: 'Almoço', time: '12:30', items: [] },
    { id: generateId(), name: 'Lanche da Tarde', time: '16:00', items: [] },
    { id: generateId(), name: 'Jantar', time: '20:00', items: [] },
];

export const DietPlan: React.FC<DietPlanProps> = ({ plans = [], onUpdatePlans, patientName, patientWeight = 70 }) => {
  // State for which plan is currently being viewed
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Ensure we select a plan on mount/update (prefer active, then latest)
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
        const active = plans.find(p => p.status === 'active');
        if (active) {
            setSelectedPlanId(active.id);
        } else {
            // Sort by date desc
            const sorted = [...plans].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setSelectedPlanId(sorted[0].id);
        }
    } else if (plans.length === 0) {
        setSelectedPlanId(null);
    }
  }, [plans]);

  // Derived state for the active view
  const currentPlan = useMemo(() => plans.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);

  // Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);

  // Editing State
  const [editForm, setEditForm] = useState<DietPlanType | null>(null);
  
  // New Plan Modal State
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanType, setNewPlanType] = useState<'blank' | 'copy'>('copy');

  // Load form when editing starts
  useEffect(() => {
    if (isEditing && currentPlan) {
        setEditForm(JSON.parse(JSON.stringify(currentPlan))); // Deep copy
    }
  }, [isEditing, currentPlan]);

  // Click outside suggestions
  useEffect(() => {
    const handleClickOutside = () => setActiveSuggestionId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);


  // --- ACTIONS ---

  const handleCreateNewPlan = () => {
    // Determine default name
    const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    setNewPlanName(`Plano ${month.charAt(0).toUpperCase() + month.slice(1)}`);
    setNewPlanType(currentPlan ? 'copy' : 'blank');
    setShowNewPlanModal(true);
  };

  const confirmCreateNewPlan = () => {
    const newId = generateId();
    let newMeals = createDefaultMeals();

    if (newPlanType === 'copy' && currentPlan) {
        newMeals = currentPlan.meals.map(m => ({
            ...m, 
            id: generateId(), 
            items: m.items.map(i => ({...i, id: generateId()}))
        }));
    }

    const newPlan: DietPlanType = {
        id: newId,
        name: newPlanName,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        meals: newMeals,
        notes: newPlanType === 'copy' && currentPlan ? currentPlan.notes : ''
    };

    // Archive current active plans if any
    const updatedPlans = plans.map(p => ({
        ...p,
        status: 'archived' as const
    }));

    onUpdatePlans([...updatedPlans, newPlan]);
    setSelectedPlanId(newId);
    setShowNewPlanModal(false);
    
    // Auto enter edit mode for the new plan
    setTimeout(() => {
        setIsEditing(true);
        // editForm will be set by useEffect
    }, 100);
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) {
        const remaining = plans.filter(p => p.id !== id);
        onUpdatePlans(remaining);
        if (selectedPlanId === id) {
            setSelectedPlanId(null); // useEffect will pick a new one
        }
    }
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    
    const updatedPlans = plans.map(p => p.id === editForm.id ? {
        ...editForm,
        lastUpdated: new Date().toISOString()
    } : p);
    
    onUpdatePlans(updatedPlans);
    setIsEditing(false);
  };

  const handleCopyDiet = () => {
    if (!currentPlan) return;
    
    let text = `📅 ${currentPlan.name} - ${patientName}\n\n`;
    currentPlan.meals.forEach(meal => {
        text += `⏰ ${meal.time} - ${meal.name}\n`;
        meal.items.forEach(item => {
            text += `• ${item.quantity} ${item.name} (${item.calories.toFixed(0)} kcal)\n`;
        });
        text += '\n';
    });
    
    if (currentPlan.notes) {
        text += `📝 Observações: ${currentPlan.notes}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- FORM HANDLERS (Similar to previous logic) ---
  
  const handleMealChange = (mealId: string, field: keyof Meal, value: string) => {
    if (!editForm) return;
    setEditForm(prev => ({
        ...prev!,
        meals: prev!.meals.map(m => m.id === mealId ? { ...m, [field]: value } : m)
    }));
  };

  const handleAddMeal = () => {
    if (!editForm) return;
    const newMeal: Meal = { id: generateId(), name: 'Nova Refeição', time: '08:00', items: [] };
    setEditForm(prev => ({...prev!, meals: [...prev!.meals, newMeal]}));
  };

  const handleRemoveMeal = (mealId: string) => {
    if (!editForm) return;
    setEditForm(prev => ({...prev!, meals: prev!.meals.filter(m => m.id !== mealId)}));
  };

  const handleItemChange = (mealId: string, itemId: string, field: keyof FoodItem, value: string) => {
    if (!editForm) return;
    
    // Logic for auto-calculation (keeps manual overrides valid)
    const calculateNutrition = (currentName: string, currentQtyStr: string): Partial<FoodItem> => {
        const normalizedInput = normalizeText(currentName);
        const foodDB = FOOD_DATABASE.find(f => normalizeText(f.name) === normalizedInput);
        
        if (!foodDB) return {};
        
        const qtyNumber = parseFloat(currentQtyStr.replace(/[^0-9.]/g, ''));
        if (!qtyNumber || isNaN(qtyNumber)) return {};
        
        const factor = qtyNumber / 100;
        return {
            protein: parseFloat((foodDB.protein * factor).toFixed(1)),
            carbs: parseFloat((foodDB.carbs * factor).toFixed(1)),
            fats: parseFloat((foodDB.fats * factor).toFixed(1)),
            calories: parseFloat((foodDB.calories * factor).toFixed(1))
        };
    };

    setEditForm(prev => ({
        ...prev!,
        meals: prev!.meals.map(m => {
            if (m.id === mealId) {
                return {
                    ...m,
                    items: m.items.map(i => {
                        if (i.id === itemId) {
                            let updatedItem = { ...i, [field]: value };
                            
                            // If name or quantity changes, try to recalculate if we have an exact DB match
                            if (field === 'name' || field === 'quantity') {
                                const nameToUse = field === 'name' ? value : updatedItem.name;
                                const qtyToUse = field === 'quantity' ? value : updatedItem.quantity;
                                const autoMacros = calculateNutrition(nameToUse, qtyToUse);
                                updatedItem = { ...updatedItem, ...autoMacros };
                            }

                            // If specific macro changes, recalculate calories
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
        setActiveSuggestionId(value.length >= 2 ? itemId : null);
    }
  };

  const handleSelectSuggestion = (mealId: string, itemId: string, food: typeof FOOD_DATABASE[0]) => {
     if (!editForm) return;
     setEditForm(prev => {
        const currentMeal = prev!.meals.find(m => m.id === mealId);
        const currentItem = currentMeal?.items.find(i => i.id === itemId);
        
        // Use existing quantity if present, else default to 100g
        const currentQty = currentItem?.quantity && currentItem.quantity.trim() !== '' ? currentItem.quantity : '100g';
        const qtyNumber = parseFloat(currentQty.replace(/[^0-9.]/g, '')) || 100;
        const factor = qtyNumber / 100;

        return {
            ...prev!,
            meals: prev!.meals.map(m => {
                if (m.id === mealId) {
                    return {
                        ...m,
                        items: m.items.map(i => {
                            if (i.id === itemId) {
                                return {
                                    ...i,
                                    name: food.name,
                                    quantity: currentQty,
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

  const handleAddItem = (mealId: string) => {
    if (!editForm) return;
    const newItem: FoodItem = { id: generateId(), name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0 };
    setEditForm(prev => ({
        ...prev!,
        meals: prev!.meals.map(m => m.id === mealId ? { ...m, items: [...m.items, newItem] } : m)
    }));
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    if (!editForm) return;
    setEditForm(prev => ({
        ...prev!,
        meals: prev!.meals.map(m => m.id === mealId ? { ...m, items: m.items.filter(i => i.id !== itemId) } : m)
    }));
  };

  // --- CALCULATIONS ---
  const totals = useMemo(() => {
    const data = isEditing ? editForm : currentPlan;
    if (!data) return { kcal: 0, p: 0, c: 0, f: 0 };

    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;

    data.meals.forEach(meal => {
        meal.items.forEach(item => {
            totalP += Number(item.protein) || 0;
            totalC += Number(item.carbs) || 0;
            totalF += Number(item.fats) || 0;
            totalKcal += Number(item.calories) || ((Number(item.protein) || 0) * 4 + (Number(item.carbs) || 0) * 4 + (Number(item.fats) || 0) * 9);
        });
    });
    return { kcal: totalKcal, p: totalP, c: totalC, f: totalF };
  }, [currentPlan, editForm, isEditing]);


  // --- RENDER HELPERS ---
  
  const MacroSummary = () => {
    if (totals.kcal === 0 && !isEditing) return null;
    const calFromP = totals.p * 4;
    const calFromC = totals.c * 4;
    const calFromF = totals.f * 9;
    const validTotal = (calFromP + calFromC + calFromF) || totals.kcal || 1; 
    const pctP = Math.round((calFromP / validTotal) * 100);
    const pctC = Math.round((calFromC / validTotal) * 100);
    const pctF = Math.round((calFromF / validTotal) * 100);

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
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
                <div className="ml-auto text-xs text-slate-400 hidden sm:block">
                   Peso ref: {patientWeight}kg
                </div>
            </div>

            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex mb-4">
                <div style={{ width: `${pctP}%` }} className="h-full bg-rose-500" title="Proteínas"></div>
                <div style={{ width: `${pctC}%` }} className="h-full bg-blue-500" title="Carboidratos"></div>
                <div style={{ width: `${pctF}%` }} className="h-full bg-amber-400" title="Gorduras"></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Proteína</span>
                    </div>
                    <div className="text-slate-800 font-bold text-lg leading-none">{totals.p.toFixed(0)}g</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{(totals.p / patientWeight).toFixed(1)}g/kg</div>
                </div>
                
                <div className="flex flex-col items-center border-x border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Carbo</span>
                    </div>
                    <div className="text-slate-800 font-bold text-lg leading-none">{totals.c.toFixed(0)}g</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{(totals.c / patientWeight).toFixed(1)}g/kg</div>
                </div>
                
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Gordura</span>
                    </div>
                    <div className="text-slate-800 font-bold text-lg leading-none">{totals.f.toFixed(0)}g</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{(totals.f / patientWeight).toFixed(1)}g/kg</div>
                </div>
            </div>
        </div>
    );
  };


  // --- VIEW: EMPTY ---
  if (plans.length === 0 && !showNewPlanModal) {
    return (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-300 text-center p-8">
            <div className="bg-slate-50 p-4 rounded-full mb-4 text-slate-400">
              <ChefHat size={48} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum plano alimentar</h3>
            <p className="text-slate-500 mb-6 max-w-md">Crie o primeiro ciclo de dieta para este paciente.</p>
            <button 
              onClick={handleCreateNewPlan}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-200 flex items-center gap-2"
            >
              <Plus size={20} /> Criar Primeiro Plano
            </button>
            {/* Modal Logic needs to be rendered outside or handled here if showNewPlanModal is true */}
            {showNewPlanModal && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    {/* Rendered below in main return usually, but handled by state switch */}
                 </div>
            )}
        </div>
    );
  }

  // --- VIEW: MASTER-DETAIL ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SIDEBAR: HISTORY */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-1">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 text-sm">Ciclos de Dieta</h3>
                 <button onClick={handleCreateNewPlan} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors" title="Novo Ciclo">
                    <FilePlus size={18} />
                 </button>
             </div>
             <div className="max-h-[500px] overflow-y-auto">
                 {plans.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(plan => (
                     <div 
                        key={plan.id}
                        onClick={() => {
                            if(!isEditing) setSelectedPlanId(plan.id);
                            else if (window.confirm('Sair da edição? Alterações não salvas serão perdidas.')) {
                                setIsEditing(false);
                                setSelectedPlanId(plan.id);
                            }
                        }}
                        className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 group ${
                            selectedPlanId === plan.id ? 'bg-emerald-50/50 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'
                        }`}
                     >
                         <div className="flex justify-between items-start mb-1">
                             <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${plan.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                 {plan.status === 'active' ? 'Ativo' : 'Histórico'}
                             </span>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={14} />
                             </button>
                         </div>
                         <h4 className={`font-semibold text-sm mb-1 ${selectedPlanId === plan.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                             {plan.name}
                         </h4>
                         <div className="flex items-center gap-1 text-xs text-slate-400">
                             <Calendar size={10} />
                             {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                         </div>
                     </div>
                 ))}
             </div>
        </div>

        {/* MAIN: CONTENT */}
        <div className="lg:col-span-3">
            {currentPlan && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <div>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editForm?.name || ''}
                                    onChange={(e) => setEditForm({...editForm!, name: e.target.value})}
                                    className="text-xl font-bold text-slate-900 border-b border-dashed border-slate-300 focus:border-emerald-500 outline-none bg-transparent placeholder-slate-400"
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-slate-800">{currentPlan.name}</h2>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                Criado em {new Date(currentPlan.createdAt).toLocaleDateString('pt-BR')} • {currentPlan.meals.length} refeições
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors font-medium text-sm">Cancelar</button>
                                    <button onClick={handleSaveEdit} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm">
                                        <Save size={16} /> Salvar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleCopyDiet} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">
                                        {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                                        <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar Texto'}</span>
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm">
                                        <Edit2 size={16} /> Editar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <MacroSummary />

                    {/* Editor / Viewer Body */}
                    <div className="space-y-6">
                         {(isEditing ? editForm?.meals : currentPlan.meals)?.map((meal) => (
                             <div key={meal.id} className={`rounded-xl p-4 border transition-all ${isEditing ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'}`}>
                                 {/* Meal Header */}
                                 <div className="flex justify-between items-center mb-3">
                                     <div className="flex items-center gap-3">
                                         {isEditing ? (
                                             <input 
                                                 type="time" 
                                                 value={meal.time} 
                                                 onChange={(e) => handleMealChange(meal.id, 'time', e.target.value)}
                                                 className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-bold w-24 text-slate-900 outline-none focus:border-emerald-500"
                                             />
                                         ) : (
                                            <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg">
                                                <Clock size={14} />
                                                {meal.time}
                                            </div>
                                         )}
                                         
                                         {isEditing ? (
                                             <input 
                                                type="text" 
                                                value={meal.name}
                                                onChange={(e) => handleMealChange(meal.id, 'name', e.target.value)}
                                                className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-bold w-40 sm:w-64 text-slate-900 outline-none focus:border-emerald-500"
                                             />
                                         ) : (
                                             <h3 className="font-bold text-slate-800">{meal.name}</h3>
                                         )}
                                     </div>
                                     
                                     <div className="flex items-center gap-2">
                                         {!isEditing && (
                                             <span className="text-xs font-medium text-slate-400">
                                                 {meal.items.reduce((acc, i) => acc + (Number(i.calories) || 0), 0).toFixed(0)} kcal
                                             </span>
                                         )}
                                         {isEditing && (
                                             <button onClick={() => handleRemoveMeal(meal.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                                         )}
                                     </div>
                                 </div>

                                 {/* Meal Items */}
                                 <ul className="space-y-2">
                                     {meal.items.map(item => (
                                         <li key={item.id} className={`flex flex-col sm:flex-row gap-2 sm:items-center text-sm ${isEditing ? 'bg-white p-2 rounded border border-slate-200' : ''}`}>
                                             {isEditing ? (
                                                 <>
                                                     <div className="flex gap-2 w-full sm:w-auto">
                                                         <input 
                                                             className="w-20 p-1 border border-slate-300 rounded text-xs bg-white text-slate-900 focus:border-emerald-500 outline-none" 
                                                             placeholder="Qtd" 
                                                             value={item.quantity} 
                                                             onChange={(e) => handleItemChange(meal.id, item.id, 'quantity', e.target.value)} 
                                                         />
                                                         <div className="relative flex-1 sm:w-64">
                                                             <div className="relative">
                                                                <input 
                                                                    className="w-full p-1 border border-slate-300 rounded text-xs pr-8 bg-white text-slate-900 focus:border-emerald-500 outline-none" 
                                                                    placeholder="Buscar alimento..." 
                                                                    value={item.name} 
                                                                    onFocus={() => item.name.length >= 2 && setActiveSuggestionId(item.id)}
                                                                    onChange={(e) => handleItemChange(meal.id, item.id, 'name', e.target.value)} 
                                                                    autoComplete="off"
                                                                />
                                                                <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                                                             </div>

                                                             {/* AUTOCOMPLETE DROPDOWN */}
                                                             {activeSuggestionId === item.id && (
                                                                <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-xl border border-slate-100 z-50 max-h-48 overflow-y-auto mt-1 custom-scrollbar">
                                                                    {FOOD_DATABASE.filter(f => normalizeText(f.name).includes(normalizeText(item.name))).map((f, idx) => (
                                                                        <div 
                                                                            key={idx} 
                                                                            onClick={() => handleSelectSuggestion(meal.id, item.id, f)} 
                                                                            className="p-2.5 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0 group"
                                                                        >
                                                                            <div className="font-medium text-slate-700 text-xs">{f.name}</div>
                                                                            <div className="text-[10px] text-slate-400 mt-0.5 flex gap-2">
                                                                                <span className="font-semibold text-slate-500">{f.calories.toFixed(0)}kcal</span>
                                                                                <span>P:{f.protein}</span>
                                                                                <span>C:{f.carbs}</span>
                                                                                <span>G:{f.fats}</span>
                                                                                <span className="ml-auto text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Selecionar</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {FOOD_DATABASE.filter(f => normalizeText(f.name).includes(normalizeText(item.name))).length === 0 && (
                                                                        <div className="p-3 text-xs text-slate-400 text-center italic">
                                                                            Nenhum alimento encontrado.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                             )}
                                                         </div>
                                                     </div>
                                                     {/* Alterado gap-1 para gap-2 e w-10 para w-16 para melhor visibilidade */}
                                                     <div className="flex gap-2 w-full sm:w-auto">
                                                         <input type="number" className="w-16 p-1 border border-rose-200 rounded text-xs text-center bg-rose-50 text-rose-900 placeholder-rose-300 focus:border-rose-500 outline-none" placeholder="P" value={item.protein} onChange={(e) => handleItemChange(meal.id, item.id, 'protein', e.target.value)} />
                                                         <input type="number" className="w-16 p-1 border border-blue-200 rounded text-xs text-center bg-blue-50 text-blue-900 placeholder-blue-300 focus:border-blue-500 outline-none" placeholder="C" value={item.carbs} onChange={(e) => handleItemChange(meal.id, item.id, 'carbs', e.target.value)} />
                                                         <input type="number" className="w-16 p-1 border border-amber-200 rounded text-xs text-center bg-amber-50 text-amber-900 placeholder-amber-300 focus:border-amber-500 outline-none" placeholder="G" value={item.fats} onChange={(e) => handleItemChange(meal.id, item.id, 'fats', e.target.value)} />
                                                     </div>
                                                     <div className="flex items-center justify-between flex-1">
                                                         <span className="text-xs text-slate-400 w-12 text-right">{item.calories?.toFixed(0)}kcal</span>
                                                         <button onClick={() => handleRemoveItem(meal.id, item.id)} className="text-slate-300 hover:text-red-500 ml-2"><X size={14}/></button>
                                                     </div>
                                                 </>
                                             ) : (
                                                 // View Mode Item
                                                 <div className="flex justify-between w-full group/item">
                                                     <div className="flex items-center">
                                                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>
                                                         <span className="font-semibold text-slate-700 mr-1.5">{item.quantity}</span>
                                                         <span className="text-slate-600">{item.name}</span>
                                                     </div>
                                                     {(item.calories > 0) && (
                                                         <div className="text-xs text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                             <span className="mr-2 text-rose-400 font-medium">P:{item.protein}</span>
                                                             <span className="mr-2 text-blue-400 font-medium">C:{item.carbs}</span>
                                                             <span className="font-semibold">{item.calories?.toFixed(0)}kcal</span>
                                                         </div>
                                                     )}
                                                 </div>
                                             )}
                                         </li>
                                     ))}
                                     {isEditing && (
                                         <button onClick={() => handleAddItem(meal.id)} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-2">
                                             <Plus size={12} /> Adicionar Item
                                         </button>
                                     )}
                                 </ul>
                             </div>
                         ))}

                         {isEditing && (
                             <button onClick={handleAddMeal} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors text-sm font-medium">
                                 + Adicionar Refeição
                             </button>
                         )}
                    </div>
                    
                    {/* Notes Section */}
                    <div className="mt-8">
                        {isEditing ? (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações</label>
                                <textarea 
                                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-400" 
                                    rows={4}
                                    value={editForm?.notes || ''}
                                    onChange={(e) => setEditForm({...editForm!, notes: e.target.value})}
                                />
                            </div>
                        ) : (
                            currentPlan.notes && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <h4 className="font-bold text-amber-900 text-sm mb-1">Observações</h4>
                                    <p className="text-amber-800 text-sm whitespace-pre-wrap">{currentPlan.notes}</p>
                                </div>
                            )
                        )}
                    </div>

                </div>
            )}
        </div>

        {/* MODAL: NEW PLAN */}
        {showNewPlanModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Novo Ciclo de Dieta</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Plano</label>
                            <input 
                                type="text" 
                                value={newPlanName}
                                onChange={(e) => setNewPlanName(e.target.value)}
                                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Base do Plano</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setNewPlanType('copy')}
                                    disabled={!currentPlan}
                                    className={`p-3 rounded-xl border text-left transition-all ${newPlanType === 'copy' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <span className="block font-bold text-sm mb-1">Copiar Atual</span>
                                    <span className="block text-xs opacity-70">Usa o plano ativo como base</span>
                                </button>
                                <button 
                                    onClick={() => setNewPlanType('blank')}
                                    className={`p-3 rounded-xl border text-left transition-all ${newPlanType === 'blank' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <span className="block font-bold text-sm mb-1">Em Branco</span>
                                    <span className="block text-xs opacity-70">Começar do zero</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex gap-2 items-start">
                            <Archive size={16} className="shrink-0 mt-0.5" />
                            <p>Ao criar um novo ciclo, o plano "Ativo" atual será movido automaticamente para o histórico.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setShowNewPlanModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">Cancelar</button>
                        <button onClick={confirmCreateNewPlan} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm">Criar Ciclo</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};
