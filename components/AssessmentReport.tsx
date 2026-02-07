
import React, { useState, useRef, useMemo } from 'react';
import { CheckIn, Patient } from '../types';
import { ChevronLeft, Download, AlertTriangle, CheckCircle, User, Camera, X, Activity, Scale, Ruler, TrendingUp, Flame, Hourglass, Loader2 } from 'lucide-react';
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
  
  // --- Estados para Fotos ---
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

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

  // --- GERAÇÃO DE PDF ---
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
        const element = reportRef.current;
        
        // Captura o elemento como Canvas
        const canvas = await html2canvas(element, {
            scale: 2, // Melhor resolução
            useCORS: true, // Para imagens externas se houver
            backgroundColor: '#ffffff', // Garante fundo branco
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Dimensões A4 em mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        // Criação do PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        
        // Calcula a altura da imagem no PDF mantendo a proporção
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Primeira página
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Páginas subsequentes (se o relatório for maior que uma A4)
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
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
  const heightCm = checkIn.height * 100;
  
  // RCA: Cintura / Altura
  const rca = waist > 0 && heightCm > 0 ? waist / heightCm : 0;
  
  // RCQ: Cintura / Quadril
  const rcq = waist > 0 && hip > 0 ? waist / hip : 0;
  
  // Massas (kg)
  const fatMass = (checkIn.weight * (checkIn.bodyFat / 100));
  const muscleMass = (checkIn.weight * (checkIn.muscleMass / 100));
  
  // Indices (kg/m²)
  const heightM2 = checkIn.height * checkIn.height;
  const img = fatMass / heightM2; // Índice de Massa Gorda
  const imm = muscleMass / heightM2; // Índice de Massa Magra

  // Water / Residual
  const residualMass = checkIn.weight - fatMass - muscleMass;

  // --- ALGORITMO DE PONTUAÇÃO DE SAÚDE (HEALTH SCORE) ---
  const healthScore = useMemo(() => {
    let score = 100;

    // Penalidade por IMC (Muito baixo ou muito alto)
    if (checkIn.imc > 25) score -= (checkIn.imc - 25) * 2; // -2 pontos por unidade acima
    else if (checkIn.imc < 18.5) score -= (18.5 - checkIn.imc) * 2; // -2 pontos por unidade abaixo

    // Penalidade por Gordura Visceral (Crítico)
    if (checkIn.visceralFat > 9) score -= (checkIn.visceralFat - 9) * 4; // -4 pontos por nível acima

    // Penalidade por % Gordura (Exemplo genérico simplificado)
    // Homens > 25% | Mulheres > 32%
    const fatLimit = patient.gender === 'Masculino' ? 25 : 32;
    if (checkIn.bodyFat > fatLimit) score -= (checkIn.bodyFat - fatLimit);

    // Bônus por Massa Muscular (Exemplo genérico)
    // Homens > 35% | Mulheres > 30%
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
        // Calculated kg
        fatMassKg: parseFloat((c.weight * (c.bodyFat / 100)).toFixed(1)),
        muscleMassKg: parseFloat((c.weight * (c.muscleMass / 100)).toFixed(1))
      }));
  }, [allCheckIns]);

  const pieData = [
    { name: 'Massa Gorda', value: parseFloat(fatMass.toFixed(1)), color: '#f43f5e' }, // Rose 500
    { name: 'Massa Magra', value: parseFloat(muscleMass.toFixed(1)), color: '#3b82f6' }, // Blue 500
  ];

  // --- Componentes Visuais ---

  const MetricRow = ({ label, value, subValue, highlight = false }: any) => (
      <div className={`flex justify-between items-center py-2 border-b border-slate-100 last:border-0 ${highlight ? 'bg-slate-50 px-2 -mx-2 rounded' : ''}`}>
          <span className="text-slate-500 text-sm">{label}</span>
          <div className="text-right">
              <span className={`block font-bold ${highlight ? 'text-slate-900' : 'text-slate-700'}`}>{value}</span>
              {subValue && <span className="block text-[10px] text-slate-400">{subValue}</span>}
          </div>
      </div>
  );

  const StatusBadge = ({ value, label, type }: { value: number, label: string, type: 'good' | 'warning' | 'danger' }) => {
    const colors = {
        good: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-rose-100 text-rose-700'
    };
    return (
        <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">{label}</span>
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

  // Componente de Upload de Foto
  const PhotoUploadBox = ({ title, photo, onUpload, onClear, inputRef }: any) => {
    // Se não tiver foto e estiver imprimindo, não renderiza nada
    if (!photo) {
        return (
            <div className="bg-slate-50/50 rounded-xl p-4 border border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[200px] print:hidden cursor-pointer hover:border-blue-400 transition-colors group" onClick={() => inputRef.current?.click()}>
                <div className="p-3 bg-white rounded-full mb-2 shadow-sm text-slate-300 group-hover:text-blue-500 transition-colors">
                    <Camera size={24} />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600">{title}</span>
                <span className="text-xs text-slate-400 mt-1">Clique para adicionar</span>
                <input type="file" ref={inputRef} onChange={onUpload} className="hidden" accept="image/*" />
            </div>
        );
    }

    return (
        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm relative group print:border-none print:shadow-none print:p-0">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 text-center print:text-left print:mb-1">{title}</h4>
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

  // Custom Label para os Gráficos
  const CustomLabel = (props: any) => {
    const { x, y, value, color, unit } = props;
    return (
        <text x={x} y={y} dy={-10} fill={color || "#64748b"} fontSize={10} textAnchor="middle" fontWeight="bold">
            {value}{unit ? unit : ''}
        </text>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      
      {/* Header de Ação (Apenas UI) */}
      <div className="max-w-5xl mx-auto pt-6 px-4 mb-6 flex justify-between items-center print:hidden">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
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

      {/* ÁREA DE IMPRESSÃO / CAPTURA */}
      {/* Definimos uma largura fixa para o container durante a captura para garantir proporção A4 */}
      <div className="flex justify-center overflow-auto p-4 md:p-0">
          <div 
            ref={reportRef}
            className="w-[210mm] min-h-[297mm] bg-white shadow-xl p-8 md:p-12"
            style={{ margin: '0 auto' }} // Centraliza
          >
            
            {/* Cabeçalho do Relatório */}
            <header className="flex justify-between items-end border-b-2 border-slate-100 pb-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <Activity size={24} />
                        <span className="font-bold text-xl tracking-tight">NutriVida</span>
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Relatório de Avaliação Física</p>
                </div>
                <div className="text-right">
                    <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                    <p className="text-slate-500 text-sm">
                        {patient.age} anos • {patient.gender} • {new Date(checkIn.date).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </header>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                
                {/* Coluna 1: Métricas Detalhadas */}
                <div className="space-y-6">
                    
                    {/* Antropometria */}
                    <section>
                        <h3 className="flex items-center gap-2 font-bold text-blue-700 mb-3 text-sm uppercase tracking-wide">
                            <Ruler size={16} /> Antropometria
                        </h3>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <MetricRow label="Peso Corporal" value={`${checkIn.weight.toFixed(1)} kg`} highlight />
                            <MetricRow label="Altura" value={`${(checkIn.height * 100).toFixed(0)} cm`} />
                            <MetricRow label="IMC" value={`${checkIn.imc.toFixed(1)} kg/m²`} subValue={checkIn.imc < 25 ? 'Eutrofia' : 'Sobrepeso'} />
                            <MetricRow label="Circunferência Cintura" value={waist > 0 ? `${waist} cm` : '-'} />
                            <MetricRow label="Circunferência Quadril" value={hip > 0 ? `${hip} cm` : '-'} />
                            {rcq > 0 && <MetricRow label="Relação Cintura-Quadril" value={rcq.toFixed(2)} />}
                        </div>
                    </section>

                    {/* Composição Corporal (Tabela) */}
                    <section>
                        <h3 className="flex items-center gap-2 font-bold text-blue-700 mb-3 text-sm uppercase tracking-wide">
                            <Scale size={16} /> Composição Corporal
                        </h3>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <MetricRow label="Massa Gorda" value={`${fatMass.toFixed(1)} kg`} subValue={`${checkIn.bodyFat}%`} />
                            <MetricRow label="Massa Magra" value={`${muscleMass.toFixed(1)} kg`} subValue={`${checkIn.muscleMass}%`} />
                            <MetricRow label="Água / Residual" value={`${residualMass.toFixed(1)} kg`} />
                            <MetricRow label="Gordura Visceral" value={`Nível ${checkIn.visceralFat}`} />
                            <MetricRow label="Idade Corporal" value={`${checkIn.bodyAge || '-'} anos`} />
                        </div>
                    </section>
                </div>

                {/* Coluna 2: Gráficos e Score */}
                <div className="flex flex-col gap-6">
                    
                    {/* Health Score Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Pontuação de Saúde</p>
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
                        {/* Decorative Blob */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                    </div>

                    {/* Gráfico Donut */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 flex flex-col items-center justify-center">
                        <h4 className="font-bold text-slate-700 text-sm mb-4">Distribuição de Massa (Kg)</h4>
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
                                        <span className="block font-bold text-slate-700">{fatMass.toFixed(1)}kg</span>
                                        <span className="text-slate-400">Gordura ({checkIn.bodyFat}%)</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <div>
                                        <span className="block font-bold text-slate-700">{muscleMass.toFixed(1)}kg</span>
                                        <span className="text-slate-400">Músculo ({checkIn.muscleMass}%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Indicadores Visuais Rápidos */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <StatusBadge label="Índice Massa Corporal (IMC)" value={checkIn.imc} type={getStatusColor(checkIn.imc, 18.5, 24.9)} />
                        <StatusBadge label="Índice Massa Gorda (IMG)" value={img} type={getStatusColor(img, 3, 8)} />
                        <StatusBadge label="Índice Massa Magra (IMM)" value={imm} type={getStatusColor(imm, 18, 24)} />
                    </div>
                </div>
            </div>

            {/* --- ÁREA DE GRÁFICOS DE EVOLUÇÃO --- */}
            <div className="mb-8">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase border-b border-slate-100 pb-2 flex items-center gap-2">
                    <TrendingUp size={16} /> Evolução Detalhada
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 1. Peso e IMC */}
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <p className="text-xs text-center font-bold text-slate-600 mb-2">Peso Corporal (kg) e IMC</p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
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

                    {/* 2. Massas em KG (Gordura vs Músculo) */}
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <p className="text-xs text-center font-bold text-slate-600 mb-2">Composição Corporal (Kg)</p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
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

                    {/* 3. Gordura Visceral */}
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <p className="text-xs text-center font-bold text-slate-600 mb-2 flex items-center justify-center gap-1"><Flame size={12} className="text-amber-500"/> Nível Visceral</p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
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
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <p className="text-xs text-center font-bold text-slate-600 mb-2 flex items-center justify-center gap-1"><Hourglass size={12} className="text-blue-500"/> Idade Corporal (anos)</p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
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
                                    {/* Linha de referência da idade real (apenas visual) */}
                                    <Line type="monotone" dataKey="age" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            {/* Fotos (Se existirem) */}
            {(frontPhoto || sidePhoto) && (
                <div className="grid grid-cols-2 gap-6 mb-8">
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
            )}
            
            {/* Se NÃO existirem fotos, mostra o botão de upload (escondido durante captura via lógica se necessário, mas aqui deixamos visível para edição) */}
            {(!frontPhoto && !sidePhoto) && !isGeneratingPdf && (
                <div className="grid grid-cols-2 gap-6 mb-8">
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
            )}

            {/* Rodapé e Assinatura */}
            <div className="mt-auto pt-12">
                <div className="flex justify-between items-end gap-12">
                    <div className="flex-1 border-t border-slate-300 pt-2 text-center">
                        <p className="font-bold text-slate-800 text-sm">Assinatura do Paciente</p>
                        <p className="text-xs text-slate-400 mt-1">Declaro ter recebido a avaliação física.</p>
                    </div>
                    <div className="flex-1 border-t border-slate-300 pt-2 text-center">
                        <p className="font-bold text-slate-800 text-sm">Nutricionista Responsável</p>
                        <p className="text-xs text-slate-400 mt-1">CRN-3/SP 12345</p>
                    </div>
                </div>
                <div className="text-center text-slate-300 text-[10px] mt-8">
                    Gerado por NutriVida • {new Date().toLocaleString('pt-BR')}
                </div>
            </div>

          </div>
      </div>
    </div>
  );
};
