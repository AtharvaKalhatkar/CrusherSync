import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Trash2 } from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export const Billing: React.FC = () => {
  const customers = useLiveQuery(() => db.customers.toArray());
  const products = useLiveQuery(() => db.products.toArray());
  
  const [customerId, setCustomerId] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [items, setItems] = useState<Array<{productId: string, quantity: string, date: string}>>([
    { productId: '', quantity: '1', date: new Date().toISOString().split('T')[0] }
  ]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: '1', date: new Date().toISOString().split('T')[0] }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity' | 'date', value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0 || !items[0].productId) return;

    const totalAmount = calculateTotal();
    const invoicesCount = await db.invoices.count();
    const invoiceNo = invoicesCount + 101; // Start at 101

    const invoiceId = await db.invoices.add({
      invoiceNo,
      customerId: parseInt(customerId),
      date: new Date().toISOString(),
      totalAmount
    });

    for (const item of items) {
      if (!item.productId || !item.quantity) continue;
      const product = products?.find(p => p.id?.toString() === item.productId);
      if (product) {
        await db.invoiceItems.add({
          invoiceId: invoiceId as number,
          productId: product.id!,
          productName: product.name,
          quantity: parseFloat(item.quantity),
          unit: product.unit,
          price: product.price,
          amount: product.price * parseFloat(item.quantity),
          date: item.date ? new Date(item.date).toISOString() : new Date().toISOString()
        });
      }
    }

    // Generate and Share PDF
    const savedInvoice = await db.invoices.get(invoiceId as number);
    const savedItems = await db.invoiceItems.where('invoiceId').equals(invoiceId as number).toArray();
    const customer = await db.customers.get(parseInt(customerId));

    // Handle Received Amount
    const received = parseFloat(receivedAmount) || 0;
    if (received > 0) {
      await db.payments.add({
        customerId: parseInt(customerId),
        amount: received,
        date: new Date().toISOString(),
        notes: `Advance for Invoice #${invoiceNo}`
      });
    }

    if (savedInvoice && customer) {
      await generateInvoicePDF(savedInvoice, savedItems, customer, received);
    }

    setCustomerId('');
    setReceivedAmount('');
    setItems([{ productId: '', quantity: '1', date: new Date().toISOString().split('T')[0] }]);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Create Invoice</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Select Customer</label>
            <select 
              className="form-control"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem' }}>Items</h3>
          </div>
          
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', padding: '12px', background: '#f9fafb', border: '1px solid var(--surface-color-light)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
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
                {items.length > 1 && (
                  <button 
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: '10px' }}
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1.5 }}>
                  <input 
                    type="date"
                    className="form-control"
                    value={item.date}
                    onChange={e => handleItemChange(index, 'date', e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0"
                    value={item.quantity}
                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                    required
                    style={{ paddingRight: '36px', textAlign: 'right' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.8rem', pointerEvents: 'none' }}>
                    Qty
                  </span>
                </div>
              </div>
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

        <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <div className="font-bold">Total Amount</div>
            <div className="font-bold text-primary" style={{ fontSize: '1.25rem' }}>
              ₹ {calculateTotal().toLocaleString('en-IN', {minimumFractionDigits: 2})}
            </div>
          </div>
          <div className="flex-between">
            <div className="font-bold">Received (Advance)</div>
            <div style={{ width: '120px' }}>
              <input 
                type="number"
                step="0.01"
                className="form-control"
                placeholder="₹ 0.00"
                value={receivedAmount}
                onChange={e => setReceivedAmount(e.target.value)}
                style={{ textAlign: 'right', padding: '6px 12px' }}
              />
            </div>
          </div>
          <div className="flex-between" style={{ borderTop: '1px solid var(--surface-color-light)', paddingTop: '16px' }}>
            <div className="font-bold">Net Balance</div>
            <div className="font-bold text-danger" style={{ fontSize: '1.5rem' }}>
              ₹ {Math.max(0, calculateTotal() - (parseFloat(receivedAmount) || 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.125rem' }}>
          Generate Invoice
        </button>
      </form>
    </div>
  );
};
