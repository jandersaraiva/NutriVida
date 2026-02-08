import React from 'react';
import { Patient } from '../types';
import { ChevronRight, Utensils, CalendarCheck, Search, ChevronLeft } from 'lucide-react';

interface ActiveDietsListProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onBack: () => void;
}

export const ActiveDietsList: React.FC<ActiveDietsListProps> = ({ patients, onSelectPatient, onBack }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const patientsWithActiveDiet = patients.filter(p => 
    p.status === 'active' && 
    p.dietPlans && 
    p.dietPlans.some(d => d.status === 'active' && d.meals.length > 0) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onBack}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dietas Ativas</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie os planos alimentares em andamento.</p>
                </div>
            </div>
            
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar paciente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
            </div>
        </div>

        {patientsWithActiveDiet.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <Utensils size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhuma dieta ativa encontrada</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
                    {searchTerm ? 'Nenhum paciente corresponde à busca.' : 'Cadastre um plano alimentar e marque como ativo para vê-lo aqui.'}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patientsWithActiveDiet.map(patient => {
                    const activeDiet = patient.dietPlans.find(d => d.status === 'active');
                    return (
                        <div 
                            key={patient.id}
                            onClick={() => onSelectPatient(patient.id)}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 flex flex-col justify-between h-full"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 ${patient.avatarColor} rounded-full flex items-center justify-center font-bold text-base shadow-sm shrink-0`}>
                                            {patient.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                                {patient.name}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{patient.objective}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                        <Utensils size={16} className="text-blue-500" />
                                        <span>{activeDiet?.name || 'Plano Atual'}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Refeições</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{activeDiet?.meals.length || 0} diárias</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Última Atualização</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                {activeDiet?.lastUpdated 
                                                    ? new Date(activeDiet.lastUpdated).toLocaleDateString('pt-BR') 
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {activeDiet?.notes && (
                                    <div className="mb-4 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800/50">
                                        "{activeDiet.notes}"
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700 mt-auto">
                                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                    <CalendarCheck size={12} /> Ativo
                                </span>
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                                    Ver Detalhes <ChevronRight size={16} />
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};