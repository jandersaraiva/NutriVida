import React, { useState } from 'react';
import { Patient } from '../types';
import { User, Mail, Phone, MapPin, Briefcase, Instagram, Save, X, Edit2, Key, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PatientProfileProps {
  patient: Patient;
  onUpdate: (updatedPatient: Patient) => Promise<void>;
  readOnly?: boolean;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onUpdate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Patient>(patient);
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [unlinkStatus, setUnlinkStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    await onUpdate(formData);
    setIsEditing(false);
  };

  const handleSendPasswordReset = async () => {
    if (!formData.email) return;
    setResetStatus('sending');
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
            redirectTo: window.location.origin, // Redireciona para o app após reset
        });

        if (error) throw error;
        setResetStatus('success');
    } catch (error) {
        console.error("Erro ao enviar reset de senha:", error);
        setResetStatus('error');
    }
  };

  const handleUnlinkUser = async () => {
    if (!confirm("Tem certeza? Isso desconectará o paciente de qualquer conta de login atual. Ele precisará fazer login novamente para se reconectar.")) return;
    
    setUnlinkStatus('loading');
    try {
        // Atualiza no banco removendo o auth_user_id
        const { error } = await supabase
            .from('patients')
            .update({ auth_user_id: null })
            .eq('id', patient.id);

        if (error) throw error;

        // Atualiza localmente
        const updated = { ...patient, auth_user_id: null }; // Nota: auth_user_id não está na interface Patient padrão, mas o Supabase retorna.
        // Como não temos auth_user_id na interface Patient, vamos apenas chamar onUpdate com os dados atuais para forçar refresh se necessário,
        // mas o ideal seria recarregar os dados.
        // Vamos assumir que o onUpdate lida com isso ou que o pai recarrega.
        
        setUnlinkStatus('success');
        alert("Vínculo de login removido com sucesso! O paciente poderá se vincular novamente no próximo login.");
    } catch (error) {
        console.error("Erro ao desvincular:", error);
        setUnlinkStatus('error');
    }
  };

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 max-w-4xl mx-auto border border-slate-100 dark:border-slate-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
        <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <User size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dados Pessoais</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie as informações cadastrais e de acesso</p>
            </div>
        </div>
        
        {!readOnly && (
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <button 
                            onClick={() => {
                                setIsEditing(false);
                                setFormData(patient); // Revert
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                        >
                            <X size={18} /> Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                        >
                            <Save size={18} /> Salvar Alterações
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium text-sm"
                    >
                        <Edit2 size={18} /> Editar Dados
                    </button>
                )}
            </div>
        )}
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nome Completo</label>
            <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    value={formData.name} 
                    disabled={!isEditing} 
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none`} 
                />
            </div>
        </div>

        <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email (Login)</label>
            <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="email" 
                    value={formData.email} 
                    disabled={!isEditing} 
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none`} 
                />
            </div>
        </div>

        <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Telefone</label>
            <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    value={formData.phone} 
                    disabled={!isEditing} 
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none`} 
                />
            </div>
        </div>

        <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Data de Nascimento</label>
            <input 
                type="date" 
                value={formData.birthDate} 
                disabled={!isEditing} 
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none`} 
            />
        </div>

        <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Gênero</label>
            <select 
                value={formData.gender} 
                disabled={!isEditing} 
                onChange={(e) => handleChange('gender', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none appearance-none`}
            >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
            </select>
        </div>

        <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Profissão</label>
            <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    value={formData.profession} 
                    disabled={!isEditing} 
                    onChange={(e) => handleChange('profession', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none`} 
                />
            </div>
        </div>

        <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Instagram</label>
            <div className="relative">
                <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    value={formData.instagram} 
                    disabled={!isEditing} 
                    onChange={(e) => handleChange('instagram', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none`} 
                />
            </div>
        </div>

        <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Endereço</label>
            <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    value={formData.address || ''} 
                    disabled={!isEditing} 
                    onChange={(e) => handleChange('address', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none`} 
                />
            </div>
        </div>

        <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Objetivo</label>
            <input 
                type="text" 
                value={formData.objective} 
                disabled={!isEditing} 
                onChange={(e) => handleChange('objective', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${isEditing ? 'bg-white dark:bg-slate-900 border-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} text-slate-700 dark:text-slate-200 transition-all outline-none`} 
            />
        </div>
      </div>

      {/* Login Management Section (Only for Nutritionist) */}
      {!readOnly && (
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Key size={20} className="text-amber-500" />
                Gestão de Acesso e Login
            </h3>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Redefinição de Senha</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Se o paciente esqueceu a senha, você pode enviar um e-mail com um link para ele criar uma nova.
                            Isso é mais seguro do que definir uma senha manualmente.
                        </p>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleSendPasswordReset}
                                disabled={resetStatus === 'sending' || resetStatus === 'success'}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {resetStatus === 'sending' ? 'Enviando...' : 'Enviar Email de Redefinição'}
                                <Mail size={16} />
                            </button>
                            
                            {resetStatus === 'success' && (
                                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-1">
                                    <CheckCircle size={16} /> Email enviado!
                                </span>
                            )}
                            {resetStatus === 'error' && (
                                <span className="text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-1">
                                    <AlertTriangle size={16} /> Erro ao enviar.
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-px bg-slate-200 dark:bg-slate-700 self-stretch hidden md:block"></div>

                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Problemas de Vínculo?</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Se o paciente criou uma conta com o email errado ou está tendo problemas para acessar, você pode desvincular o login atual para que ele tente novamente.
                        </p>
                        
                        <button 
                            onClick={handleUnlinkUser}
                            disabled={unlinkStatus === 'loading'}
                            className="px-4 py-2 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Lock size={16} />
                            {unlinkStatus === 'loading' ? 'Desvinculando...' : 'Desvincular Login Atual'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
