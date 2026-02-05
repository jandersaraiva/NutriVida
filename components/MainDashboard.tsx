
import React from 'react';
import { Patient, Appointment, ViewState } from '../types';
import { Users, CalendarDays, Utensils, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface MainDashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  onNavigateTo: (view: ViewState) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ patients, appointments, onNavigateTo }) => {
  // KPIs
  const activePatients = patients.filter(p => p.status === 'active');
  const totalActive = activePatients.length;
  const patientsWithDiet = activePatients.filter(p => p.diet && p.diet.meals.length > 0).length;
  
  const today = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointments.filter(a => a.date === today && a.status !== 'Cancelado');
  const upcomingAppointments = appointments
    .filter(a => new Date(`${a.date}T${a.time}`) > new Date() && a.status !== 'Cancelado')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 3);

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Desconhecido';

  const Card = ({ title, value, subtext, icon: Icon, colorClass, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md cursor-pointer group`}
    >
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
        <p className="text-xs text-slate-400">{subtext}</p>
      </div>
      <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10 group-hover:scale-105 transition-transform`}>
        <Icon size={28} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Painel Geral</h2>
            <p className="text-slate-500">Bem-vindo ao NutriVida. Aqui está o resumo da sua clínica hoje.</p>
        </div>
        <div className="text-sm text-slate-400 font-medium bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
            title="Pacientes Ativos" 
            value={totalActive} 
            subtext="Total cadastrado"
            icon={Users} 
            colorClass="bg-blue-500 text-blue-500"
            onClick={() => onNavigateTo('patients')}
        />
        <Card 
            title="Agendamentos Hoje" 
            value={appointmentsToday.length} 
            subtext="Consultas agendadas"
            icon={CalendarDays} 
            colorClass="bg-emerald-500 text-emerald-500"
            onClick={() => onNavigateTo('schedule')}
        />
        <Card 
            title="Dietas Ativas" 
            value={patientsWithDiet} 
            subtext={`${((patientsWithDiet/totalActive || 0)*100).toFixed(0)}% dos pacientes`}
            icon={Utensils} 
            colorClass="bg-orange-500 text-orange-500"
            onClick={() => onNavigateTo('active_diets')}
        />
        <Card 
            title="Novos (Mês)" 
            value="2" 
            subtext="+15% vs mês anterior"
            icon={TrendingUp} 
            colorClass="bg-violet-500 text-violet-500"
            onClick={() => onNavigateTo('patients')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Appointments */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Clock size={20} className="text-emerald-500" />
                    Próximos Agendamentos
                </h3>
                <button 
                    onClick={() => onNavigateTo('schedule')}
                    className="text-sm text-emerald-600 font-medium hover:underline"
                >
                    Ver agenda completa
                </button>
            </div>
            
            {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <p>Nenhum agendamento futuro.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {upcomingAppointments.map(app => (
                        <div key={app.id} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex flex-col items-center justify-center w-14 h-14 bg-white rounded-lg shadow-sm text-emerald-700 mr-4">
                                <span className="text-sm font-bold">{app.time}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{getPatientName(app.patientId)}</h4>
                                <p className="text-xs text-slate-500 capitalize">
                                    {app.type} • {new Date(app.date).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}
                                </p>
                            </div>
                            <div className="text-right">
                                <button className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Quick Alerts / Actions */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-orange-500" />
                    Atenção Necessária
                </h3>
                <div className="space-y-3">
                    {activePatients.filter(p => !p.diet || p.diet.meals.length === 0).slice(0, 3).map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigateTo('patients')}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.avatarColor}`}>
                                {p.name.substring(0,2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                                <p className="text-xs text-orange-500">Sem dieta cadastrada</p>
                            </div>
                        </div>
                    ))}
                    {activePatients.filter(p => !p.diet || p.diet.meals.length === 0).length === 0 && (
                        <p className="text-sm text-slate-400">Tudo certo! Todos os pacientes possuem dieta.</p>
                    )}
                </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-lg text-white">
                <h3 className="font-bold text-lg mb-2">Dica do Dia</h3>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                    Lembre-se de verificar o feedback dos pacientes sobre a nova dieta na próxima consulta de retorno.
                </p>
                <div className="h-1 w-12 bg-emerald-400 rounded-full"></div>
            </div>
        </div>
      </div>
    </div>
  );
};
