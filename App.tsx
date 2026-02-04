import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard'; // Patient Dashboard
import { MainDashboard } from './components/MainDashboard'; // Clinic Dashboard
import { HistoryTable } from './components/HistoryTable';
import { EntryForm } from './components/EntryForm';
import { PatientList } from './components/PatientList';
import { Schedule } from './components/Schedule';
import { PatientSelector } from './components/PatientSelector';
import { DietPlan } from './components/DietPlan';
import { CheckIn, ViewState, Patient, DietPlan as DietPlanType, PatientTab, Appointment } from './types';
import { User, Activity, Utensils, FileText, LayoutDashboard } from 'lucide-react';

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

const SEED_DIET: DietPlanType = {
  id: 'd1',
  lastUpdated: new Date().toISOString(),
  meals: [
    {
      id: 'm1',
      name: 'Café da Manhã',
      time: '07:30',
      items: [
        { id: 'i1', name: 'Ovos mexidos', quantity: '3 unidades' },
        { id: 'i2', name: 'Pão integral', quantity: '2 fatias' },
        { id: 'i3', name: 'Mamão papaya', quantity: '1/2 unidade' },
        { id: 'i4', name: 'Café preto s/ açúcar', quantity: '200ml' }
      ]
    },
    {
      id: 'm2',
      name: 'Almoço',
      time: '12:30',
      items: [
        { id: 'i5', name: 'Arroz branco', quantity: '150g' },
        { id: 'i6', name: 'Feijão carioca', quantity: '100g' },
        { id: 'i7', name: 'Peito de frango grelhado', quantity: '150g' },
        { id: 'i8', name: 'Salada de folhas verdes', quantity: 'À vontade' },
        { id: 'i9', name: 'Azeite de oliva', quantity: '1 col. sopa' }
      ]
    },
    {
      id: 'm3',
      name: 'Lanche da Tarde',
      time: '16:00',
      items: [
        { id: 'i10', name: 'Iogurte Natural', quantity: '170g' },
        { id: 'i11', name: 'Whey Protein', quantity: '30g' },
        { id: 'i12', name: 'Aveia em flocos', quantity: '20g' }
      ]
    },
    {
      id: 'm4',
      name: 'Jantar',
      time: '20:00',
      items: [
        { id: 'i13', name: 'Batata doce cozida', quantity: '150g' },
        { id: 'i14', name: 'Patinho moído', quantity: '150g' },
        { id: 'i15', name: 'Legumes cozidos (Brócolis/Cenoura)', quantity: '100g' }
      ]
    }
  ],
  notes: 'Beber pelo menos 3 litros de água por dia.\nEvitar frituras e doces durante a semana.\nRefeição livre permitida: 1x na semana.'
};

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
    status: 'active',
    checkIns: SEED_CHECKINS,
    diet: SEED_DIET
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
    status: 'active',
    checkIns: []
  }
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientId: 'p1',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Consulta',
    status: 'Agendado',
    notes: 'Primeira consulta de rotina'
  },
  {
    id: '2',
    patientId: 'p2',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '14:30',
    type: 'Avaliação',
    status: 'Agendado',
    notes: 'Avaliação física completa'
  }
];

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(SEED_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(SEED_APPOINTMENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null); // Start with no patient
  const [currentView, setCurrentView] = useState<ViewState>('home'); // Default to dashboard
  const [activeTab, setActiveTab] = useState<PatientTab>('overview');
  
  // Controls if the add patient modal should automatically open when viewing PatientList
  const [shouldOpenAddPatientModal, setShouldOpenAddPatientModal] = useState(false);

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
    setActiveTab('overview');
    // Keep ViewState as 'patients' to show the patient details context
    setCurrentView('patients');
    setShouldOpenAddPatientModal(false);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleUpdateDiet = (newDiet: DietPlanType) => {
    if (!activePatient) return;
    const updatedPatient: Patient = {
        ...activePatient,
        diet: newDiet
    };
    handleUpdatePatient(updatedPatient);
  };

  const handleTrashPatient = (id: string) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'trash' } : p));
    if (selectedPatientId === id) {
      setSelectedPatientId(null);
    }
  };

  const handleRestorePatient = (id: string) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab('overview');
    setCurrentView('patients'); // Ensure we are in the "Patients" section
  };

  // Specific handler for the selector screen to go straight to entry
  const handleSelectPatientForEntry = (id: string) => {
    setSelectedPatientId(id);
    setCurrentView('add_entry');
  };

  const handleAddCheckIn = (newCheckIn: CheckIn) => {
    if (!activePatient) return;

    const updatedPatient = {
      ...activePatient,
      checkIns: [...activePatient.checkIns, newCheckIn]
    };

    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setCurrentView('patients');
    setActiveTab('overview');
  };

  const handleAddAppointment = (newAppointment: Appointment) => {
    setAppointments(prev => [...prev, newAppointment]);
  };

  const handleViewChange = (view: ViewState) => {
    // Reset states when changing main sections
    if (view === 'patients') {
      // If clicking "Patients" in sidebar, we go back to list, deselect patient
      setSelectedPatientId(null);
    }
    
    if (view !== 'patients') {
        setShouldOpenAddPatientModal(false);
        setSelectedPatientId(null);
    }

    setCurrentView(view);
  };

  // Render Tabs Logic
  const renderTabs = () => (
    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-full max-w-2xl">
      {[
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'history', label: 'Histórico', icon: FileText },
        { id: 'diet', label: 'Dieta', icon: Utensils },
        { id: 'profile', label: 'Perfil', icon: User },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as PatientTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* Dynamic Header (Only show if NOT in Home/Main Dashboard because it has its own header) */}
        {currentView !== 'home' && (
          <header className="mb-6 flex justify-between items-center max-w-[1920px] mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {currentView === 'patients' && !selectedPatientId && 'Gestão de Pacientes'}
                {currentView === 'patients' && selectedPatientId && (activePatient?.name || 'Detalhes do Paciente')}
                {currentView === 'schedule' && 'Agenda'}
                {currentView === 'add_entry' && 'Nova Avaliação'}
                {currentView === 'select_patient_for_entry' && 'Iniciar Avaliação'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {currentView === 'patients' && !selectedPatientId && 'Gerencie o acompanhamento dos seus alunos'}
                {currentView === 'patients' && selectedPatientId && 'Acompanhe a evolução e gerencie o plano'}
                {currentView === 'schedule' && 'Visualize seus próximos atendimentos'}
                {currentView === 'select_patient_for_entry' && 'Escolha um paciente'}
              </p>
            </div>
            
            {activePatient && selectedPatientId && (
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
        )}

        <div className="w-full max-w-[1920px] mx-auto">
          
          {currentView === 'home' && (
            <MainDashboard 
              patients={patients} 
              appointments={appointments}
              onNavigateTo={(view) => setCurrentView(view as ViewState)}
            />
          )}

          {currentView === 'select_patient_for_entry' && (
            <PatientSelector 
              patients={patients}
              onSelectPatient={handleSelectPatientForEntry}
              onCreateNew={() => {
                setShouldOpenAddPatientModal(true);
                setCurrentView('patients');
              }}
            />
          )}

          {currentView === 'patients' && !selectedPatientId && (
            <PatientList 
              patients={patients} 
              onSelectPatient={handleSelectPatient}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onTrashPatient={handleTrashPatient}
              onRestorePatient={handleRestorePatient}
              initialOpenModal={shouldOpenAddPatientModal}
            />
          )}

          {currentView === 'schedule' && (
            <Schedule 
              patients={patients} 
              appointments={appointments} 
              onAddAppointment={handleAddAppointment}
            />
          )}

          {/* PATIENT DETAILS VIEW (TABS) */}
          {currentView === 'patients' && activePatient && (
            <div className="space-y-6">
              {renderTabs()}

              {activeTab === 'overview' && (
                <Dashboard 
                  checkIns={activeCheckIns} 
                  onAddEntry={() => setCurrentView('add_entry')}
                  age={activePatient.age}
                />
              )}

              {activeTab === 'history' && (
                <HistoryTable checkIns={activeCheckIns} />
              )}
              
              {activeTab === 'diet' && (
                <DietPlan 
                    diet={activePatient.diet} 
                    onUpdateDiet={handleUpdateDiet}
                    patientName={activePatient.name}
                />
              )}

              {activeTab === 'profile' && (
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
          )}

          {activePatient && currentView === 'add_entry' && (
            <EntryForm 
              onSave={handleAddCheckIn} 
              onCancel={() => {
                setCurrentView('patients'); // Back to patient details
                setActiveTab('overview');
              }}
              lastRecord={activeCheckIns[0]}
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;