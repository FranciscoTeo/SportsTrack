import React, { useState } from 'react';
import { User } from '../types';
import { Card, Button, Badge, Input } from './Layout';
import { CheckCircle, CreditCard, Star, ShieldCheck, Calendar, AlertCircle, X, Lock, Loader2 } from 'lucide-react';

interface SubscriptionProps {
  user: User;
  onUpgrade: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ user, onUpgrade }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Payment Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentError, setPaymentError] = useState('');

  if (!user.subscription) return null;

  const isTrial = user.subscription.status === 'trial';
  const isActive = user.subscription.status === 'active';
  const endDate = new Date(user.subscription.endDate).toLocaleDateString('pt-PT');
  
  const daysLeft = Math.ceil((new Date(user.subscription.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  // Formatters
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    // Basic Validation
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setPaymentError('Número de cartão inválido.');
      return;
    }
    if (expiry.length < 5) {
      setPaymentError('Data de validade inválida.');
      return;
    }
    if (cvc.length < 3) {
      setPaymentError('CVC inválido.');
      return;
    }
    if (!cardName) {
        setPaymentError('Nome do titular obrigatório.');
        return;
    }

    setIsProcessing(true);
    
    // Simulate Bank API Call
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      onUpgrade();
      // Reset form
      setCardName('');
      setCardNumber('');
      setExpiry('');
      setCvc('');
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="text-green-600 dark:text-green-400" size={20} />
                 <h3 className="font-bold text-slate-900 dark:text-white">Pagamento Seguro</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6 text-center">
                 <p className="text-sm text-slate-500 dark:text-slate-400">Total a pagar</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">5,00 €</p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Titular do Cartão</label>
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Como aparece no cartão"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        />
                        <CreditCard size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Número do Cartão</label>
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:text-white font-mono"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        />
                        <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                        <div className="absolute right-3 top-2.5 flex gap-1">
                           {/* Simple visual indicators for card types */}
                           <div className="w-8 h-5 bg-slate-200 dark:bg-slate-600 rounded"></div>
                           <div className="w-8 h-5 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Validade (MM/AA)</label>
                        <input 
                            type="text"
                            placeholder="MM/AA"
                            maxLength={5}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:text-white text-center"
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">CVC</label>
                        <input 
                            type="text"
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:text-white text-center"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                </div>

                {paymentError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                        <AlertCircle size={16} />
                        {paymentError}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                           <Loader2 size={20} className="animate-spin" />
                           A processar pagamento...
                        </>
                    ) : (
                        `Pagar 5,00 €`
                    )}
                </button>
                
                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                    <Lock size={10} />
                    Pagamento encriptado SSL de 256-bits
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">A Minha Assinatura</h2>
        {isTrial && daysLeft > 0 && (
           <Badge color="yellow">Período de Teste: {daysLeft} dias restantes</Badge>
        )}
        {isActive && (
           <Badge color="green">Subscrição Ativa</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Status Card */}
        <Card className="p-6 border-t-4 border-t-primary h-full flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-