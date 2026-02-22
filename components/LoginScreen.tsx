import React, { useState } from 'react';
import { Activity, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sun, Moon, UserPlus, LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignUp: (email: string, pass: string) => Promise<void>;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp, isDarkMode, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (!email || !password) {
        setError('Por favor, preencha todos os campos.');
        setIsLoading(false);
        return;
    }

    try {
        if (isSignUpMode) {
            await onSignUp(email, password);
            setSuccessMessage('Conta criada com sucesso! Verifique seu e-mail ou faça login.');
            setIsSignUpMode(false); // Switch back to login
        } else {
            await onLogin(email, password);
        }
    } catch (err: any) {
        console.error(err);
        
        // Tradução de erros comuns do Supabase
        let msg = err.message || 'Ocorreu um erro. Verifique suas credenciais.';
        
        if (msg.includes('Invalid login credentials')) {
            msg = 'E-mail ou senha incorretos.';
        } else if (msg.includes('User already registered')) {
            msg = 'Este e-mail já está cadastrado.';
        } else if (msg.includes('Password should be at least')) {
            msg = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (msg.includes('Email not confirmed')) {
            msg = 'Verifique seu e-mail para confirmar o cadastro.';
        }

        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Botão de Tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all z-20 group"
        title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
      >
        {isDarkMode ? (
          <Sun size={20} className="group-hover:text-amber-500 transition-colors" />
        ) : (
          <Moon size={20} className="group-hover:text-blue-500 transition-colors" />
        )}
      </button>

      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white mb-4 shadow-lg shadow-blue-500/30">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
            {isSignUpMode ? 'Criar Conta' : 'Bem-vindo ao NutriVida'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isSignUpMode ? 'Preencha os dados para começar' : 'Entre para gerenciar seus pacientes'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">E-mail</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Senha</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-11 pr-12 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center justify-center animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center justify-center animate-in slide-in-from-top-2">
              {successMessage}
            </div>
          )}

          {!isSignUpMode && (
            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">Lembrar de mim</span>
                </label>
                <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Esqueceu a senha?</a>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {isSignUpMode ? 'Criar Conta' : 'Entrar no Sistema'} 
                {isSignUpMode ? <UserPlus size={20} /> : <LogIn size={20} />}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isSignUpMode ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            {' '}
            <button 
                type="button"
                onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setError('');
                    setSuccessMessage('');
                }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
                {isSignUpMode ? 'Fazer login' : 'Criar conta'}
            </button>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-center text-xs text-slate-400 dark:text-slate-600">
        &copy; {new Date().getFullYear()} NutriVida App. Todos os direitos reservados.
      </div>
    </div>
  );
};