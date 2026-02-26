import React, { useState, useEffect } from 'react';
import { Patient, ActivityLevel } from '../types';
import { Search, Plus, User, ChevronRight, Calendar, X, Pencil, Trash2, RefreshCcw, Archive, MapPin, Zap } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onTrashPatient: (patientId: string) => void;
  onRestorePatient: (patientId: string) => void;
  initialOpenModal?: boolean; 
}

// Helper seguro para IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

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
    email: '',
    birthDate: '', 
    gender: 'Masculino' as 'Masculino' | 'Feminino',
    profession: '',
    phone: '',
    instagram: '',
    address: '',
    activityFactor: 1.2 as ActivityLevel
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
    setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'activityFactor' ? parseFloat(value) : value 
    }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      birthDate: '',
      gender: 'Masculino',
      profession: '',
      phone: '',
      instagram: '',
      address: '',
      activityFactor: 1.2
    });
    setShowModal(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation(); // Prevent card selection
    setEditingId(patient.id);
    setFormData({
      name: patient.name,
      email: patient.email || '',
      birthDate: patient.birthDate, // Load actual birthDate
      gender: patient.gender,
      profession: patient.profession,
      phone: patient.phone,
      instagram: patient.instagram,
      address: patient.address || '',
      activityFactor: patient.activityFactor || 1.2 // Default to 1.2 if missing
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
                email: formData.email, // Use form email
                birthDate: formData.birthDate,
                age: calculatedAge, // Auto calculated
                gender: formData.gender,
                profession: formData.profession,
                phone: formData.phone,
                instagram: formData.instagram,
                address: formData.address,
                activityFactor: formData.activityFactor,
            };
            onUpdatePatient(updated);
        }
    } else {
        // Create new
        const newPatient: Patient = {
            id: generateId(),
            name: formData.name,
            email: formData.email, // Use form email
            gender: formData.gender,
            birthDate: formData.birthDate,
            age: calculatedAge, // Auto calculated
            profession: formData.profession,
            phone: formData.phone,
            instagram: formData.instagram,
            address: formData.address,
            objective: 'Saúde e Bem-estar', // Default
            avatarColor: 'bg-blue-100 text-blue-700',
            status: 'active',
            activityFactor: formData.activityFactor,
            checkIns: [],
            dietPlans: [] // Start with empty array
        };
        onAddPatient(newPatient);
    }
    
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
             {viewMode === 'active' ? 'Meus Pacientes' : 'Lixeira de Pacientes'}
           </h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm">
             {viewMode === 'active' 
                ? 'Gerencie os cadastros e acompanhe a evolução.' 
                : 'Recupere pacientes ou remova permanentemente.'}
           </p>
        </div>
        
        <div className="flex gap-3">
            {viewMode === 'active' ? (
                <>
                    <button 
                        onClick={() => setViewMode('trash')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
                    >
                        <Archive size={18} />
                        <span className="hidden sm:inline">Lixeira</span>
                    </button>
                    <button 
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Novo Paciente</span>
                    </button>
                </>
            ) : (
                <button 
                    onClick={() => setViewMode('active')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
                >
                    <User size={18} />
                    <span className="hidden sm:inline">Ver Ativos</span>
                </button>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar paciente por nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <User size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhum paciente encontrado</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
            {searchTerm 
                ? 'Tente buscar com outro termo.' 
                : viewMode === 'active' 
                    ? 'Cadastre seu primeiro paciente para começar o acompanhamento.'
                    : 'A lixeira está vazia.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              onClick={() => viewMode === 'active' && onSelectPatient(patient.id)}
              className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between ${viewMode === 'active' ? 'cursor-pointer hover:border-blue-200 dark:hover:border-blue-700' : 'opacity-75'}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`h-14 w-14 ${patient.avatarColor} rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner`}>
                    {patient.name.substring(0,2).toUpperCase()}
                  </div>
                  
                  <div className="flex gap-1">
                    {viewMode === 'active' ? (
                        <>
                            <button 
                                onClick={(e) => handleOpenEdit(e, patient)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={(e) => handleTrashClick(e, patient.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={(e) => handleRestoreClick(e, patient.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Restaurar"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate mb-1">{patient.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 truncate">{patient.profession || 'Profissão não informada'}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar size={14} className="text-blue-500" />
                    {patient.age} anos
                  </div>
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-blue-500 font-bold text-xs">Tel:</span>
                        {patient.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center mt-auto">
                 <span className={`text-xs font-semibold px-2 py-1 rounded-md ${patient.checkIns.length > 0 ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {patient.checkIns.length} Avaliações
                 </span>
                 
                 {/* Espaço reservado para o indicador de navegação que aparece no hover */}
                 {viewMode === 'active' && (
                     <span className="text-xs text-slate-300 dark:text-slate-600 font-medium opacity-100 group-hover:opacity-0 transition-opacity">
                        Ver perfil
                     </span>
                 )}
              </div>
              
              {viewMode === 'active' && (
                  <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 pointer-events-none bg-white dark:bg-slate-800 pl-2">
                    <ChevronRight size={20} />
                  </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {editingId ? 'Editar Paciente' : 'Novo Paciente'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            name="name"
                            required
                            placeholder="Ex: João da Silva"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                        <input 
                            type="email" 
                            name="email"
                            required
                            placeholder="Ex: joao@email.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Este e-mail será usado para o login do paciente no aplicativo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento</label>
                            <input 
                                type="date" 
                                name="birthDate"
                                required
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gênero</label>
                            <select 
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                           <Zap size={14} className="text-amber-500" /> Nível de Atividade Física (Fator GET)
                        </label>
                        <div className="relative">
                            <select 
                                name="activityFactor"
                                value={formData.activityFactor}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value={1.2}>Sedentário (Pouco ou nenhum exercício)</option>
                                <option value={1.375}>Levemente Ativo (Exercício leve 1-3 dias/sem)</option>
                                <option value={1.55}>Moderadamente Ativo (Exercício moderado 3-5 dias/sem)</option>
                                <option value={1.725}>Muito Ativo (Exercício pesado 6-7 dias/sem)</option>
                                <option value={1.9}>Extremamente Ativo (Trabalho físico pesado ou treino 2x dia)</option>
                            </select>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Usado para calcular o Gasto Energético Total (GET) e planejar a dieta.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profissão</label>
                            <input 
                                type="text" 
                                name="profession"
                                placeholder="Ex: Advogado"
                                value={formData.profession}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                            <input 
                                type="text" 
                                name="phone"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                                <input 
                                    type="text" 
                                    name="instagram"
                                    placeholder="usuario"
                                    value={formData.instagram}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        {/* Novo Campo de Endereço */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    name="address"
                                    placeholder="Rua, Número - Cidade/UF"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-6 border-t border-slate-50 dark:border-slate-700 mt-2">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-6 py-3 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2"
                        >
                            <User size={18} />
                            {editingId ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};