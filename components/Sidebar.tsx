import React from 'react';
import { ViewState } from '../types';
import { PlusCircle, Activity, Users, CalendarDays, LayoutDashboard, Moon, Sun } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, theme, toggleTheme }) => {
  const menuItems = [
    { id: 'home', label: 'Visão Geral', icon: LayoutDashboard }, // New Dashboard
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'schedule', label: 'Agenda', icon: CalendarDays },
    { id: 'select_patient_for_entry', label: 'Nova Avaliação', icon: PlusCircle },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 z-10 shadow-sm">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Activity size={24} />
            </div>
            <span className="font-bold text-xl text-emerald-900 dark:text-emerald-400 hidden lg:block">NutriVida</span>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            // Highlight logic
            let isActive = currentView === item.id;
            
            // Special case for 'select_patient_for_entry' which maps to 'add_entry' view
            if (item.id === 'select_patient_for_entry' && currentView === 'add_entry') {
              isActive = true;
            }

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewState)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-900' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500'} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
         {/* Theme Toggle */}
         <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
         >
            {theme === 'light' ? (
                <>
                    <Moon size={20} />
                    <span className="hidden lg:block text-sm font-medium">Modo Escuro</span>
                </>
            ) : (
                <>
                    <Sun size={20} />
                    <span className="hidden lg:block text-sm font-medium">Modo Claro</span>
                </>
            )}
         </button>

        <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 text-white hidden lg:block">
          <p className="text-xs text-slate-400 mb-1">Versão Pro</p>
          <p className="font-medium text-sm">Gestão completa de pacientes</p>
        </div>
      </div>
    </aside>
  );
};