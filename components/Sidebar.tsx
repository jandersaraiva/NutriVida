
import React from 'react';
import { ViewState } from '../types';
import { PlusCircle, Activity, Users, CalendarDays, LayoutDashboard, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'home', label: 'Visão Geral', icon: LayoutDashboard }, // New Dashboard
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'schedule', label: 'Agenda', icon: CalendarDays },
    { id: 'select_patient_for_entry', label: 'Novo', icon: PlusCircle },
    { id: 'profile_settings', label: 'Meu Perfil', icon: Settings },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-10 shadow-sm print:hidden">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Activity size={24} />
            </div>
            <span className="font-bold text-xl text-blue-900 hidden lg:block">NutriVida</span>
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
                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 hidden lg:block">
        <div className="bg-slate-900 rounded-xl p-4 text-white">
          <p className="text-xs text-slate-400 mb-1">Versão Pro</p>
          <p className="font-medium text-sm">Gestão completa de pacientes</p>
        </div>
      </div>
    </aside>
  );
};
