import React, { useState, useEffect, useMemo } from 'react';
import { DietPlan as DietPlanType, Meal, FoodItem, Nutritionist } from '../types';
import { Clock, Plus, Trash2, Edit2, Save, X, ChefHat, Copy, Check, PieChart, Search, Calendar, Archive, FilePlus, ChevronLeft, Zap, Target, Droplets, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DietPDFReport } from './DietPDFReport';

interface DietPlanProps {
  plans: DietPlanType[];
  onUpdatePlans: (plans: DietPlanType[]) => void;
  patientName: string;
  patientWeight?: number;
  targetCalories?: number; // Nova Prop para Meta
  nutritionist: Nutritionist;
  readOnly?: boolean;
}

// --- BANCO DE DADOS DE ALIMENTOS (Baseado na TACO/TBCA - Por 100g) ---
const FOOD_DATABASE = [
  // --- PROTEÍNAS ANIMAIS ---
  { name: 'Peito de Frango Grelhado', protein: 32.0, carbs: 0.0, fats: 2.5, calories: 159, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Peito de Frango Cozido', protein: 31.5, carbs: 0.0, fats: 3.2, calories: 163, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Sobrecoxa de Frango Assada (sem pele)', protein: 26.0, carbs: 0.0, fats: 11.0, calories: 230, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Carne Moída (Patinho) Refogada', protein: 35.9, carbs: 0.0, fats: 7.3, calories: 219, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Patinho Grelhado (Bife)', protein: 35.9, carbs: 0.0, fats: 7.3, calories: 219, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Filé Mignon Grelhado (sem gordura)', protein: 32.8, carbs: 0.0, fats: 8.8, calories: 220, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Alcatra Grelhada (sem gordura)', protein: 31.9, carbs: 0.0, fats: 11.6, calories: 241, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Maminha Grelhada (sem gordura)', protein: 30.7, carbs: 0.0, fats: 2.4, calories: 153, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Lagarto Cozido', protein: 32.9, carbs: 0.0, fats: 9.1, calories: 222, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Coxão Mole Refogado (sem gordura)', protein: 32.4, carbs: 0.0, fats: 8.9, calories: 219, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Coxão Duro Cozido', protein: 31.0, carbs: 0.0, fats: 9.0, calories: 217, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Músculo Cozido', protein: 31.2, carbs: 0.0, fats: 6.7, calories: 194, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Lombo Suíno Assado (magro)', protein: 35.7, carbs: 0.0, fats: 6.4, calories: 210, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Contrafilé Grelhado (sem gordura)', protein: 32.4, carbs: 0.0, fats: 15.5, calories: 278, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Tilápia Grelhada', protein: 26.0, carbs: 0.0, fats: 2.7, calories: 128, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Salmão Grelhado', protein: 24.0, carbs: 0.0, fats: 14.0, calories: 220, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Atum em Conserva (Água)', protein: 26.0, carbs: 0.0, fats: 1.0, calories: 116, unitWeight: 120, defaultUnit: 'lata' },
  
  // --- OVOS ---
  { name: 'Ovo de Galinha Cozido (Inteiro)', protein: 13.3, carbs: 0.6, fats: 9.5, calories: 146, unitWeight: 50, defaultUnit: 'un' },
  { name: 'Ovo de Galinha Frito (Inteiro)', protein: 15.6, carbs: 1.2, fats: 18.6, calories: 240, unitWeight: 50, defaultUnit: 'un' },
  { name: 'Ovo Mexido (simples)', protein: 14.0, carbs: 1.5, fats: 12.0, calories: 170, unitWeight: 50, defaultUnit: 'un' },
  { name: 'Clara de Ovo Cozida', protein: 13.0, carbs: 0.0, fats: 0.0, calories: 54, unitWeight: 30, defaultUnit: 'un' },
  
  // --- CARBOIDRATOS / CEREAIS / TUBÉRCULOS ---
  { name: 'Arroz Branco Cozido', protein: 2.5, carbs: 28.1, fats: 0.2, calories: 128, unitWeight: 25, defaultUnit: 'colher' },
  { name: 'Arroz Integral Cozido', protein: 2.6, carbs: 25.8, fats: 1.0, calories: 124, unitWeight: 25, defaultUnit: 'colher' },
  { name: 'Feijão Carioca Cozido', protein: 4.8, carbs: 13.6, fats: 0.5, calories: 76, unitWeight: 50, defaultUnit: 'concha' },
  { name: 'Feijão Preto Cozido', protein: 4.5, carbs: 14.0, fats: 0.5, calories: 77, unitWeight: 50, defaultUnit: 'concha' },
  { name: 'Batata Inglesa Cozida', protein: 1.2, carbs: 11.9, fats: 0.0, calories: 52, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Batata Doce Cozida', protein: 0.6, carbs: 18.4, fats: 0.1, calories: 77, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Mandioca Cozida', protein: 0.6, carbs: 30.1, fats: 0.3, calories: 125, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Macarrão Cozido (Trigo)', protein: 5.8, carbs: 30.0, fats: 0.9, calories: 157, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Tapioca (Goma Hidratada)', protein: 0.0, carbs: 54.0, fats: 0.0, calories: 240, unitWeight: 20, defaultUnit: 'colher' },
  { name: 'Cuscuz de Milho Cozido', protein: 2.2, carbs: 25.0, fats: 0.7, calories: 113, unitWeight: 100, defaultUnit: 'g' },
  
  // --- CEREAIS MATINAIS E SEMENTES ---
  { name: 'Granola Tradicional', protein: 10.0, carbs: 70.0, fats: 16.0, calories: 471, unitWeight: 20, defaultUnit: 'colher' },
  { name: 'Aveia em Flocos', protein: 13.9, carbs: 66.6, fats: 8.5, calories: 394, unitWeight: 15, defaultUnit: 'colher' },
  { name: 'Farelo de Aveia', protein: 17.3, carbs: 66.2, fats: 7.0, calories: 246, unitWeight: 15, defaultUnit: 'colher' },
  { name: 'Semente de Chia', protein: 16.5, carbs: 42.1, fats: 30.7, calories: 486, unitWeight: 10, defaultUnit: 'colher' },
  { name: 'Semente de Linhaça', protein: 14.1, carbs: 43.3, fats: 32.3, calories: 495, unitWeight: 10, defaultUnit: 'colher' },
  { name: 'Corn Flakes (Milho)', protein: 7.0, carbs: 84.0, fats: 1.0, calories: 370, unitWeight: 30, defaultUnit: 'xícara' },

  // --- AÇÚCARES E ADOÇANTES ---
  { name: 'Mel de Abelha', protein: 0.0, carbs: 82.0, fats: 0.0, calories: 304, unitWeight: 20, defaultUnit: 'colher' },
  { name: 'Açúcar Mascavo', protein: 0.0, carbs: 95.0, fats: 0.0, calories: 380, unitWeight: 5, defaultUnit: 'colher' },

  // --- PANIFICADOS ---
  { name: 'Pão Francês', protein: 8.0, carbs: 58.0, fats: 3.0, calories: 300, unitWeight: 50, defaultUnit: 'un' },
  { name: 'Pão de Forma Integral', protein: 9.4, carbs: 49.0, fats: 3.7, calories: 253, unitWeight: 25, defaultUnit: 'fatia' },
  
  // --- LATICÍNIOS ---
  { name: 'Leite Integral (Vaca)', protein: 3.2, carbs: 4.7, fats: 3.0, calories: 60, unitWeight: 200, defaultUnit: 'ml' },
  { name: 'Leite Desnatado (Vaca)', protein: 3.0, carbs: 4.9, fats: 0.0, calories: 35, unitWeight: 200, defaultUnit: 'ml' },
  { name: 'Iogurte Natural', protein: 4.0, carbs: 5.0, fats: 3.0, calories: 60, unitWeight: 170, defaultUnit: 'pote' },
  { name: 'Queijo Minas Frescal', protein: 17.4, carbs: 3.2, fats: 20.2, calories: 264, unitWeight: 30, defaultUnit: 'fatia' },
  { name: 'Queijo Muçarela', protein: 22.6, carbs: 3.0, fats: 21.6, calories: 300, unitWeight: 20, defaultUnit: 'fatia' },
  { name: 'Queijo Cottage', protein: 11.0, carbs: 3.4, fats: 4.3, calories: 98, unitWeight: 30, defaultUnit: 'colher' },
  { name: 'Requeijão Cremoso', protein: 9.6, carbs: 2.4, fats: 26.0, calories: 280, unitWeight: 30, defaultUnit: 'colher' },
  
  // --- FRUTAS ---
  { name: 'Banana Prata', protein: 1.3, carbs: 26.0, fats: 0.1, calories: 98, unitWeight: 70, defaultUnit: 'un' },
  { name: 'Banana Nanica', protein: 1.4, carbs: 24.0, fats: 0.1, calories: 92, unitWeight: 80, defaultUnit: 'un' },
  { name: 'Maçã Fuji (com casca)', protein: 0.3, carbs: 15.0, fats: 0.2, calories: 56, unitWeight: 130, defaultUnit: 'un' },
  { name: 'Mamão Papaya', protein: 0.5, carbs: 10.0, fats: 0.1, calories: 40, unitWeight: 150, defaultUnit: 'fatia' },
  { name: 'Abacaxi Pérola', protein: 0.9, carbs: 12.3, fats: 0.1, calories: 48, unitWeight: 80, defaultUnit: 'fatia' },
  { name: 'Abacate', protein: 1.2, carbs: 6.0, fats: 8.4, calories: 96, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Morango', protein: 0.9, carbs: 6.8, fats: 0.3, calories: 30, unitWeight: 10, defaultUnit: 'un' },
  { name: 'Melancia', protein: 0.9, carbs: 8.1, fats: 0.0, calories: 33, unitWeight: 200, defaultUnit: 'fatia' },
  { name: 'Laranja Pera', protein: 1.0, carbs: 8.9, fats: 0.1, calories: 37, unitWeight: 130, defaultUnit: 'un' },
  { name: 'Uva Rubi', protein: 0.6, carbs: 12.7, fats: 0.2, calories: 49, unitWeight: 5, defaultUnit: 'un' },
  { name: 'Goiaba Vermelha', protein: 0.9, carbs: 11.8, fats: 0.1, calories: 54, unitWeight: 170, defaultUnit: 'un' },
  { name: 'Acerola', protein: 0.9, carbs: 8.0, fats: 0.2, calories: 33, unitWeight: 10, defaultUnit: 'un' },
  { name: 'Manga Palmer', protein: 0.4, carbs: 17.0, fats: 0.2, calories: 72, unitWeight: 200, defaultUnit: 'un' },
  { name: 'Pera Williams', protein: 0.6, carbs: 14.0, fats: 0.2, calories: 53, unitWeight: 150, defaultUnit: 'un' },
  { name: 'Kiwi', protein: 1.3, carbs: 14.8, fats: 0.6, calories: 63, unitWeight: 76, defaultUnit: 'un' },

  // --- BEBIDAS E VITAMINAS (Estimado com Leite Integral) ---
  { name: 'Vitamina de Banana (com Leite)', protein: 3.5, carbs: 14.0, fats: 3.0, calories: 95, unitWeight: 250, defaultUnit: 'ml' },
  { name: 'Vitamina de Abacate (com Leite)', protein: 3.0, carbs: 6.0, fats: 6.0, calories: 90, unitWeight: 250, defaultUnit: 'ml' },
  { name: 'Vitamina de Morango (com Leite)', protein: 3.0, carbs: 8.0, fats: 3.0, calories: 70, unitWeight: 250, defaultUnit: 'ml' },
  { name: 'Vitamina de Frutas Mistas (com Leite)', protein: 3.2, carbs: 12.0, fats: 3.0, calories: 85, unitWeight: 250, defaultUnit: 'ml' },
  { name: 'Suco de Laranja (Natural)', protein: 0.7, carbs: 10.5, fats: 0.2, calories: 45, unitWeight: 250, defaultUnit: 'ml' },
  { name: 'Suco de Uva (Integral)', protein: 0.7, carbs: 15.0, fats: 0.0, calories: 60, unitWeight: 250, defaultUnit: 'ml' },
  { name: 'Água de Coco', protein: 0.0, carbs: 5.5, fats: 0.0, calories: 22, unitWeight: 250, defaultUnit: 'ml' },

  // --- LEGUMES E VERDURAS ---
  { name: 'Alface (Americana/Crespa/Lisa)', protein: 1.3, carbs: 2.9, fats: 0.2, calories: 14, unitWeight: 10, defaultUnit: 'folha' },
  { name: 'Rúcula', protein: 2.6, carbs: 3.7, fats: 0.7, calories: 25, unitWeight: 10, defaultUnit: 'folha' },
  { name: 'Agrião', protein: 2.3, carbs: 1.3, fats: 0.1, calories: 11, unitWeight: 10, defaultUnit: 'ramo' },
  { name: 'Espinafre Refogado', protein: 2.7, carbs: 4.2, fats: 0.3, calories: 23, unitWeight: 30, defaultUnit: 'colher' },
  { name: 'Couve Manteiga Refogada', protein: 1.7, carbs: 5.7, fats: 0.5, calories: 36, unitWeight: 30, defaultUnit: 'colher' },
  { name: 'Repolho Branco Cru', protein: 1.3, carbs: 5.8, fats: 0.1, calories: 25, unitWeight: 20, defaultUnit: 'colher' },
  { name: 'Repolho Roxo Cru', protein: 1.4, carbs: 7.4, fats: 0.2, calories: 31, unitWeight: 20, defaultUnit: 'colher' },
  { name: 'Tomate', protein: 1.1, carbs: 3.1, fats: 0.2, calories: 15, unitWeight: 80, defaultUnit: 'un' },
  { name: 'Pepino Japonês', protein: 0.7, carbs: 3.6, fats: 0.1, calories: 15, unitWeight: 50, defaultUnit: 'un' },
  { name: 'Rabanete', protein: 0.7, carbs: 3.4, fats: 0.1, calories: 16, unitWeight: 20, defaultUnit: 'un' },
  { name: 'Brócolis Cozido', protein: 2.1, carbs: 4.4, fats: 0.5, calories: 25, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Couve-Flor Cozida', protein: 1.9, carbs: 4.1, fats: 0.3, calories: 23, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Cenoura Crua', protein: 1.3, carbs: 7.7, fats: 0.2, calories: 34, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Cenoura Cozida', protein: 0.8, carbs: 6.7, fats: 0.2, calories: 30, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Beterraba Cozida', protein: 1.3, carbs: 7.2, fats: 0.1, calories: 32, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Beterraba Crua Ralada', protein: 1.6, carbs: 9.6, fats: 0.1, calories: 43, unitWeight: 20, defaultUnit: 'colher' },
  { name: 'Abobrinha Italiana Cozida', protein: 1.1, carbs: 3.0, fats: 0.2, calories: 15, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Vagem Cozida', protein: 1.8, carbs: 7.9, fats: 0.1, calories: 35, unitWeight: 30, defaultUnit: 'colher' },
  { name: 'Chuchu Cozido', protein: 0.4, carbs: 4.8, fats: 0.1, calories: 19, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Abóbora Cabotiá Cozida', protein: 1.4, carbs: 10.8, fats: 0.7, calories: 48, unitWeight: 100, defaultUnit: 'g' },
  { name: 'Salada Mista (Folhas e Tomate)', protein: 1.2, carbs: 3.5, fats: 0.2, calories: 20, unitWeight: 100, defaultUnit: 'g' },

  // --- GORDURAS E OLEAGINOSAS ---
  { name: 'Azeite de Oliva', protein: 0.0, carbs: 0.0, fats: 100.0, calories: 884, unitWeight: 13, defaultUnit: 'colher' },
  { name: 'Manteiga (com sal)', protein: 0.4, carbs: 0.0, fats: 83.0, calories: 726, unitWeight: 10, defaultUnit: 'colher' },
  { name: 'Pasta de Amendoim (Integral)', protein: 25.0, carbs: 20.0, fats: 50.0, calories: 590, unitWeight: 15, defaultUnit: 'colher' },
  { name: 'Castanha do Pará', protein: 14.0, carbs: 12.0, fats: 66.0, calories: 656, unitWeight: 5, defaultUnit: 'un' },
  
  // --- SUPLEMENTOS E OUTROS ---
  { name: 'Whey Protein (Concentrado Padrão)', protein: 80.0, carbs: 5.0, fats: 2.0, calories: 360, unitWeight: 30, defaultUnit: 'scoop' },
  { name: 'Creatina', protein: 0.0, carbs: 0.0, fats: 0.0, calories: 0, unitWeight: 5, defaultUnit: 'g' },
  { name: 'Chocolate 70% Cacau', protein: 8.0, carbs: 34.0, fats: 42.0, calories: 580, unitWeight: 25, defaultUnit: 'g' },
];

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper para remover acentos para busca
const normalizeText = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const calculateDayTotals = (dayMeals: Meal[]) => {
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
    dayMeals.forEach(meal => {
        if (meal.isCheatMeal) return;
        meal.items.forEach(item => {
            totalP += Number(item.protein) || 0;
            totalC += Number(item.carbs) || 0;
            totalF += Number(item.fats) || 0;
            totalKcal += Number(item.calories) || ((Number(item.protein) || 0) * 4 + (Number(item.carbs) || 0) * 4 + (Number(item.fats) || 0) * 9);
        });
    });
    return { kcal: totalKcal, p: totalP, c: totalC, f: totalF };
  };

const createDefaultMeals = (): Meal[] => [
    { id: generateId(), name: 'Café da Manhã', time: '07:30', items: [] },
    { id: generateId(), name: 'Almoço', time: '12:30', items: [] },
    { id: generateId(), name: 'Lanche da Tarde', time: '16:00', items: [] },
    { id: generateId(), name: 'Jantar', time: '20:00', items: [] },
];

const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const DietPlan: React.FC<DietPlanProps> = ({ plans = [], onUpdatePlans, patientName, patientWeight = 70, targetCalories, nutritionist, readOnly = false }) => {
  // State for which plan is currently being viewed
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Segunda');
  
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

  // Prepare data for PDF (handle migration for display)
  const pdfPlanData = useMemo(() => {
      if (!currentPlan) return null;
      const plan = JSON.parse(JSON.stringify(currentPlan)); // Deep copy
      
      // Migration logic: If days are missing, populate them with the main meals
      if (!plan.days || plan.days.length === 0) {
          plan.days = DAYS_OF_WEEK.map((day: string) => ({
              day,
              meals: JSON.parse(JSON.stringify(plan.meals || []))
          }));
      }
      return plan;
  }, [currentPlan]);

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

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = React.useRef<HTMLDivElement>(null);

  const handleGeneratePDF = async () => {
    if (!currentPlan || !pdfRef.current) return;
    setIsGeneratingPDF(true);
    
    try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Garantir render
        
        const canvas = await html2canvas(pdfRef.current, {
            scale: 2, // Melhor qualidade
            useCORS: true,
            logging: false,
            windowWidth: 1200 // Forçar largura desktop para layout
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`Dieta_${patientName.replace(/\s+/g, '_')}.pdf`);
        
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
        setIsGeneratingPDF(false);
    }
  };

  // Load form when editing starts
  useEffect(() => {
    if (isEditing && currentPlan) {
        const deepCopy = JSON.parse(JSON.stringify(currentPlan));
        // Se não tiver meta de água, sugere 35ml/kg
        if (!deepCopy.waterTarget) {
            deepCopy.waterTarget = Math.round(patientWeight * 35);
        }

        // Initialize days if missing (Migration from single day to weekly)
        if (!deepCopy.days || deepCopy.days.length === 0) {
            deepCopy.days = DAYS_OF_WEEK.map(day => ({
                day,
                meals: JSON.parse(JSON.stringify(deepCopy.meals || [])) // Copy existing meals to all days
            }));
        }

        setEditForm(deepCopy);
    }
  }, [isEditing, currentPlan, patientWeight]);

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
    let notes = '';
    let waterTarget = Math.round(patientWeight * 35); // Default 35ml/kg
    let days: DayPlan[] = [];

    if (newPlanType === 'copy' && currentPlan) {
        newMeals = currentPlan.meals.map(m => ({
            ...m, 
            id: generateId(), 
            items: m.items.map(i => ({...i, id: generateId()}))
        }));
        notes = currentPlan.notes || '';
        waterTarget = currentPlan.waterTarget || waterTarget;

        // Copy days if exist
        if (currentPlan.days && currentPlan.days.length > 0) {
            days = currentPlan.days.map(d => ({
                day: d.day,
                meals: d.meals.map(m => ({
                    ...m,
                    id: generateId(),
                    items: m.items.map(i => ({...i, id: generateId()}))
                }))
            }));
        } else {
            // If copying from a plan without days, initialize days with copied meals
            days = DAYS_OF_WEEK.map(day => ({
                day,
                meals: JSON.parse(JSON.stringify(newMeals))
            }));
        }
    } else {
        // Blank plan
        days = DAYS_OF_WEEK.map(day => ({
            day,
            meals: createDefaultMeals()
        }));
    }

    const newPlan: DietPlanType = {
        id: newId,
        name: newPlanName,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        meals: newMeals,
        days: days,
        notes: notes,
        waterTarget: waterTarget
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





  // --- FORM HANDLERS (Updated for Weekly Plan) ---
  
  const getCurrentDayMeals = () => {
      if (!editForm) return [];
      const dayPlan = editForm.days?.find(d => d.day === selectedDay);
      return dayPlan ? dayPlan.meals : (editForm.meals || []);
  };

  const updateCurrentDayMeals = (newMeals: Meal[]) => {
      if (!editForm) return;
      
      // Ensure days structure exists
      let days = editForm.days || [];
      if (days.length === 0) {
          days = DAYS_OF_WEEK.map(d => ({ day: d, meals: [] }));
      }

      const updatedDays = days.map(d => d.day === selectedDay ? { ...d, meals: newMeals } : d);

      setEditForm(prev => ({
          ...prev!,
          days: updatedDays,
          // Sync main meals array with Monday for backward compatibility
          meals: selectedDay === 'Segunda' ? newMeals : prev!.meals
      }));
  };

  const handleMealChange = (mealId: string, field: keyof Meal, value: any) => {
    const currentMeals = getCurrentDayMeals();
    const updatedMeals = currentMeals.map(m => m.id === mealId ? { ...m, [field]: value } : m);
    updateCurrentDayMeals(updatedMeals);
  };

  const handleAddMeal = () => {
    const currentMeals = getCurrentDayMeals();
    const newMeal: Meal = { id: generateId(), name: 'Nova Refeição', time: '08:00', items: [] };
    updateCurrentDayMeals([...currentMeals, newMeal]);
  };

  const handleRemoveMeal = (mealId: string) => {
    const currentMeals = getCurrentDayMeals();
    updateCurrentDayMeals(currentMeals.filter(m => m.id !== mealId));
  };

  const handleItemChange = (mealId: string, itemId: string, field: keyof FoodItem, value: string) => {
    if (!editForm) return;
    
    // Logic for auto-calculation (keeps manual overrides valid)
    const calculateNutrition = (currentName: string, currentQtyStr: string, currentUnit: string = 'g'): Partial<FoodItem> => {
        const normalizedInput = normalizeText(currentName);
        const foodDB = FOOD_DATABASE.find(f => normalizeText(f.name) === normalizedInput);
        
        if (!foodDB) return {};
        
        const qtyNumber = parseFloat(currentQtyStr.replace(/[^0-9.]/g, ''));
        if (!qtyNumber || isNaN(qtyNumber)) return {};
        
        let factor = 1;

        if (currentUnit === 'g' || currentUnit === 'ml') {
            factor = qtyNumber / 100;
        } else if (foodDB.unitWeight) {
            factor = (qtyNumber * foodDB.unitWeight) / 100;
        } else {
            factor = qtyNumber / 100; // Default to grams behavior
        }
        
        return {
            protein: parseFloat((foodDB.protein * factor).toFixed(1)),
            carbs: parseFloat((foodDB.carbs * factor).toFixed(1)),
            fats: parseFloat((foodDB.fats * factor).toFixed(1)),
            calories: parseFloat((foodDB.calories * factor).toFixed(1))
        };
    };

    const currentMeals = getCurrentDayMeals();
    const updatedMeals = currentMeals.map(m => {
        if (m.id === mealId) {
            return {
                ...m,
                items: m.items.map(i => {
                    if (i.id === itemId) {
                        let updatedItem = { ...i, [field]: value };
                        
                        // If name, quantity or unit changes, try to recalculate
                        if (field === 'name' || field === 'quantity' || field === 'unit') {
                            const nameToUse = field === 'name' ? value : updatedItem.name;
                            const qtyToUse = field === 'quantity' ? value : updatedItem.quantity;
                            const unitToUse = field === 'unit' ? value : (updatedItem.unit || 'g');
                            
                            const autoMacros = calculateNutrition(nameToUse, qtyToUse, unitToUse);
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
    });
    
    updateCurrentDayMeals(updatedMeals);

    if (field === 'name') {
        setActiveSuggestionId(value.length >= 2 ? itemId : null);
    }
  };

  const handleSelectSuggestion = (mealId: string, itemId: string, food: typeof FOOD_DATABASE[0]) => {
     if (!editForm) return;
     
     const currentMeals = getCurrentDayMeals();
     const currentMeal = currentMeals.find(m => m.id === mealId);
     const currentItem = currentMeal?.items.find(i => i.id === itemId);
     
     // Use existing quantity if present, else default to 100g or 1 unit
     const currentQty = currentItem?.quantity && currentItem.quantity.trim() !== '' ? currentItem.quantity : '1';
     const qtyNumber = parseFloat(currentQty.replace(/[^0-9.]/g, '')) || 1;
     
     // Determine unit
     const unitToUse = food.defaultUnit || 'g';
     
     // Calculate factor
     let factor = 1;
     if (unitToUse === 'g' || unitToUse === 'ml') {
         factor = qtyNumber / 100;
     } else if (food.unitWeight) {
         factor = (qtyNumber * food.unitWeight) / 100;
     } else {
         factor = qtyNumber / 100; // Fallback
     }

     const updatedMeals = currentMeals.map(m => {
        if (m.id === mealId) {
            return {
                ...m,
                items: m.items.map(i => {
                    if (i.id === itemId) {
                        return {
                            ...i,
                            name: food.name,
                            quantity: currentQty,
                            unit: unitToUse,
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
    });

    updateCurrentDayMeals(updatedMeals);
    setActiveSuggestionId(null);
  };

  const handleAddItem = (mealId: string) => {
    const currentMeals = getCurrentDayMeals();
    const newItem: FoodItem = { id: generateId(), name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0 };
    const updatedMeals = currentMeals.map(m => m.id === mealId ? { ...m, items: [...m.items, newItem] } : m);
    updateCurrentDayMeals(updatedMeals);
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    const currentMeals = getCurrentDayMeals();
    const updatedMeals = currentMeals.map(m => m.id === mealId ? { ...m, items: m.items.filter(i => i.id !== itemId) } : m);
    updateCurrentDayMeals(updatedMeals);
  };

  const handleCopyDay = (targetDay: string) => {
      if (!editForm) return;
      const currentMeals = getCurrentDayMeals();
      
      // Deep copy meals
      const copiedMeals = JSON.parse(JSON.stringify(currentMeals)).map((m: Meal) => ({
          ...m,
          id: generateId(),
          items: m.items.map(i => ({ ...i, id: generateId() }))
      }));

      const days = editForm.days || [];
      const updatedDays = days.map(d => d.day === targetDay ? { ...d, meals: copiedMeals } : d);

      setEditForm(prev => ({
          ...prev!,
          days: updatedDays,
          meals: targetDay === 'Segunda' ? copiedMeals : prev!.meals
      }));
      
      alert(`Plano de ${selectedDay} copiado para ${targetDay}!`);
  };

  // --- CALCULATIONS ---
  const totals = useMemo(() => {
    const data = isEditing ? editForm : currentPlan;
    if (!data) return { kcal: 0, p: 0, c: 0, f: 0 };

    // Get meals for selected day
    let meals: Meal[] = [];
    if (data.days && data.days.length > 0) {
        const dayPlan = data.days.find(d => d.day === selectedDay);
        meals = dayPlan ? dayPlan.meals : [];
    } else {
        meals = data.meals || [];
    }

    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;

    meals.forEach(meal => {
        if (meal.isCheatMeal) return; // Optional: Don't count cheat meals? Or count them? User didn't specify. Let's count them for now.
        // Actually, usually cheat meals don't have macros defined or are just "Free".
        // If items exist, count them.
        
        meal.items.forEach(item => {
            totalP += Number(item.protein) || 0;
            totalC += Number(item.carbs) || 0;
            totalF += Number(item.fats) || 0;
            totalKcal += Number(item.calories) || ((Number(item.protein) || 0) * 4 + (Number(item.carbs) || 0) * 4 + (Number(item.fats) || 0) * 9);
        });
    });
    return { kcal: totalKcal, p: totalP, c: totalC, f: totalF };
  }, [currentPlan, editForm, isEditing, selectedDay]);

  const handleCopyDiet = () => {
    if (!currentPlan) return;
    
    let text = `📅 ${currentPlan.name} - ${patientName}\n`;
    text += `💧 Meta de Água: ${(currentPlan.waterTarget || 2000) / 1000}L\n\n`;

    const printMeals = (meals: Meal[], dayName?: string) => {
        let t = dayName ? `=== ${dayName.toUpperCase()} ===\n\n` : '';
        meals.forEach(meal => {
            t += `⏰ ${meal.time} - ${meal.name} ${meal.isCheatMeal ? '(Refeição Livre 🍔)' : ''}\n`;
            if (meal.isCheatMeal && meal.items.length === 0) {
                 t += `• Refeição Livre\n`;
            }
            meal.items.forEach(item => {
                const unit = item.unit ? ` ${item.unit}` : 'g';
                t += `• ${item.quantity}${unit} ${item.name} (${item.calories.toFixed(0)} kcal)\n`;
            });
            t += '\n';
        });
        return t;
    };

    if (currentPlan.days && currentPlan.days.length > 0) {
        currentPlan.days.forEach(d => {
             // Only print days that have meals or if it's a valid plan
             if (d.meals.length > 0) {
                text += printMeals(d.meals, d.day);
                text += '\n';
             }
        });
    } else {
        text += printMeals(currentPlan.meals);
    }
    
    if (currentPlan.notes) {
        text += `📝 Observações: ${currentPlan.notes}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const MacroSummary = ({ customTotals, isPdf = false }: { customTotals?: { kcal: number, p: number, c: number, f: number }, isPdf?: boolean }) => {
    const t = customTotals || totals;
    if (t.kcal === 0 && !isEditing && !customTotals) return null;
    const calFromP = t.p * 4;
    const calFromC = t.c * 4;
    const calFromF = t.f * 9;
    const validTotal = (calFromP + calFromC + calFromF) || t.kcal || 1; 
    const pctP = Math.round((calFromP / validTotal) * 100);
    const pctC = Math.round((calFromC / validTotal) * 100);
    const pctF = Math.round((calFromF / validTotal) * 100);

    const diff = targetCalories ? t.kcal - targetCalories : 0;

    return (
        <div className={`${isPdf ? 'bg-white border border-slate-200 rounded-xl p-4 mb-4' : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6'} print:border print:border-slate-300`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                {!isPdf && (
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 self-start print:hidden">
                        <PieChart size={20} />
                    </div>
                )}
                
                <div className="flex-1 w-full">
                     <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Diário</span>
                            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
                                {Math.round(t.kcal).toLocaleString()} 
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">kcal</span>
                            </div>
                        </div>
                        
                        {targetCalories && targetCalories > 0 && !customTotals && (
                             <div className="text-right print:hidden">
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-end gap-1">
                                    <Target size={12} /> Meta: {targetCalories}
                                </span>
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                                    Math.abs(diff) < 50 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 
                                    diff > 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 
                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                }`}>
                                    {diff > 0 ? '+' : ''}{diff.toFixed(0)} kcal
                                    <span className="opacity-75 font-medium">
                                        ({diff > 0 ? 'Superávit' : 'Déficit'})
                                    </span>
                                </div>
                             </div>
                        )}
                     </div>
                </div>
            </div>

            <div className={`h-4 w-full ${isPdf ? 'bg-slate-100' : 'bg-slate-200 dark:bg-slate-700'} rounded-full overflow-hidden flex mb-4 relative group print:border print:border-slate-300`}>
                <div style={{ width: `${pctP}%` }} className="h-full bg-rose-500 print:bg-slate-400" title="Proteínas"></div>
                <div style={{ width: `${pctC}%` }} className="h-full bg-blue-500 print:bg-slate-600" title="Carboidratos"></div>
                <div style={{ width: `${pctF}%` }} className="h-full bg-amber-400 print:bg-slate-800" title="Lipídios"></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500 print:bg-slate-400"></div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Proteína</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-100 font-bold text-lg leading-none">{t.p.toFixed(0)}g</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">{(t.p / patientWeight).toFixed(1)}g/kg</div>
                </div>
                
                <div className="flex flex-col items-center border-x border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 print:bg-slate-600"></div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Carbo</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-100 font-bold text-lg leading-none">{t.c.toFixed(0)}g</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">{(t.c / patientWeight).toFixed(1)}g/kg</div>
                </div>
                
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400 print:bg-slate-800"></div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Lipídios</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-100 font-bold text-lg leading-none">{t.f.toFixed(0)}g</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">{(t.f / patientWeight).toFixed(1)}g/kg</div>
                </div>
            </div>
        </div>
    );
  };


  // --- VIEW: EMPTY ---
  if (plans.length === 0 && !showNewPlanModal) {
    return (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center p-8">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full mb-4 text-slate-400 dark:text-slate-500">
              <ChefHat size={48} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                {readOnly ? 'Nenhum plano alimentar disponível' : 'Nenhum plano alimentar'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                {readOnly ? 'Aguarde seu nutricionista criar um plano para você.' : 'Crie o primeiro ciclo de dieta para este paciente.'}
            </p>
            {!readOnly && (
                <button 
                onClick={handleCreateNewPlan}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2"
                >
                <Plus size={20} /> Criar Primeiro Plano
                </button>
            )}
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
        
        {/* SIDEBAR: HISTORY (Hidden in Print) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden lg:col-span-1 print:hidden">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Ciclos de Dieta</h3>
                 {!readOnly && (
                    <button onClick={handleCreateNewPlan} className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-1.5 rounded-lg transition-colors" title="Novo Ciclo">
                        <FilePlus size={18} />
                    </button>
                 )}
             </div>
             <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
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
                        className={`p-4 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 group ${
                            selectedPlanId === plan.id ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                        }`}
                     >
                         <div className="flex justify-between items-start mb-1">
                             <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${plan.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                 {plan.status === 'active' ? 'Ativo' : 'Histórico'}
                             </span>
                             {!readOnly && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                             )}
                         </div>
                         <h4 className={`font-semibold text-sm mb-1 ${selectedPlanId === plan.id ? 'text-blue-900 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                             {plan.name}
                         </h4>
                         <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                             <Calendar size={10} />
                             {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                         </div>
                     </div>
                 ))}
             </div>
        </div>

        {/* MAIN: CONTENT */}
        <div className="lg:col-span-3 w-full">
            {currentPlan && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 print:border-none print:shadow-none print:p-0 print:w-full">
                    
                    {/* Header Impressão */}
                    <div className="hidden print:block mb-8 text-center border-b border-slate-300 pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-left">
                                <h1 className="text-2xl font-bold text-slate-900">Plano Alimentar</h1>
                                <p className="text-slate-600">Paciente: {patientName}</p>
                            </div>
                            <div className="text-right text-sm">
                                <p className="font-bold">{nutritionist.name}</p>
                                <p>{nutritionist.crn}</p>
                            </div>
                        </div>
                    </div>

                    {/* Header Tela */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 print:hidden">
                        <div>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editForm?.name || ''}
                                    onChange={(e) => setEditForm({...editForm!, name: e.target.value})}
                                    className="text-xl font-bold text-slate-900 dark:text-slate-100 border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none bg-transparent placeholder-slate-400"
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{currentPlan.name}</h2>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Criado em {new Date(currentPlan.createdAt).toLocaleDateString('pt-BR')} • {currentPlan.meals.length} refeições
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm">Cancelar</button>
                                    <button onClick={handleSaveEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                                        <Save size={16} /> Salvar
                                    </button>
                                </>
                            ) : (
                                <>

                                    <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm disabled:opacity-50">
                                        <FileDown size={16} /> <span className="hidden sm:inline">{isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}</span>
                                    </button>
                                    <button onClick={handleCopyDiet} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm">
                                        {copied ? <Check size={16} className="text-blue-600 dark:text-blue-400" /> : <Copy size={16} />}
                                        <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar Texto'}</span>
                                    </button>
                                    {!readOnly && (
                                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                                            <Edit2 size={16} /> Editar
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Water Tracker Section */}
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between print:border-slate-300 print:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full print:hidden">
                                <Droplets size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Meta de Hidratação</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400 print:text-slate-600">Calculado base 35ml/kg</p>
                            </div>
                        </div>
                        {isEditing ? (
                             <div className="flex items-center gap-2">
                                <input 
                                    type="number"
                                    value={editForm?.waterTarget || 2000}
                                    onChange={(e) => setEditForm({...editForm!, waterTarget: Number(e.target.value)})}
                                    className="w-20 text-right font-bold text-blue-900 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <span className="text-sm font-bold text-blue-900 dark:text-blue-300">ml</span>
                             </div>
                        ) : (
                            <div className="text-xl font-bold text-blue-800 dark:text-blue-200 print:text-slate-800">
                                {((currentPlan.waterTarget || 2000) / 1000).toFixed(1)} <span className="text-sm">Litros/dia</span>
                            </div>
                        )}
                    </div>

                    <MacroSummary />

                    {/* Day Tabs */}
                    <div className="flex flex-col gap-4 mb-6 print:hidden">
                        <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar">
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                                        selectedDay === day 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        
                        {isEditing && (
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                <Copy size={14} className="text-slate-400" />
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Copiar {selectedDay} para:</span>
                                <select 
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            if (window.confirm(`Copiar plano de ${selectedDay} para ${e.target.value}?`)) {
                                                handleCopyDay(e.target.value);
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                    className="text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Selecione um dia...</option>
                                    {DAYS_OF_WEEK.filter(d => d !== selectedDay).map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Editor / Viewer Body */}
                    <div className="space-y-6 print:space-y-4">
                         {/* Header do Dia na Impressão */}
                         <div className="hidden print:block mb-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1">{selectedDay}</h3>
                         </div>

                         {(() => {
                            const data = isEditing ? editForm : currentPlan;
                            let mealsToRender: Meal[] = [];
                            if (data?.days && data.days.length > 0) {
                                const dayPlan = data.days.find(d => d.day === selectedDay);
                                mealsToRender = dayPlan ? dayPlan.meals : [];
                            } else {
                                mealsToRender = data?.meals || [];
                            }

                            if (mealsToRender.length === 0 && !isEditing) {
                                return (
                                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic">
                                        Nenhuma refeição planejada para {selectedDay}.
                                    </div>
                                );
                            }

                            return mealsToRender.map((meal) => (
                             <div key={meal.id} className={`rounded-xl p-4 border transition-all ${isEditing ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm'} print:border-slate-300 print:shadow-none print:break-inside-avoid`}>
                                 {/* Meal Header */}
                                 <div className="flex justify-between items-center mb-3">
                                     <div className="flex items-center gap-3 flex-wrap">
                                         {isEditing ? (
                                             <input 
                                                 type="time" 
                                                 value={meal.time} 
                                                 onChange={(e) => handleMealChange(meal.id, 'time', e.target.value)}
                                                 className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm font-bold w-24 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                                             />
                                         ) : (
                                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg print:bg-slate-100 print:text-slate-800 print:border print:border-slate-200">
                                                <Clock size={14} className="print:hidden" />
                                                {meal.time}
                                            </div>
                                         )}
                                         
                                         {isEditing ? (
                                             <div className="flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    value={meal.name}
                                                    onChange={(e) => handleMealChange(meal.id, 'name', e.target.value)}
                                                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm font-bold w-40 sm:w-64 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                                                />
                                                <label className="flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={meal.isCheatMeal || false}
                                                        onChange={(e) => handleMealChange(meal.id, 'isCheatMeal', e.target.checked)}
                                                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Livre</span>
                                                </label>
                                             </div>
                                         ) : (
                                             <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                {meal.name}
                                                {meal.isCheatMeal && (
                                                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                                        Refeição Livre 🍔
                                                    </span>
                                                )}
                                             </h3>
                                         )}
                                     </div>
                                     
                                     <div className="flex items-center gap-2">
                                         {!isEditing && (
                                             <div className="flex items-center gap-3 text-xs font-medium text-slate-400 dark:text-slate-500 print:hidden">
                                                 <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                    {meal.items.reduce((acc, i) => acc + (Number(i.protein) || 0), 0).toFixed(1)}g P
                                                 </span>
                                                 <span className="flex items-center gap-1">
                                                    {meal.items.reduce((acc, i) => acc + (Number(i.calories) || 0), 0).toFixed(0)} kcal
                                                 </span>
                                             </div>
                                         )}
                                         {isEditing && (
                                             <button onClick={() => handleRemoveMeal(meal.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                                         )}
                                     </div>
                                 </div>

                                 {/* Meal Items */}
                                 <ul className="space-y-2">
                                     {meal.items.map(item => (
                                         <li key={item.id} className={`flex flex-col sm:flex-row gap-2 sm:items-center text-sm ${isEditing ? 'bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700' : ''}`}>
                                             {isEditing ? (
                                                 <>
                                                     <div className="flex gap-2 w-full sm:w-auto">
                                                         <input 
                                                             className="w-16 p-1 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 outline-none text-center" 
                                                             placeholder="Qtd" 
                                                             value={item.quantity} 
                                                             onChange={(e) => handleItemChange(meal.id, item.id, 'quantity', e.target.value)} 
                                                         />
                                                         <select
                                                            className="w-16 p-1 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 outline-none"
                                                            value={item.unit || 'g'}
                                                            onChange={(e) => handleItemChange(meal.id, item.id, 'unit', e.target.value)}
                                                         >
                                                            <option value="g">g</option>
                                                            <option value="ml">ml</option>
                                                            <option value="un">un</option>
                                                            <option value="fatia">fatia</option>
                                                            <option value="colher">colher</option>
                                                            <option value="xícara">xícara</option>
                                                            <option value="scoop">scoop</option>
                                                            <option value="lata">lata</option>
                                                            <option value="pote">pote</option>
                                                            <option value="concha">concha</option>
                                                            <option value="folha">folha</option>
                                                         </select>
                                                         <div className="relative flex-1 sm:w-64">
                                                             <div className="relative">
                                                                <input 
                                                                    className="w-full p-1 border border-slate-300 dark:border-slate-600 rounded text-xs pr-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 outline-none" 
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
                                                                <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-50 max-h-48 overflow-y-auto mt-1 custom-scrollbar">
                                                                    {FOOD_DATABASE.filter(f => normalizeText(f.name).includes(normalizeText(item.name))).map((f, idx) => (
                                                                        <div 
                                                                            key={idx} 
                                                                            onClick={() => handleSelectSuggestion(meal.id, item.id, f)} 
                                                                            className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-0 group"
                                                                        >
                                                                            <div className="font-medium text-slate-700 dark:text-slate-200 text-xs">{f.name}</div>
                                                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex gap-2">
                                                                                <span className="font-semibold text-slate-500 dark:text-slate-400">{f.calories.toFixed(0)}kcal</span>
                                                                                <span>P:{f.protein}</span>
                                                                                <span>C:{f.carbs}</span>
                                                                                <span>G:{f.fats}</span>
                                                                                <span className="ml-auto text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Selecionar</span>
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
                                                         <input type="number" className="w-16 p-1 border border-rose-200 dark:border-rose-900/50 rounded text-xs text-center bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-200 placeholder-rose-300 focus:border-rose-500 outline-none [color-scheme:light] dark:[color-scheme:dark]" placeholder="P" value={item.protein} onChange={(e) => handleItemChange(meal.id, item.id, 'protein', e.target.value)} />
                                                         <input type="number" className="w-16 p-1 border border-blue-200 dark:border-blue-900/50 rounded text-xs text-center bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 placeholder-blue-300 focus:border-blue-500 outline-none [color-scheme:light] dark:[color-scheme:dark]" placeholder="C" value={item.carbs} onChange={(e) => handleItemChange(meal.id, item.id, 'carbs', e.target.value)} />
                                                         <input type="number" className="w-16 p-1 border border-amber-200 dark:border-amber-900/50 rounded text-xs text-center bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 placeholder-amber-300 focus:border-amber-500 outline-none [color-scheme:light] dark:[color-scheme:dark]" placeholder="G" value={item.fats} onChange={(e) => handleItemChange(meal.id, item.id, 'fats', e.target.value)} />
                                                     </div>
                                                     <div className="flex items-center justify-between flex-1">
                                                         <span className="text-xs text-slate-400 dark:text-slate-500 w-12 text-right">{item.calories?.toFixed(0)}kcal</span>
                                                         <button onClick={() => handleRemoveItem(meal.id, item.id)} className="text-slate-300 hover:text-red-500 ml-2"><X size={14}/></button>
                                                     </div>
                                                 </>
                                             ) : (
                                                 // View Mode Item
                                                 <div className="flex justify-between w-full group/item">
                                                     <div className="flex items-center">
                                                         <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 print:border print:border-slate-400 print:bg-white"></span>
                                                         <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1.5">
                                                            {item.quantity}{item.unit ? ` ${item.unit}` : 'g'}
                                                         </span>
                                                         <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                                                     </div>
                                                     {(item.calories > 0) && (
                                                         <div className="text-xs text-slate-400 dark:text-slate-500 opacity-0 group-hover/item:opacity-100 transition-opacity print:hidden">
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
                                         <button onClick={() => handleAddItem(meal.id)} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2">
                                             <Plus size={12} /> Adicionar Item
                                         </button>
                                     )}
                                 </ul>
                             </div>
                         ));
                         })()}

                         {isEditing && (
                             <button onClick={handleAddMeal} className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                                 + Adicionar Refeição
                             </button>
                         )}
                    </div>
                    
                    {/* Notes Section */}
                    <div className="mt-8">
                        {isEditing ? (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Observações</label>
                                <textarea 
                                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400" 
                                    rows={4}
                                    value={editForm?.notes || ''}
                                    onChange={(e) => setEditForm({...editForm!, notes: e.target.value})}
                                />
                            </div>
                        ) : (
                            currentPlan.notes && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 print:bg-white print:border-slate-300">
                                    <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm mb-1 print:text-slate-800">Observações</h4>
                                    <p className="text-amber-800 dark:text-amber-300 text-sm whitespace-pre-wrap print:text-slate-600">{currentPlan.notes}</p>
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Novo Ciclo de Dieta</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Plano</label>
                            <input 
                                type="text" 
                                value={newPlanName}
                                onChange={(e) => setNewPlanName(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Base do Plano</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setNewPlanType('copy')}
                                    disabled={!currentPlan}
                                    className={`p-3 rounded-xl border text-left transition-all ${newPlanType === 'copy' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                >
                                    <span className="block font-bold text-sm mb-1">Copiar Atual</span>
                                    <span className="block text-xs opacity-70">Usa o plano ativo como base</span>
                                </button>
                                <button 
                                    onClick={() => setNewPlanType('blank')}
                                    className={`p-3 rounded-xl border text-left transition-all ${newPlanType === 'blank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                >
                                    <span className="block font-bold text-sm mb-1">Em Branco</span>
                                    <span className="block text-xs opacity-70">Começar do zero</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex gap-2 items-start">
                            <Archive size={16} className="shrink-0 mt-0.5" />
                            <p>Ao criar um novo ciclo, o plano "Ativo" atual será movido automaticamente para o histórico.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setShowNewPlanModal(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">Cancelar</button>
                        <button onClick={confirmCreateNewPlan} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">Criar Ciclo</button>
                    </div>
                </div>
            </div>
        )}

        {/* PDF TEMPLATE (Hidden) */}
        {pdfPlanData && (
            <div className="absolute left-[-9999px] top-0">
                <DietPDFReport 
                    ref={pdfRef} 
                    plan={pdfPlanData} 
                    patientName={patientName} 
                    nutritionist={nutritionist} 
                />
            </div>
        )}

    </div>
  );
};