
import React from 'react';
import { CheckIn } from '../types';
import { Calendar, Download, Pencil, Trash2, FileText } from 'lucide-react';

interface HistoryTableProps {
  checkIns: CheckIn[];
  onEdit: (checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
  onViewReport?: (checkIn: CheckIn) => void; // Nova prop opcional para não quebrar outros usos se houver
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ checkIns, onEdit, onDelete, onViewReport }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">Histórico Completo</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
          <Download size={16} /> Exportar CSV
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Peso</th>
              <th className="px-6 py-4">IMC</th>
              <th className="px-6 py-4">Gordura</th>
              <th className="px-6 py-4">Músculo</th>
              <th className="px-6 py-4">Idade Corp.</th>
              <th className="px-6 py-4">TMB (Kcal)</th>
              <th className="px-6 py-4 text-center">Visceral</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {checkIns.map((checkIn) => (
              <tr key={checkIn.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(checkIn.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-slate-600">{checkIn.weight.toFixed(1)} kg</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    checkIn.imc < 18.5 ? 'bg-yellow-100 text-yellow-700' :
                    checkIn.imc < 25 ? 'bg-emerald-100 text-emerald-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {checkIn.imc.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{checkIn.bodyFat.toFixed(1)}%</td>
                <td className="px-6 py-4 text-slate-600">{checkIn.muscleMass.toFixed(1)}%</td>
                <td className="px-6 py-4 text-slate-600">
                    {checkIn.bodyAge ? (
                        <span className={`${checkIn.bodyAge < checkIn.age ? 'text-blue-600 font-semibold' : 'text-slate-600'}`}>
                            {checkIn.bodyAge} anos
                        </span>
                    ) : '-'}
                </td>
                <td className="px-6 py-4 text-slate-600">{checkIn.bmr}</td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-block w-8 py-0.5 bg-slate-100 rounded text-slate-600 text-xs font-bold">
                    {checkIn.visceralFat}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {onViewReport && (
                        <button 
                            onClick={() => onViewReport(checkIn)}
                            className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm"
                            title="Ver Relatório Completo"
                        >
                            <FileText size={16} />
                        </button>
                    )}
                    <button 
                      onClick={() => onEdit(checkIn)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(checkIn.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
