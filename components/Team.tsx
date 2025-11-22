import React, { useState } from 'react';
import { User } from '../types';
import { Card, Button, Input } from './Layout';
import { UserPlus, Trash2, Mail, CheckCircle, Key } from 'lucide-react';

interface TeamProps {
  coaches: User[];
  onAdd: (coach: User) => void;
  onDelete: (id: string) => void;
}

export const Team: React.FC<TeamProps> = ({ coaches, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onAdd({
        id: `coach-${Date.now()}`,
        name,
        email,
        role: 'coach',
        password: '123', // Default temporary password
        mustChangePassword: true
      });
      setName('');
      setEmail('');
      setInviteSent(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setInviteSent(false), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Equipa</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid gap-4">
          {coaches.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-400">Nenhum treinador registado.</p>
            </div>
          ) : (
            coaches.map(coach => (
              <Card key={coach.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                    {coach.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{coach.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Mail size={12} /> {coach.email}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => onDelete(coach.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                  <Trash2 size={18} />
                </Button>
              </Card>
            ))
          )}
        </div>

        <div>
          <Card className="p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                <UserPlus size={20} />
                <h3 className="font-bold">Novo Treinador</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Nome Completo" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Carlos Silva"
              />
              <Input 
                label="Email Corporativo" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="carlos@clube.com"
              />

              {inviteSent && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-lg flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 border border-green-200 dark:border-green-900/30">
                   <div className="flex items-center gap-2 font-bold">
                      <CheckCircle size={14} />
                      Treinador adicionado!
                   </div>
                   <div className="flex items-center gap-2 mt-1 text-slate-600 dark:text-slate-300">
                      <Key size={14} className="text-yellow-500" />
                      Password Temporária: <strong>123</strong>
                   </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!name || !email}>
                Adicionar Treinador
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};