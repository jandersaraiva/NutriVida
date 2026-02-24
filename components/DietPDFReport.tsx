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
    <div ref={ref} className="p-8 bg-white text-slate-900 w-[210mm] mx-auto" style={{ minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-6">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Plano Alimentar</h1>
            <p className="text-lg text-slate-600 font-medium">{plan.name}</p>
         </div>
         <div className="text-right">
            <h2 className="text-xl font-bold text-slate-800">{patientName}</h2>
            <p className="text-sm text-slate-500 mt-1">Gerado em {new Date().toLocaleDateString()}</p>
            {nutritionist && (
                <div className="mt-2 text-sm text-slate-600">
                    <p className="font-medium">{nutritionist.name}</p>
                    <p>CRN: {nutritionist.crn}</p>
                </div>
            )}
         </div>
      </div>

      {/* Summary & Chart */}
      <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 break-inside-avoid">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            📊 Distribuição Calórica Semanal
        </h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Bar dataKey="kcal" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                        <LabelList dataKey="kcal" position="top" fill="#64748b" fontSize={12} formatter={(val: number) => val > 0 ? val : ''} />
                        {dailyStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.kcal > 0 ? '#3b82f6' : '#e2e8f0'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
             <div className="bg-white p-3 rounded-lg border border-slate-100">
                 <span className="text-slate-500 block">Meta de Água</span>
                 <span className="text-lg font-bold text-blue-600">{plan.waterTarget ? (plan.waterTarget / 1000).toFixed(1) : '2.0'}L / dia</span>
             </div>
             <div className="bg-white p-3 rounded-lg border border-slate-100">
                 <span className="text-slate-500 block">Observações</span>
                 <span className="text-slate-700">{plan.notes || 'Nenhuma observação adicional.'}</span>
             </div>
        </div>
      </div>

      {/* Daily Plans */}
      <div className="space-y-8">
        {plan.days?.map((day) => (
            <div key={day.day} className="break-inside-avoid pt-4">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
                    <div className="bg-slate-900 text-white px-3 py-1 rounded-md font-bold text-sm uppercase tracking-wide">
                        {day.day}
                    </div>
                    <div className="text-sm text-slate-500">
                        {dailyStats.find(s => s.fullDay === day.day)?.kcal} kcal totais
                    </div>
                </div>

                <div className="space-y-4">
                    {day.meals.length === 0 && (
                        <p className="text-slate-400 italic text-sm">Sem refeições planejadas para este dia.</p>
                    )}
                    {day.meals.map((meal) => (
                        <div key={meal.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm break-inside-avoid">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">
                                        {meal.time}
                                    </span>
                                    <span className="font-semibold text-slate-800">{meal.name}</span>
                                </div>
                                {meal.isCheatMeal && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium border border-yellow-200">
                                        Refeição Livre
                                    </span>
                                )}
                            </div>
                            
                            <div className="p-4">
                                {meal.items.length > 0 ? (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                                <th className="pb-2 font-medium w-1/2">Alimento</th>
                                                <th className="pb-2 font-medium text-right">Qtd</th>
                                                <th className="pb-2 font-medium text-right">Kcal</th>
                                                <th className="pb-2 font-medium text-right">Macros (P/C/G)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {meal.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="py-2 text-slate-700 font-medium">{item.name}</td>
                                                    <td className="py-2 text-right text-slate-600">{item.quantity} {item.unit || 'g'}</td>
                                                    <td className="py-2 text-right text-slate-600 font-mono">{item.calories.toFixed(0)}</td>
                                                    <td className="py-2 text-right text-slate-500 text-xs font-mono">
                                                        {item.protein}g / {item.carbs}g / {item.fats}g
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-slate-400 text-sm italic">
                                        {meal.isCheatMeal ? 'Aproveite sua refeição livre!' : 'Nenhum alimento adicionado.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">NutriVida - Planejamento Nutricional Inteligente</p>
      </div>
    </div>
  );
});

DietPDFReport.displayName = 'DietPDFReport';
