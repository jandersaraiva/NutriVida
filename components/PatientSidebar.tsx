import React from 'react';
import { LayoutDashboard, FileText, Utensils, LogOut, Calendar, User } from 'lucide-react';
import { ViewState } from '../types';

interface PatientSidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  patientName: string;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({ 
  currentView, 
  onViewChange, 
  isDarkMode, 
  toggleTheme, 
  onLogout,
  patientName
}) => {
  const menuItems = [
    { id: 'home', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'history', label: 'Histórico', icon: FileText },
    { id: 'diet', label: 'Minha Dieta', icon: Utensils },
    { id: 'schedule', label: 'Agenda', icon: Calendar },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 md:hidden safe-area-bottom">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'home' && currentView === 'patients'); // Home maps to dashboard view
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300 sticky top-0 z-40">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <User size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">NutriVida</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Área do Paciente</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Principal</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'home' && currentView === 'patients');
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as ViewState)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={20} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                    {patientName.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{patientName}</p>
                    <p className="text-xs text-slate-400 truncate">Paciente</p>
                </div>
            </div>

            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 transition-all text-sm font-medium group"
            >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                Sair
            </button>
            
            <div className="mt-4 flex justify-center">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Alternar Tema"
                >
                    {isDarkMode ? '🌙' : '☀️'}
                </button>
            </div>
        </div>
      </aside>
    </>
  );
};
