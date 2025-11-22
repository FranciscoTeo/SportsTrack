import React from 'react';
import { User } from '../types';
import { Card, Badge } from './Layout';
import { Shield, Users, Building2, Mail, Hash } from 'lucide-react';

interface SuperAdminDashboardProps {
  allUsers: User[];
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ allUsers }) => {
  const admins = allUsers.filter(u => u.role === 'admin');
  const coaches = allUsers.filter(u => u.role === 'coach');

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="text-purple-600" />
          Painel de Super Administrador
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Visão global de todos os registos na plataforma.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Utilizadores</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{allUsers.length}</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Clubes (Admins)</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{admins.length}</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Treinadores</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{coaches.length}</h3>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-blue-500" />
                Clubes & Administradores
            </h3>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-3 font-medium">Nome do Clube</th>
                        <th className="px-6 py-3 font-medium">Administrador</th>
                        <th className="px-6 py-3 font-medium">Email</th>
                        <th className="px-6 py-3 font-medium">ID</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {admins.length === 0 ? (
                         <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum clube registado.</td>
                         </tr>
                    ) : (
                        admins.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-3 font-bold text-slate-800 dark:text-slate-200">{u.clubName}</td>
                            <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{u.name}</td>
                            <td className="px-6 py-3 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Mail size={14} /> {u.email}
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-400 font-mono">{u.id}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </Card>
        </section>

        <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-green-500" />
                Treinadores Registados
            </h3>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-3 font-medium">Nome</th>
                        <th className="px-6 py-3 font-medium">Email</th>
                        <th className="px-6 py-3 font-medium">Role</th>
                        <th className="px-6 py-3 font-medium">ID</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {coaches.length === 0 ? (
                         <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum treinador registado.</td>
                         </tr>
                    ) : (
                        coaches.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                            <td className="px-6 py-3 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Mail size={14} /> {u.email}
                            </td>
                            <td className="px-6 py-3">
                                <Badge color="green">Treinador</Badge>
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-400 font-mono">{u.id}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </Card>
        </section>
      </div>
    </div>
  );
};
