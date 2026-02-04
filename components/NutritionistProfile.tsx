import React, { useState, useEffect } from 'react';
import { Nutritionist } from '../types';
import { User, Building, Phone, Mail, BadgeCheck, MapPin, Save, CheckCircle } from 'lucide-react';

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
    clinicName: '',
    address: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (data) {
        setFormData(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
            <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 text-4xl font-bold border-4 border-white shadow-sm">
              {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'NU'}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{formData.name || 'Seu Nome'}</h2>
            <p className="text-emerald-600 font-medium mb-1">{formData.clinicName || 'Nome da Clínica'}</p>
            <p className="text-slate-400 text-sm">{formData.crn || 'CRN não informado'}</p>
            
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
                        <div>
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <hr className="border-slate-100" />

                {/* Clinic Info */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Building size={14} /> Dados da Clínica
                    </h4>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Clínica / Consultório</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                name="clinicName"
                                value={formData.clinicName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Ex: Clínica Bem Estar"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Rua, Número, Bairro, Cidade - UF"
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