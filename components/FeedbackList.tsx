import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Feedback } from '../types';
import { MessageSquare, CheckCircle, Clock, User, Trash2 } from 'lucide-react';

interface FeedbackListProps {
  userId: string;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({ userId }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchFeedbacks();
  }, [userId]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      // Fetch feedbacks and join with patients table to get patient name
      const { data, error } = await supabase
        .from('feedbacks')
        .select(`
          *,
          patient:patients (
            name,
            "avatarColor"
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match Feedback interface
      const formattedFeedbacks: Feedback[] = (data || []).map((item: any) => ({
        id: item.id,
        patient_id: item.patient_id,
        message: item.message,
        created_at: item.created_at,
        read: item.read,
        patient: item.patient ? {
          name: item.patient.name,
          avatarColor: item.patient.avatarColor
        } : undefined
      }));

      setFeedbacks(formattedFeedbacks);
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setFeedbacks(prev => 
        prev.map(f => f.id === id ? { ...f, read: true } : f)
      );
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este feedback?')) return;

    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir feedback:', error);
      alert(`Erro ao excluir feedback: ${error.message || 'Verifique as permissões.'}`);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === 'unread') return !f.read;
    if (filter === 'read') return f.read;
    return true;
  });

  const unreadCount = feedbacks.filter(f => !f.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-blue-600" />
            Feedbacks dos Pacientes
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gerencie as mensagens e feedbacks enviados pelos seus pacientes.
          </p>
        </div>

        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'unread' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Não Lidos
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'read' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Lidos
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Nenhum feedback encontrado</h3>
            <p className="text-slate-400 dark:text-slate-500">Não há mensagens nesta categoria.</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div 
              key={feedback.id} 
              className={`bg-white dark:bg-slate-800 rounded-xl p-5 border transition-all hover:shadow-md ${
                feedback.read 
                  ? 'border-slate-100 dark:border-slate-700 opacity-75 hover:opacity-100' 
                  : 'border-blue-100 dark:border-blue-900/30 shadow-sm ring-1 ring-blue-50 dark:ring-blue-900/20'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${feedback.patient?.avatarColor || 'bg-slate-400'}`}
                  >
                    {feedback.patient?.name?.charAt(0).toUpperCase() || <User size={20} />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800 dark:text-white">
                        {feedback.patient?.name || 'Paciente Desconhecido'}
                      </h4>
                      {!feedback.read && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Novo
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                      {feedback.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(feedback.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!feedback.read && (
                    <button
                      onClick={() => markAsRead(feedback.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Marcar como lido"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteFeedback(feedback.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    title="Excluir feedback"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
