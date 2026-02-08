import React, { useRef, useState, useMemo } from 'react';
import { CheckIn } from '../types';
import { Calendar, Download, Pencil, Trash2, FileText, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface HistoryTableProps {
  checkIns: CheckIn[];
  onEdit: (checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
  onViewReport?: (checkIn: CheckIn) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ checkIns, onEdit, onDelete, onViewReport }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Processar dados para incluir deltas
  const processedData = useMemo(() => {
    // 1. Ordenar do mais antigo para o mais novo para calcular diffs
    const chronological = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 2. Calcular deltas
    const withDeltas = chronological.map((current, index) => {
        const prev = index > 0 ? chronological[index - 1] : null;
        
        return {
            ...current,
            delta: {
                weight: prev ? current.weight - prev.weight : null,
                imc: prev ? current.imc - prev.imc : null,
                bodyFat: prev ? current.bodyFat - prev.bodyFat : null,
                muscleMass: prev ? current.muscleMass - prev.muscleMass : null,
                visceralFat: prev ? current.visceralFat - prev.visceralFat : null,
                bmr: prev ? current.bmr - prev.bmr : null
            }
        };
    });

    // 3. Inverter para exibir o mais recente primeiro (ordem da tabela)
    return withDeltas.reverse();
  }, [checkIns]);

  const renderDelta = (val: number | null, type: 'inverse' | 'standard' | 'neutral', suffix = '') => {
    if (val === null) return <span className="text-[10px] text-slate-300 dark:text-slate-600 block mt-0.5">-</span>;
    if (Math.abs(val) < 0.1) return <span className="text-[10px] text-slate-400 block mt-0.5 flex items-center gap-0.5"><Minus size={10} /> Estável</span>;

    const isPositive = val > 0;
    let colorClass = 'text-slate-500';
    
    // Logic: 
    // Inverse (Fat, Weight, Visceral): Negative is Good (Green), Positive is Bad (Red)
    // Standard (Muscle): Positive is Good (Green), Negative is Bad (Red)
    
    if (type === 'inverse') {
        colorClass = isPositive ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400';
    } else if (type === 'standard') {
        colorClass = isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400';
    }

    return (
        <span className={`text-[10px] font-bold block mt-0.5 flex items-center gap-0.5 ${colorClass}`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(val).toFixed(1)}{suffix}
        </span>
    );
  };
  
  const handleExportPDF = async () => {
    if (checkIns.length === 0 || !tableRef.current) {
      alert("Não há dados para exportar.");
      return;
    }

    setIsExporting(true);

    try {
        // Detecta tema para fundo
        const isDark = document.documentElement.classList.contains('dark');
        const backgroundColor = isDark ? '#1e293b' : '#ffffff'; // slate-800 vs white
        const textColor = isDark ? '#f8fafc' : '#1e293b';

        // Captura a tabela como imagem
        const canvas = await html2canvas(tableRef.current, {
            scale: 2, // Melhor resolução
            backgroundColor: backgroundColor,
            ignoreElements: (element) => {
                // Ignora elementos com a classe 'pdf-exclude' (Coluna Ações)
                return element.classList.contains('pdf-exclude');
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;
        const margin = 10;
        
        // Calcula altura proporcional
        const imgProps = pdf.getImageProperties(imgData);
        const contentWidth = pdfWidth - (margin * 2);
        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

        // Pinta o fundo da página inteira se for modo escuro
        if (isDark) {
            pdf.setFillColor(30, 41, 59); // slate-800 RGB
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        }

        // Título do Documento
        pdf.setFontSize(14);
        pdf.setTextColor(isDark ? 255 : 0, isDark ? 255 : 0, isDark ? 255 : 0);
        pdf.text("Histórico de Avaliações", margin, margin + 5);

        // Adiciona a imagem da tabela
        pdf.addImage(imgData, 'PNG', margin, margin + 10, contentWidth, imgHeight);

        pdf.save(`historico_avaliacoes_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
        console.error("Erro ao exportar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Histórico Completo</h3>
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isExporting ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>
      
      <div className="overflow-x-auto" ref={tableRef}>
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
              <th className="px-6 py-4 text-right pdf-exclude">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {processedData.map((checkIn) => (
              <tr key={checkIn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(checkIn.date).toLocaleDateString('pt-BR')}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal ml-6 block">
                      {checkIn.delta.weight === null ? 'Avaliação Inicial' : 'Retorno'}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                    <div className="text-slate-600 dark:text-slate-300 font-medium">{checkIn.weight.toFixed(1)} kg</div>
                    {renderDelta(checkIn.delta.weight, 'inverse', ' kg')}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        checkIn.imc < 18.5 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        checkIn.imc < 25 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}>
                        {checkIn.imc.toFixed(1)}
                      </span>
                  </div>
                  {renderDelta(checkIn.delta.imc, 'inverse')}
                </td>

                <td className="px-6 py-4">
                    <div className="text-slate-600 dark:text-slate-300 font-medium">{checkIn.bodyFat.toFixed(1)}%</div>
                    {renderDelta(checkIn.delta.bodyFat, 'inverse', '%')}
                </td>

                <td className="px-6 py-4">
                    <div className="text-slate-600 dark:text-slate-300 font-medium">{checkIn.muscleMass.toFixed(1)}%</div>
                    {renderDelta(checkIn.delta.muscleMass, 'standard', '%')}
                </td>

                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {checkIn.bodyAge ? (
                        <div>
                            <span className={`${checkIn.bodyAge < checkIn.age ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                                {checkIn.bodyAge} anos
                            </span>
                        </div>
                    ) : '-'}
                </td>
                
                <td className="px-6 py-4">
                    <div className="text-slate-600 dark:text-slate-300">{checkIn.bmr}</div>
                    {renderDelta(checkIn.delta.bmr, 'standard')}
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="inline-block w-8 py-0.5 bg-slate-100 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-200 text-xs font-bold">
                    {checkIn.visceralFat}
                  </div>
                  <div className="flex justify-center">
                     {renderDelta(checkIn.delta.visceralFat, 'inverse')}
                  </div>
                </td>
                
                <td className="px-6 py-4 text-right pdf-exclude">
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