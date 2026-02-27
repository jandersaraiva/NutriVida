import React from 'react';
import { DietPlan, Nutritionist } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface DietPDFReportProps {
  plan: DietPlan;
  patientName: string;
  nutritionist?: Nutritionist;
}

export const DietPDFReport = React.forwardRef<HTMLDivElement, DietPDFReportProps>(({ plan, patientName, nutritionist }, ref) => {
  // Calculate daily stats
  const dailyStats = (plan.days || []).map(day => {
    let totalKcal = 0;
    day.meals.forEach(meal => {
        // Include cheat meals in calculation? Usually they are "free" or have estimated calories.
        // If items exist, we sum them.
        meal.items.forEach(item => {
             totalKcal += Number(item.calories) || 0;
        });
    });
    return { name: day.day.substring(0, 3), fullDay: day.day, kcal: Math.round(totalKcal) };
  });

  return (
    <div ref={ref} className="p-12 bg-white text-slate-900 w-[210mm] mx-auto font-sans" style={{ minHeight: '297mm' }}>
      {/* Header Minimalista */}
      <div className="flex justify-between items-end mb-12 pb-4 border-b border-slate-100">
         <div>
            <h1 className="text-4xl font-light text-slate-900 tracking-tight mb-1">Plano Alimentar</h1>
            <p className="text-lg text-slate-500 font-light">{plan.name}</p>
         </div>
         <div className="text-right">
            <h2 className="text-xl font-medium text-slate-800">{patientName}</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Gerado em {new Date().toLocaleDateString()}</p>
            {nutritionist && (
                <div className="mt-2 text-xs text-slate-500">
                    <p>{nutritionist.name} • CRN: {nutritionist.crn}</p>
                </div>
            )}
         </div>
      </div>

      {/* Summary & Chart - Estilo Clean */}
      <div className="mb-12 break-inside-avoid">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Visão Geral
            </h3>
            <div className="flex gap-6 text-sm">
                 <div>
                     <span className="text-slate-400 mr-2">Meta Hídrica:</span>
                     <span className="font-medium text-slate-800">{plan.waterTarget ? (plan.waterTarget / 1000).toFixed(1) : '2.0'}L</span>
                 </div>
                 {plan.notes && (
                     <div className="max-w-xs text-right truncate">
                         <span className="text-slate-400 mr-2">Obs:</span>
                         <span className="text-slate-600">{plan.notes}</span>
                     </div>
                 )}
            </div>
        </div>
        
        <div className="h-48 w-full mb-8 opacity-90">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <Bar dataKey="kcal" fill="#1e293b" radius={[2, 2, 0, 0]} barSize={32}>
                        <LabelList dataKey="kcal" position="top" fill="#64748b" fontSize={11} formatter={(val: number) => val > 0 ? val : ''} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Plans - Estilo Lista Limpa */}
      <div className="space-y-12">
        {plan.days?.map((day) => (
            <div key={day.day} className="break-inside-avoid">
                <div className="flex items-baseline gap-4 mb-6 border-b border-slate-100 pb-2">
                    <h2 className="text-2xl font-light text-slate-900 capitalize">
                        {day.day}
                    </h2>
                    <span className="text-sm text-slate-400 font-mono">
                        {dailyStats.find(s => s.fullDay === day.day)?.kcal} kcal
                    </span>
                </div>

                <div className="space-y-8 pl-2">
                    {day.meals.length === 0 && (
                        <p className="text-slate-300 italic text-sm">Sem refeições planejadas.</p>
                    )}
                    {day.meals.map((meal) => (
                        <div key={meal.id} className="break-inside-avoid relative">
                            {/* Linha vertical sutil para guiar o olhar */}
                            <div className="absolute left-0 top-2 bottom-0 w-px bg-slate-100 -ml-4 hidden"></div>

                            <div className="flex items-baseline justify-between mb-3">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-xs font-bold text-slate-400 w-12">
                                        {meal.time}
                                    </span>
                                    <span className="text-base font-medium text-slate-800">{meal.name}</span>
                                </div>
                                {meal.isCheatMeal && (
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider border border-slate-200 px-2 py-0.5 rounded-full">
                                        Livre
                                    </span>
                                )}
                            </div>
                            
                            <div className="pl-16">
                                {meal.items.length > 0 ? (
                                    <table className="w-full text-sm table-fixed">
                                        <tbody className="text-slate-600">
                                            {meal.items.map((item) => (
                                                <tr key={item.id} className="group">
                                                    <td className="py-1 align-top w-1/2 pr-4">
                                                        <span className="text-slate-700">{item.name}</span>
                                                    </td>
                                                    <td className="py-1 align-top text-right w-1/6 text-slate-500">
                                                        {item.quantity} <span className="text-xs text-slate-400">{item.unit || 'g'}</span>
                                                    </td>
                                                    <td className="py-1 align-top text-right w-1/6 font-mono text-xs text-slate-400">
                                                        {item.calories.toFixed(0)} kcal
                                                    </td>
                                                    <td className="py-1 align-top text-right w-1/4 font-mono text-[10px] text-slate-300 group-hover:text-slate-400 transition-colors">
                                                        P:{item.protein} C:{item.carbs} G:{item.fats}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-slate-300 text-sm italic">
                                        {meal.isCheatMeal ? 'Refeição livre.' : '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
      
      {/* Footer Minimalista */}
      <div className="mt-16 pt-8 border-t border-slate-50 text-center">
        <p className="text-slate-300 text-[10px] uppercase tracking-[0.2em]">NutriVida</p>
      </div>
    </div>
  );
});

DietPDFReport.displayName = 'DietPDFReport';
