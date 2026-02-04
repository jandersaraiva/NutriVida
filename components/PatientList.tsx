import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { Search, Plus, User, ChevronRight, Calendar, X, Pencil, Trash2, RefreshCcw, Archive } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onTrashPatient: (patientId: string) => void;
  onRestorePatient: (patientId: string) => void;
  initialOpenModal?: boolean; 
}

export const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  onSelectPatient, 
  onAddPatient,
  onUpdatePatient,
  onTrashPatient,
  onRestorePatient,
  initialOpenModal = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  
  // Open modal if prop is true (on mount)
  useEffect(() => {
    if (initialOpenModal) {
      handleOpenAdd();
    }
  }, [initialOpenModal]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '', 
    gender: 'Masculino' as 'Masculino' | 'Feminino',
    profession: '',
    phone: '',
    instagram: ''
  });

  const filteredPatients = patients.filter(p => 
    p.status === viewMode && // Filter by active or trash status
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      birthDate: '',
      gender: 'Masculino',
      profession: '',
      phone: '',
      instagram: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation(); // Prevent card selection
    setEditingId(patient.id);
    setFormData({
      name: patient.name,
      birthDate: patient.birthDate, // Load actual birthDate
      gender: patient.gender,
      profession: patient.profession,
      phone: patient.phone,
      instagram: patient.instagram
    });
    setShowModal(true);
  };

  const handleTrashClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card selection
    if (window.confirm('Tem certeza que deseja mover este paciente para a lixeira?')) {
        onTrashPatient(id);
    }
  };

  const handleRestoreClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onRestorePatient(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthDate) return;

    const calculatedAge = calculateAge(formData.birthDate);

    if (editingId) {
        // Update existing
        const existingPatient = patients.find(p => p.id === editingId);
        if (existingPatient) {
            const updated: Patient = {
                ...existingPatient,
                name: formData.name,
                birthDate: formData.birthDate,
                age: calculatedAge, // Auto calculated
                gender: formData.gender,
                profession: formData.profession,
                phone: formData.phone,
                instagram: formData.instagram,
            };
            onUpdatePatient(updated);
        }
    } else {
        // Create new
        const newPatient: Patient = {
            id: crypto.randomUUID(),
            name: formData.name,
            email: `${formData.name.toLowerCase().replace(/\s/g, '.')}@email.com`, // Generated email
            gender: formData.gender,
            birthDate: formData.birthDate,
            age: calculatedAge, // Auto calculated
            profession: formData.profession,
            phone: formData.phone,
            instagram: formData.instagram,
            objective: 'Saúde e Bem-estar', // Default
            avatarColor: 'bg-emerald-100 text-emerald-700',
            status: 'active',
            checkIns: []
        };
        onAddPatient(newPatient);
    }
    
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">
             {viewMode === 'active' ? 'Meus Pacientes' : 'Lixeira de Pacientes'}
           </h2>
           <p className="text-slate-500 text-sm">
             {viewMode === 'active' 
               ? 'Gerencie o acompanhamento dos seus alunos' 
               : 'Visualize ou restaure pacientes excluídos'}
           </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-200 p-1 rounded-xl flex text-sm font-medium">
             <button 
                onClick={() => setViewMode('active')}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Ativos
             </button>
             <button 
                onClick={() => setViewMode('trash')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${viewMode === 'trash' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Archive size={14} />
               Lixeira
             </button>
          </div>

          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Novo Paciente</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
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

      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
           <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-400 mb-3">
             {viewMode === 'active' ? <User size={32} /> : <Trash2 size={32} />}
           </div>
           <p className="text-slate-500 font-medium">
             {viewMode === 'active' 
                ? 'Nenhum paciente encontrado.' 
                : 'A lixeira está vazia.'}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredPatients.map(patient => {
              const lastCheckIn = patient.checkIns.length > 0 
                  ? [...patient.checkIns].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                  : null;

              return (
                  <div 
                    key={patient.id}
                    onClick={() => viewMode === 'active' ? onSelectPatient(patient.id) : null}
                    className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative ${viewMode === 'active' ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
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
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {viewMode === 'active' ? (
                            <>
                              <button 
                                  onClick={(e) => handleOpenEdit(e, patient)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Editar"
                              >
                                  <Pencil size={16} />
                              </button>
                              <button 
                                  onClick={(e) => handleTrashClick(e, patient.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Mover para Lixeira"
                              >
                                  <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <button 
                                onClick={(e) => handleRestoreClick(e, patient.id)}
                                className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1 px-2"
                                title="Restaurar Paciente"
                            >
                                <RefreshCcw size={14} />
                                <span className="text-xs font-bold">Restaurar</span>
                            </button>
                          )}
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
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">
                        {editingId ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input 
                            autoFocus
                            name="name"
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ex: João Silva"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                            <input 
                                name="birthDate"
                                type="date" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                            <select 
                                name="gender"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                value={formData.instagram}
                                onChange={handleInputChange}
                                placeholder="@usuario"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-50 mt-6">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={!formData.name.trim()}
                            className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-200"
                        >
                            {editingId ? 'Salvar Alterações' : 'Criar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};