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
  
  const handleExportCSV = () => {
    if (checkIns.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // Cabeçalho do CSV
    const headers = [
      "Data",
      "Peso (kg)",
      "IMC",
      "Gordura (%)",
      "Músculo (%)",
      "Idade Corporal",
      "TMB (kcal)",
      "Gordura Visceral",
      "Cintura (cm)",
      "Quadril (cm)"
    ];

    // Linhas de dados
    const rows = checkIns.map(c => [
      new Date(c.date).toLocaleDateString('pt-BR'),
      c.weight.toFixed(2).replace('.', ','),
      c.imc.toFixed(2).replace('.', ','),
      c.bodyFat.toFixed(2).replace('.', ','),
      c.muscleMass.toFixed(2).replace('.', ','),
      c.bodyAge || '-',
      c.bmr,
      c.visceralFat,
      c.waistCircumference || '-',
      c.hipCircumference || '-'
    ]);

    // Monta o conteúdo CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    // Cria o blob e o link para download
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historico_avaliacoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Histórico Completo</h3>
        <button 
          onClick={handleExportCSV}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-700">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {checkIns.map((checkIn) => (
              <tr key={checkIn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(checkIn.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{checkIn.weight.toFixed(1)} kg</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    checkIn.imc < 18.5 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    checkIn.imc < 25 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  }`}>
                    {checkIn.imc.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{checkIn.bodyFat.toFixed(1)}%</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{checkIn.muscleMass.toFixed(1)}%</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {checkIn.bodyAge ? (
                        <span className={`${checkIn.bodyAge < checkIn.age ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                            {checkIn.bodyAge} anos
                        </span>
                    ) : '-'}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{checkIn.bmr}</td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-block w-8 py-0.5 bg-slate-100 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-200 text-xs font-bold">
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
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(checkIn.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
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