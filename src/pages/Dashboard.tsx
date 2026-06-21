import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { TrendingUp, Users as UsersIcon, Package, IndianRupee, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = useLiveQuery(async () => {
    const customersCount = await db.customers.count();
    const productsCount = await db.products.count();
    const invoices = await db.invoices.toArray();
    const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      customers: customersCount,
      products: productsCount,
      totalSales: totalSales,
      invoices: invoices.length
    };
  });

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Overview</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="glass-panel" style={{ background: 'linear-gradient(135deg, var(--accent-primary), #1e40af)', color: 'white', marginBottom: '16px', border: 'none' }}>
        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '8px' }}>Total Sales (Cash In)</div>
        <div className="flex-between">
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            ₹{stats?.totalSales?.toLocaleString('en-IN') || 0}
          </div>
          <IndianRupee size={32} style={{ opacity: 0.5 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="glass-panel stat-card" style={{ padding: '12px 16px' }}>
          <div className="flex-between">
            <span className="stat-card-title">Parties</span>
            <UsersIcon size={18} color="var(--accent-primary)" />
          </div>
          <div className="stat-card-value text-primary">
            {stats?.customers || 0}
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: '12px 16px' }}>
          <div className="flex-between">
            <span className="stat-card-title">Invoices</span>
            <TrendingUp size={18} color="var(--accent-primary)" />
          </div>
          <div className="stat-card-value">
            {stats?.invoices || 0}
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: '12px 16px', gridColumn: 'span 2' }}>
          <div className="flex-between">
            <span className="stat-card-title">Items / Products in Stock</span>
            <Package size={18} color="var(--accent-primary)" />
          </div>
          <div className="stat-card-value">
            {stats?.products || 0}
          </div>
        </div>
      </div>

      </div>

      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => window.location.href='/billing'}>
            + New Invoice
          </button>
          <button className="btn btn-success" onClick={() => window.location.href='/customers'}>
            + Add Payment
          </button>
        </div>
      </div>
      
      <button className="fab" onClick={() => navigate('/billing')} aria-label="Create New Bill">
        <Plus size={28} />
      </button>
    </div>
  );
};
