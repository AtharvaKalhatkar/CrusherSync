import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Trash2, Save } from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export const EditBill: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const customers = useLiveQuery(() => db.customers.toArray());
  const products = useLiveQuery(() => db.products.toArray());
  
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(0);
  const [items, setItems] = useState<Array<{id?: number, productId: string, quantity: string}>>([]);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) return;
      const invId = parseInt(id);
      const invoice = await db.invoices.get(invId);
      if (invoice) {
        setCustomerId(invoice.customerId.toString());
        setDate(invoice.date.split('T')[0]);
        setInvoiceNo(invoice.invoiceNo);
        
        const invItems = await db.invoiceItems.where('invoiceId').equals(invId).toArray();
        setItems(invItems.map(item => ({
          id: item.id,
          productId: item.productId.toString(),
          quantity: item.quantity.toString()
        })));
      }
    };
    loadInvoice();
  }, [id]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: '1' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const product = products?.find(p => p.id?.toString() === item.productId);
      if (product && item.quantity) {
        return sum + (product.price * parseFloat(item.quantity));
      }
      return sum;
    }, 0);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !customerId || items.length === 0 || !items[0].productId) return;

    const invId = parseInt(id);
    const totalAmount = calculateTotal();

    // Update Invoice
    await db.invoices.update(invId, {
      customerId: parseInt(customerId),
      date: new Date(date).toISOString(),
      totalAmount
    });

    // Replace items (delete old, add new)
    const oldItems = await db.invoiceItems.where('invoiceId').equals(invId).toArray();
    for (const oldItem of oldItems) {
      await db.invoiceItems.delete(oldItem.id!);
    }

    for (const item of items) {
      if (!item.productId || !item.quantity) continue;
      const product = products?.find(p => p.id?.toString() === item.productId);
      if (product) {
        await db.invoiceItems.add({
          invoiceId: invId,
          productId: product.id!,
          productName: product.name,
          quantity: parseFloat(item.quantity),
          unit: product.unit,
          price: product.price,
          amount: product.price * parseFloat(item.quantity)
        });
      }
    }

    // Generate and Share PDF
    const savedInvoice = await db.invoices.get(invId);
    const savedItems = await db.invoiceItems.where('invoiceId').equals(invId).toArray();
    const customer = await db.customers.get(parseInt(customerId));

    if (savedInvoice && customer) {
      await generateInvoicePDF(savedInvoice, savedItems, customer);
    }

    alert(`Invoice #${invoiceNo} updated successfully!`);
    navigate('/bills');
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontWeight: 300 }}>Edit <span className="text-gold" style={{ fontWeight: 600 }}>Bill #{invoiceNo}</span></h2>
        <button className="btn" style={{ padding: '8px', background: 'transparent' }} onClick={() => navigate('/bills')}>Cancel</button>
      </div>
      
      <form onSubmit={handleUpdate}>
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Select Client</label>
            <select 
              className="form-control"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              required
            >
              <option value="">-- Choose Client --</option>
              {customers?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input 
              type="date" 
              className="form-control"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Items</h3>
          </div>
          
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
              <div style={{ flex: 2 }}>
                <select 
                  className="form-control"
                  value={item.productId}
                  onChange={e => handleItemChange(index, 'productId', e.target.value)}
                  required
                >
                  <option value="">-- Product --</option>
                  {products?.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price}/{p.unit})</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                  required
                />
              </div>
              {items.length > 1 && (
                <button 
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: '12px', border: 'none' }}
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            className="btn" 
            style={{ border: '1px dashed var(--accent-primary)', color: 'var(--accent-primary)', width: '100%', marginTop: '8px' }}
            onClick={handleAddItem}
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="glass-panel flex-between" style={{ marginBottom: '24px', borderTop: '2px solid var(--accent-primary)' }}>
          <div className="font-bold text-muted">Total Amount</div>
          <div className="font-bold text-gold" style={{ fontSize: '1.5rem' }}>
            ₹ {calculateTotal().toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.125rem' }}>
          <Save size={20} /> Update & Share Bill
        </button>
      </form>
    </div>
  );
};
