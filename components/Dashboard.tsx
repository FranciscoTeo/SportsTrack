
import React from 'react';
import { User, Item, Reservation } from '../types';
import { Card, Badge } from './Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Package, Users as UsersIcon, Activity, AlertOctagon, Wrench, History, CheckCircle, XCircle, Palette, Trash2, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  user: User;
  items: Item[];
  users: User[];
  reservations: Reservation[];
  onFixDamage?: (reservationId: string, itemId: string) => void;
  onResolveDamage?: (reservationId: string, itemId: string) => void;
  onUpdateTheme?: (color: string) => void;
  onDeleteAccount?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, items, users, reservations, onFixDamage, onResolveDamage, onUpdateTheme, onDeleteAccount }) => {
  // Stats Calculation
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const activeReservations = reservations.filter(r => r.status === 'active').length;
  // Only count coaches from the same club if user is admin
  const coachCount = users.filter(u => u.role === 'coach' && u.clubName === user.clubName).length;

  // Get ALL damage reports for history
  const allDamageReports = reservations
    .filter(r => r.damageReports && r.damageReports.length > 0)
    .flatMap(r => r.damageReports!.map(report => ({ ...report, reservationId: r.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Recent unresolved damages for top alert box
  const recentUnresolvedDamages = allDamageReports
    .filter(item => !item.isResolved)
    .slice(0, 5);

  // Generate last 7 days data dynamically
  const generateChartData = () => {
    const data = [];
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        
        const count = reservations.filter(r => r.date === dateStr).length;
        
        data.push({
            name: days[d.getDay()],
            fullDate: dateStr,
            bookings: count
        });
    }
    return data;
  };

  const chartData = generateChartData();

  const THEME_COLORS = [
    { name: 'Azul', hex: '#2563eb', class: 'bg-blue-600' },
    { name: 'Índigo', hex: '#4f46e5', class: 'bg-indigo-600' },
    { name: 'Roxo', hex: '#7c3aed', class: 'bg-violet-600' },
    { name: 'Esmeralda', hex: '#059669', class: 'bg-emerald-600' },
    { name: 'Vermelho', hex: '#dc2626', class: 'bg-red-600' },
    { name: 'Laranja', hex: '#ea580c', class: 'bg-orange-600' },
    { name: 'Preto', hex: '#1e293b', class: 'bg-slate-800' },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="p-6 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Olá, {user.name} 👋</h2>
        <p className="text-slate-500 dark:text-slate-400">Aqui está o resumo do {user.clubName || 'clube'} hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Reservas Ativas" value={activeReservations} icon={Calendar} color="bg-blue-500" />
        <StatCard title="Total Equipamento" value={totalItems} icon={Package} color="bg-indigo-500" />
        {user.role === 'admin' && (
          <StatCard title="Equipa Técnica" value={coachCount} icon={UsersIcon} color="bg-teal-500" />
        )}
         {user.role === 'coach' && (
          <StatCard title="As Minhas Reservas" value={reservations.filter(r => r.coachId === user.id && r.status === 'active').length} icon={Activity} color="bg-teal-500" />
        )}
      </div>

      {/* Urgent Maintenance Alert for Admins */}
      {user.role === 'admin' && recentUnresolvedDamages.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex flex-col gap-3">
           <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
              <AlertOctagon size={20} />
              <h3>Alertas de Manutenção (Pendentes)</h3>
           </div>
           <div className="grid gap-2">
             {recentUnresolvedDamages.map((dmg, idx) => (
               <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full text-red-600 dark:text-red-300">
                      <Wrench size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {dmg.itemName} <span className="text-red-600 dark:text-red-400">danificado (-{dmg.quantityDamaged})</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Reportado por {dmg.reportedBy}: "{dmg.description}"</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onFixDamage && onFixDamage(dmg.reservationId, dmg.itemId)}
                    className="text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1.5 rounded hover:bg-red-200 dark:hover:bg-red-900/50 hover:shadow-sm transition-all"
                  >
                    Substituir
                  </button>
               </div>
             ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Atividade Semanal</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="bookings" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fullDate === new Date().toISOString().split('T')[0] ? 'var(--color-primary)' : '#94a3b8'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Reservas Recentes</h3>
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Sem reservas.</p>
              ) : (
                reservations.slice(0, 4).map(res => (
                  <div key={res.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${res.status === 'active' ? 'bg-blue-500' : res.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                          {res.items.length === 1 
                              ? res.items[0].itemName 
                              : `${res.items.length} itens (${res.items.map(i => i.itemName).join(', ')})`}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{res.date} • {res.startTime}</p>
                      <p className="text-xs text-slate-400 mt-1">Por: {res.coachName}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Theme Picker for Admin */}
          {user.role === 'admin' && onUpdateTheme && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                  <Palette size={20} className="text-slate-500 dark:text-slate-400" />
                  <h3 className="text-lg font-semibold">Personalização Visual</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Selecione a cor principal da aplicação:</p>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => onUpdateTheme(color.hex)}
                    className={`w-8 h-8 rounded-full ${color.class} hover:scale-110 transition-transform ring-2 ring-white dark:ring-slate-700 shadow-md`}
                    title={color.name}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* DAMAGE HISTORY TABLE - ADMIN ONLY */}
      {user.role === 'admin' && (
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
              <History size={20} className="text-slate-500 dark:text-slate-400" />
              <h3 className="text-lg font-semibold">Histórico de Danos e Manutenção</h3>
          </div>
          
          {allDamageReports.length === 0 ? (
             <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
               <p className="text-slate-400">Sem registo de danos.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Qtd</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Reportado Por</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {allDamageReports.map((report, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{report.itemName}</td>
                      <td className="px-4 py-3 text-red-600 dark:text-red-400 font-bold">-{report.quantityDamaged}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{report.description}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{report.reportedBy}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(report.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                         {report.isResolved ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              <CheckCircle size={12} /> Resolvido
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                              <AlertOctagon size={12} /> Pendente
                           </span>
                         )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!report.isResolved && onResolveDamage ? (
                          <button 
                            onClick={() => onResolveDamage(report.reservationId, report.itemId)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
                          >
                            Marcar Resolvido
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* DANGER ZONE - ADMIN ONLY */}
      {user.role === 'admin' && onDeleteAccount && (
        <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-10 pb-4">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> Zona de Perigo
            </h3>
            <Card className="p-6 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Eliminar Conta do Clube</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Esta ação irá apagar permanentemente a sua conta de administrador.
                            <br/>⚠️ <strong>ATENÇÃO:</strong> Todos os treinadores associados a este clube também serão eliminados automaticamente.
                        </p>
                    </div>
                    <button 
                        onClick={onDeleteAccount}
                        className="px-4 py-2 bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-900 hover:border-red-600 transition-colors font-medium flex items-center gap-2 shrink-0"
                    >
                        <Trash2 size={18} />
                        Eliminar Conta
                    </button>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};
