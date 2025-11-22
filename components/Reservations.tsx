import React, { useState, useMemo } from 'react';
import { User, Item, Reservation, ReservationItem, DamageReport } from '../types';
import { Card, Button, Input, Badge } from './Layout';
import { Calendar as CalendarIcon, Clock, ShoppingBag, XCircle, AlertCircle, Plus, Trash2, CheckCircle, AlertTriangle, Edit2, X } from 'lucide-react';

interface ReservationsProps {
  user: User;
  items: Item[];
  reservations: Reservation[];
  onAdd: (res: Reservation) => { success: boolean; message: string };
  onUpdate: (res: Reservation) => { success: boolean; message: string };
  onCancel: (id: string) => void;
  onReturn: (id: string, damageReports: DamageReport[]) => void;
}

export const Reservations: React.FC<ReservationsProps> = ({ user, items, reservations, onAdd, onUpdate, onCancel, onReturn }) => {
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // "Cart" State for multiple items
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<ReservationItem[]>([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [reservationToReturn, setReservationToReturn] = useState<Reservation | null>(null);
  const [hasDamage, setHasDamage] = useState(false);
  const [damageList, setDamageList] = useState<{itemId: string, qty: number, desc: string}[]>([]);

  // Filter logic
  const myReservations = useMemo(() => {
      if (user.role === 'admin') return reservations;
      return reservations.filter(r => r.coachId === user.id);
  }, [reservations, user]);

  const handleAddToCart = () => {
    if (!selectedItemId) return;
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    if (quantity <= 0) {
        setError("A quantidade deve ser maior que zero.");
        return;
    }
    
    if (quantity > item.quantity) {
        setError(`Quantidade excede o stock total (${item.quantity}).`);
        return;
    }

    // Check if item already in cart
    const existingInCart = cart.find(i => i.itemId === selectedItemId);
    if (existingInCart) {
        if (existingInCart.quantity + quantity > item.quantity) {
            setError(`Total no carrinho excede o stock disponível.`);
            return;
        }
        setCart(prev => prev.map(i => i.itemId === selectedItemId ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
        setCart(prev => [...prev, { itemId: item.id, itemName: item.name, quantity }]);
    }
    
    // Reset selection
    setError('');
    setQuantity(1);
    setSelectedItemId('');
  };

  const removeFromCart = (itemId: string) => {
      setCart(prev => prev.filter(i => i.itemId !== itemId));
  };

  const startEditing = (res: Reservation) => {
      setEditingId(res.id);
      setDate(res.date);
      setStartTime(res.startTime);
      setEndTime(res.endTime);
      setCart(JSON.parse(JSON.stringify(res.items))); // Deep copy to avoid reference issues
      setError('');
      setSuccess('');
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
      setEditingId(null);
      setDate('');
      setStartTime('');
      setEndTime('');
      setCart([]);
      setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (cart.length === 0) {
        setError("Adicione pelo menos um item à reserva.");
        return;
    }
    if (!date || !startTime || !endTime) {
        setError("Defina a data e o horário da reserva.");
        return;
    }

    if (startTime >= endTime) {
        setError("A hora de fim deve ser posterior à hora de início.");
        return;
    }

    let result;

    if (editingId) {
        // UPDATE EXISTING
        const updatedRes: Reservation = {
            // Keep existing ID and coach info
            id: editingId,
            items: cart,
            coachId: user.id, 
            coachName: user.name,
            date,
            startTime,
            endTime,
            status: 'active'
        };
        result = onUpdate(updatedRes);
    } else {
        // CREATE NEW
        const newRes: Reservation = {
            id: `res-${Date.now()}`,
            items: cart,
            coachId: user.id,
            coachName: user.name,
            date,
            startTime,
            endTime,
            status: 'active'
        };
        result = onAdd(newRes);
    }

    if (result.success) {
        setSuccess(result.message);
        // Reset form completely
        setEditingId(null);
        setDate('');
        setStartTime('');
        setEndTime('');
        setCart([]);
        setTimeout(() => setSuccess(''), 4000);
    } else {
        setError(result.message);
    }
  };

  // Return Logic
  const openReturnModal = (res: Reservation) => {
    setReservationToReturn(res);
    setHasDamage(false);
    setDamageList([]);
    setReturnModalOpen(true);
  };

  const toggleDamageItem = (itemId: string) => {
    if (damageList.some(d => d.itemId === itemId)) {
      setDamageList(prev => prev.filter(d => d.itemId !== itemId));
    } else {
      setDamageList(prev => [...prev, { itemId, qty: 1, desc: '' }]);
    }
  };

  const updateDamageDetails = (itemId: string, field: 'qty' | 'desc', value: string | number) => {
    setDamageList(prev => prev.map(d => {
      if (d.itemId === itemId) {
        return { ...d, [field]: value };
      }
      return d;
    }));
  };

  const submitReturn = () => {
    if (!reservationToReturn) return;

    const reports: DamageReport[] = damageList.map(d => {
      const item = reservationToReturn.items.find(i => i.itemId === d.itemId);
      return {
        itemId: d.itemId,
        itemName: item ? item.itemName : 'Unknown',
        quantityDamaged: Number(d.qty),
        description: d.desc || 'Danificado',
        reportedBy: user.name,
        date: new Date().toISOString()
      };
    });

    onReturn(reservationToReturn.id, reports);
    setReturnModalOpen(false);
    setReservationToReturn(null);
  };

  return (
    <div className="space-y-6 relative">
       {/* Return Modal Overlay */}
       {returnModalOpen && reservationToReturn && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
             <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Devolução de Material</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">
               Está a devolver a reserva de <strong>{reservationToReturn.date}</strong>. 
               <br/>O material está em boas condições?
             </p>

             <div className="flex gap-4 mb-6">
               <button 
                onClick={() => setHasDamage(false)}
                className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${!hasDamage ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-green-200 dark:hover:border-green-800'}`}
               >
                 <CheckCircle size={24} />
                 <span className="font-bold">Sim, tudo OK</span>
               </button>
               <button 
                onClick={() => setHasDamage(true)}
                className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${hasDamage ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-red-200 dark:hover:border-red-800'}`}
               >
                 <AlertTriangle size={24} />
                 <span className="font-bold">Não, há danos</span>
               </button>
             </div>

             {hasDamage && (
               <div className="mb-6 space-y-4 max-h-60 overflow-y-auto pr-2">
                 <p className="text-sm font-medium text-slate-900 dark:text-white">Selecione os itens danificados:</p>
                 {reservationToReturn.items.map(item => {
                   const isSelected = damageList.some(d => d.itemId === item.itemId);
                   const detail = damageList.find(d => d.itemId === item.itemId);

                   return (
                     <div key={item.itemId} className={`p-3 rounded-lg border ${isSelected ? 'border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                       <div className="flex items-center gap-3">
                         <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => toggleDamageItem(item.itemId)}
                            className="w-5 h-5 rounded text-red-600 focus:ring-red-500 dark:bg-slate-700 dark:border-slate-600"
                         />
                         <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">{item.itemName}</span>
                         <span className="text-xs text-slate-500 dark:text-slate-400">Total: {item.quantity}</span>
                       </div>
                       
                       {isSelected && detail && (
                         <div className="mt-3 pl-8 grid gap-2">
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Qtd Danificada</label>
                              <input 
                                type="number" 
                                min="1" 
                                max={item.quantity}
                                value={detail.qty}
                                onChange={(e) => updateDamageDetails(item.itemId, 'qty', e.target.value)}
                                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Descrição do Dano</label>
                              <input 
                                type="text" 
                                placeholder="Ex: Furada, rasgado..."
                                value={detail.desc}
                                onChange={(e) => updateDamageDetails(item.itemId, 'desc', e.target.value)}
                                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded text-sm"
                              />
                            </div>
                         </div>
                       )}
                     </div>
                   )
                 })}
               </div>
             )}

             <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
               <Button variant="secondary" onClick={() => setReturnModalOpen(false)}>Cancelar</Button>
               <Button variant={hasDamage ? "danger" : "primary"} onClick={submitReturn}>Confirmar Devolução</Button>
             </div>
           </div>
         </div>
       )}

       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reservas de Material</h2>
        {user.role === 'coach' && <Badge color="green">Modo Treinador</Badge>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="order-1 xl:order-2">
            <Card className={`p-6 sticky top-6 border-blue-100 dark:border-slate-700 shadow-lg shadow-blue-100/50 dark:shadow-none transition-all ${editingId ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                        {editingId ? <Edit2 className="text-yellow-500" size={20} /> : <ShoppingBag className="text-primary" size={20} />}
                        {editingId ? 'Editar Reserva' : 'Nova Reserva'}
                    </h3>
                    {editingId && (
                        <button onClick={cancelEditing} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                            <X size={14} /> Cancelar Edição
                        </button>
                    )}
                </div>

                {editingId && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Está a editar a reserva selecionada. Clique em "Atualizar" para guardar.</span>
                  </div>
                )}
                
                {/* 1. Time Selection */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">1. Data e Hora</h4>
                    <Input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="Início" 
                            type="time" 
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                        />
                        <Input 
                            label="Fim" 
                            type="time" 
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                        />
                    </div>
                </div>

                {/* 2. Item Selection */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">2. Escolher Material</h4>
                    <div className="flex flex-col gap-2">
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                            value={selectedItemId}
                            onChange={e => setSelectedItemId(e.target.value)}
                        >
                            <option value="">Selecione o equipamento...</option>
                            {items.map(i => (
                                <option key={i.id} value={i.id}>{i.name} (Stock Total: {i.quantity})</option>
                            ))}
                        </select>
                        
                        <div className="flex gap-2">
                            <div className="w-24">
                                <Input 
                                    type="number" 
                                    min="1" 
                                    value={quantity}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    placeholder="Qtd"
                                />
                            </div>
                            <Button 
                                type="button" 
                                variant="secondary" 
                                className="flex-1 flex items-center justify-center gap-2"
                                onClick={handleAddToCart}
                                disabled={!selectedItemId}
                            >
                                <Plus size={16} /> Adicionar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 3. Cart Summary */}
                <div className="mb-6">
                     <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                         <span>3. Resumo do Pedido</span>
                         <span className="text-slate-400 font-normal text-xs">{cart.length} itens</span>
                     </h4>
                     {cart.length === 0 ? (
                         <div className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                             Nenhum item adicionado.
                         </div>
                     ) : (
                         <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                             {cart.map((item, idx) => (
                                 <li key={idx} className="flex justify-between items-center bg-white dark:bg-slate-700 p-2 rounded border border-slate-100 dark:border-slate-600 text-sm">
                                     <span className="truncate flex-1 font-medium text-slate-700 dark:text-slate-200">
                                         {item.itemName} <span className="text-slate-400">x{item.quantity}</span>
                                     </span>
                                     <button 
                                         onClick={() => removeFromCart(item.itemId)}
                                         className="text-red-400 hover:text-red-600 p-1"
                                     >
                                         <Trash2 size={14} />
                                     </button>
                                 </li>
                             ))}
                         </ul>
                     )}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-start gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-lg text-center font-medium border border-green-100 dark:border-green-900/30">
                        {success}
                    </div>
                )}

                <Button 
                    onClick={handleSubmit} 
                    className={`w-full py-3 shadow-lg ${editingId ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' : 'shadow-blue-500/20'}`} 
                    disabled={cart.length === 0 || !date || !startTime || !endTime}
                >
                    {editingId ? 'Atualizar Reserva' : 'Confirmar Reserva'}
                </Button>
            </Card>
        </div>

        {/* History List */}
        <div className="order-2 xl:order-1 xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Histórico e Próximas Reservas</h3>
            </div>
            
            {myReservations.length === 0 ? (
                 <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-400">Sem reservas registadas.</p>
                </div>
            ) : (
                myReservations.map(res => (
                    <Card key={res.id} className={`p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${editingId === res.id ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-lg mt-1 ${
                                res.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : 
                                res.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300' : 
                                'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300'
                            }`}>
                                <CalendarIcon size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300"><CalendarIcon size={14} /> {res.date}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {res.startTime} - {res.endTime}</span>
                                    {user.role === 'admin' && <span className="text-slate-400 dark:text-slate-500">• {res.coachName}</span>}
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Itens Reservados</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {res.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-slate-700 dark:text-slate-300">{item.itemName}</span>
                                                <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 rounded border border-slate-200 dark:border-slate-600 text-xs flex items-center">{item.quantity} un</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Damage Report Display inside History */}
                                    {res.damageReports && res.damageReports.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/30">
                                            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mb-1">
                                                <AlertTriangle size={12} /> Danos Reportados:
                                            </p>
                                            {res.damageReports.map((dmg, i) => (
                                                <div key={i} className="text-xs text-red-500 ml-1">
                                                    • {dmg.itemName} (-{dmg.quantityDamaged}): {dmg.description}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start justify-end gap-2">
                            <div className="flex flex-col items-end gap-2">
                                <Badge color={
                                    res.status === 'active' ? 'blue' : 
                                    res.status === 'completed' ? 'green' : 'red'
                                }>
                                    {res.status === 'active' ? 'Ativo' : 
                                     res.status === 'completed' ? 'Devolvido' : 'Cancelado'}
                                </Badge>
                                {res.status === 'active' && (
                                    <>
                                        <Button 
                                            onClick={() => openReturnModal(res)}
                                            className="w-full text-xs py-1.5"
                                        >
                                            Devolver
                                        </Button>
                                        <div className="flex gap-2 mt-1">
                                            <button 
                                                onClick={() => startEditing(res)}
                                                disabled={!!editingId}
                                                className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-200 disabled:opacity-30 disabled:hover:bg-slate-100 flex items-center gap-1 transition-all"
                                            >
                                                <Edit2 size={12} /> Editar
                                            </button>
                                            <button 
                                                onClick={() => onCancel(res.id)}
                                                className="text-xs text-slate-400 hover:text-red-500 px-2 py-1"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
      </div>
    </div>
  );
};