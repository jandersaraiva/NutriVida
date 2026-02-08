import React, { useState, useEffect, useRef } from 'react';
import { Nutritionist } from '../types';
import { User, Phone, Mail, BadgeCheck, Save, Camera, Calendar, Trash2, Upload } from 'lucide-react';

interface NutritionistProfileProps {
  data: Nutritionist;
  onSave: (data: Nutritionist) => void;
  onResetData?: () => void;
}

export const NutritionistProfile: React.FC<NutritionistProfileProps> = ({ data, onSave, onResetData }) => {
  const [formData, setFormData] = useState<Nutritionist>(data || {
    name: '',
    crn: '',
    email: '',
    phone: '',
    birthDate: '',
    photo: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) {
        setFormData(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Notification */}
      {showSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-center animate-in fade-in slide-in-from-top-4 fixed top-6 right-6 z-50 shadow-lg">
          <BadgeCheck className="mr-2" size={20} />
          <span className="font-medium">Perfil atualizado com sucesso!</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Identity Card */}
        <div className="w-full md:w-1/3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center text-center h-full">
            
            <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                {formData.photo ? (
                  <img src={formData.photo} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300 dark:text-slate-600" />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                <Upload size={14} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{formData.name || 'Seu Nome'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{formData.crn || 'CRN não informado'}</p>

            <div className="w-full pt-6 border-t border-slate-100 dark:border-slate-700 mt-auto">
                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-3">Ações da Conta</div>
                {onResetData && (
                    <button 
                        onClick={onResetData}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-sm font-medium"
                    >
                        <Trash2 size={16} /> Resetar Todos os Dados
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* Right Column: Form Details */}
        <div className="w-full md:w-2/3">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                    Informações Profissionais
                </h3>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome Completo</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name} 
                            onChange={handleChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Dr(a). Exemplo da Silva"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Registro Profissional (CRN)</label>
                            <div className="relative">
                                <BadgeCheck className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    name="crn"
                                    value={formData.crn} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="CRN-3 12345"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data de Nascimento</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                <input 
                                    type="date" 
                                    name="birthDate"
                                    value={formData.birthDate} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-mail Profissional</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="email@clinica.com.br"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Telefone / WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    name="phone"
                                    value={formData.phone} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button 
                        type="submit"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Save size={18} />
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};