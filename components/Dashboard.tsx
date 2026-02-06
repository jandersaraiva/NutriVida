
import React from 'react';
import { CheckIn } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Legend 
} from 'recharts';
import { Scale, Activity, Zap, Flame, PieChart } from 'lucide-react';

interface DashboardProps {
  checkIns: CheckIn[];
  onAddEntry: () => void;
  age: number; // Current calculated age of the patient
  gender: 'Masculino' | 'Feminino';
}

const BodySilhouette: React.FC<{ gender: 'Masculino' | 'Feminino' }> = ({ gender }) => {
  return (
    <svg viewBox="0 0 200 500" className="h-full w-full" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>
       <defs>
         <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" /> {/* Slate-200 */}
            <stop offset="50%" stopColor="#f8fafc" /> {/* Slate-50 */}
            <stop offset="100%" stopColor="#e2e8f0" /> {/* Slate-200 */}
         </linearGradient>
       </defs>
       
       <g fill="url(#bodyGradient)" stroke="#cbd5e1" strokeWidth="1.5">
         {gender === 'Masculino' ? (
           /* Silhueta Masculina Clean - Sem rosto, sem músculos internos */
           <path d="M100,20 
                    C115,20 125,28 125,45 
                    C125,55 120,62 115,65 L115,70 
                    L145,80 C160,85 170,95 170,130 
                    L165,200 L175,210 L180,240 L170,250 L155,245 
                    L150,180 L145,260 L145,300 L148,380 
                    L145,460 L155,475 L125,475 L120,380 
                    L115,300 L100,310 L85,300 L80,380 
                    L75,475 L45,475 L55,460 L52,380 
                    L55,300 L55,260 L50,180 L45,245 
                    L30,250 L20,240 L25,210 L35,200 
                    L30,130 C30,95 40,85 55,80 L85,70 L85,65 
                    C80,62 75,55 75,45 C75,28 85,20 100,20 Z" />
         ) : (
           /* Silhueta Feminina Clean - Sem rosto, sem detalhes */
           <path d="M100,25 
                    C112,25 120,32 120,48 
                    C120,58 115,62 112,65 L112,70 
                    L135,78 C145,82 150,90 150,115 
                    L145,185 L155,195 L160,225 L150,235 L140,230 
                    L140,180 C140,180 145,200 145,230 
                    C145,260 140,280 145,380 L150,460 
                    L135,470 L125,470 L125,380 L120,290 
                    L100,300 L80,290 L75,380 L75,470 
                    L65,470 L50,460 L55,380 C60,280 55,260 55,230 
                    C55,200 60,180 60,180 L60,230 L50,235 
                    L40,225 L45,195 L55,185 L50,115 
                    C50,90 55,82 65,78 L88,70 L88,65 
                    C85,62 80,58 80,48 C80,32 88,25 100,25 Z" />
         )}
       </g>
    </svg>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ checkIns, onAddEntry, age, gender }) => {
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
        <Card 
          title="Gordura Visceral" 
          value={current.visceralFat} 
          unit="nível" 
          icon={Activity} 
          colorClass={current.visceralFat > 9 ? 'text-orange-600 bg-orange-100' : 'text-emerald-600 bg-emerald-100'}
          delta={renderDelta(current.visceralFat, previous?.visceralFat, true)}
        />
      </div>

      {/* Row 2: Metabolic Profile Visual - TEMA CLARO */}
      <div className="bg-white rounded-2xl p-8 relative overflow-hidden shadow-sm border border-slate-100">
          
          <div className="text-center mb-8 relative z-10">
             <h3 className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <span className="w-8 h-px bg-slate-300"></span>
                Perfil Metabólico & Biometria
                <span className="w-8 h-px bg-slate-300"></span>
             </h3>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-8 md:gap-0 max-w-4xl mx-auto">
             {/* IMC */}
             <div className="text-center w-full md:w-1/3 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <p className="text-emerald-600 text-sm font-bold mb-1 tracking-wide">IMC</p>
                <div className="flex flex-col items-center">
                    <p className="text-4xl font-light text-slate-800">{current.imc.toFixed(1)}</p>
                    <span className="text-xs text-slate-400 font-medium mt-1">Kg/m²</span>
                </div>
             </div>

             {/* Age */}
             <div className="text-center w-full md:w-1/3 order-first md:order-none p-4">
                <p className="text-emerald-600 text-sm font-bold mb-1 tracking-wide">Idade</p>
                <div className="flex flex-col items-center">
                    <p className="text-4xl font-light text-slate-800">{age}</p>
                    <span className="text-xs text-slate-400 font-medium mt-1">anos</span>
                </div>
             </div>

             {/* BMR */}
             <div className="text-center w-full md:w-1/3 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <p className="text-emerald-600 text-sm font-bold mb-1 tracking-wide leading-tight">Taxa Metabólica</p>
                <div className="flex flex-col items-center">
                    <p className="text-4xl font-light text-slate-800">{current.bmr}</p>
                    <span className="text-xs text-slate-400 font-medium mt-1">kcal/24h</span>
                </div>
             </div>
          </div>

          {/* Body Visual Area */}
          <div className="mt-8 flex justify-center items-center relative h-[380px] w-full max-w-lg mx-auto">
             
             {/* Height Ruler Left (Light Theme) */}
             <div className="absolute left-0 md:left-6 top-10 h-[85%] flex flex-col justify-between items-end pr-3 border-r border-slate-200">
                {[...Array(11)].map((_, i) => (
                    <div key={i} className={`h-px bg-slate-300 ${i % 5 === 0 ? 'w-5' : 'w-3'}`} />
                ))}
                <div className="absolute top-12 right-6 text-right whitespace-nowrap">
                    <span className="text-3xl font-light block text-slate-700">{(current.height * 100).toFixed(0)}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">cm</span>
                </div>
             </div>

             {/* Silhouette (Updated to Clean Light Gray Silhouette) */}
             <div className="h-full mx-auto relative z-10 w-64 md:w-80 p-4">
                 <BodySilhouette gender={gender} />
             </div>

             {/* Weight Indicator (Light Theme) */}
             <div className="absolute right-0 md:right-6 bottom-16 flex items-end">
                 <div className="h-px w-16 md:w-24 bg-slate-800 rotate-[-25deg] origin-left transform -translate-y-1">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                 </div>
                 <div className="ml-2 mb-4">
                    <span className="text-4xl font-light text-slate-800">{current.weight.toFixed(1)}</span>
                    <span className="text-xs text-slate-500 ml-1 uppercase tracking-wider">kg</span>
                 </div>
             </div>
             
             {/* Base Shadow (Removed/Minimal for outline style) */}
             
             {/* Optional Button (Light Theme) */}
             <div className="absolute right-0 top-1/3 hidden md:block">
                 <button className="bg-white border border-slate-100 hover:border-emerald-200 text-slate-600 pl-3 pr-4 py-2 rounded-l-xl shadow-lg transition-all hover:text-emerald-600 flex items-center gap-2 text-sm font-medium">
                    <PieChart size={16} className="text-emerald-500" />
                    Detalhes
                 </button>
             </div>
          </div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
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

    </div>
  );
};
