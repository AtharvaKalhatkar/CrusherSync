import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Trash2 } from 'lucide-react';

export const Products: React.FC = () => {
  const products = useLiveQuery(() => db.products.toArray());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: 'Kg', price: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    
    await db.products.add({
      name: formData.name,
      unit: formData.unit,
      price: parseFloat(formData.price)
    });
    
    setFormData({ name: '', unit: 'Kg', price: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2>Items</h2>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Add Item</h3>
            <button className="btn" style={{ background: 'transparent', padding: '4px' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g., Dabar, crasend" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Unit</label>
                <select 
                  className="form-control"
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="Kg">Kg</option>
                  <option value="Brass">Brass</option>
                  <option value="Ton">Ton</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Default Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="0.00"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '8px' }}>
              Save Product
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {products?.length === 0 && (
          <div className="text-muted" style={{ textAlign: 'center', padding: '24px' }}>
            No items added yet.
          </div>
        )}
        {products?.map(product => (
          <div key={product.id} className="list-card" style={{ padding: '16px' }}>
            <div>
              <div className="font-bold" style={{ fontSize: '1.125rem' }}>{product.name}</div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Per {product.unit}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="font-bold" style={{ fontSize: '1.125rem' }}>₹{product.price.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '8px' }}
                onClick={() => db.products.delete(product.id!)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {!showForm && (
        <button className="fab" onClick={() => setShowForm(true)} aria-label="Add Item">
          <Plus size={28} />
        </button>
      )}
    </div>
  );
};
