
import React, { useState, useRef } from 'react';
import { CheckIn, Patient } from '../types';
import { ChevronLeft, Download, AlertTriangle, CheckCircle, User, Camera, X, Plus } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

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
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

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

  // Water (Estimativa simples se não tiver input: TBW approx 73% of FFM or simple formula)
  // Usando residual simples para gráfico
  const residualMass = checkIn.weight - fatMass - muscleMass;

  // Dados para gráficos
  const sortedHistory = [...allCheckIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const historyData = sortedHistory.map(c => ({
      date: new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: c.weight,
      bodyFat: c.bodyFat
  }));

  const pieData = [
    { name: 'Gordura', value: fatMass, color: '#f43f5e' }, // Rose 500
    { name: 'Músculo', value: muscleMass, color: '#10b981' }, // Emerald 500
    { name: 'Resid/Água', value: residualMass, color: '#3b82f6' } // Blue 500
  ];

  // --- Helpers de Status Visual ---
  const getStatusBadge = (value: number, type: 'IMC' | 'RCQ' | 'RCA' | 'IMG' | 'IMM') => {
      let status = 'Adequado';
      let color = 'bg-emerald-500';
      let icon = CheckCircle;

      if (type === 'IMC') {
          if (value > 25) { status = 'Sobrepeso'; color = 'bg-amber-400'; icon = AlertTriangle; }
          else if (value < 18.5) { status = 'Abaixo'; color = 'bg-blue-400'; icon = AlertTriangle; }
      }
      
      // Lógica simplificada para demonstração
      if (type === 'IMG' && value > 6) { status = 'Alto'; color = 'bg-amber-400'; icon = AlertTriangle; }
      if (type === 'RCQ' && value > 0.9) { status = 'Risco Alto'; color = 'bg-rose-500'; icon = AlertTriangle; }

      const Icon = icon;

      return (
          <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">{value.toFixed(2)} Kg/m² - {status}</span>
              <div className={`p-0.5 rounded text-white ${color}`}>
                  <Icon size={14} />
              </div>
          </div>
      );
  };

  const BarIndicator = ({ value, max = 100, color = 'bg-emerald-500' }: { value: number, max?: number, color?: string }) => (
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
          <div className={`h-full ${color}`} style={{ width: `${Math.min((value/max)*100, 100)}%` }}></div>
      </div>
  );

  // Componente de Upload de Foto
  const PhotoUploadBox = ({ title, photo, onUpload, onClear, inputRef }: any) => (
    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center min-h-[250px] relative group">
        <h4 className="font-bold text-slate-700 mb-4 self-start">{title}</h4>
        
        {photo ? (
            <div className="flex-1 w-full relative bg-black rounded-lg overflow-hidden flex items-center justify-center">
                <img src={photo} alt={title} className="max-w-full max-h-[200px] object-contain" />
                <button 
                    onClick={onClear}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    title="Remover foto"
                >
                    <X size={16} />
                </button>
            </div>
        ) : (
            <div 
                className="flex-1 w-full bg-white border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-emerald-400 hover:text-emerald-500 transition-all group/upload"
                onClick={() => inputRef.current?.click()}
            >
                <div className="p-3 bg-slate-50 rounded-full mb-2 group-hover/upload:bg-emerald-50 transition-colors">
                    <Camera size={32} />
                </div>
                <span className="text-sm font-medium">Adicionar Foto</span>
                <span className="text-xs mt-1 text-slate-400">Clique para carregar</span>
            </div>
        )}
        
        <input 
            type="file" 
            ref={inputRef}
            onChange={onUpload}
            className="hidden"
            accept="image/*"
        />
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-12 print:bg-white print:pb-0">
      
      {/* Header de Ação (Não imprime) */}
      <div className="max-w-5xl mx-auto pt-6 px-4 mb-6 flex justify-between items-center print:hidden">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
              <ChevronLeft size={20} /> Voltar
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
            title="Salvar como PDF usando a janela de impressão"
          >
              <Download size={18} /> Exportar PDF
          </button>
      </div>

      {/* DOCUMENTO A4 */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-8 md:p-12 print:p-0 min-h-[297mm]">
        
        {/* Cabeçalho do Relatório */}
        <div className="bg-slate-50 rounded-xl p-6 mb-8 text-center border border-slate-100 print:border-none print:bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Relatório de Avaliação Antropométrica</h1>
            <p className="text-slate-600 font-medium">Paciente: {patient.name} ({patient.gender === 'Masculino' ? 'homem' : 'mulher'}, {patient.age} anos)</p>
        </div>

        {/* Linha 1: Dados e Fotos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Coluna 1: Dados Numéricos */}
            <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 text-sm">
                <h3 className="font-bold text-slate-800 mb-4 text-base">Dados da avaliação</h3>
                <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Data da avaliação</span>
                        <span className="font-bold text-slate-800">{new Date(checkIn.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Peso corporal</span>
                        <span className="font-bold text-slate-800">{checkIn.weight.toFixed(1)} Kg</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Altura</span>
                        <span className="font-bold text-slate-800">{(checkIn.height * 100).toFixed(0)} cm</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Circunferência da cintura</span>
                        <span className="font-bold text-slate-800">{waist > 0 ? waist + ' cm' : '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Circunferência do quadril</span>
                        <span className="font-bold text-slate-800">{hip > 0 ? hip + ' cm' : '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Cintura / altura (RCA)</span>
                        <span className="font-bold text-slate-800">{rca > 0 ? rca.toFixed(2) : '-'}</span>
                    </div>
                     <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Cintura / quadril (RCQ)</span>
                        <span className="font-bold text-slate-800">{rcq > 0 ? rcq.toFixed(2) : '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Gordura corporal</span>
                        <span className="font-bold text-slate-800">{fatMass.toFixed(1)}Kg ({checkIn.bodyFat}%)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-600">Massa magra</span>
                        <span className="font-bold text-slate-800">{muscleMass.toFixed(1)}Kg ({checkIn.muscleMass}%)</span>
                    </div>
                </div>
            </div>

            {/* Colunas 2 e 3: Fotos Interativas */}
            <PhotoUploadBox 
                title="Foto da análise frontal"
                photo={frontPhoto}
                inputRef={frontInputRef}
                onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, 'front')}
                onClear={() => clearPhoto('front')}
            />
            
            <PhotoUploadBox 
                title="Foto da análise lateral"
                photo={sidePhoto}
                inputRef={sideInputRef}
                onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, 'side')}
                onClear={() => clearPhoto('side')}
            />
        </div>

        {/* Linha 2: Composição e Índices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Esquerda: Donut Chart e Cards de Massa */}
            <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-6">Composição corporal</h3>
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="bg-white p-3 rounded-lg border-l-4 border-rose-500 shadow-sm">
                            <span className="text-xs text-slate-500 block">Massa de gordura</span>
                            <span className="font-bold text-slate-800">{fatMass.toFixed(1)} Kg ({checkIn.bodyFat}%)</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border-l-4 border-emerald-500 shadow-sm">
                            <span className="text-xs text-slate-500 block">Massa magra total</span>
                            <span className="font-bold text-slate-800">{muscleMass.toFixed(1)} Kg ({checkIn.muscleMass}%)</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border-l-4 border-blue-500 shadow-sm">
                            <span className="text-xs text-slate-500 block">Água / Residual</span>
                            <span className="font-bold text-slate-800">{residualMass.toFixed(1)} Kg</span>
                        </div>
                    </div>
                </div>
                
                {/* Score Mock */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Pontuação de Saúde</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-slate-800">74</span>
                        <span className="text-slate-500 mb-1.5">pontos / 100</span>
                    </div>
                </div>
            </div>

            {/* Direita: Índices Detalhados */}
            <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 space-y-6">
                <div>
                    <h3 className="font-bold text-slate-800 mb-1 text-sm">Índice de massa corporal (IMC)</h3>
                    {getStatusBadge(checkIn.imc, 'IMC')}
                    <BarIndicator value={checkIn.imc} max={40} color={checkIn.imc > 25 ? 'bg-amber-400' : 'bg-emerald-500'} />
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 mb-1 text-sm">Índice de massa magra (IMM)</h3>
                    {getStatusBadge(imm, 'IMM')}
                    <BarIndicator value={imm} max={25} color="bg-emerald-500" />
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 mb-1 text-sm">Índice de massa gorda (IMG)</h3>
                    {getStatusBadge(img, 'IMG')}
                    <BarIndicator value={img} max={15} color="bg-emerald-500" />
                </div>

                {rcq > 0 && (
                    <div>
                        <h3 className="font-bold text-slate-800 mb-1 text-sm">Relação Cintura-Quadril (RCQ)</h3>
                        {getStatusBadge(rcq, 'RCQ')}
                        <BarIndicator value={rcq * 100} max={120} color={rcq > 0.9 ? 'bg-rose-500' : 'bg-emerald-500'} />
                    </div>
                )}
            </div>
        </div>

        {/* Linha 3: Gráficos de Histórico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Histórico do % de gordura</h3>
                <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fill: '#64748b'}} 
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{fontSize: 10, fill: '#64748b'}}
                                domain={['dataMin - 2', 'dataMax + 2']} 
                                width={30}
                            />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Area 
                                type="monotone" 
                                dataKey="bodyFat" 
                                stroke="#10b981" 
                                fill="#10b981" 
                                fillOpacity={0.1} 
                                strokeWidth={2}
                                label={{ position: 'top', fill: '#059669', fontSize: 10, fontWeight: 600, formatter: (val: any) => `${val}%` }}
                            />
                        </AreaChart>
                     </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Histórico do peso corporal</h3>
                <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fill: '#64748b'}} 
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{fontSize: 10, fill: '#64748b'}}
                                domain={['dataMin - 2', 'dataMax + 2']} 
                                width={30}
                            />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Area 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="#3b82f6" 
                                fill="#3b82f6" 
                                fillOpacity={0.1} 
                                strokeWidth={2} 
                                label={{ position: 'top', fill: '#2563eb', fontSize: 10, fontWeight: 600, formatter: (val: any) => `${val}kg` }}
                            />
                        </AreaChart>
                     </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Footer do Relatório */}
        <div className="mt-8 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
            <p>NutriVida - Software de Nutrição Profissional</p>
        </div>

      </div>
    </div>
  );
};
