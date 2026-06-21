import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Search, Share2, Edit3, Calendar, X, Plus } from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';

const BillDetailsModal = ({ invoiceId, onClose }: { invoiceId: number, onClose: () => void }) => {
  const items = useLiveQuery(() => db.invoiceItems.where('invoiceId').equals(invoiceId).toArray(), [invoiceId]);
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-between" style={{ marginBottom: '16px', borderBottom: '1px solid var(--surface-color-light)', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Bill Details</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {!items ? (
            <div className="text-muted" style={{ textAlign: 'center', padding: '24px' }}>Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-muted" style={{ textAlign: 'center', padding: '24px' }}>No items found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--surface-color-light)', paddingBottom: '8px' }}>
                  <div>
                    <div className="font-bold" style={{ fontSize: '0.95rem' }}>{item.productName}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>{item.quantity} {item.unit} × ₹{item.price}</div>
                  </div>
                  <div className="font-bold text-primary">₹ {item.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Bills: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);

  const invoices = useLiveQuery(() => db.invoices.reverse().toArray());
  const customers = useLiveQuery(() => db.customers.toArray());

  const getCustomerName = (id: number) => {
    return customers?.find(c => c.id === id)?.name || 'Unknown Client';
  };

  const handleShare = async (invoiceId: number) => {
    const savedInvoice = await db.invoices.get(invoiceId);
    const savedItems = await db.invoiceItems.where('invoiceId').equals(invoiceId).toArray();
    if (savedInvoice && savedInvoice.customerId) {
      const customer = await db.customers.get(savedInvoice.customerId);
      if (customer) {
        await generateInvoicePDF(savedInvoice, savedItems, customer);
      }
    }
  };

  const filteredInvoices = invoices?.filter(inv => {
    const clientName = getCustomerName(inv.customerId).toLowerCase();
    const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || inv.invoiceNo.toString().includes(searchTerm);
    const matchesDate = dateFilter ? inv.date.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontWeight: 300 }}>Past <span className="text-gold" style={{ fontWeight: 600 }}>Bills</span></h2>

      <div className="glass-panel" style={{ marginBottom: '24px', padding: '16px' }}>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '0', top: '12px' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '28px' }}
              placeholder="Search client or bill #..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: '0' }}>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '0', top: '12px' }} />
            <input 
              type="date" 
              className="form-control" 
              style={{ paddingLeft: '28px' }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredInvoices?.length === 0 && (
          <div className="text-muted" style={{ textAlign: 'center', marginTop: '32px' }}>
            No bills found.
          </div>
        )}
        
        {filteredInvoices?.map(inv => (
          <div key={inv.id} className="list-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div 
              className="flex-between" 
              style={{ borderBottom: '1px solid var(--surface-color-light)', paddingBottom: '8px', cursor: 'pointer' }}
              onClick={() => setSelectedBillId(inv.id!)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Bill #{inv.invoiceNo}
                </div>
                <div className="font-bold" style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                  {getCustomerName(inv.customerId)}
                </div>
              </div>
              <div className="text-right" style={{ flexShrink: 0 }}>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="font-bold text-primary" style={{ fontSize: '1rem' }}>
                  ₹ {inv.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button 
                className="btn" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid var(--surface-color-light)', background: 'transparent', color: 'var(--text-primary)' }}
                onClick={() => navigate(`/bills/edit/${inv.id}`)}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => handleShare(inv.id!)}
              >
                <Share2 size={14} /> Options
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedBillId && (
        <BillDetailsModal 
          invoiceId={selectedBillId} 
          onClose={() => setSelectedBillId(null)} 
        />
      )}

      <button className="fab" onClick={() => navigate('/billing')} aria-label="Create New Bill">
        <Plus size={28} />
      </button>
    </div>
  );
};
