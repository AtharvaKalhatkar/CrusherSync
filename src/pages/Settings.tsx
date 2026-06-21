import React, { useEffect, useState } from 'react';
import { db } from '../db/db';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, Image as ImageIcon } from 'lucide-react';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    businessName: 'Shri kalbhairavnath',
    businessSubtitle: 'ENTERPRISES',
    phone: '+91 9689520324',
    email: 'Kolekarnagesh85@gmail.com',
    gstNo: '',
    logoBase64: '',
    signatureBase64: ''
  });
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await db.settings.get(1);
      if (settings) {
        setFormData(settings);
      }
    };
    loadSettings();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoBase64' | 'signatureBase64') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.settings.put({ ...formData, id: 1 });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2>{t('settings.title')}</h2>
      </div>

      <form onSubmit={handleSave} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">{t('settings.businessName')}</label>
          <input type="text" className="form-control" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} required />
        </div>

        <div className="form-group">
          <label className="form-label">{t('settings.businessSubtitle')}</label>
          <input type="text" className="form-control" value={formData.businessSubtitle} onChange={e => setFormData({...formData, businessSubtitle: e.target.value})} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">{t('settings.phone')}</label>
            <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">{t('settings.email')}</label>
            <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('settings.gst')}</label>
          <input type="text" className="form-control" placeholder="e.g. 27ABCDE1234F1Z5" value={formData.gstNo} onChange={e => setFormData({...formData, gstNo: e.target.value})} />
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', margin: '16px 0' }}></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">{t('settings.logo')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              {formData.logoBase64 && (
                <img src={formData.logoBase64} alt="Logo" style={{ height: '60px', objectFit: 'contain', background: '#fff', padding: '4px', borderRadius: '4px' }} />
              )}
              <input type="file" accept="image/*" id="logoUpload" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'logoBase64')} />
              <button type="button" className="btn" style={{ border: '1px solid #ccc' }} onClick={() => document.getElementById('logoUpload')?.click()}>
                <ImageIcon size={16} style={{ display: 'inline', marginRight: '4px' }} /> {formData.logoBase64 ? 'Change Logo' : 'Upload Logo'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('settings.signature')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              {formData.signatureBase64 && (
                <img src={formData.signatureBase64} alt="Signature" style={{ height: '60px', objectFit: 'contain', background: '#fff', padding: '4px', borderRadius: '4px' }} />
              )}
              <input type="file" accept="image/*" id="sigUpload" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'signatureBase64')} />
              <button type="button" className="btn" style={{ border: '1px solid #ccc' }} onClick={() => document.getElementById('sigUpload')?.click()}>
                <ImageIcon size={16} style={{ display: 'inline', marginRight: '4px' }} /> {formData.signatureBase64 ? 'Change Signature' : 'Upload Signature'}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <Save size={20} /> {isSaved ? 'Saved!' : t('settings.save')}
        </button>
      </form>
    </div>
  );
};
