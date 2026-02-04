import React, { useState } from 'react';
import { Patient } from '../types';
import { Search, Plus, User, ChevronRight, Calendar, X } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAddPatient: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onAddPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Masculino' as 'Masculino' | 'Feminino',
    profession: '',
    phone: '',
    instagram: ''
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name: formData.name,
      email: `${formData.name.toLowerCase().replace(/\s/g, '.')}@email.com`, // Generated email
      gender: formData.gender,
      age: parseInt(formData.age) || 0,
      profession: formData.profession,
      phone: formData.phone,
      instagram: formData.instagram,
      birthDate: new Date(new Date().getFullYear() - (parseInt(formData.age) || 20), 0, 1).toISOString().split('T')[0], // Estimate birthdate
      objective: 'Saúde e Bem-estar', // Default
      avatarColor: 'bg-emerald-100 text-emerald-700',
      checkIns: []
    };

    onAddPatient(newPatient);
    
    // Reset form
    setFormData({
      name: '',
      age: '',
      gender: 'Masculino',
      profession: '',
      phone: '',
      instagram: ''
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Meus Pacientes</h2>
           <p className="text-slate-500 text-sm">Gerencie o acompanhamento dos seus alunos</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Novo Paciente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar paciente..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredPatients.map(patient => {
            const lastCheckIn = patient.checkIns.length > 0 
                ? [...patient.checkIns].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                : null;

            return (
                <div 
                  key={patient.id}
                  onClick={() => onSelectPatient(patient.id)}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${patient.avatarColor}`}>
                            {patient.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{patient.name}</h3>
                            <p className="text-xs text-slate-500">{patient.profession || 'Paciente'}</p>
                        </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <ChevronRight size={20} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-2 text-sm">
                     <div>
                        <p className="text-slate-400 text-xs mb-1">Último Peso</p>
                        <p className="font-semibold text-slate-700">{lastCheckIn ? `${lastCheckIn.weight} kg` : '-'}</p>
                     </div>
                     <div>
                        <p className="text-slate-400 text-xs mb-1">Última Visita</p>
                        <p className="font-semibold text-slate-700 flex items-center gap-1">
                            {lastCheckIn ? new Date(lastCheckIn.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '-'}
                        </p>
                     </div>
                  </div>
                </div>
            );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Adicionar Novo Paciente</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleCreatePatient} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input 
                            autoFocus
                            name="name"
                            type="text" 
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ex: João Silva"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Idade</label>
                            <input 
                                name="age"
                                type="number" 
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.age}
                                onChange={handleInputChange}
                                placeholder="Anos"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                            <select 
                                name="gender"
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Profissão</label>
                        <input 
                            name="profession"
                            type="text" 
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.profession}
                            onChange={handleInputChange}
                            placeholder="Ex: Advogado"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                            <input 
                                name="phone"
                                type="tel" 
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
                            <input 
                                name="instagram"
                                type="text" 
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.instagram}
                                onChange={handleInputChange}
                                placeholder="@usuario"
                            />
                        </div>
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
                            disabled={!formData.name.trim()}
                            className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Criar Paciente
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};