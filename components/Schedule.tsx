
import React, { useState } from 'react';
import { Appointment, Patient } from '../types';
import { Calendar, Clock, Plus, User, MapPin, X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleProps {
  patients: Patient[];
  appointments: Appointment[];
  onAddAppointment: (appointment: Appointment) => void;
}

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const Schedule: React.FC<ScheduleProps> = ({ patients, appointments, onAddAppointment }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'Consulta' as 'Consulta' | 'Retorno' | 'Avaliação',
    notes: ''
  });

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) return;

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
    setShowAddModal(false);
    setFormData({ ...formData, notes: '' }); // Reset notes only
  };

  // Group appointments by date
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Paciente Desconhecido';
  
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(`${dateStr}T12:00:00`);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Filter for next appointment (simplistic logic for demo)
  const nextAppointment = sortedAppointments.find(a => {
      const appDate = new Date(`${a.date}T${a.time}`);
      return appDate > new Date();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Agenda de Consultas</h2>
           <p className="text-slate-500 text-sm">Gerencie seus horários e atendimentos</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simple Calendar Sidebar (Visual only for this demo) */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700 capitalize">
                        {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                {/* Simplified Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                    {['D','S','T','Q','Q','S','S'].map((d, i) => (
                        <div key={i} className="text-slate-400 text-xs font-medium py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {Array.from({length: 35}, (_, i) => {
                        const day = i - 2; // Offset for demo
                        const isToday = day === new Date().getDate();
                        // Find if there are appointments on this day
                        // Note: This matches day number only for the current month visualization
                        const hasApps = appointments.some(a => {
                            const d = new Date(a.date);
                            return d.getDate() === day && d.getMonth() === new Date().getMonth();
                        });

                        return (
                            <div 
                                key={i} 
                                className={`
                                    h-8 w-8 flex items-center justify-center rounded-full cursor-pointer transition-colors relative
                                    ${day <= 0 || day > 31 ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-50'}
                                    ${isToday ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                                `}
                            >
                                {day > 0 && day <= 31 ? day : ''}
                                {hasApps && !isToday && day > 0 && day <= 31 && (
                                    <span className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full"></span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 mb-2">Próxima Consulta</h4>
                {nextAppointment ? (
                    <div>
                        <div className="text-emerald-700 text-2xl font-bold mb-1">{nextAppointment.time}</div>
                        <div className="text-emerald-800 font-medium mb-1">{getPatientName(nextAppointment.patientId)}</div>
                        <div className="text-emerald-600 text-sm capitalize">{nextAppointment.type} • {new Date(nextAppointment.date).toLocaleDateString('pt-BR', {weekday: 'long'})}</div>
                    </div>
                ) : (
                    <p className="text-emerald-600 text-sm">Nenhum agendamento futuro encontrado.</p>
                )}
            </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-6">
            {sortedAppointments.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
                    <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600">Agenda Vazia</h3>
                    <p className="text-slate-400">Nenhum agendamento encontrado.</p>
                </div>
            ) : (
                <>
                {Array.from(new Set(sortedAppointments.map(a => a.date))).map(date => (
                    <div key={date}>
                        <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wide mb-3 ml-1">
                            {formatDateHeader(date)}
                        </h3>
                        <div className="space-y-3">
                            {sortedAppointments.filter(a => a.date === date).map(app => (
                                <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-emerald-200 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-lg text-slate-700 border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-100 transition-colors">
                                            <span className="text-lg font-bold leading-none">{app.time.split(':')[0]}</span>
                                            <span className="text-xs font-medium text-slate-400 group-hover:text-emerald-600">{app.time.split(':')[1]}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{getPatientName(app.patientId)}</h4>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle size={14} className="text-emerald-500" />
                                                    {app.type}
                                                </span>
                                                {app.notes && (
                                                    <span className="text-slate-400 max-w-[200px] truncate hidden sm:inline-block">
                                                        • {app.notes}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-emerald-600 transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                </>
            )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Novo Agendamento</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleAddAppointment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                        <select 
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                            <input 
                                type="date" 
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                            <input 
                                type="time" 
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Agendamento</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Consulta', 'Retorno', 'Avaliação'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({...formData, type: type as any})}
                                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                                        formData.type === type 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Notas adicionais sobre o agendamento..."
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-50 mt-6">
                        <button 
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={!formData.patientId}
                            className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Agendar
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
