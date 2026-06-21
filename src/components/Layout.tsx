import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Package, ReceiptText, Plus } from 'lucide-react';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide FAB if we are already on the billing page
  const showFab = !location.pathname.includes('/billing') && !location.pathname.includes('/bills/edit');

  return (
    <div className="app-container">
      <header className="app-header" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '2px' }}>
        <div className="app-header-title" style={{ fontSize: '1.4rem' }}>Stone Crusher</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, opacity: 0.9, letterSpacing: '0.5px' }}>
          Shree Kalbhairavnath
        </div>
      </header>

      <main className="app-content animate-fade-in">
        <Outlet />
      </main>



      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={22} />
          <span>Parties</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={22} />
          <span>Items</span>
        </NavLink>
        <NavLink to="/bills" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ReceiptText size={22} />
          <span>Bills</span>
        </NavLink>
      </nav>
    </div>
  );
};
