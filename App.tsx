import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HistoryTable } from './components/HistoryTable';
import { EntryForm } from './components/EntryForm';
import { PatientList } from './components/PatientList';
import { CheckIn, ViewState, Patient } from './types';
import { User, ClipboardList, LayoutDashboard } from 'lucide-react';

// Seed Data for initial demo
const SEED_CHECKINS: CheckIn[] = [
  {
    id: '1',
    date: '2026-01-31',
    height: 1.72,
    weight: 70.9,
    imc: 24.0,
    bodyFat: 24.0,
    muscleMass: 38.5,
    bmr: 1649,
    age: 29,
    visceralFat: 7,
  },
  {
    id: '0',
    date: '2025-12-31',
    height: 1.72,
    weight: 70.2, 
    imc: 23.7,
    bodyFat: 23.7,
    muscleMass: 38.7,
    bmr: 1640,
    age: 29,
    visceralFat: 7,
  },
  {
    id: 'old',
    date: '2025-05-25',
    height: 1.72,
    weight: 61.6, 
    imc: 20.8,
    bodyFat: 17.8,
    muscleMass: 40.0,
    bmr: 1550,
    age: 28,
    visceralFat: 4,
  }
];

const SEED_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Jander Rabelo Saraiva',
    email: 'janderrabelosaraiva@gmail.com',
    gender: 'Masculino',
    age: 29,
    profession: 'Desenvolvedor',
    phone: '(11) 99999-9999',
    instagram: '@jander',
    birthDate: '1997-01-01',
    objective: 'Hipertrofia',
    avatarColor: 'bg-blue-100 text-blue-700',
    checkIns: SEED_CHECKINS
  },
  {
    id: 'p2',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    gender: 'Feminino',
    age: 34,
    profession: 'Arquiteta',
    phone: '(11) 98888-8888',
    instagram: '@mariasilva.arq',
    birthDate: '1990-05-15',
    objective: 'Emagrecimento',
    avatarColor: 'bg-rose-100 text-rose-700',
    checkIns: []
  }
];

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(SEED_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('p1'); // Start with p1 selected
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  // Helpers
  const activePatient = useMemo(() => 
    patients.find(p => p.id === selectedPatientId), 
  [patients, selectedPatientId]);

  const activeCheckIns = useMemo(() => {
    if (!activePatient) return [];
    return [...activePatient.checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activePatient]);

  // Actions
  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [...prev, newPatient]);
    setSelectedPatientId(newPatient.id);
    setCurrentView('dashboard');
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setCurrentView('dashboard');
  };

  const handleAddCheckIn = (newCheckIn: CheckIn) => {
    if (!activePatient) return;

    const updatedPatient = {
      ...activePatient,
      checkIns: [...activePatient.checkIns, newCheckIn]
    };

    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: ViewState) => {
    if (view === 'patients') {
      setSelectedPatientId(null);
    } else if (!selectedPatientId) {
      // If trying to access dashboard/history without user, default to patient list
      setCurrentView('patients');
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* Dynamic Header */}
        <header className="mb-8 flex justify-between items-center max-w-[1920px] mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {currentView === 'patients' && 'Gestão de Pacientes'}
              {currentView === 'dashboard' && 'Visão Geral'}
              {currentView === 'history' && 'Histórico de Avaliações'}
              {currentView === 'add_entry' && 'Nova Avaliação'}
              {currentView === 'profile' && 'Perfil do Paciente'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activePatient 
                ? `Acompanhamento de ${activePatient.name}` 
                : 'Selecione um paciente para começar'}
            </p>
          </div>
          
          {activePatient && (
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-slate-100">
               <div className={`h-10 w-10 ${activePatient.avatarColor} rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
                  {activePatient.name.substring(0,2).toUpperCase()}
               </div>
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700 leading-tight">{activePatient.name}</p>
                  <p className="text-[10px] text-slate-400">
                     {activePatient.age} anos • {activePatient.profession}
                  </p>
               </div>
            </div>
          )}
        </header>

        <div className="w-full max-w-[1920px] mx-auto">
          {currentView === 'patients' && (
            <PatientList 
              patients={patients} 
              onSelectPatient={handleSelectPatient}
              onAddPatient={handleAddPatient}
            />
          )}

          {activePatient && currentView === 'dashboard' && (
            <Dashboard 
              checkIns={activeCheckIns} 
              onAddEntry={() => setCurrentView('add_entry')}
            />
          )}

          {activePatient && currentView === 'history' && (
            <HistoryTable checkIns={activeCheckIns} />
          )}

          {activePatient && currentView === 'add_entry' && (
            <EntryForm 
              onSave={handleAddCheckIn} 
              onCancel={() => setCurrentView('dashboard')}
              lastRecord={activeCheckIns[0]}
            />
          )}

          {activePatient && currentView === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-4xl">
              <div className="flex items-center gap-4 mb-6 text-emerald-600">
                <User size={32} />
                <h2 className="text-xl font-semibold">Dados Pessoais</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Nome Completo</label>
                  <input type="text" value={activePatient.name} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                  <input type="text" value={activePatient.email} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Idade</label>
                  <input type="text" value={activePatient.age} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Profissão</label>
                  <input type="text" value={activePatient.profession} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Telefone</label>
                  <input type="text" value={activePatient.phone} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Instagram</label>
                  <input type="text" value={activePatient.instagram} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Objetivo</label>
                  <input type="text" value={activePatient.objective} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Gênero</label>
                  <select disabled value={activePatient.gender} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700">
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;