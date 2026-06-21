import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { TrendingUp, Users as UsersIcon, Package, IndianRupee, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const stats = useLiveQuery(async () => {
    const customersCount = await db.customers.count();
    const productsCount = await db.products.count();
    const invoices = await db.invoices.toArray();
    
    let totalSales = 0;
    let thisMonthSales = 0;
    let lastMonthSales = 0;
    let thisYearSales = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    invoices.forEach(inv => {
      totalSales += inv.totalAmount;
      
      const invDate = new Date(inv.date);
      const invMonth = invDate.getMonth();
      const invYear = invDate.getFullYear();

      if (invYear === currentYear) {
        thisYearSales += inv.totalAmount;
        if (invMonth === currentMonth) {
          thisMonthSales += inv.totalAmount;
        } else if (invMonth === currentMonth - 1) {
          lastMonthSales += inv.totalAmount;
        }
      } else if (invYear === currentYear - 1 && currentMonth === 0 && invMonth === 11) {
        lastMonthSales += inv.totalAmount;
      }
    });

    return {
      customers: customersCount,
      products: productsCount,
      totalSales,
      thisMonthSales,
      lastMonthSales,
      thisYearSales,
      invoices: invoices.length
    };
  });

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>{t('dashboard.overview')}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Total Sales */}
      <div className="glass-panel" style={{ background: 'linear-gradient(135deg, var(--accent-primary), #1e40af)', color: 'white', marginBottom: '8px', border: 'none' }}>
        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '8px' }}>{t('dashboard.totalSales')}</div>
        <div className="flex-between">
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            ₹{stats?.totalSales?.toLocaleString('en-IN') || 0}
          </div>
          <IndianRupee size={32} style={{ opacity: 0.5 }} />
        </div>
      </div>

      {/* Advanced Sales Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
        <div className="glass-panel stat-card" style={{ padding: '12px 16px', background: '#f8fafc' }}>
          <div className="flex-between">
            <span className="stat-card-title">{t('dashboard.thisMonthSale')}</span>
          </div>
          <div className="stat-card-value text-success" style={{ fontSize: '1.25rem' }}>
            ₹{stats?.thisMonthSales?.toLocaleString('en-IN') || 0}
          </div>
        </div>
        <div className="glass-panel stat-card" style={{ padding: '12px 16px', background: '#f8fafc' }}>
          <div className="flex-between">
            <span className="stat-card-title">{t('dashboard.lastMonthSale')}</span>
          </div>
          <div className="stat-card-value text-muted" style={{ fontSize: '1.25rem' }}>
            ₹{stats?.lastMonthSales?.toLocaleString('en-IN') || 0}
          </div>
        </div>
        <div className="glass-panel stat-card" style={{ padding: '12px 16px', gridColumn: 'span 2', background: '#f8fafc' }}>
          <div className="flex-between">
            <span className="stat-card-title">{t('dashboard.thisYearSale')}</span>
          </div>
          <div className="stat-card-value text-primary" style={{ fontSize: '1.25rem' }}>
            ₹{stats?.thisYearSales?.toLocaleString('en-IN') || 0}
          </div>
        </div>
      </div>

      {/* Stock & Party Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="glass-panel stat-card" style={{ padding: '12px 16px' }}>
          <div className="flex-between">
            <span className="stat-card-title">{t('dashboard.parties')}</span>
            <UsersIcon size={18} color="var(--accent-primary)" />
          </div>
          <div className="stat-card-value text-primary">
            {stats?.customers || 0}
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: '12px 16px' }}>
          <div className="flex-between">
            <span className="stat-card-title">{t('dashboard.invoices')}</span>
            <TrendingUp size={18} color="var(--accent-primary)" />
          </div>
          <div className="stat-card-value">
            {stats?.invoices || 0}
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: '12px 16px', gridColumn: 'span 2' }}>
          <div className="flex-between">
            <span className="stat-card-title">{t('dashboard.itemsInStock')}</span>
            <Package size={18} color="var(--accent-primary)" />
          </div>
          <div className="stat-card-value">
            {stats?.products || 0}
          </div>
        </div>
      </div>

      </div>

      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>{t('dashboard.quickActions')}</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => window.location.href='/billing'}>
            {t('dashboard.newInvoice')}
          </button>
          <button className="btn btn-success" onClick={() => window.location.href='/customers'}>
            {t('dashboard.addPayment')}
          </button>
        </div>
      </div>
      
      <button className="fab" onClick={() => navigate('/billing')} aria-label="Create New Bill">
        <Plus size={28} />
      </button>
    </div>
  );
};
