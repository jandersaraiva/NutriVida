import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HistoryTable } from './components/HistoryTable';
import { EntryForm } from './components/EntryForm';
import { CheckIn, ViewState } from './types';
import { User, ClipboardList, LayoutDashboard } from 'lucide-react';

const SEED_DATA: CheckIn[] = [
  {
    id: '1',
    date: '2026-01-31',
    height: 1.72,
    weight: 70.9,
    imc: 24.0,
    bodyFat: 22.0,
    muscleMass: 38.5,
    bmr: 1649,
    age: 33,
    visceralFat: 7,
  },
  // Adding a previous record to demonstrate the "Evolution" and "Deltas" feature immediately
  {
    id: '0',
    date: '2025-12-31',
    height: 1.72,
    weight: 72.1, // +1.2kg difference
    imc: 24.4,
    bodyFat: 23.5,
    muscleMass: 37.8,
    bmr: 1660,
    age: 33,
    visceralFat: 8,
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [checkIns, setCheckIns] = useState<CheckIn[]>(SEED_DATA);

  const handleAddCheckIn = (newCheckIn: CheckIn) => {
    setCheckIns((prev) => [...prev, newCheckIn]);
    setCurrentView('dashboard');
  };

  const sortedCheckIns = useMemo(() => {
    return [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [checkIns]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {currentView === 'dashboard' && 'Painel de Evolução'}
              {currentView === 'history' && 'Histórico de Avaliações'}
              {currentView === 'add_entry' && 'Nova Avaliação'}
              {currentView === 'profile' && 'Perfil do Paciente'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Acompanhamento nutricional e biométrico
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700">Paciente Exemplo</p>
                <p className="text-xs text-slate-500">Última avaliação: {sortedCheckIns[0]?.date.split('-').reverse().join('/')}</p>
             </div>
             <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
                PE
             </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              checkIns={sortedCheckIns} 
              onAddEntry={() => setCurrentView('add_entry')}
            />
          )}

          {currentView === 'history' && (
            <HistoryTable checkIns={sortedCheckIns} />
          )}

          {currentView === 'add_entry' && (
            <EntryForm 
              onSave={handleAddCheckIn} 
              onCancel={() => setCurrentView('dashboard')}
              lastRecord={sortedCheckIns[0]}
            />
          )}

          {currentView === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl">
              <div className="flex items-center gap-4 mb-6 text-emerald-600">
                <User size={32} />
                <h2 className="text-xl font-semibold">Dados Pessoais</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Nome Completo</label>
                  <input type="text" value="Paciente Exemplo" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Data de Nascimento</label>
                  <input type="date" value="1993-01-01" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Objetivo</label>
                  <input type="text" value="Hipertrofia e Definição" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Gênero</label>
                  <select disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700">
                    <option>Masculino</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
                Esta é uma visualização de demonstração. A edição de perfil está desabilitada neste protótipo.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;