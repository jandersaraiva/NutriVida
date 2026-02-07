
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Nutritionist } from '../types';
import { User, Phone, Mail, BadgeCheck, Save, CheckCircle, Camera, Calendar, Cake } from 'lucide-react';

interface NutritionistProfileProps {
  data: Nutritionist;
  onSave: (data: Nutritionist) => void;
}

export const NutritionistProfile: React.FC<NutritionistProfileProps> = ({ data, onSave }) => {
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

  const calculateAge = useMemo(() => {
    if (!formData.birthDate) return null;
    const birth = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  }, [formData.birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            
            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm bg-emerald-100 flex items-center justify-center">
                {formData.photo ? (
                  <img src={formData.photo} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-emerald-600">
                    {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'NU'}
                  </span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                title="Alterar foto"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-1">{formData.name || 'Seu Nome'}</h2>
            <p className="text-slate-500 text-sm mb-2">{formData.crn || 'CRN não informado'}</p>
            
            {calculateAge !== null && (
               <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  <Cake size={14} className="text-pink-500" />
                  {calculateAge} anos
               </div>
            )}
            
            <div className="mt-6 w-full pt-6 border-t border-slate-50">
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span>Conta Profissional Ativa</span>
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="w-full md:w-2/3">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Dados do Profissional</h3>
                {showSuccess && (
                    <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 animate-pulse">
                        <CheckCircle size={16} /> Salvo com sucesso!
                    </span>
                )}
            </div>
            
            <div className="p-6 space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User size={14} /> Informações Pessoais
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Ex: Dr. Fulano de Tal"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Idade</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    disabled
                                    value={calculateAge !== null ? `${calculateAge} anos` : '-'}
                                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CRN / Registro</label>
                            <div className="relative">
                                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="crn"
                                    value={formData.crn}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Ex: CRN-3 12345"
                                />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Profissional</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="email@clinica.com"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                    type="submit"
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 font-medium"
                >
                    <Save size={18} /> Salvar Alterações
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
