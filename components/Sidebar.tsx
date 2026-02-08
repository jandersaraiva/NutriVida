import React from 'react';
import { ViewState } from '../types';
import { PlusCircle, Activity, Users, CalendarDays, LayoutDashboard, Settings, Moon, Sun, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout?: () => void; // Tornando opcional para compatibilidade, mas é usado
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isDarkMode, toggleTheme, onLogout }) => {
  const menuItems = [
    { id: 'home', label: 'Início', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'select_patient_for_entry', label: 'Novo', icon: PlusCircle, isAction: true }, // Action button
    { id: 'schedule', label: 'Agenda', icon: CalendarDays },
    { id: 'profile_settings', label: 'Perfil', icon: Settings },
  ];

  // Lógica de destaque
  const isItemActive = (id: string) => {
    if (currentView === id) return true;
    if (id === 'select_patient_for_entry' && currentView === 'add_entry') return true;
    return false;
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Visible on lg screens and up) --- */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between transition-all duration-300 z-10 shadow-sm print:hidden h-screen sticky top-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/30">
                <Activity size={24} />
              </div>
              <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">NutriVida</span>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as ViewState)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={22} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          )}
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION (Visible on screens smaller than lg) --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe z-50 px-2 print:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 sm:h-20 max-w-md mx-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id);
            
            if (item.isAction) {
              return (
                <div key={item.id} className="relative -top-5">
                  <button
                    onClick={() => onViewChange(item.id as ViewState)}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
                  >
                    <PlusCircle size={28} />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewState)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} className="transition-all" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};