import React, { useState } from 'react';
import { CheckIn } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Bar 
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, ArrowRight, Scale, Activity, Ruler } from 'lucide-react';

interface DashboardProps {
  checkIns: CheckIn[];
  onAddEntry: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ checkIns, onAddEntry }) => {
  const [chartMode, setChartMode] = useState<'composition' | 'weight'>('composition');

  // We assume checkIns is already sorted (newest first)
  const current = checkIns[0];
  const previous = checkIns[1];

  // Helper to calculate delta and determine color
  const renderDelta = (currentVal: number, prevVal: number | undefined, inverse = false) => {
    if (prevVal === undefined) return <span className="text-slate-400 text-xs">Primeiro registro</span>;
    
    const diff = currentVal - prevVal;
    const absDiff = Math.abs(diff);
    const isNeutral = absDiff < 0.05;
    
    if (isNeutral) return <span className="text-slate-400 text-xs flex items-center gap-1"><Minus size={12}/> Estável</span>;

    // Logic: 
    // Usually Weight loss is good (green) -> unless we want muscle gain? Assume generic "weight loss" goal for color logic, 
    // but Muscle gain is good (green).
    // Inverse = true means LOWER is BETTER (e.g. Visceral Fat, Body Fat usually).
    
    let isGood = inverse ? diff < 0 : diff > 0;
    
    // Special case for weight: Context dependent, but let's assume dropping weight is generally "Green" for general population apps,
    // or we can make it neutral blue. Let's use the prompt example: "Perdeu 1.2kg" in green.
    // So for weight: Lower is Green.
    
    const colorClass = isGood ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
    const Icon = diff > 0 ? TrendingUp : TrendingDown;
    const sign = diff > 0 ? '+' : '';

    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        <Icon size={12} />
        {sign}{diff.toFixed(1).replace('.', ',')}
      </span>
    );
  };

  // Prepare data for charts (needs to be ascending by date)
  const chartData = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(c => ({
    ...c,
    dateFormatted: new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }));

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-300">
        <p className="text-slate-500 mb-4">Nenhuma avaliação registrada ainda.</p>
        <button onClick={onAddEntry} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          Adicionar Primeira Avaliação
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Scale size={20} />
            </div>
            {renderDelta(current.weight, previous?.weight, true)}
          </div>
          <p className="text-slate-500 text-sm font-medium">Peso Corporal</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-bold text-slate-800">{current.weight.toFixed(1).replace('.', ',')}</h3>
            <span className="text-sm text-slate-400">kg</span>
          </div>
        </div>

        {/* Body Fat Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Activity size={20} />
            </div>
            {renderDelta(current.bodyFat, previous?.bodyFat, true)}
          </div>
          <p className="text-slate-500 text-sm font-medium">Gordura Corporal</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-bold text-slate-800">{current.bodyFat.toFixed(1).replace('.', ',')}</h3>
            <span className="text-sm text-slate-400">%</span>
          </div>
        </div>

        {/* Muscle Mass Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Activity size={20} />
            </div>
            {renderDelta(current.muscleMass, previous?.muscleMass, false)}
          </div>
          <p className="text-slate-500 text-sm font-medium">Massa Muscular</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-bold text-slate-800">{current.muscleMass.toFixed(1).replace('.', ',')}</h3>
            <span className="text-sm text-slate-400">%</span>
          </div>
        </div>

        {/* IMC Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Ruler size={20} />
            </div>
            {renderDelta(current.imc, previous?.imc, true)}
          </div>
          <p className="text-slate-500 text-sm font-medium">IMC</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-bold text-slate-800">{current.imc.toFixed(1).replace('.', ',')}</h3>
            <span className="text-sm text-slate-400">kg/m²</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Evolução Temporal</h3>
              <p className="text-sm text-slate-500">Tendência dos últimos meses</p>
            </div>
            <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
              <button 
                onClick={() => setChartMode('composition')}
                className={`px-3 py-1.5 rounded-md transition-all ${chartMode === 'composition' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Composição
              </button>
              <button 
                onClick={() => setChartMode('weight')}
                className={`px-3 py-1.5 rounded-md transition-all ${chartMode === 'weight' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Peso Geral
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'composition' ? (
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={['dataMin - 5', 'dataMax + 5']} unit="%" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="muscleMass" name="Massa Muscular" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorMuscle)" />
                  <Line type="monotone" dataKey="bodyFat" name="Gordura Corporal" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316', strokeWidth: 2, stroke:'#fff'}} />
                </ComposedChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={['dataMin - 2', 'dataMax + 2']} unit="kg" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="weight" name="Peso (kg)" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Details Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6">Metabolismo & Saúde</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 text-sm">Taxa Metabólica Basal</span>
                  <span className="font-semibold text-slate-800">{current.bmr} Kcal</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 text-sm">Gordura Visceral</span>
                  <span className="font-semibold text-slate-800">Nível {current.visceralFat}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${current.visceralFat > 9 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${(current.visceralFat / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {current.visceralFat < 10 ? 'Nível Saudável (1-9)' : 'Nível de Alerta (10+)'}
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 text-sm">Idade Metabólica Est.</span>
                  <span className="font-semibold text-slate-800">{current.age - 2} anos</span>
                </div>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingDown size={12} /> Ótimo! Menor que cronológica
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={onAddEntry}
            className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
          >
            Registrar Check-in <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};