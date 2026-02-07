
import React from 'react';
import { CheckIn } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Legend 
} from 'recharts';
import { 
  Scale, Activity, Zap, Flame, PieChart, Hourglass, TrendingDown, TrendingUp, 
  Calculator, Calendar, AlertTriangle, CheckCircle, FileText 
} from 'lucide-react';

interface DashboardProps {
  checkIns: CheckIn[];
  onAddEntry: () => void;
  onViewReport?: (checkIn: CheckIn) => void; // Nova prop
  age: number; // Current calculated age of the patient
  gender: 'Masculino' | 'Feminino';
}

export const Dashboard: React.FC<DashboardProps> = ({ checkIns, onAddEntry, onViewReport, age, gender }) => {
  // We assume checkIns is already sorted (newest first) for card display
  const current = checkIns[0];
  const previous = checkIns[1];

  // For charts, we need chronological order (oldest to newest)
  const chartData = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(c => ({
    ...c,
    dateFormatted: new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    // Formatação para tooltips
    weightNum: c.weight,
    imcNum: c.imc,
    muscleNum: c.muscleMass,
    fatNum: c.bodyFat,
    // Calculated absolute mass values (kg)
    fatMassKg: parseFloat((c.weight * (c.bodyFat / 100)).toFixed(1)),
    muscleMassKg: parseFloat((c.weight * (c.muscleMass / 100)).toFixed(1))
  }));

  const renderDelta = (currentVal: number, prevVal: number | undefined, inverse = false, suffix = "") => {
    if (prevVal === undefined) return <span className="text-slate-400 text-xs">Início</span>;
    
    const diff = currentVal - prevVal;
    const absDiff = Math.abs(diff);
    const isNeutral = absDiff < 0.05;
    
    if (isNeutral) return <span className="text-slate-400 text-xs flex items-center gap-1">Estável</span>;
    
    const isGood = inverse ? diff < 0 : diff > 0;
    const colorClass = isGood ? 'text-emerald-600' : 'text-rose-600';
    const sign = diff > 0 ? '+' : '';

    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
        {sign}{diff.toFixed(1).replace('.', ',')}{suffix} vs anterior
      </span>
    );
  };

  // Custom Tooltip para o Gráfico de Composição
  const CustomCompositionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-sm outline-none">
          <p className="font-bold text-slate-700 mb-2 border-b border-slate-50 pb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const data = entry.payload;
            
            // Determina a porcentagem baseada na chave do dado
            let percentage = null;
            if (entry.dataKey === 'muscleMassKg') percentage = data.muscleMass;
            if (entry.dataKey === 'fatMassKg') percentage = data.bodyFat;

            return (
              <div key={index} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0" style={{ color: entry.color }}>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="font-medium text-slate-600">{entry.name}:</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="font-bold">{entry.value}</span>
                    {percentage !== null && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium min-w-[3rem] text-center">
                            {percentage}%
                        </span>
                    )}
                 </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Custom Dot para o Gráfico de Idade (Verde se bodyAge <= age, Vermelho se >)
  const CustomBodyAgeDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isGood = payload.bodyAge <= payload.age;
    const color = isGood ? '#10b981' : '#f43f5e'; // emerald-500 or rose-500
    
    // Reduzi r de 5 para 4 e strokeWidth de 3 para 2
    return (
        <circle cx={cx} cy={cy} r={4} stroke={color} strokeWidth={2} fill="white" />
    );
  };

  // Custom Tooltip para o Gráfico de Idade
  const CustomAgeTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
          const data = payload[0].payload;
          const diff = data.bodyAge - data.age;
          const isGood = diff <= 0;
          
          return (
              <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-sm outline-none min-w-[180px]">
                  <p className="font-bold text-slate-700 mb-3 border-b border-slate-50 pb-2">{label}</p>
                  
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500">Idade Real</span>
                      <span className="font-semibold text-slate-700">{data.age} anos</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-500">Idade Corporal</span>
                      <span className={`font-bold ${isGood ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {data.bodyAge} anos
                      </span>
                  </div>

                  <div className={`mt-2 p-2 rounded-lg text-center text-xs font-bold flex items-center justify-center gap-1 ${isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {isGood ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                      {diff === 0 ? 'Equilibrado' : 
                       diff < 0 ? `${Math.abs(diff)} anos a menos` : 
                       `${diff} anos a mais`}
                  </div>
              </div>
          );
      }
      return null;
  };

  // --- Lógica para Gráfico de Gordura Visceral ---
  const getVisceralColor = (value: number) => {
    if (value <= 9) return '#10b981'; // Green (Normal)
    if (value <= 14) return '#f59e0b'; // Amber (Alert)
    return '#f43f5e'; // Rose (Excess)
  };

  const CustomVisceralDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = getVisceralColor(payload.visceralFat);
    // Reduzi r de 5 para 4 e strokeWidth de 3 para 2
    return <circle cx={cx} cy={cy} r={4} stroke={color} strokeWidth={2} fill="white" />;
  };

  const CustomVisceralTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const value = data.visceralFat;
        let status = 'Normal';
        let statusColor = 'text-emerald-600 bg-emerald-50';
        let dotColor = '#10b981';
        let Icon = CheckCircle;

        if (value > 9 && value <= 14) {
            status = 'Alerta';
            statusColor = 'text-amber-600 bg-amber-50';
            dotColor = '#f59e0b';
            Icon = AlertTriangle;
        } else if (value > 14) {
            status = 'Alto Risco';
            statusColor = 'text-rose-600 bg-rose-50';
            dotColor = '#f43f5e';
            Icon = Flame;
        }

        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-sm outline-none min-w-[160px]">
                <p className="font-bold text-slate-700 mb-2 border-b border-slate-50 pb-2">{label}</p>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
                        <span className="text-slate-500">Nível</span>
                    </div>
                    <span className="font-bold text-xl text-slate-800">{value}</span>
                </div>
                <div className={`flex items-center justify-center gap-2 p-2 rounded-lg font-bold text-xs ${statusColor}`}>
                    <Icon size={14} /> {status}
                </div>
            </div>
        );
    }
    return null;
  };


  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-300">
        <p className="text-slate-500 mb-4">Nenhuma avaliação registrada para este paciente.</p>
        <button onClick={onAddEntry} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          Realizar Primeira Avaliação
        </button>
      </div>
    );
  }

  // Common card style
  const Card = ({ title, value, unit, icon: Icon, colorClass, delta }: any) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
         <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
              <span className="text-sm text-slate-400 font-medium">{unit}</span>
            </div>
         </div>
         <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
            <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
         </div>
      </div>
      <div>
        {delta}
      </div>
    </div>
  );

  // Helper para cor do IMC
  const getImcColor = (imc: number) => {
    if (imc < 18.5) return 'text-yellow-600 bg-yellow-100';
    if (imc >= 18.5 && imc < 25) return 'text-emerald-600 bg-emerald-100';
    return 'text-orange-600 bg-orange-100';
  };

  // Helper para cor da Idade Corporal
  const getBodyAgeColor = (bodyAge: number, realAge: number) => {
      if (bodyAge < realAge) return 'text-emerald-600 bg-emerald-100';
      if (bodyAge > realAge) return 'text-rose-600 bg-rose-100';
      return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header - Latest CheckIn */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
         <div className="flex items-center gap-3">
             <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                <Calendar size={20} />
             </div>
             <div>
                <h3 className="font-bold text-slate-800 text-sm">Última Avaliação: {new Date(current.date).toLocaleDateString('pt-BR')}</h3>
                <p className="text-xs text-slate-500">Confira a evolução detalhada e gere o PDF.</p>
             </div>
         </div>
         <div className="w-full sm:w-auto flex gap-2">
             {onViewReport && (
                <button 
                    onClick={() => onViewReport(current)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm shadow-blue-100"
                >
                    <FileText size={16} />
                    Ver Relatório Detalhado
                </button>
             )}
         </div>
      </div>

      {/* Metrics Grid - Unified */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Linha 1 */}
        <Card 
          title="Peso Atual" 
          value={current.weight.toFixed(1)} 
          unit="kg" 
          icon={Scale} 
          colorClass="text-slate-600 bg-slate-100"
          delta={renderDelta(current.weight, previous?.weight, true, " kg")}
        />
        <Card 
            title="IMC"
            value={current.imc.toFixed(1)}
            unit="kg/m²"
            icon={Calculator}
            colorClass={getImcColor(current.imc)}
            delta={renderDelta(current.imc, previous?.imc, true)}
        />
        <Card 
          title="Gordura Corporal" 
          value={current.bodyFat.toFixed(1)} 
          unit="%" 
          icon={PieChart} 
          colorClass="text-slate-600 bg-slate-100"
          delta={renderDelta(current.bodyFat, previous?.bodyFat, true, " %")}
        />
        <Card 
          title="Massa Muscular" 
          value={current.muscleMass.toFixed(1)} 
          unit="%" 
          icon={Zap} 
          colorClass="text-slate-600 bg-slate-100"
          delta={renderDelta(current.muscleMass, previous?.muscleMass, false, " %")}
        />

        {/* Linha 2 */}
        <Card 
          title="Gordura Visceral" 
          value={current.visceralFat} 
          unit="nível" 
          icon={Activity} 
          colorClass={current.visceralFat > 9 ? 'text-orange-600 bg-orange-100' : 'text-emerald-600 bg-emerald-100'}
          delta={renderDelta(current.visceralFat, previous?.visceralFat, true)}
        />
        <Card 
            title="Idade Corporal"
            value={current.bodyAge || '-'}
            unit="anos"
            icon={Hourglass}
            colorClass={getBodyAgeColor(current.bodyAge, current.age)}
            delta={renderDelta(current.bodyAge, previous?.bodyAge, true, " anos")}
        />
         <Card 
            title="Taxa Metabólica"
            value={current.bmr}
            unit="kcal"
            icon={Flame}
            colorClass="text-slate-600 bg-slate-100"
            delta={renderDelta(current.bmr, previous?.bmr, false)}
        />
        <Card 
            title="Idade Real"
            value={current.age}
            unit="anos"
            icon={Calendar}
            colorClass="text-slate-600 bg-slate-100"
            delta={<span className="text-slate-400 text-xs">Data Nasc: {new Date().getFullYear() - current.age}</span>}
        />
      </div>

      {/* Charts Section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Chart 1: Weight & IMC */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Evolução de Peso & IMC
            </h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                   <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={['auto', 'auto']} unit="kg" />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={['dataMin - 1', 'dataMax + 1']} hide />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                {/* Weight Area with Dot */}
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="weight" 
                  name="Peso (kg)" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                />
                {/* IMC Line with Dot - Stroke removed */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="imc" 
                  name="IMC" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#7c3aed' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weight Composition (kg) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-violet-500" />
              Composição do Peso (kg)
            </h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={['auto', 'auto']} unit="kg" />
                <Tooltip content={<CustomCompositionTooltip />} cursor={{ opacity: 0.2 }} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Line type="monotone" dataKey="weight" name="Peso Total" stroke="#3b82f6" strokeWidth={2} dot={{r: 3}} />
                <Line type="monotone" dataKey="muscleMassKg" name="Massa Magra (kg)" stroke="#10b981" strokeWidth={2} dot={{r: 3}} />
                <Line type="monotone" dataKey="fatMassKg" name="Massa Gorda (kg)" stroke="#f97316" strokeWidth={2} dot={{r: 3}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Charts Section: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Chart 3: Body Age vs Real Age */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Hourglass size={18} className="text-emerald-500" />
                    Comparativo: Idade Corporal vs. Idade Real
                </h3>
            </div>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBodyAge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={['dataMin - 3', 'dataMax + 3']} unit=" anos" />
                    
                    <Tooltip content={<CustomAgeTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                    
                    {/* Linha de Base: Idade Real (Monotone agora) */}
                    <Area 
                        type="monotone" 
                        dataKey="age" 
                        name="Idade Real" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                        fill="none" 
                        dot={false}
                        activeDot={false}
                    />

                    {/* Linha Principal: Idade Corporal */}
                    <Area 
                        type="monotone" 
                        dataKey="bodyAge" 
                        name="Idade Corporal" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorBodyAge)" 
                        dot={<CustomBodyAgeDot />}
                        activeDot={{ r: 5, strokeWidth: 0, fill: '#059669' }}
                    />
                </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Visceral Fat Evolution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Flame size={18} className="text-amber-500" />
                    Evolução da Gordura Visceral
                </h3>
            </div>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVisceral" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 'dataMax + 2']} />
                        
                        <Tooltip content={<CustomVisceralTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="visceralFat" 
                            name="Nível Visceral" 
                            stroke="#f59e0b" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorVisceral)"
                            dot={<CustomVisceralDot />} 
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#d97706' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>

      </div>

    </div>
  );
};
