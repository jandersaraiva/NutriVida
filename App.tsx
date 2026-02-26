import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PatientSidebar } from './components/PatientSidebar'; // Import PatientSidebar
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
import { LoginScreen } from './components/LoginScreen';
import { CheckIn, ViewState, Patient, DietPlan as DietPlanType, PatientTab, Appointment, Nutritionist, Anamnesis } from './types';
import { User, Activity, Utensils, FileText, LayoutDashboard, Stethoscope, Sun, Moon, LogOut, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const SEED_NUTRITIONIST: Nutritionist = {
  name: 'Dr. João Nutri',
  crn: 'CRN-3 45678',
  email: 'contato@drjoao.com.br',
  phone: '(11) 97777-7777',
  birthDate: '1990-01-01',
  photo: ''
};

const App: React.FC = () => {
  // --- AUTH STATE (Supabase) ---
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [userType, setUserType] = useState<'nutritionist' | 'patient' | null>(null); // New state for user role

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoadingSession(false);
      if (!session) setUserType(null); // Reset role on logout
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const handleSignUp = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) throw error;
    // O useEffect de onAuthStateChange vai pegar a sessão se o login for automático
    // Se precisar de confirmação de email, o Supabase avisa no erro ou retorno
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setHasInitialFetch(false); // Reset para mostrar loading no próximo login
    setCurrentView('home');
  };

  // --- THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('nutrivida_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nutrivida_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nutrivida_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // --- DATA STATE (Supabase) ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [nutritionist, setNutritionist] = useState<Nutritionist>(SEED_NUTRITIONIST);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasInitialFetch, setHasInitialFetch] = useState(false); // Novo estado para controle de carga inicial
  const [showLongLoadingOptions, setShowLongLoadingOptions] = useState(false); // Controle para mostrar opção de fechar
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Efeito para monitorar tempo de carregamento
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoadingData) {
        setShowLongLoadingOptions(false);
        timer = setTimeout(() => {
            setShowLongLoadingOptions(true);
        }, 5000); // 5 segundos
    }
    return () => clearTimeout(timer);
  }, [isLoadingData]);

  // Carregar dados do Supabase
  const fetchData = async () => {
    if (!session) return; // Só busca se estiver autenticado
    
    setFetchError(null);
    // Bloqueia a UI apenas se for a primeira carga
    if (!hasInitialFetch) {
        setIsLoadingData(true);
    }

    try {
        const userId = session.user.id;
        let isNutritionist = false;

        // 0. Check User Role (Nutritionist Profile Exists?)
        const { data: profileCheck, error: profileCheckError } = await supabase
            .from('nutritionist_profile')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (profileCheck) {
            isNutritionist = true;
            setUserType('nutritionist');
        } else {
            // Se não tem perfil, assume paciente (ou novo usuário que ainda não configurou)
            // Mas vamos verificar se existe um paciente vinculado a este auth_user_id
            const { data: patientCheck, error: patientCheckError } = await supabase
                .from('patients')
                .select('id')
                .eq('auth_user_id', userId)
                .maybeSingle();
            
            if (patientCheck) {
                isNutritionist = false;
                setUserType('patient');
            } else {
                // Tenta encontrar paciente pelo email para vincular (Primeiro Acesso do Paciente)
                console.log("Tentando vincular paciente pelo email:", session.user.email);
                
                const { data: emailMatch, error: searchError } = await supabase
                    .from('patients')
                    .select('id')
                    .eq('email', session.user.email)
                    .is('auth_user_id', null) // Só vincula se ainda não tiver dono
                    .maybeSingle();

                if (searchError) {
                    console.error("Erro ao buscar paciente por email (Provável RLS):", searchError);
                }

                if (emailMatch) {
                    console.log("Paciente encontrado para vínculo:", emailMatch.id);
                    // Vincula o usuário Auth ao registro de Paciente
                    const { error: updateError } = await supabase
                        .from('patients')
                        .update({ auth_user_id: userId })
                        .eq('id', emailMatch.id);
                    
                    if (!updateError) {
                        console.log("Paciente vinculado com sucesso!");
                        isNutritionist = false;
                        setUserType('patient');
                        // O fluxo segue e vai buscar os dados desse paciente recém vinculado
                    } else {
                        // Se falhar o update, assume nutri (fallback) ou trata erro
                        console.error("Erro ao vincular paciente (Update falhou):", updateError);
                        isNutritionist = true; 
                        setUserType('nutritionist');
                    }
                } else {
                    console.log("Nenhum paciente encontrado com este email ou já vinculado.");
                    // Caso de borda: usuário logado mas sem perfil nem paciente vinculado.
                    // Pode ser um novo nutricionista que ainda não salvou perfil?
                    // Vamos assumir nutricionista por padrão para permitir criar perfil.
                    isNutritionist = true; 
                    setUserType('nutritionist');
                }
            }
        }

        let patientsData: any[] = [];
        let appointmentsData: any[] = [];
        let profileData: any = null;

        if (isNutritionist) {
            // --- NUTRITIONIST FLOW ---

            // 1. Fetch Patients (Created by this Nutritionist)
            const { data: pData, error: pError } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', userId);
            
            if (pError) throw new Error(`Erro ao buscar pacientes: ${pError.message}`);
            patientsData = pData || [];

            // 4. Fetch Appointments (For this Nutritionist)
            const { data: aData, error: aError } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', userId);
            
            if (aError) throw new Error(`Erro ao buscar agendamentos: ${aError.message}`);
            appointmentsData = aData || [];

            // 5. Fetch Nutritionist Profile
            const { data: profData, error: profError } = await supabase
                .from('nutritionist_profile')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();
            
            if (profData) profileData = profData;

        } else {
            // --- PATIENT FLOW ---
            
            // 1. Fetch THIS Patient (Linked by auth_user_id)
            const { data: pData, error: pError } = await supabase
                .from('patients')
                .select('*')
                .eq('auth_user_id', userId)
                .single();
            
            if (pError) throw new Error(`Erro ao buscar dados do paciente: ${pError.message}`);
            patientsData = pData ? [pData] : [];

            // 4. Fetch Appointments (For this Patient) - Assuming we filter by patientId later or add RLS for patient view
            // For now, let's fetch appointments where patientId matches this patient's ID
            if (patientsData.length > 0) {
                const patientId = patientsData[0].id;
                const { data: aData, error: aError } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('patientId', patientId);
                
                if (!aError) appointmentsData = aData || [];
            }
            
            // Fetch Nutritionist Profile (of the nutritionist who created this patient)
            // We need this to display nutritionist info on the dashboard
            if (patientsData.length > 0) {
                 const nutritionistId = patientsData[0].user_id; // The creator's ID
                 const { data: profData } = await supabase
                    .from('nutritionist_profile')
                    .select('*')
                    .eq('user_id', nutritionistId)
                    .maybeSingle();
                 if (profData) profileData = profData;
            }
        }

        const patientIds = patientsData.map(p => p.id);

        // 2. Fetch CheckIns (Filtered by Patient IDs)
        let checkInsData: any[] = [];
        if (patientIds.length > 0) {
            const { data, error } = await supabase
                .from('check_ins')
                .select('*')
                .in('patientId', patientIds);
            
            if (error) throw new Error(`Erro ao buscar avaliações: ${error.message}`);
            checkInsData = data || [];
        }

        // 3. Fetch Diet Plans (Filtered by Patient IDs)
        let dietsData: any[] = [];
        if (patientIds.length > 0) {
            const { data, error } = await supabase
                .from('diet_plans')
                .select('*')
                .in('patientId', patientIds);
            
            if (error) throw new Error(`Erro ao buscar dietas: ${error.message}`);
            dietsData = data || [];
        }

        if (profileData) {
             setNutritionist(profileData);
        }

        // Montar a estrutura de objeto aninhado que o frontend espera
        const assembledPatients: Patient[] = patientsData.map(p => {
            return {
                ...p,
                checkIns: checkInsData.filter(c => c.patientId === p.id),
                dietPlans: dietsData.filter(d => d.patientId === p.id),
                // Anamnesis já vem como JSONB no objeto do paciente se configurado no banco
                anamnesis: p.anamnesis || undefined
            };
        });

        setPatients(assembledPatients);
        setAppointments(appointmentsData);
        
        // Se for paciente, seleciona automaticamente ele mesmo
        if (!isNutritionist && assembledPatients.length > 0) {
            setSelectedPatientId(assembledPatients[0].id);
            // Mapeia a view inicial corretamente
            // A view 'patients' com activeTab='overview' é o dashboard do paciente
            if (currentView === 'home') {
                setCurrentView('patients');
                setActiveTab('overview');
            }
        }
        
        setHasInitialFetch(true); // Marca como carregado

    } catch (error: any) {
        console.error("Erro ao buscar dados do Supabase:", error);
        setFetchError(error.message || "Erro desconhecido ao conectar com o banco de dados.");
    } finally {
        setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (session) {
        fetchData();
    }
  }, [session]);

  // --- RESET HANDLER ---
  const handleResetData = async () => {
    if (window.confirm('ATENÇÃO: Isso apagará TODOS os dados do banco de dados (Pacientes, Dietas, etc). Deseja continuar?')) {
        // Limpar tabelas
        await supabase.from('check_ins').delete().neq('id', '0');
        await supabase.from('diet_plans').delete().neq('id', '0');
        await supabase.from('appointments').delete().neq('id', '0');
        await supabase.from('patients').delete().neq('id', '0');
        // Resetar perfil para valores padrão (mas manter o registro)
        await supabase.from('nutritionist_profile').update({
             name: '', crn: '', email: '', phone: '', birthDate: '', photo: ''
        }).eq('id', 'profile_1');
        
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
  const handleAddPatient = async (newPatient: Patient) => {
    // Remover campos relacionais (arrays) antes de salvar na tabela 'patients'
    const { checkIns, dietPlans, ...patientData } = newPatient;
    
    if (!session) return;

    const { error } = await supabase.from('patients').insert({
        ...patientData,
        user_id: session.user.id
    });
    
    if (error) {
        console.error("Erro ao salvar paciente:", error);
        alert("Erro ao salvar paciente no banco.");
        return;
    }

    // Atualiza estado local para refletir na UI imediatamente
    setPatients(prev => [...prev, newPatient]);
    setSelectedPatientId(newPatient.id);
    setActiveTab('overview');
    setCurrentView('patients');
    setShouldOpenAddPatientModal(false);
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    const { checkIns, dietPlans, ...patientData } = updatedPatient;

    const { error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', updatedPatient.id);

    if (error) {
        console.error("Erro ao atualizar paciente:", error);
        return;
    }
    
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleUpdateDietPlans = async (newDietPlans: DietPlanType[]) => {
    if (!activePatient) return;

    for (const plan of newDietPlans) {
        const { error } = await supabase
            .from('diet_plans')
            .upsert({
                ...plan,
                patientId: activePatient.id
            });
        
        if (error) console.error("Erro ao salvar dieta:", error);
    }

    const currentIds = newDietPlans.map(d => d.id);
    const idsToDelete = activePatient.dietPlans.filter(d => !currentIds.includes(d.id)).map(d => d.id);
    
    if (idsToDelete.length > 0) {
        await supabase.from('diet_plans').delete().in('id', idsToDelete);
    }

    const updatedPatient: Patient = {
        ...activePatient,
        dietPlans: newDietPlans
    };
    
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleUpdateAnamnesis = async (newAnamnesis: Anamnesis) => {
    if (!activePatient) return;
    
    const { error } = await supabase
        .from('patients')
        .update({ anamnesis: newAnamnesis })
        .eq('id', activePatient.id);

    if (error) {
        console.error("Erro ao salvar anamnese:", error);
        return;
    }

    const updatedPatient: Patient = {
        ...activePatient,
        anamnesis: newAnamnesis
    };
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleTrashPatient = async (id: string) => {
    const { error } = await supabase
        .from('patients')
        .update({ status: 'trash' })
        .eq('id', id);

    if (!error) {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'trash' } : p));
        if (selectedPatientId === id) {
            setSelectedPatientId(null);
        }
    }
  };

  const handleRestorePatient = async (id: string) => {
    const { error } = await supabase
        .from('patients')
        .update({ status: 'active' })
        .eq('id', id);

    if (!error) {
        setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
    }
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab('overview');
    setCurrentView('patients'); // Ensure we are in the "Patients" section
  };

  const handleSelectPatientDiet = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab('diet');
    setCurrentView('patients');
  };

  const handleSelectPatientForEntry = (id: string) => {
    setSelectedPatientId(id);
    setCheckInToEdit(null); // Ensure clean form
    setCurrentView('add_entry');
  };

  const handleSaveCheckIn = async (checkIn: CheckIn) => {
    if (!activePatient) return;

    // SANITIZAÇÃO: Remove propriedades extras (UI-derived) antes de enviar para o Supabase
    // Isso evita o erro 400/500 se o objeto contiver campos como 'delta', 'dateFormatted', etc.
    const payload = {
        id: checkIn.id,
        patientId: activePatient.id,
        date: checkIn.date,
        height: checkIn.height,
        weight: checkIn.weight,
        imc: checkIn.imc,
        bodyFat: checkIn.bodyFat,
        muscleMass: checkIn.muscleMass,
        bmr: checkIn.bmr,
        age: checkIn.age,
        bodyAge: checkIn.bodyAge,
        visceralFat: checkIn.visceralFat,
        waistCircumference: checkIn.waistCircumference || 0,
        hipCircumference: checkIn.hipCircumference || 0,
        chestCircumference: checkIn.chestCircumference || 0,
        abdomenCircumference: checkIn.abdomenCircumference || 0,
        armCircumference: checkIn.armCircumference || 0,
        forearmCircumference: checkIn.forearmCircumference || 0,
        wristCircumference: checkIn.wristCircumference || 0,
        thighCircumference: checkIn.thighCircumference || 0,
        calfCircumference: checkIn.calfCircumference || 0
    };

    // Salvar no Supabase
    const { error } = await supabase
        .from('check_ins')
        .upsert(payload);

    if (error) {
        console.error("Erro ao salvar avaliação:", error);
        alert("Erro ao salvar avaliação: " + error.message);
        return;
    }

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
    
    if (isUpdate) {
        setActiveTab('history');
    } else {
        setActiveTab('overview');
    }
    setCheckInToEdit(null);
  };

  const handleDeleteCheckIn = async (id: string) => {
    if (!activePatient) return;
    if (!window.confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    const { error } = await supabase.from('check_ins').delete().eq('id', id);

    if (error) {
        console.error("Erro ao deletar:", error);
        return;
    }

    const updatedCheckIns = activePatient.checkIns.filter(c => c.id !== id);
    const updatedPatient = { ...activePatient, checkIns: updatedCheckIns };
    
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleEditCheckIn = (checkIn: CheckIn) => {
    setCheckInToEdit(checkIn);
    setCurrentView('add_entry');
  };

  const handleViewReport = (checkIn: CheckIn) => {
      setReportCheckIn(checkIn);
      setCurrentView('assessment_report');
  };

  const handleAddAppointment = async (newAppointment: Appointment) => {
    if (!session) return;
    const { error } = await supabase.from('appointments').insert({
        ...newAppointment,
        user_id: session.user.id
    });
    if (!error) {
        setAppointments(prev => [...prev, newAppointment]);
    }
  };

  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    const { error } = await supabase
        .from('appointments')
        .update(updatedAppointment)
        .eq('id', updatedAppointment.id);
        
    if (!error) {
        setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
    
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    
    if (error) {
        console.error("Erro ao deletar agendamento:", error);
        alert("Erro ao deletar agendamento.");
        return;
    }

    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // Helper para gerar UUID (caso o navegador suporte ou fallback simples)
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSaveProfile = async (data: Nutritionist) => {
      if (!session) return;
      
      const userId = session.user.id;
      console.log("Salvando perfil para usuário:", userId);

      // Verificar se já existe um perfil para este usuário
      const { data: existingProfile, error: fetchError } = await supabase
        .from('nutritionist_profile')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) {
          console.error("Erro ao verificar perfil existente:", fetchError);
      }

      let error;

      // Sanitizar dados: remover 'id' para não tentar inserir/atualizar PK explicitamente
      const { id, ...profileData } = data as any;

      if (existingProfile) {
          console.log("Perfil existente encontrado. Atualizando...", existingProfile.id);
          // Atualizar existente
          const { error: updateError } = await supabase
            .from('nutritionist_profile')
            .update({
                ...profileData,
                user_id: userId, // Garante que o user_id não muda
            })
            .eq('user_id', userId); // Usa user_id como chave para update
          error = updateError;
      } else {
          console.log("Perfil não encontrado. Criando novo...");
          // Criar novo
          // Gerar ID manualmente para garantir que não seja nulo
          const newId = generateUUID();
          const { error: insertError } = await supabase
            .from('nutritionist_profile')
            .insert({
                id: newId,
                ...profileData,
                user_id: userId
            });
          error = insertError;
      }
      
      if (error) {
          console.error("Erro ao salvar perfil (Supabase):", error);
          alert("Erro ao salvar perfil: " + error.message);
          return;
      }
      
      console.log("Perfil salvo com sucesso!");
      // Atualizar estado local
      setNutritionist(data);
  };

  const handleViewChange = (view: ViewState) => {
    if (view === 'patients') {
      setSelectedPatientId(null);
    }
    
    if (view !== 'patients') {
        setShouldOpenAddPatientModal(false);
        setSelectedPatientId(null);
    }
    
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
    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 w-full max-w-2xl mx-auto print:hidden overflow-x-auto">
      {[
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'anamnesis', label: 'Anamnese', icon: Stethoscope },
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all min-w-[100px] ${
              isActive 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={16} className="shrink-0" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  );

  // --- RENDER CONDICIONAL (AUTH vs APP) ---
  if (isLoadingSession) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <div className="animate-spin text-blue-600 dark:text-blue-400">
                  <Activity size={48} />
              </div>
          </div>
      );
  }

  if (!session) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onSignUp={handleSignUp}
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-200">
      {userType === 'patient' && activePatient ? (
        <PatientSidebar 
            currentView={
                currentView === 'schedule' ? 'schedule' as ViewState :
                activeTab === 'diet' ? 'diet' as ViewState :
                activeTab === 'history' ? 'history' as ViewState :
                'home' as ViewState
            } 
            onViewChange={(view) => {
                const viewId = view as string;
                if (viewId === 'schedule') {
                    setCurrentView('schedule');
                } else {
                    setCurrentView('patients');
                    if (viewId === 'home') setActiveTab('overview');
                    if (viewId === 'history') setActiveTab('history');
                    if (viewId === 'diet') setActiveTab('diet');
                }
            }} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
            onLogout={handleLogout}
            patientName={activePatient.name}
        />
      ) : (
        <Sidebar 
            currentView={currentView} 
            onViewChange={handleViewChange} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
            onLogout={handleLogout}
        />
      )}

      {/* Main Content Area: Added pb-24 for mobile nav clearance */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 print:p-0 print:overflow-visible">
        
        {/* Loading Indicator for Data Fetching - Só aparece na primeira carga */}
        {(isLoadingData && !hasInitialFetch) && (
            <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="animate-spin text-blue-600 dark:text-blue-400 mb-4">
                    <Activity size={48} />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">Sincronizando com Supabase...</p>
                {/* Opção de escape se demorar muito */}
                {showLongLoadingOptions && (
                    <button 
                        onClick={() => {
                            setIsLoadingData(false);
                            setHasInitialFetch(true); // Assume carregado para desbloquear
                        }}
                        className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        <XCircle size={16} /> Demorando muito? Fechar
                    </button>
                )}
            </div>
        )}

        {/* Error Indicator */}
        {fetchError && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center justify-between mx-4 md:mx-0">
                <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                    <div>
                        <h3 className="font-bold text-red-800 dark:text-red-200">Erro de Conexão</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">{fetchError}</p>
                    </div>
                </div>
                <button 
                    onClick={fetchData}
                    className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-sm font-bold whitespace-nowrap ml-4"
                >
                    Tentar Novamente
                </button>
            </div>
        )}

        {/* Header Logic: Allow header on 'home' but with different content */}
        {(currentView !== 'active_diets' && currentView !== 'assessment_report') && (
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-[1920px] mx-auto print:hidden">
            <div className="flex justify-between w-full sm:w-auto items-center">
              <div>
                {/* Special Header Content for Home View on Mobile */}
                {currentView === 'home' ? (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm lg:hidden">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">NutriVida</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm lg:hidden">Seu assistente nutricional</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm hidden lg:block">Painel Geral</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {currentView === 'patients' && !selectedPatientId && 'Gestão de Pacientes'}
                        {currentView === 'patients' && selectedPatientId && userType === 'nutritionist' && (activePatient?.name || 'Detalhes do Paciente')}
                        {currentView === 'patients' && selectedPatientId && userType === 'patient' && 'Meu Painel'}
                        {currentView === 'schedule' && 'Agenda'}
                        {currentView === 'add_entry' && (checkInToEdit ? 'Editar Avaliação' : 'Nova Avaliação')}
                        {currentView === 'select_patient_for_entry' && 'Menu de Ações'}
                        {currentView === 'profile_settings' && 'Meu Perfil'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {currentView === 'patients' && !selectedPatientId && 'Gerencie o acompanhamento dos seus alunos'}
                        {currentView === 'patients' && selectedPatientId && userType === 'nutritionist' && 'Acompanhe a evolução e gerencie o plano'}
                        {currentView === 'patients' && selectedPatientId && userType === 'patient' && 'Acompanhe sua evolução e metas'}
                        {currentView === 'schedule' && 'Visualize seus próximos atendimentos'}
                        {currentView === 'select_patient_for_entry' && 'Selecione o que deseja criar ou gerenciar'}
                        {currentView === 'profile_settings' && 'Gerencie seus dados e informações da clínica'}
                        </p>
                    </>
                )}
              </div>

              {/* Mobile Header Buttons (visible on all screens on mobile since sidebar is bottom nav) */}
              <div className="flex gap-2 lg:hidden">
                 <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                    title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                 >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                 </button>
                 <button 
                    onClick={handleLogout} 
                    className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-sm"
                    title="Sair"
                 >
                    <LogOut size={20} />
                 </button>
              </div>
            </div>
            
            {activePatient && selectedPatientId && currentView !== 'home' && (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-4 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                 <div className={`h-10 w-10 ${activePatient.avatarColor} rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-700 shadow-sm`}>
                    {activePatient.name.substring(0,2).toUpperCase()}
                 </div>
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{activePatient.name}</p>
                    <p className="text-sm text-slate-400">
                       {activePatient.age} anos • {activePatient.profession}
                    </p>
                 </div>
              </div>
            )}
          </header>
        )}

        <div className="w-full max-w-[1920px] mx-auto">
          
          {currentView === 'home' && userType === 'nutritionist' && (
            <MainDashboard 
              patients={patients} 
              appointments={appointments}
              onNavigateTo={(view) => setCurrentView(view as ViewState)}
            />
          )}

          {currentView === 'active_diets' && userType === 'nutritionist' && (
             <ActiveDietsList 
                patients={patients}
                onSelectPatient={handleSelectPatientDiet}
                onBack={() => setCurrentView('home')}
             />
          )}

          {currentView === 'assessment_report' && reportCheckIn && activePatient && (
             <AssessmentReport 
                checkIn={reportCheckIn}
                patient={activePatient}
                allCheckIns={activeCheckIns}
                onBack={() => {
                    setCurrentView('patients');
                    setActiveTab('history');
                }}
                nutritionist={nutritionist}
             />
          )}

          {currentView === 'profile_settings' && userType === 'nutritionist' && (
            <NutritionistProfile 
                data={nutritionist}
                onSave={handleSaveProfile}
                onResetData={handleResetData}
                onLogout={handleLogout}
            />
          )}

          {currentView === 'select_patient_for_entry' && userType === 'nutritionist' && (
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

          {currentView === 'patients' && !selectedPatientId && userType === 'nutritionist' && (
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
              onDeleteAppointment={handleDeleteAppointment}
              readOnly={userType === 'patient'}
            />
          )}

          {currentView === 'patients' && activePatient && (
            <div className="space-y-6">
              {userType === 'nutritionist' && renderTabs()}

              {activeTab === 'overview' && (
                <Dashboard 
                  checkIns={activeCheckIns} 
                  onAddEntry={() => {
                      setCheckInToEdit(null);
                      setCurrentView('add_entry');
                  }}
                  onViewReport={handleViewReport}
                  age={activePatient.age}
                  gender={activePatient.gender}
                  activityFactor={activePatient.activityFactor || 1.2}
                  readOnly={userType === 'patient'}
                />
              )}

              {activeTab === 'anamnesis' && userType === 'nutritionist' && (
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
                    readOnly={userType === 'patient'}
                />
              )}
              
              {activeTab === 'diet' && (
                <DietPlan 
                    plans={activePatient.dietPlans} 
                    onUpdatePlans={handleUpdateDietPlans}
                    patientName={activePatient.name}
                    patientWeight={activeCheckIns[0]?.weight || 70}
                    targetCalories={(activeCheckIns[0]?.bmr || 0) * (activePatient.activityFactor || 1.2)} 
                    nutritionist={nutritionist}
                    readOnly={userType === 'patient'}
                />
              )}

              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 max-w-4xl mx-auto border border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400">
                        <User size={32} />
                        <h2 className="text-xl font-semibold">Dados Pessoais</h2>
                    </div>
                    <button 
                        onClick={() => setActiveTab('anamnesis')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium text-sm shadow-sm"
                    >
                        <Stethoscope size={18} />
                        Editar Anamnese
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Nome Completo</label>
                      <input type="text" value={activePatient.name} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                      <input type="text" value={activePatient.email} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Idade</label>
                      <input type="text" value={activePatient.age} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Profissão</label>
                      <input type="text" value={activePatient.profession} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Telefone</label>
                      <input type="text" value={activePatient.phone} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Instagram</label>
                      <input type="text" value={activePatient.instagram} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Endereço</label>
                      <input type="text" value={activePatient.address || ''} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Objetivo</label>
                      <input type="text" value={activePatient.objective} disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Gênero</label>
                      <select disabled value={activePatient.gender} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300">
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Fator de Atividade (FA)</label>
                      <input type="text" value={
                          activePatient.activityFactor === 1.2 ? '1.2 - Sedentário' :
                          activePatient.activityFactor === 1.375 ? '1.375 - Levemente Ativo' :
                          activePatient.activityFactor === 1.55 ? '1.55 - Moderadamente Ativo' :
                          activePatient.activityFactor === 1.725 ? '1.725 - Muito Ativo' :
                          '1.9 - Extremamente Ativo'
                      } disabled className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-300" />
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
                setCheckInToEdit(null);
                setCurrentView('patients');
                setActiveTab(checkInToEdit ? 'history' : 'overview');
              }}
              lastRecord={activeCheckIns[0]}
              patientBirthDate={activePatient.birthDate}
              initialData={checkInToEdit}
              patientGender={activePatient.gender}
            />
          )}

        </div>
      </main>
    </div>
  );
};
export default App;