
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard'; // Patient Dashboard
import { MainDashboard } from './components/MainDashboard'; // Clinic Dashboard
import { HistoryTable } from './components/HistoryTable';
import { EntryForm } from './components/EntryForm';
import { PatientList } from './components/PatientList';
import { Schedule } from './components/Schedule';
import { PatientSelector } from './components/PatientSelector';
import { DietPlan } from './components/DietPlan';
import { NutritionistProfile } from './components/NutritionistProfile';
import { ActiveDietsList } from './components/ActiveDietsList';
import { AnamnesisForm } from './components/AnamnesisForm';
import { AssessmentReport } from './components/AssessmentReport';
import { CheckIn, ViewState, Patient, DietPlan as DietPlanType, PatientTab, Appointment, Nutritionist, Anamnesis } from './types';
import { User, Activity, Utensils, FileText, LayoutDashboard, Stethoscope } from 'lucide-react';

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

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
    bodyAge: 27, // Nova propriedade
    visceralFat: 7,
    waistCircumference: 84,
    hipCircumference: 100
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
    bodyAge: 28, // Nova propriedade
    visceralFat: 7,
    waistCircumference: 85,
    hipCircumference: 101
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
    bodyAge: 25, // Nova propriedade
    visceralFat: 4,
    waistCircumference: 78,
    hipCircumference: 95
  }
];

const SEED_DIET: DietPlanType = {
  id: 'd1',
  name: 'Plano Hipertrofia Inicial',
  status: 'active',
  createdAt: '2026-01-01T10:00:00Z',
  lastUpdated: new Date().toISOString(),
  waterTarget: 2500,
  meals: [
    {
      id: 'm1',
      name: 'Café da Manhã',
      time: '07:30',
      items: [
        { id: 'i1', name: 'Ovos mexidos', quantity: '3 unidades', calories: 240, protein: 18, carbs: 2, fats: 16 },
        { id: 'i2', name: 'Pão integral', quantity: '2 fatias', calories: 120, protein: 6, carbs: 22, fats: 2 },
        { id: 'i3', name: 'Mamão papaya', quantity: '1/2 unidade', calories: 60, protein: 1, carbs: 14, fats: 0 },
        { id: 'i4', name: 'Café preto s/ açúcar', quantity: '200ml', calories: 5, protein: 0, carbs: 1, fats: 0 }
      ]
    },
    {
      id: 'm2',
      name: 'Almoço',
      time: '12:30',
      items: [
        { id: 'i5', name: 'Arroz branco', quantity: '150g', calories: 190, protein: 4, carbs: 42, fats: 0 },
        { id: 'i6', name: 'Feijão carioca', quantity: '100g', calories: 76, protein: 5, carbs: 14, fats: 0.5 },
        { id: 'i7', name: 'Peito de frango grelhado', quantity: '150g', calories: 240, protein: 46, carbs: 0, fats: 5 },
        { id: 'i8', name: 'Salada de folhas verdes', quantity: 'À vontade', calories: 20, protein: 1, carbs: 3, fats: 0 },
        { id: 'i9', name: 'Azeite de oliva', quantity: '1 col. sopa', calories: 119, protein: 0, carbs: 0, fats: 13.5 }
      ]
    },
    {
      id: 'm3',
      name: 'Lanche da Tarde',
      time: '16:00',
      items: [
        { id: 'i10', name: 'Iogurte Natural', quantity: '170g', calories: 100, protein: 6, carbs: 10, fats: 6 },
        { id: 'i11', name: 'Whey Protein', quantity: '30g', calories: 120, protein: 24, carbs: 3, fats: 1 },
        { id: 'i12', name: 'Aveia em flocos', quantity: '20g', calories: 70, protein: 3, carbs: 12, fats: 1.5 }
      ]
    },
    {
      id: 'm4',
      name: 'Jantar',
      time: '20:00',
      items: [
        { id: 'i13', name: 'Batata doce cozida', quantity: '150g', calories: 115, protein: 2, carbs: 27, fats: 0 },
        { id: 'i14', name: 'Patinho moído', quantity: '150g', calories: 330, protein: 36, carbs: 0, fats: 20 },
        { id: 'i15', name: 'Legumes cozidos (Brócolis/Cenoura)', quantity: '100g', calories: 40, protein: 3, carbs: 7, fats: 0 }
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
    address: 'Rua das Flores, 123 - São Paulo, SP',
    birthDate: '1997-01-01',
    objective: 'Hipertrofia',
    avatarColor: 'bg-blue-100 text-blue-700',
    status: 'active',
    activityFactor: 1.55, // Moderadamente Ativo
    checkIns: SEED_CHECKINS,
    dietPlans: [SEED_DIET],
    anamnesis: {
        mainComplaint: 'Gostaria de ganhar massa muscular e definir o abdômen.',
        history: 'Sem histórico de doenças crônicas na família.',
        allergies: 'Nenhuma conhecida.',
        medications: 'Nenhum.',
        sleepQuality: 'Bom',
        bowelFunction: 'Regular',
        alcohol: 'Socialmente, 2x no mês.',
        smoker: false,
        notes: 'Pratica musculação 5x na semana.'
    }
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
    address: 'Av. Paulista, 2000 - São Paulo, SP',
    birthDate: '1990-05-15',
    objective: 'Emagrecimento',
    avatarColor: 'bg-rose-100 text-rose-700',
    status: 'active',
    activityFactor: 1.2, // Sedentário
    checkIns: [],
    dietPlans: []
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

const SEED_NUTRITIONIST: Nutritionist = {
  name: 'Dr. João Nutri',
  crn: 'CRN-3 45678',
  email: 'contato@drjoao.com.br',
  phone: '(11) 97777-7777',
  birthDate: '1990-01-01',
  photo: ''
};

const App: React.FC = () => {
  // --- STATE WITH PERSISTENCE ---
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('nutrivida_patients');
    return saved ? JSON.parse(saved) : SEED_PATIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('nutrivida_appointments');
    return saved ? JSON.parse(saved) : SEED_APPOINTMENTS;
  });

  const [nutritionist, setNutritionist] = useState<Nutritionist>(() => {
    const saved = localStorage.getItem('nutrivida_nutritionist');
    return saved ? JSON.parse(saved) : SEED_NUTRITIONIST;
  });
  
  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('nutrivida_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('nutrivida_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('nutrivida_nutritionist', JSON.stringify(nutritionist));
  }, [nutritionist]);

  // --- RESET HANDLER ---
  const handleResetData = () => {
    if (window.confirm('ATENÇÃO: Tem certeza que deseja resetar todos os dados? \nIsso apagará todos os pacientes e agendamentos criados e restaurará os dados de demonstração.')) {
        localStorage.removeItem('nutrivida_patients');
        localStorage.removeItem('nutrivida_appointments');
        localStorage.removeItem('nutrivida_nutritionist');
        window.location.reload();
    }
  };

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null); // Start with no patient
  const [currentView, setCurrentView] = useState<ViewState>('home'); // Default to dashboard
  const [activeTab, setActiveTab] = useState<PatientTab>('overview');
  const [checkInToEdit, setCheckInToEdit] = useState<CheckIn | null>(null);
  const [reportCheckIn, setReportCheckIn] = useState<CheckIn | null>(null); // Estado para o relatório
  
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

  const handleUpdateDietPlans = (newDietPlans: DietPlanType[]) => {
    if (!activePatient) return;
    const updatedPatient: Patient = {
        ...activePatient,
        dietPlans: newDietPlans
    };
    handleUpdatePatient(updatedPatient);
  };

  const handleUpdateAnamnesis = (newAnamnesis: Anamnesis) => {
    if (!activePatient) return;
    const updatedPatient: Patient = {
        ...activePatient,
        anamnesis: newAnamnesis
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

  // Specific handler to go from active diet list directly to diet tab
  const handleSelectPatientDiet = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab('diet');
    setCurrentView('patients');
  };

  // Specific handler for the selector screen to go straight to entry
  const handleSelectPatientForEntry = (id: string) => {
    setSelectedPatientId(id);
    setCheckInToEdit(null); // Ensure clean form
    setCurrentView('add_entry');
  };

  const handleSaveCheckIn = (checkIn: CheckIn) => {
    if (!activePatient) return;

    // Verificar se é uma atualização ou inserção
    const isUpdate = activePatient.checkIns.some(c => c.id === checkIn.id);
    let updatedCheckIns;

    if (isUpdate) {
        updatedCheckIns = activePatient.checkIns.map(c => c.id === checkIn.id ? checkIn : c);
    } else {
        updatedCheckIns = [...activePatient.checkIns, checkIn];
    }

    const updatedPatient = {
      ...activePatient,
      checkIns: updatedCheckIns
    };

    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setCurrentView('patients');
    
    // Se estava editando, provavelmente quer ver o histórico. Se é novo, quer ver o dashboard.
    if (isUpdate) {
        setActiveTab('history');
    } else {
        setActiveTab('overview');
    }
    setCheckInToEdit(null);
  };

  const handleDeleteCheckIn = (id: string) => {
    if (!activePatient) return;
    if (!window.confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    const updatedCheckIns = activePatient.checkIns.filter(c => c.id !== id);
    const updatedPatient = { ...activePatient, checkIns: updatedCheckIns };
    
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleEditCheckIn = (checkIn: CheckIn) => {
    setCheckInToEdit(checkIn);
    setCurrentView('add_entry');
  };

  // --- Handler para Visualizar Relatório ---
  const handleViewReport = (checkIn: CheckIn) => {
      setReportCheckIn(checkIn);
      setCurrentView('assessment_report');
  };

  const handleAddAppointment = (newAppointment: Appointment) => {
    setAppointments(prev => [...prev, newAppointment]);
  };

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
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
    
    // Ensure entry form state is clean when navigating away
    if (view !== 'add_entry') {
        setCheckInToEdit(null);
    }
    
    if (view !== 'assessment_report') {
        setReportCheckIn(null);
    }

    setCurrentView(view);
  };

  // Render Tabs Logic
  const renderTabs = () => (
    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-full max-w-2xl mx-auto print:hidden">
      {[
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'anamnesis', label: 'Anamnese', icon: Stethoscope }, // Nova Aba
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
                ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
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
      <main className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible">
        
        {/* Dynamic Header (Only show if NOT in Home/Main Dashboard because it has its own header) */}
        {currentView !== 'home' && currentView !== 'active_diets' && currentView !== 'assessment_report' && (
          <header className="mb-6 flex justify-between items-center max-w-[1920px] mx-auto print:hidden">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {currentView === 'patients' && !selectedPatientId && 'Gestão de Pacientes'}
                {currentView === 'patients' && selectedPatientId && (activePatient?.name || 'Detalhes do Paciente')}
                {currentView === 'schedule' && 'Agenda'}
                {currentView === 'add_entry' && (checkInToEdit ? 'Editar Avaliação' : 'Nova Avaliação')}
                {currentView === 'select_patient_for_entry' && 'Menu de Ações'}
                {currentView === 'profile_settings' && 'Meu Perfil'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {currentView === 'patients' && !selectedPatientId && 'Gerencie o acompanhamento dos seus alunos'}
                {currentView === 'patients' && selectedPatientId && 'Acompanhe a evolução e gerencie o plano'}
                {currentView === 'schedule' && 'Visualize seus próximos atendimentos'}
                {currentView === 'select_patient_for_entry' && 'Selecione o que deseja criar ou gerenciar'}
                {currentView === 'profile_settings' && 'Gerencie seus dados e informações da clínica'}
              </p>
            </div>
            
            {activePatient && selectedPatientId && (
              <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-slate-100">
                 <div className={`h-10 w-10 ${activePatient.avatarColor} rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
                    {activePatient.name.substring(0,2).toUpperCase()}
                 </div>
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">{activePatient.name}</p>
                    <p className="text-sm text-slate-400">
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

          {currentView === 'active_diets' && (
             <ActiveDietsList 
                patients={patients}
                onSelectPatient={handleSelectPatientDiet}
                onBack={() => setCurrentView('home')}
             />
          )}

          {/* VIEW: RELATÓRIO DE AVALIAÇÃO */}
          {currentView === 'assessment_report' && reportCheckIn && activePatient && (
             <AssessmentReport 
                checkIn={reportCheckIn}
                patient={activePatient}
                allCheckIns={activeCheckIns}
                onBack={() => {
                    setCurrentView('patients');
                    setActiveTab('history');
                }}
             />
          )}

          {currentView === 'profile_settings' && (
            <NutritionistProfile 
                data={nutritionist}
                onSave={setNutritionist}
                onResetData={handleResetData}
            />
          )}

          {currentView === 'select_patient_for_entry' && (
            <PatientSelector 
              patients={patients}
              onSelectPatient={handleSelectPatientForEntry}
              onSelectForDiet={handleSelectPatientDiet}
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
              onUpdateAppointment={handleUpdateAppointment}
            />
          )}

          {/* PATIENT DETAILS VIEW (TABS) */}
          {currentView === 'patients' && activePatient && (
            <div className="space-y-6">
              {renderTabs()}

              {activeTab === 'overview' && (
                <Dashboard 
                  checkIns={activeCheckIns} 
                  onAddEntry={() => {
                      setCheckInToEdit(null); // Ensure clean form
                      setCurrentView('add_entry');
                  }}
                  onViewReport={handleViewReport}
                  age={activePatient.age}
                  gender={activePatient.gender}
                  // Passamos o fator de atividade para calcular o GET no Dashboard
                  activityFactor={activePatient.activityFactor || 1.2}
                />
              )}

              {activeTab === 'anamnesis' && (
                <AnamnesisForm 
                    initialData={activePatient.anamnesis}
                    onSave={handleUpdateAnamnesis}
                />
              )}

              {activeTab === 'history' && (
                <HistoryTable 
                    checkIns={activeCheckIns} 
                    onEdit={handleEditCheckIn}
                    onDelete={handleDeleteCheckIn}
                    onViewReport={handleViewReport}
                />
              )}
              
              {activeTab === 'diet' && (
                <DietPlan 
                    plans={activePatient.dietPlans} 
                    onUpdatePlans={handleUpdateDietPlans}
                    patientName={activePatient.name}
                    patientWeight={activeCheckIns[0]?.weight || 70} // Passando peso para calculo de g/kg
                    // CALCULA O GET: BMR * ActivityFactor (Se não houver checkin, usa 0)
                    targetCalories={(activeCheckIns[0]?.bmr || 0) * (activePatient.activityFactor || 1.2)} 
                />
              )}

              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm p-8 max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 mb-6 text-blue-600">
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
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-500 mb-1">Endereço</label>
                      <input type="text" value={activePatient.address || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
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
                    {/* Exibição do Fator de Atividade no Perfil */}
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Fator de Atividade (FA)</label>
                      <input type="text" value={
                          activePatient.activityFactor === 1.2 ? '1.2 - Sedentário' :
                          activePatient.activityFactor === 1.375 ? '1.375 - Levemente Ativo' :
                          activePatient.activityFactor === 1.55 ? '1.55 - Moderadamente Ativo' :
                          activePatient.activityFactor === 1.725 ? '1.725 - Muito Ativo' :
                          '1.9 - Extremamente Ativo'
                      } disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePatient && currentView === 'add_entry' && (
            <EntryForm 
              onSave={handleSaveCheckIn} 
              onCancel={() => {
                setCheckInToEdit(null); // Limpa estado de edição
                setCurrentView('patients'); // Back to patient details
                setActiveTab(checkInToEdit ? 'history' : 'overview'); // Retorna para onde estava logicamente
              }}
              lastRecord={activeCheckIns[0]}
              patientBirthDate={activePatient.birthDate}
              initialData={checkInToEdit}
              patientGender={activePatient.gender} // PASSING GENDER FOR BMR CALCULATION
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
