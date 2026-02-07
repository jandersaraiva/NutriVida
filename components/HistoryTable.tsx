
import React from 'react';
import { CheckIn } from '../types';
import { Calendar, Download } from 'lucide-react';

interface HistoryTableProps {
  checkIns: CheckIn[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ checkIns }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">Histórico Completo</h3>
        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {checkIns.map((checkIn) => (
              <tr key={checkIn.id} className="hover:bg-slate-50 transition-colors">
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
                        <span className={`${checkIn.bodyAge < checkIn.age ? 'text-emerald-600 font-semibold' : 'text-slate-600'}`}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
