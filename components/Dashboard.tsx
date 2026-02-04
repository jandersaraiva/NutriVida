import React from 'react';
import { CheckIn } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Legend 
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, ArrowRight, Scale, Activity, Ruler, Zap, Flame, PieChart, Cake } from 'lucide-react';

interface DashboardProps {
  checkIns: CheckIn[];
  onAddEntry: () => void;
  age: number; // Current calculated age of the patient
}

export const Dashboard: React.FC<DashboardProps> = ({ checkIns, onAddEntry, age }) => {
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
    
    // Logic: 
    // Weight: usually lower is green (but context dependent). Let's stick to standard "evolution" logic where green = progress. 
    // For simplicity, let's use colors based on direction relative to "inverse".
    // Inverse=true means Negative Delta is Green (Good).
    
    const isGood = inverse ? diff < 0 : diff > 0;
    const colorClass = isGood ? 'text-emerald-600' : 'text-rose-600';
    const sign = diff > 0 ? '+' : '';

    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
        {sign}{diff.toFixed(1).replace('.', ',')}{suffix} vs anterior
      </span>
    );
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
  const Card = ({ title, value, unit, icon: Icon, colorClass, delta, subdelta }: any) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
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

  return (
    <div className="space-y-6">
      
      {/* Row 1: Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          title="Peso Atual" 
          value={current.weight.toFixed(1)} 
          unit="kg" 
          icon={Scale} 
          colorClass="text-slate-600 bg-slate-100" // Neutral/Black icon in image
          delta={renderDelta(current.weight, previous?.weight, true, " kg")}
        />
        <Card 
          title="IMC" 
          value={current.imc.toFixed(1)} 
          unit="" 
          icon={Activity} 
          colorClass="text-slate-600 bg-slate-100"
          delta={renderDelta(current.imc, previous?.imc, true)}
        />
        <Card 
          title="Gordura Corporal" 
          value={current.bodyFat.toFixed(1)} 
          unit="%" 
          icon={Flame} 
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
      </div>

      {/* Row 2: Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Idade</p>
              <h3 className="text-2xl font-bold text-slate-800">{age}</h3>
              <p className="text-xs text-slate-400">Anos</p>
           </div>
           <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
              <Cake size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Gordura Visceral</p>
              <h3 className="text-2xl font-bold text-slate-800">{current.visceralFat}</h3>
              <p className="text-xs text-slate-400">Nível de Risco</p>
           </div>
           <div className={`p-3 rounded-full ${current.visceralFat > 9 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Activity size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Metabolismo</p>
              <h3 className="text-2xl font-bold text-slate-800">{current.bmr}</h3>
              <p className="text-xs text-slate-400">Kcal / dia</p>
           </div>
           <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
              <Zap size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Altura</p>
              <h3 className="text-2xl font-bold text-slate-800">{current.height}m</h3>
              <p className="text-xs text-slate-400">Estático</p>
           </div>
           <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <Ruler size={24} />
           </div>
        </div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Weight & IMC */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Evolução de Peso & IMC
            </h3>
          </div>
          <div className="h-[300px] w-full">
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
                {/* Weight Area */}
                <Area yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                {/* IMC Line */}
                <Line yAxisId="right" type="monotone" dataKey="imc" name="IMC" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke:'#fff'}} />
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
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={['auto', 'auto']} unit="kg" />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Line type="monotone" dataKey="weight" name="Peso Total" stroke="#3b82f6" strokeWidth={2} dot={{r: 3}} />
                <Line type="monotone" dataKey="muscleMassKg" name="Massa Magra (kg)" stroke="#10b981" strokeWidth={2} dot={{r: 3}} />
                <Line type="monotone" dataKey="fatMassKg" name="Massa Gorda (kg)" stroke="#f97316" strokeWidth={2} dot={{r: 3}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};