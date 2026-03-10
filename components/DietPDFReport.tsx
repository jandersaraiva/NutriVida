import React from 'react';
import { DietPlan, Nutritionist, Meal } from '../types';

interface DietPDFReportProps {
  plan: DietPlan;
  patientName: string;
  nutritionist?: Nutritionist;
}

export const DietPDFReport = React.forwardRef<HTMLDivElement, DietPDFReportProps>(({ plan, patientName, nutritionist }, ref) => {
  
  // Cálculo de macros diários para o gráfico
  const calculateDayStats = (meals: Meal[]) => {
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
    meals.forEach(meal => {
        if (meal.isCheatMeal) return;
        meal.items.forEach(item => {
            totalP += Number(item.protein) || 0;
            totalC += Number(item.carbs) || 0;
            totalF += Number(item.fats) || 0;
            totalKcal += Number(item.calories) || 0;
        });
    });
    return { kcal: totalKcal, p: totalP, c: totalC, f: totalF };
  };

  // Componente de Gráfico de Macros (SVG Puro para Impressão Perfeita)
  const MacroChart = ({ p, c, f, kcal }: { p: number, c: number, f: number, kcal: number }) => {
      if (kcal === 0) return null;
      const total = p + c + f || 1;
      const pctP = (p / total) * 100;
      const pctC = (c / total) * 100;
      const pctF = (f / total) * 100;

      return (
          <div className="flex flex-col gap-2 mb-4 break-inside-avoid">
              <div className="flex items-end gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-700">{Math.round(kcal)} kcal</span>
                  <span className="text-xs text-slate-400 mb-0.5">total diário</span>
              </div>
              {/* Barra de Progresso SVG */}
              <svg width="100%" height="12" className="rounded-full overflow-hidden">
                  <rect x="0" width={`${pctP}%`} height="100%" fill="#f43f5e" /> {/* Rose-500 */}
                  <rect x={`${pctP}%`} width={`${pctC}%`} height="100%" fill="#3b82f6" /> {/* Blue-500 */}
                  <rect x={`${pctP + pctC}%`} width={`${pctF}%`} height="100%" fill="#fbbf24" /> {/* Amber-400 */}
              </svg>
              {/* Legenda */}
              <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1">
                  <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <span>Prot: {Math.round(p)}g ({Math.round(pctP)}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Carb: {Math.round(c)}g ({Math.round(pctC)}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <span>Gord: {Math.round(f)}g ({Math.round(pctF)}%)</span>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div ref={ref} className="bg-white text-slate-900 w-[210mm] min-h-[297mm] font-sans p-12 mx-auto">
      {/* Estrutura de Tabela para Layout Fixo */}
      <table className="w-full">
        <thead className="table-header-group">
            <tr>
                <td>
                    <div className="pb-6 mb-6 border-b-2 border-slate-800 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <h1 className="text-3xl font-bold tracking-tight">NutriVida</h1>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Planejamento Nutricional</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-slate-900">{patientName}</h2>
                            <div className="text-xs text-slate-500 mt-1">
                                {nutritionist && <span>Nutricionista: {nutritionist.name} • CRN: {nutritionist.crn}</span>}
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td>
                    {/* Conteúdo Principal */}
                    <div className="space-y-8">
                        
                        {/* Resumo do Plano */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 break-inside-avoid">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plano Ativo</h3>
                                    <p className="text-2xl font-light text-slate-800">{plan.name}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Meta Hídrica</h3>
                                    <p className="text-xl font-bold text-blue-600">{plan.waterTarget ? (plan.waterTarget / 1000).toFixed(1) : '2.0'}L <span className="text-sm text-slate-400 font-normal">/ dia</span></p>
                                </div>
                            </div>
                            {plan.notes && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-sm text-slate-600 italic">"{plan.notes}"</p>
                                </div>
                            )}
                        </div>

                        {/* Dias da Semana */}
                        {plan.days?.map((day) => {
                            const stats = calculateDayStats(day.meals);
                            if (day.meals.length === 0) return null;

                            return (
                                <div key={day.day} className="break-inside-avoid pt-4">
                                    {/* Cabeçalho do Dia */}
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-bold text-slate-800">{day.day}</h2>
                                            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                                {day.meals.length} refeições
                                            </span>
                                        </div>
                                    </div>

                                    {/* Gráfico de Macros do Dia */}
                                    <MacroChart {...stats} />

                                    {/* Refeições */}
                                    <div className="space-y-4 pl-2 border-l-2 border-slate-100 ml-1">
                                        {day.meals.map((meal) => (
                                            <div key={meal.id} className="break-inside-avoid relative pl-6 pb-2">
                                                {/* Marcador de Tempo */}
                                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                                
                                                <div className="flex items-baseline justify-between mb-2">
                                                    <div className="flex items-baseline gap-3">
                                                        <span className="text-sm font-bold text-blue-600 font-mono">{meal.time}</span>
                                                        <span className="text-lg font-medium text-slate-800">{meal.name}</span>
                                                    </div>
                                                    {meal.isCheatMeal && (
                                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-amber-100">
                                                            Refeição Livre
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Tabela de Alimentos Limpa */}
                                                {meal.items.length > 0 ? (
                                                    <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                                                        <table className="w-full text-sm table-fixed">
                                                            <tbody className="text-slate-700">
                                                                {meal.items.map((item) => (
                                                                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                                                                        <td className="py-1.5 w-1/2 align-top">
                                                                            <span className="font-medium">{item.name}</span>
                                                                        </td>
                                                                        <td className="py-1.5 w-1/4 text-right align-top text-slate-600">
                                                                            {item.quantity} <span className="text-xs text-slate-400">{item.unit || 'g'}</span>
                                                                        </td>
                                                                        <td className="py-1.5 w-1/4 text-right align-top font-mono text-xs text-slate-400">
                                                                            {item.calories.toFixed(0)} kcal
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-400 italic">
                                                        {meal.isCheatMeal ? 'Aproveite com moderação.' : 'Nenhum alimento registrado.'}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </td>
            </tr>
        </tbody>

        <tfoot className="table-footer-group">
            <tr>
                <td>
                    <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                        <p className="text-slate-300 text-[10px] uppercase tracking-[0.2em]">NutriVida • {new Date().toLocaleDateString()}</p>
                    </div>
                </td>
            </tr>
        </tfoot>
      </table>
    </div>
  );
});

DietPDFReport.displayName = 'DietPDFReport';
