import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Customer } from '../db/db';
import { Plus, ChevronRight, Share2 } from 'lucide-react';
import { generateStatementPDF } from '../utils/pdfGenerator';
import { useLanguage } from '../contexts/LanguageContext';

const CustomerStatement = ({ customer, onBack }: { customer: Customer, onBack: () => void }) => {
  const { t } = useLanguage();
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;
    
    await db.payments.add({
      customerId: customer.id!,
      amount: parseFloat(paymentAmount),
      date: new Date().toISOString()
    });
    
    setPaymentAmount('');
    setShowPaymentForm(false);
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const transactions = useLiveQuery(async () => {
    const invoices = await db.invoices.where('customerId').equals(customer.id!).toArray();
    const payments = await db.payments.where('customerId').equals(customer.id!).toArray();
    
    const combined = [
      ...invoices.map(inv => ({ 
        date: inv.date, 
        type: 'Sale', 
        ref: inv.invoiceNo.toString(), 
        amount: inv.totalAmount,
        isPayment: false
      })),
      ...payments.map(pay => ({ 
        date: pay.date, 
        type: 'Payment-in', 
        ref: '-', 
        amount: pay.amount,
        isPayment: true
      }))
    ];
    
    const sortedTransactions = combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let currentBalance = 0;
    return sortedTransactions.map(t => {
      if (!t.isPayment) {
        currentBalance += t.amount;
      } else {
        currentBalance -= t.amount;
      }
      return { ...t, runningBalance: currentBalance };
    });
  }, [customer.id]);

  const filteredTransactions = transactions?.filter(t => t.date >= startDate && t.date <= endDate + 'T23:59:59.999Z') || [];
  const priorTransactions = transactions?.filter(t => t.date < startDate) || [];
  
  const openingBalance = priorTransactions.length > 0 ? priorTransactions[priorTransactions.length - 1].runningBalance : 0;
  const closingBalance = filteredTransactions.length > 0 ? filteredTransactions[filteredTransactions.length - 1].runningBalance : openingBalance;

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <button className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0' }} onClick={onBack}>
          ← {t('customers.cancel')}
        </button>
        <button 
          className="btn btn-primary" 
          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
          onClick={() => generateStatementPDF(customer, filteredTransactions, closingBalance, new Date(startDate), new Date(endDate), openingBalance)}
        >
          <Share2 size={16} /> Share PDF
        </button>
      </div>
      
      <div className="glass-panel" style={{ marginBottom: '16px' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px', fontWeight: 300 }}>PARTY STATEMENT</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Client</div>
            <div className="font-bold">{customer.name}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact</div>
            <div>{customer.phone || '-'}</div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in">
        <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--accent-primary)' }}>
           <div>
             <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Opening</div>
             <div className="font-bold" style={{ fontSize: '1.25rem' }}>₹ {openingBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
           </div>
           <div className="text-right">
             <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Net Balance</div>
             <div className="font-bold" style={{ color: closingBalance > 0 ? 'var(--accent-danger)' : 'var(--text-primary)', fontSize: '1.25rem' }}>
               ₹ {Math.abs(closingBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
             </div>
           </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          {!showPaymentForm ? (
            <button className="btn btn-success" style={{ width: '100%' }} onClick={() => setShowPaymentForm(true)}>
              <Plus size={18} /> Record Payment Received
            </button>
          ) : (
            <div className="glass-panel">
              <h4 style={{ marginBottom: '12px' }}>Record Payment</h4>
              <form onSubmit={handleRecordPayment}>
                <div className="form-group">
                  <label className="form-label">Amount Received (₹)</label>
                  <input type="number" step="0.01" className="form-control" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn" style={{ flex: 1, border: '1px solid #ccc' }} onClick={() => setShowPaymentForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                    Save Payment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>From</label>
            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>To</label>
            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <h3 style={{ marginBottom: '16px', fontWeight: 300 }}>TRANSACTIONS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTransactions.slice().reverse().map((t, i) => (
            <div key={i} className="list-card" style={{ padding: '12px' }}>
              <div>
                <div className="font-bold">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t.type}</div>
              </div>
              <div className="text-right">
                <div className={t.isPayment ? "text-success font-bold" : "text-danger font-bold"}>
                  {t.isPayment ? `+ ₹ ${t.amount.toLocaleString('en-IN')}` : `- ₹ ${t.amount.toLocaleString('en-IN')}`}
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                  Bal: ₹ {t.runningBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                </div>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="text-muted" style={{ textAlign: 'center', padding: '16px' }}>No transactions found in this period.</div>
          )}
        </div>
        <div className="text-right font-bold" style={{ marginTop: '16px', fontSize: '1.125rem' }}>
          TOTAL DUE: <span className="text-primary" style={{ fontSize: '1.5rem' }}>₹ {closingBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
    </div>
  );
};

export const Customers: React.FC = () => {
  const { t } = useLanguage();
  const customers = useLiveQuery(() => db.customers.toArray());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    await db.customers.add({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      createdAt: new Date()
    });
    
    setFormData({ name: '', phone: '', email: '' });
    setShowForm(false);
  };

  if (selectedCustomer) {
    return <CustomerStatement customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2>{t('customers.title')}</h2>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>{t('customers.addParty')}</h3>
            <button className="btn" style={{ background: 'transparent', padding: '4px' }} onClick={() => setShowForm(false)}>{t('customers.cancel')}</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('customers.nameLabel')}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder={t('customers.namePlaceholder')} 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('customers.phoneLabel')}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder={t('customers.phonePlaceholder')}
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '8px' }}>
              {t('customers.save')}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {customers?.length === 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            {t('customers.noCustomers')}
          </div>
        )}
        {customers?.map(customer => (
          <div 
            key={customer.id} 
            className="glass-panel flex-between" 
            style={{ cursor: 'pointer', padding: '16px' }}
            onClick={() => setSelectedCustomer(customer)}
          >
            <div>
              <div className="font-bold" style={{ fontSize: '1.125rem' }}>{customer.name}</div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>{customer.phone || 'No phone'}</div>
            </div>
            <ChevronRight color="var(--text-secondary)" />
          </div>
        ))}
      </div>
      
      {!showForm && (
        <button className="fab" onClick={() => setShowForm(true)} aria-label="Add Party">
          <Plus size={28} />
        </button>
      )}
    </div>
  );
};
