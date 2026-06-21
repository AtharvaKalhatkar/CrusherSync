import { Outlet, NavLink } from 'react-router-dom';
import { Home, Users, Package, ReceiptText, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Layout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="app-container">
      <header className="app-header" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
          <div className="app-header-title" style={{ fontSize: '1.4rem' }}>{t('app.title')}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, opacity: 0.9, letterSpacing: '0.5px' }}>
            {t('app.subtitle')}
          </div>
        </div>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}
        >
          {language === 'en' ? 'मराठी' : 'EN'}
        </button>
      </header>

      <main className="app-content animate-fade-in">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={22} />
          <span>{t('nav.home')}</span>
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={22} />
          <span>{t('nav.parties')}</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={22} />
          <span>{t('nav.items')}</span>
        </NavLink>
        <NavLink to="/bills" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ReceiptText size={22} />
          <span>{t('nav.bills')}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <SettingsIcon size={22} />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </nav>
    </div>
  );
};
