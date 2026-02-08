import React, { useState, useRef, useMemo, useEffect } from 'react';
import { CheckIn, Patient } from '../types';
import { ChevronLeft, Download, AlertTriangle, CheckCircle, User, Camera, X, Activity, Scale, Ruler, TrendingUp, Flame, Hourglass, Loader2, Info } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Line, LabelList 
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AssessmentReportProps {
  checkIn: CheckIn;
  patient: Patient;
  allCheckIns: CheckIn[];
  onBack: () => void;
}

export const AssessmentReport: React.FC<AssessmentReportProps> = ({ checkIn, patient, allCheckIns, onBack }) => {
  
  // --- Estados para Fotos e Tema ---
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);

  // --- Detectar Tema Escuro ---
  useEffect(() => {
    // Checagem inicial
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();

    // Observador para mudanças dinâmicas de classe no HTML
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // --- Handlers de Foto ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'front') setFrontPhoto(reader.result as string);
        else setSidePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = (type: 'front' | 'side') => {
    if (type === 'front') {
        setFrontPhoto(null);
        if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
        setSidePhoto(null);
        if (sideInputRef.current) sideInputRef.current.value = '';
    }
  };

  // --- GERAÇÃO DE PDF INTELIGENTE ---
  const handleDownloadPDF = async () => {
    if (!reportContainerRef.current) return;
    setIsGeneratingPdf(true);

    try {
        // Detecta cor de fundo baseado no tema atual
        const isDarkActive = document.documentElement.classList.contains('dark');
        const backgroundColor = isDarkActive ? '#020617' : '#ffffff'; // slate-950 vs white

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;
        const margin = 10; // 10mm de margem
        const contentWidth = pdfWidth - (margin * 2);

        // Helper para pintar o fundo da página (cobre as margens brancas)
        const paintBackground = () => {
            if (isDarkActive) {
                pdf.setFillColor(2, 6, 23); // RGB para Slate-950 (#020617)
                pdf.rect(0, 0, pdfWidth, pdfHeight, 'F'); // Preenche retângulo do tamanho da página
            }
        };

        // Pinta a primeira página
        paintBackground();

        // 1. Capturar Cabeçalho
        const headerEl = reportContainerRef.current.querySelector('.report-header') as HTMLElement;
        let headerHeight = 0;
        let headerData: string | null = null;

        if (headerEl) {
            const headerCanvas = await html2canvas(headerEl, { scale: 2, backgroundColor });
            headerData = headerCanvas.toDataURL('image/png');
            // Calcula a altura proporcional no PDF
            headerHeight = (headerCanvas.height * contentWidth) / headerCanvas.width;
        }

        // 2. Identificar Seções do Relatório
        const sections = Array.from(reportContainerRef.current.querySelectorAll('.report-section')) as HTMLElement[];
        
        let currentY = margin;

        // Função para adicionar cabeçalho na página atual
        const addHeaderToPage = () => {
            if (headerData && headerHeight > 0) {
                pdf.addImage(headerData, 'PNG', margin, margin, contentWidth, headerHeight);
                return margin + headerHeight + 5; // Retorna nova posição Y com espaçamento
            }
            return margin;
        };

        // Adiciona cabeçalho na primeira página
        currentY = addHeaderToPage();

        // 3. Iterar sobre as seções e paginar
        for (const section of sections) {
            // Captura a seção
            const canvas = await html2canvas(section, { scale: 2, backgroundColor });
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * contentWidth) / canvas.width;

            // Verifica se a seção cabe na página atual
            if (currentY + imgHeight > pdfHeight - margin) {
                pdf.addPage(); // Nova página
                paintBackground(); // Pinta o fundo da nova página
                currentY = addHeaderToPage(); // Adiciona cabeçalho e reseta Y
            }

            // Adiciona a seção
            pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeight);
            currentY += imgHeight + 5; // Espaçamento entre seções
        }

        pdf.save(`Avaliacao-${patient.name.replace(/\s+/g, '_')}-${checkIn.date}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  // --- Cálculos ---
  const waist = checkIn.waistCircumference || 0;
  const hip = checkIn.hipCircumference || 0;
  const rcq = waist > 0 && hip > 0 ? waist / hip : 0;
  
  const fatMass = (checkIn.weight * (checkIn.bodyFat / 100));
  const muscleMass = (checkIn.weight * (checkIn.muscleMass / 100));
  const heightM2 = checkIn.height * checkIn.height;
  const img = fatMass / heightM2;
  const imm = muscleMass / heightM2;
  const residualMass = checkIn.weight - fatMass - muscleMass;

  // --- Score ---
  const healthScore = useMemo(() => {
    let score = 100;
    if (checkIn.imc > 25) score -= (checkIn.imc - 25) * 2;
    else if (checkIn.imc < 18.5) score -= (18.5 - checkIn.imc) * 2;
    if (checkIn.visceralFat > 9) score -= (checkIn.visceralFat - 9) * 4;
    const fatLimit = patient.gender === 'Masculino' ? 25 : 32;
    if (checkIn.bodyFat > fatLimit) score -= (checkIn.bodyFat - fatLimit);
    const muscleTarget = patient.gender === 'Masculino' ? 35 : 30;
    if (checkIn.muscleMass > muscleTarget) score += (checkIn.muscleMass - muscleTarget) * 0.5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [checkIn, patient.gender]);

  // --- DADOS PARA GRÁFICOS ---
  const chartData = useMemo(() => {
    return [...allCheckIns]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(c => ({
        date: new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        weight: c.weight,
        bodyFat: c.bodyFat,
        muscleMass: c.muscleMass,
        imc: c.imc,
        visceralFat: c.visceralFat,
        bodyAge: c.bodyAge,
        age: c.age,
        fatMassKg: parseFloat((c.weight * (c.bodyFat / 100)).toFixed(1)),
        muscleMassKg: parseFloat((c.weight * (c.muscleMass / 100)).toFixed(1))
      }));
  }, [allCheckIns]);

  const pieData = [
    { name: 'Massa Gorda', value: parseFloat(fatMass.toFixed(1)), color: '#f43f5e' },
    { name: 'Massa Magra', value: parseFloat(muscleMass.toFixed(1)), color: '#3b82f6' },
  ];

  // --- Cores Gráficos ---
  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';

  // --- Componentes Visuais ---
  const MetricRow = ({ label, value, subValue, highlight = false }: any) => (
      <div className={`flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 ${highlight ? 'bg-slate-50 dark:bg-slate-900 px-2 -mx-2 rounded' : ''}`}>
          <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
          <div className="text-right">
              <span className={`block font-bold ${highlight ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200'}`}>{value}</span>
              {subValue && <span className="block text-[10px] text-slate-400 dark:text-slate-500">{subValue}</span>}
          </div>
      </div>
  );

  const StatusBadge = ({ value, label, type }: { value: number, label: string, type: 'good' | 'warning' | 'danger' }) => {
    const colors = {
        good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return (
        <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[type]}`}>
                {value.toFixed(1)}
            </span>
        </div>
    );
  };

  const getStatusColor = (val: number, goodMin: number, goodMax: number) => {
      if (val >= goodMin && val <= goodMax) return 'good';
      if (val < goodMin || val > goodMax + 5) return 'danger';
      return 'warning';
  };

  const PhotoUploadBox = ({ title, photo, onUpload, onClear, inputRef }: any) => {
    if (!photo) {
        return (
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-4 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[200px] print:hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors group" onClick={() => inputRef.current?.click()}>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full mb-2 shadow-sm text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    <Camera size={24} />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">{title}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">Clique para adicionar</span>
                <input type="file" ref={inputRef} onChange={onUpload} className="hidden" accept="image/*" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative group print:border-none print:shadow-none print:p-0">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 text-center print:text-left print:mb-1">{title}</h4>
            <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center aspect-[3/4]">
                <img src={photo} alt={title} className="w-full h-full object-contain" />
                <button 
                    onClick={onClear}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    title="Remover foto"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
  };

  const CustomLabel = (props: any) => {
    const { x, y, value, color, unit } = props;
    return (
        <text x={x} y={y} dy={-10} fill={color || chartTextColor} fontSize={10} textAnchor="middle" fontWeight="bold">
            {value}{unit ? unit : ''}
        </text>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12 transition-colors">
      
      {/* Header de Ação */}
      <div className="max-w-5xl mx-auto pt-6 px-4 mb-6 flex justify-between items-center print:hidden">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              <ChevronLeft size={20} /> Voltar
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:opacity-70 disabled:cursor-wait"
          >
              {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF'}
          </button>
      </div>

      {/* ÁREA DO RELATÓRIO */}
      <div className="flex justify-center overflow-auto p-4 md:p-0">
          <div 
            ref={reportContainerRef}
            className="w-[210mm] min-h-[297mm] bg-white dark:bg-slate-950 shadow-xl p-8 md:p-12 relative transition-colors duration-200"
            style={{ margin: '0 auto' }} 
          >
            {/* Aviso de Pré-visualização */}
            <div className="absolute top-0 left-0 w-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] text-center py-1 print:hidden">
                Pré-visualização de Impressão • {isDark ? 'Modo Escuro (PDF será gerado escuro)' : 'Modo Claro (PDF será gerado branco)'}
            </div>
            
            {/* 1. CABEÇALHO */}
            <div className="report-header bg-white dark:bg-slate-950 pb-6 mb-2 border-b-2 border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-500 mb-1">
                            <Activity size={24} />
                            <span className="font-bold text-xl tracking-tight">NutriVida</span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Relatório de Avaliação Física</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{patient.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {patient.age} anos • {patient.gender} • {new Date(checkIn.date).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. GRID PRINCIPAL */}
            <div className="report-section bg-white dark:bg-slate-950 mb-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Coluna 1: Métricas Detalhadas */}
                    <div className="space-y-6">
                        {/* Antropometria */}
                        <section>
                            <h3 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 mb-3 text-sm uppercase tracking-wide">
                                <Ruler size={16} /> Antropometria
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                <MetricRow label="Peso Corporal" value={`${checkIn.weight.toFixed(1)} kg`} highlight />
                                <MetricRow label="Altura" value={`${(checkIn.height * 100).toFixed(0)} cm`} />
                                <MetricRow label="IMC" value={`${checkIn.imc.toFixed(1)} kg/m²`} subValue={checkIn.imc < 25 ? 'Eutrofia' : 'Sobrepeso'} />
                                <MetricRow label="Circunferência Cintura" value={waist > 0 ? `${waist} cm` : '-'} />
                                <MetricRow label="Circunferência Quadril" value={hip > 0 ? `${hip} cm` : '-'} />
                                {rcq > 0 && <MetricRow label="Relação Cintura-Quadril" value={rcq.toFixed(2)} />}
                            </div>
                        </section>

                        {/* Composição Corporal */}
                        <section>
                            <h3 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 mb-3 text-sm uppercase tracking-wide">
                                <Scale size={16} /> Composição Corporal
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                <MetricRow label="Massa Gorda" value={`${fatMass.toFixed(1)} kg`} subValue={`${checkIn.bodyFat}%`} />
                                <MetricRow label="Massa Magra" value={`${muscleMass.toFixed(1)} kg`} subValue={`${checkIn.muscleMass}%`} />
                                <MetricRow label="Água / Residual" value={`${residualMass.toFixed(1)} kg`} />
                                <MetricRow label="Gordura Visceral" value={`Nível ${checkIn.visceralFat}`} />
                                <MetricRow label="Idade Corporal" value={`${checkIn.bodyAge || '-'} anos`} />
                            </div>
                        </section>
                    </div>

                    {/* Coluna 2: Health Score + Donut */}
                    <div className="flex flex-col gap-6">
                        
                        {/* Health Score Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Pontuação de Saúde</p>
                                        <button 
                                            onClick={() => setShowScoreInfo(true)}
                                            className="text-slate-400 hover:text-white transition-colors print:hidden"
                                            title="Como é calculado?"
                                        >
                                            <Info size={14} />
                                        </button>
                                    </div>
                                    <h2 className="text-4xl font-bold">{healthScore} <span className="text-lg font-normal text-slate-400">/ 100</span></h2>
                                </div>
                                <div className="h-16 w-16 rounded-full border-4 border-blue-500 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm">
                                    <Activity size={32} className="text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-slate-300">
                                    {healthScore >= 80 ? 'Excelente! Continue assim.' : 
                                    healthScore >= 60 ? 'Bom, mas há espaço para melhorias.' : 
                                    'Atenção necessária a alguns indicadores.'}
                                </p>
                            </div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                        </div>

                        {/* Gráfico Donut */}
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col items-center justify-center">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-4">Distribuição de Massa (Kg)</h4>
                            <div className="flex items-center justify-center w-full gap-8">
                                <div className="w-32 h-32 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={35}
                                                outerRadius={55}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                isAnimationActive={false}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                        <div>
                                            <span className="block font-bold text-slate-700 dark:text-slate-200">{fatMass.toFixed(1)}kg</span>
                                            <span className="text-slate-400 dark:text-slate-500">Gordura ({checkIn.bodyFat}%)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <div>
                                            <span className="block font-bold text-slate-700 dark:text-slate-200">{muscleMass.toFixed(1)}kg</span>
                                            <span className="text-slate-400 dark:text-slate-500">Músculo ({checkIn.muscleMass}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Indicadores Visuais Rápidos */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                            <StatusBadge label="Índice Massa Corporal (IMC)" value={checkIn.imc} type={getStatusColor(checkIn.imc, 18.5, 24.9)} />
                            <StatusBadge label="Índice Massa Gorda (IMG)" value={img} type={getStatusColor(img, 3, 8)} />
                            <StatusBadge label="Índice Massa Magra (IMM)" value={imm} type={getStatusColor(imm, 18, 24)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. TÍTULO EVOLUÇÃO */}
            <div className="report-section bg-white dark:bg-slate-950 pt-4 pb-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-sm uppercase border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <TrendingUp size={16} /> Evolução Detalhada
                </h3>
            </div>
            
            {/* 4. LINHA 1 DE GRÁFICOS */}
            <div className="report-section bg-white dark:bg-slate-950 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Peso e IMC */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                        <p className="text-xs text-center font-bold text-slate-600 dark:text-slate-300 mb-2">Peso Corporal (kg) e IMC</p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: chartTextColor}} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" hide domain={['dataMin - 2', 'dataMax + 2']} />
                                    <YAxis yAxisId="right" hide orientation="right" domain={['dataMin - 1', 'dataMax + 1']} />
                                    
                                    <Area 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="weight" 
                                        stroke="#3b82f6" 
                                        fill="#3b82f6" 
                                        fillOpacity={0.1}
                                        strokeWidth={2}
                                        isAnimationActive={false}
                                    >
                                        <LabelList dataKey="weight" position="top" content={<CustomLabel color="#2563eb" unit="kg" />} />
                                    </Area>
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="imc" 
                                        stroke="#8b5cf6" 
                                        strokeWidth={2} 
                                        strokeDasharray="4 4"
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Massas em KG */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                        <p className="text-xs text-center font-bold text-slate-600 dark:text-slate-300 mb-2">Composição Corporal (Kg)</p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: chartTextColor}} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    
                                    <Line 
                                        type="monotone" 
                                        dataKey="muscleMassKg" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        isAnimationActive={false}
                                    >
                                        <LabelList dataKey="muscleMassKg" position="top" content={<CustomLabel color="#2563eb" unit="kg" />} />
                                    </Line>
                                    <Line 
                                        type="monotone" 
                                        dataKey="fatMassKg" 
                                        stroke="#f43f5e" 
                                        strokeWidth={2}
                                        isAnimationActive={false}
                                    >
                                        <LabelList dataKey="fatMassKg" position="bottom" offset={10} content={(props: any) => <text x={props.x} y={props.y} dy={15} fill="#e11d48" fontSize={10} textAnchor="middle" fontWeight="bold">{props.value}kg</text>} />
                                    </Line>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 5. LINHA 2 DE GRÁFICOS */}
            <div className="report-section bg-white dark:bg-slate-950 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 3. Gordura Visceral */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                        <p className="text-xs text-center font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-center gap-1"><Flame size={12} className="text-amber-500"/> Nível Visceral</p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: chartTextColor}} axisLine={false} tickLine={false} />
                                    <YAxis hide domain={[0, 'dataMax + 2']} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="visceralFat" 
                                        stroke="#f59e0b" 
                                        fill="#f59e0b" 
                                        fillOpacity={0.1} 
                                        strokeWidth={2}
                                        isAnimationActive={false}
                                    >
                                        <LabelList dataKey="visceralFat" position="top" content={<CustomLabel color="#d97706" />} />
                                    </Area>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. Idade Corporal */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                        <p className="text-xs text-center font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-center gap-1"><Hourglass size={12} className="text-blue-500"/> Idade Corporal (anos)</p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: chartTextColor}} axisLine={false} tickLine={false} />
                                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="bodyAge" 
                                        stroke="#3b82f6" 
                                        fill="#3b82f6" 
                                        fillOpacity={0.1} 
                                        strokeWidth={2}
                                        isAnimationActive={false}
                                    >
                                        <LabelList dataKey="bodyAge" position="top" content={<CustomLabel color="#2563eb" unit=" anos" />} />
                                    </Area>
                                    <Line type="monotone" dataKey="age" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. FOTOS */}
            {(frontPhoto || sidePhoto) && (
                <div className="report-section bg-white dark:bg-slate-950 mb-8">
                    <div className="grid grid-cols-2 gap-6">
                        <PhotoUploadBox 
                            title="Análise Frontal"
                            photo={frontPhoto}
                            inputRef={frontInputRef}
                            onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, 'front')}
                            onClear={() => clearPhoto('front')}
                        />
                        <PhotoUploadBox 
                            title="Análise Lateral"
                            photo={sidePhoto}
                            inputRef={sideInputRef}
                            onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, 'side')}
                            onClear={() => clearPhoto('side')}
                        />
                    </div>
                </div>
            )}

            {/* Caso de edição sem fotos ainda */}
            {(!frontPhoto && !sidePhoto) && !isGeneratingPdf && (
                 <div className="report-section bg-white dark:bg-slate-950 mb-8">
                    <div className="grid grid-cols-2 gap-6">
                        <PhotoUploadBox 
                            title="Análise Frontal"
                            photo={frontPhoto}
                            inputRef={frontInputRef}
                            onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, 'front')}
                            onClear={() => clearPhoto('front')}
                        />
                        <PhotoUploadBox 
                            title="Análise Lateral"
                            photo={sidePhoto}
                            inputRef={sideInputRef}
                            onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, 'side')}
                            onClear={() => clearPhoto('side')}
                        />
                    </div>
                </div>
            )}

            {/* 7. RODAPÉ */}
            <div className="report-section bg-white dark:bg-slate-950 pt-12 mt-auto">
                <div className="flex justify-between items-end gap-12">
                    <div className="flex-1 border-t border-slate-300 dark:border-slate-700 pt-2 text-center">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Assinatura do Paciente</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Declaro ter recebido a avaliação física.</p>
                    </div>
                    <div className="flex-1 border-t border-slate-300 dark:border-slate-700 pt-2 text-center">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Nutricionista Responsável</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">CRN-3/SP 12345</p>
                    </div>
                </div>
                <div className="text-center text-slate-300 dark:text-slate-600 text-[10px] mt-8">
                    Gerado por NutriVida • {new Date().toLocaleString('pt-BR')}
                </div>
            </div>

          </div>
      </div>

      {/* MODAL DE EXPLICAÇÃO DA PONTUAÇÃO */}
      {showScoreInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => setShowScoreInfo(false)}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600 dark:text-blue-400" />
                    Como funciona o cálculo?
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                    A pontuação de saúde é um algoritmo heurístico que começa com 100 pontos e aplica penalidades ou bônus.
                </p>

                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Base Inicial</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Valor de partida</span>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">100 pts</span>
                    </div>

                    <div>
                        <h4 className="font-bold text-xs text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-2 border-b border-rose-100 dark:border-rose-900/50 pb-1">Penalidades</h4>
                        <ul className="space-y-3">
                            <li className="text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200 text-xs mb-1">
                                    <span>IMC (Peso/Altura²)</span>
                                    <span className="text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded">-2 pts / unidade</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                    Descontado para cada ponto acima de 25 ou abaixo de 18.5.
                                </p>
                            </li>
                            <li className="text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200 text-xs mb-1">
                                    <span>Gordura Visceral</span>
                                    <span className="text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded">-4 pts / nível</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                    Descontado severamente para cada nível acima de 9.
                                </p>
                            </li>
                            <li className="text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200 text-xs mb-1">
                                    <span>% de Gordura Corporal</span>
                                    <span className="text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded">-1 pt / %</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                    Descontado se acima de 25% (homens) ou 32% (mulheres).
                                </p>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-xs text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-2 border-b border-emerald-100 dark:border-emerald-900/50 pb-1">Bônus</h4>
                        <ul className="space-y-2">
                            <li className="text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200 text-xs mb-1">
                                    <span>Massa Muscular</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">+0.5 pt / %</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                    Adicionado para cada % acima de 35% (homens) ou 30% (mulheres).
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button 
                        onClick={() => setShowScoreInfo(false)}
                        className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};