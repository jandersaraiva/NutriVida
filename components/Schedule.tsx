import React, { useState, useMemo } from 'react';
import { Appointment, Patient } from '../types';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, X, Edit2, Check } from 'lucide-react';

interface ScheduleProps {
  patients: Patient[];
  appointments: Appointment[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
}

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const Schedule: React.FC<ScheduleProps> = ({ patients, appointments, onAddAppointment, onUpdateAppointment }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado para navegação do calendário (Mês/Ano visível)
  const [viewDate, setViewDate] = useState(new Date());
  
  // Estado para filtro (Dia selecionado) - Inicia com hoje
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'Consulta' as 'Consulta' | 'Retorno' | 'Avaliação',
    notes: ''
  });

  // Utilitários de Data
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 = Domingo

  const toDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleOpenAddModal = (preSelectedDate?: Date) => {
    setEditingId(null);
    const dateToUse = preSelectedDate || selectedDate || new Date();
    setFormData({
        patientId: '',
        date: toDateString(dateToUse),
        time: '10:00',
        type: 'Consulta',
        notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditClick = (app: Appointment) => {
    setEditingId(app.id);
    setFormData({
        patientId: app.patientId,
        date: app.date,
        time: app.time,
        type: app.type,
        notes: app.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) return;

    if (editingId) {
        // Modo Edição
        const originalApp = appointments.find(a => a.id === editingId);
        const updatedAppointment: Appointment = {
            id: editingId,
            patientId: formData.patientId,
            date: formData.date,
            time: formData.time,
            type: formData.type,
            status: originalApp?.status || 'Agendado',
            notes: formData.notes
        };
        onUpdateAppointment(updatedAppointment);
    } else {
        // Modo Criação
        const newAppointment: Appointment = {
            id: generateId(),
            patientId: formData.patientId,
            date: formData.date,
            time: formData.time,
            type: formData.type,
            status: 'Agendado',
            notes: formData.notes
        };
        onAddAppointment(newAppointment);
    }

    setShowAddModal(false);
    setEditingId(null);
    setFormData(prev => ({ ...prev, notes: '' }));
  };

  // Filtragem e Ordenação
  const selectedDateString = toDateString(selectedDate);
  
  const filteredAppointments = useMemo(() => {
    return appointments
        .filter(a => a.date === selectedDateString)
        .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDateString]);

  // Identificar dias com agendamentos para o mês visível (para as bolinhas)
  const daysWithAppointments = useMemo(() => {
    const daysSet = new Set<number>();
    const monthStr = String(viewDate.getMonth() + 1).padStart(2, '0');
    const yearStr = String(viewDate.getFullYear());
    
    appointments.forEach(app => {
        const [appYear, appMonth, appDay] = app.date.split('-');
        if (appYear === yearStr && appMonth === monthStr) {
            daysSet.add(parseInt(appDay));
        }
    });
    return daysSet;
  }, [appointments, viewDate]);

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Paciente Desconhecido';

  // Próximo agendamento global (independente do filtro)
  const nextAppointment = useMemo(() => {
     const now = new Date();
     return [...appointments]
        .filter(a => new Date(`${a.date}T${a.time}`) > now && a.status !== 'Concluído')
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];
  }, [appointments]);

  // Geração da Grade do Calendário
  const daysInMonth = getDaysInMonth(viewDate);
  const startDay = getFirstDayOfMonth(viewDate);
  const totalSlots = Math.ceil((daysInMonth + startDay) / 7) * 7; // Garante linhas completas
  const calendarGrid = Array.from({ length: totalSlots }, (_, i) => {
    const dayNumber = i - startDay + 1;
    return (dayNumber > 0 && dayNumber <= daysInMonth) ? dayNumber : null;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Agenda de Consultas</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seus horários e atendimentos</p>
        </div>
        <button 
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Esquerdo: Calendário e Próxima Consulta Global */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 capitalize text-lg">
                        {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                    {['D','S','T','Q','Q','S','S'].map((d, i) => (
                        <div key={i} className="text-slate-400 text-xs font-bold py-2">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {calendarGrid.map((day, i) => {
                        if (day === null) return <div key={i} className="h-10"></div>;

                        const isSelected = 
                            selectedDate.getDate() === day && 
                            selectedDate.getMonth() === viewDate.getMonth() &&
                            selectedDate.getFullYear() === viewDate.getFullYear();
                        
                        const isToday = 
                            new Date().getDate() === day &&
                            new Date().getMonth() === viewDate.getMonth() &&
                            new Date().getFullYear() === viewDate.getFullYear();

                        const hasEvents = daysWithAppointments.has(day);

                        return (
                            <button 
                                key={i} 
                                onClick={() => handleDayClick(day)}
                                className={`
                                    h-10 w-full flex flex-col items-center justify-center rounded-lg transition-all relative font-medium
                                    ${isSelected 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' 
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400'
                                    }
                                    ${isToday && !isSelected ? 'border border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-400' : ''}
                                `}
                            >
                                <span>{day}</span>
                                {hasEvents && !isSelected && (
                                    <span className="absolute bottom-1.5 w-1 h-1 bg-blue-500 rounded-full"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Cartão de Próxima Consulta (Global) */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-6 rounded-2xl text-white shadow-lg">
                <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Clock size={16} className="text-blue-400" />
                    Próximo Atendimento
                </h4>
                {nextAppointment ? (
                    <div>
                        <div className="text-4xl font-bold mb-1">{nextAppointment.time}</div>
                        <div className="text-blue-400 font-medium mb-3 text-lg">{getPatientName(nextAppointment.patientId)}</div>
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm">
                            <Calendar size={14} />
                            <span className="capitalize">{new Date(nextAppointment.date).toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'short'})}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">Nenhum agendamento pendente encontrado na agenda.</p>
                )}
            </div>
        </div>

        {/* Lado Direito: Lista de Agendamentos do Dia Selecionado */}
        <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[500px] flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 block">Visualizando Dia</span>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl capitalize flex items-center gap-2">
                             {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                    </div>
                    <div className="bg-white dark:bg-slate-700 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-500 dark:text-slate-300">
                        {filteredAppointments.length} agendamentos
                    </div>
                </div>

                <div className="p-6 flex-1">
                    {filteredAppointments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <Calendar size={32} className="text-slate-300 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Agenda Livre</h3>
                            <p className="text-slate-400 mb-6 max-w-xs">Não há consultas marcadas para este dia.</p>
                            <button 
                                onClick={() => handleOpenAddModal(selectedDate)}
                                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus size={18} /> Agendar neste dia
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAppointments.map(app => {
                                const isCompleted = app.status === 'Concluído';
                                return (
                                <div key={app.id} className={`p-5 rounded-xl border transition-all group flex gap-4 ${
                                    isCompleted 
                                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                                }`}>
                                    
                                    {/* Botão de Checkbox */}
                                    <div className="flex items-center sm:items-start sm:pt-1">
                                        <button
                                            onClick={() => onUpdateAppointment({ ...app, status: isCompleted ? 'Agendado' : 'Concluído' })}
                                            className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                                isCompleted 
                                                ? 'bg-blue-500 border-blue-500 text-white' 
                                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-400'
                                            }`}
                                            title={isCompleted ? "Marcar como pendente" : "Marcar como concluído"}
                                        >
                                            <Check size={14} strokeWidth={4} />
                                        </button>
                                    </div>

                                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className={`flex flex-col items-center justify-center min-w-[80px] h-full ${isCompleted ? 'opacity-50 grayscale' : ''}`}>
                                            <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{app.time}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                                                app.type === 'Consulta' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' :
                                                app.type === 'Retorno' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' :
                                                'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300'
                                            }`}>
                                                {app.type}
                                            </span>
                                        </div>
                                        
                                        <div className="w-px h-12 bg-slate-100 dark:bg-slate-700 hidden sm:block"></div>

                                        <div className={`flex-1 ${isCompleted ? 'opacity-50' : ''}`}>
                                            <h4 className={`font-bold text-lg mb-1 ${isCompleted ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                                                {getPatientName(app.patientId)}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                {app.notes ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-500 rounded-full"></div>
                                                        {app.notes}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Sem observações</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                            <button 
                                                onClick={() => handleEditClick(app)}
                                                className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit2 size={16} />
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Modal de Adição/Edição */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
                    </h3>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paciente</label>
                        <select 
                            required
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.patientId}
                            onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        >
                            <option value="">Selecione um paciente</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                            <input 
                                type="date" 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Horário</label>
                            <input 
                                type="time" 
                                required
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Agendamento</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Consulta', 'Retorno', 'Avaliação'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({...formData, type: type as any})}
                                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                                        formData.type === type 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Notas adicionais sobre o agendamento..."
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-50 dark:border-slate-700 mt-6">
                        <button 
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={!formData.patientId}
                            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            {editingId ? 'Salvar Alterações' : 'Agendar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};