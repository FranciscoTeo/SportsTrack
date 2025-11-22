import React, { useState, useEffect } from 'react';
import { Item, UserRole } from '../types';
import { Card, Button, Input, Badge } from './Layout';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';

interface InventoryProps {
  userRole: UserRole;
  items: Item[];
  onAdd: (item: Item) => void;
  onDelete: (id: string) => void;
  onUpdate: (item: Item) => void;
  targetItemId?: string | null;
  onClearTarget?: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({ userRole, items, onAdd, onDelete, onUpdate, targetItemId, onClearTarget }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Item>>({ name: '', category: '', quantity: 0, description: '' });

  const isAdmin = userRole === 'admin';

  // Effect to handle incoming navigation from Dashboard "Substituir" button
  useEffect(() => {
    if (targetItemId && items.length > 0 && isAdmin) {
      const itemToEdit = items.find(i => i.id === targetItemId);
      if (itemToEdit) {
        handleEditClick(itemToEdit);
        // Clear the target so it doesn't loop if we close/re-open without navigation
        if (onClearTarget) onClearTarget();
      }
    }
  }, [targetItemId, items, onClearTarget, isAdmin]);

  const resetForm = () => {
    setFormData({ name: '', category: '', quantity: 0, description: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (item: Item) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      description: item.description
    });
    setEditingId(item.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.quantity !== undefined) {
        if (editingId) {
            // Update Mode
            onUpdate({
                id: editingId,
                name: formData.name,
                category: formData.category || 'Geral',
                quantity: Number(formData.quantity),
                description: formData.description || '',
            });
        } else {
            // Create Mode
            onAdd({
                id: Date.now().toString(),
                name: formData.name,
                category: formData.category || 'Geral',
                quantity: Number(formData.quantity),
                description: formData.description || '',
            });
        }
        resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inventário</h2>
        {isAdmin && (
          <div className="flex gap-2">
              <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
                  <Plus size={20} className="mr-1" /> Novo Item
              </Button>
          </div>
        )}
      </div>

      {isFormOpen && isAdmin && (
        <Card className="p-6 border-blue-100 dark:border-slate-700 shadow-md mb-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            {editingId ? <Edit2 size={18} className="text-primary"/> : <Plus size={18} className="text-primary"/>}
            {editingId ? 'Editar Equipamento' : 'Adicionar Novo Equipamento'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Nome do Item" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Bola de Basquetebol Wilson"
              />
              <Input 
                label="Categoria" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="Ex: Bolas"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                label="Quantidade Total" 
                type="number" 
                min="0"
                value={formData.quantity} 
                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
              </div>
              <textarea 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição técnica do equipamento..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" className="flex items-center gap-2">
                <Save size={16} />
                {editingId ? 'Atualizar e Guardar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id} className={`p-0 overflow-hidden group hover:shadow-md transition-shadow ${editingId === item.id ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
             <div className="h-2 bg-primary/10 dark:bg-primary/30 w-full" />
             <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <Badge color="blue">{item.category}</Badge>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="p-1 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDelete(item.id)} 
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Apagar"
                          >
                            <Trash2 size={16} />
                          </button>
                      </div>
                    )}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {item.description || "Sem descrição."}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Quantidade em Stock</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{item.quantity} un.</span>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};