import React from 'react';
import { Patient } from '../types';
import { User, Plus, Search } from 'lucide-react';

interface PatientSelectorProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
  onCreateNew: () => void;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({ patients, onSelectPatient, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredPatients = patients.filter(p => 
    p.status !== 'trash' && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Nova Avaliação</h2>
        <p className="text-slate-500">Selecione o paciente que será avaliado ou cadastre um novo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Create New */}
        <button 
          onClick={onCreateNew}
          className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-emerald-200 rounded-2xl hover:bg-emerald-50 hover:border-emerald-400 transition-all group h-full min-h-[200px]"
        >
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <h3 className="text-lg font-bold text-emerald-800">Novo Paciente</h3>
          <p className="text-sm text-emerald-600/70 text-center mt-1">Cadastrar e iniciar avaliação</p>
        </button>

        {/* Option 2: Select Existing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-full min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-slate-400" />
            Pacientes Cadastrados
          </h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredPatients.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Nenhum paciente encontrado.</p>
            ) : (
              filteredPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => onSelectPatient(patient.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                >
                  <div className={`h-10 w-10 ${patient.avatarColor} rounded-full flex items-center justify-center font-bold text-sm shrink-0`}>
                    {patient.name.substring(0,2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-700 truncate group-hover:text-emerald-700">{patient.name}</p>
                    <p className="text-xs text-slate-400 truncate">{patient.profession || 'Paciente'}</p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 text-emerald-600">
                    <Plus size={18} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};