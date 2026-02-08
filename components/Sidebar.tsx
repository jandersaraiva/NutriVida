import React from 'react';
import { ViewState } from '../types';
import { PlusCircle, Activity, Users, CalendarDays, LayoutDashboard, Settings, Moon, Sun } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isDarkMode, toggleTheme }) => {
  const menuItems = [
    { id: 'home', label: 'Visão Geral', icon: LayoutDashboard }, // New Dashboard
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'schedule', label: 'Agenda', icon: CalendarDays },
    { id: 'select_patient_for_entry', label: 'Novo', icon: PlusCircle },
    { id: 'profile_settings', label: 'Meu Perfil', icon: Settings },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 z-10 shadow-sm print:hidden">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Activity size={24} />
            </div>
            <span className="font-bold text-xl text-blue-900 dark:text-white hidden lg:block">NutriVida</span>
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
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium shadow-sm ring-1 ring-blue-100 dark:ring-blue-800' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
        >
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          <span className="hidden lg:block">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-4 text-white hidden lg:block border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Versão Pro</p>
          <p className="font-medium text-sm">Gestão completa de pacientes</p>
        </div>
      </div>
    </aside>
  );
};