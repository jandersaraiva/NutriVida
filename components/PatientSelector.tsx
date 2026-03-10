import React, { useState } from 'react';
import { Patient } from '../types';
import { UserPlus, Activity, Utensils, Search, ChevronRight, ArrowLeft, User } from 'lucide-react';

interface PatientSelectorProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void; // Para Avaliação
  onSelectForDiet: (id: string) => void; // Para Dieta
  onCreateNew: () => void; // Para Novo Paciente
}

type SelectorStep = 'menu' | 'select_assessment' | 'select_diet';

export const PatientSelector: React.FC<PatientSelectorProps> = ({ 
  patients, 
  onSelectPatient, 
  onSelectForDiet, 
  onCreateNew 
}) => {
  const [step, setStep] = useState<SelectorStep>('menu');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => 
    p.status !== 'trash' && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (id: string) => {
    if (step === 'select_assessment') {
      onSelectPatient(id);
    } else if (step === 'select_diet') {
      onSelectForDiet(id);
    }
  };

  // --- RENDER: MENU PRINCIPAL ---
  if (step === 'menu') {
    return (
      <div className="max-w-5xl mx-auto mt-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">O que você deseja fazer?</h2>
          <p className="text-slate-500 dark:text-slate-400">Escolha uma ação para iniciar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Opção 1: Novo Paciente */}
          <button 
            onClick={onCreateNew}
            className="flex flex-col items-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1 transition-all group"
          >
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <UserPlus size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Novo Paciente</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed">
              Cadastrar a ficha completa de um novo paciente no sistema.
            </p>
          </button>

          {/* Opção 2: Nova Avaliação */}
          <button 
            onClick={() => setStep('select_assessment')}
            className="flex flex-col items-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1 transition-all group"
          >
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Activity size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Nova Avaliação</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed">
              Registrar peso, medidas e composição corporal de um paciente existente.
            </p>
          </button>

          {/* Opção 3: Nova Dieta */}
          <button 
            onClick={() => setStep('select_diet')}
            className="flex flex-col items-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-orange-500 dark:hover:border-orange-500 hover:-translate-y-1 transition-all group"
          >
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Utensils size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Nova Dieta</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed">
              Criar ou editar o plano alimentar de um paciente existente.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: SELETOR DE PACIENTE (Para Avaliação ou Dieta) ---
  const isDiet = step === 'select_diet';
  const actionColor = isDiet ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400';
  const actionBg = isDiet ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-blue-50 dark:bg-blue-900/30';
  const actionBorder = isDiet ? 'focus:ring-orange-500' : 'focus:ring-blue-500';

  return (
    <div className="max-w-3xl mx-auto mt-4">
      {/* Header com Botão Voltar */}
      <button 
        onClick={() => {
            setStep('menu');
            setSearchTerm('');
        }}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={20} /> Voltar para o menu
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 text-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className={`mx-auto w-16 h-16 ${actionBg} ${actionColor} rounded-full flex items-center justify-center mb-4`}>
             {isDiet ? <Utensils size={32} /> : <Activity size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {isDiet ? 'Selecione o Paciente para a Dieta' : 'Selecione o Paciente para Avaliação'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
             Busque pelo nome abaixo para prosseguir com {isDiet ? 'o plano alimentar' : 'o registro de medidas'}.
          </p>
        </div>

        <div className="p-6">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar paciente por nome..." 
                  value={searchTerm}
                  autoFocus
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ${actionBorder} outline-none transition-all text-lg text-slate-900 dark:text-slate-100 placeholder-slate-400`}
                />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-400">Nenhum paciente encontrado com este nome.</p>
                    <button 
                        onClick={onCreateNew} 
                        className="mt-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                        Cadastrar novo paciente?
                    </button>
                  </div>
                ) : (
                  filteredPatients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientClick(patient.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group"
                    >
                      <div className={`h-12 w-12 ${patient.avatarColor} rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow-sm`}>
                        {patient.name.substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-lg group-hover:text-slate-900 dark:group-hover:text-white">{patient.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{patient.profession || 'Sem profissão'}</p>
                      </div>
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${actionColor}`}>
                        <ChevronRight size={24} />
                      </div>
                    </button>
                  ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};