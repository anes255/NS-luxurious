import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';

export default function AdminShipping() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [bulkHome, setBulkHome] = useState('');
  const [bulkOffice, setBulkOffice] = useState('');

  const load = () => {
    api.get('/shipping').then(res => { setRates(res.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const updateRate = (id, field, value) => {
    setRates(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await api.put('/shipping', { rates });
      toast.success('Tarifs mis à jour');
    } catch { toast.error('Erreur'); }
    finally { setSaving(false); }
  };

  const applyBulk = () => {
    if (!bulkHome && !bulkOffice) return;
    setRates(prev => prev.map(r => ({
      ...r,
      home_price: bulkHome ? parseFloat(bulkHome) : r.home_price,
      office_price: bulkOffice ? parseFloat(bulkOffice) : r.office_price
    })));
    toast.success('Prix appliqués à toutes les wilayas');
    setBulkHome('');
    setBulkOffice('');
  };

  const filtered = rates.filter(r =>
    r.wilaya_name_fr.toLowerCase().includes(search.toLowerCase()) ||
    r.wilaya_name_ar.includes(search) ||
    r.wilaya_code.includes(search)
  );

  return (
    <div>
      <div className="admin-header">
        <h1>Tarifs de livraison</h1>
        <button className="admin-btn admin-btn-primary" onClick={saveAll} disabled={saving}>
          {saving ? 'Enregistrement...' : '💾 Enregistrer tout'}
        </button>
      </div>

      {/* Bulk update */}
      <div style={{
        background: 'var(--white)', borderRadius: 12, padding: 20, marginBottom: 24,
        boxShadow: '0 2px 12px var(--shadow)', display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Prix domicile (toutes)</label>
          <input
            type="number" value={bulkHome} onChange={e => setBulkHome(e.target.value)}
            placeholder="DA" style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, width: 140 }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Prix bureau (toutes)</label>
          <input
            type="number" value={bulkOffice} onChange={e => setBulkOffice(e.target.value)}
            placeholder="DA" style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, width: 140 }}
          />
        </div>
        <button className="admin-btn admin-btn-secondary" onClick={applyBulk}>Appliquer à tout</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text" placeholder="Rechercher une wilaya..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', border: '2px solid var(--border)', borderRadius: 8, width: '100%', maxWidth: 400 }}
        />
      </div>

      {loading ? <p>Chargement...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Wilaya (FR)</th>
                <th>Wilaya (AR)</th>
                <th>🏠 Domicile (DA)</th>
                <th>📦 Bureau (DA)</th>
                <th>Actif</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rate => (
                <tr key={rate.id}>
                  <td style={{ fontWeight: 600 }}>{rate.wilaya_code}</td>
                  <td>{rate.wilaya_name_fr}</td>
                  <td dir="rtl">{rate.wilaya_name_ar}</td>
                  <td>
                    <input
                      type="number" value={rate.home_price}
                      onChange={e => updateRate(rate.id, 'home_price', parseFloat(e.target.value) || 0)}
                      style={{ width: 100, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number" value={rate.office_price}
                      onChange={e => updateRate(rate.id, 'office_price', parseFloat(e.target.value) || 0)}
                      style={{ width: 100, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox" checked={rate.is_active}
                      onChange={e => updateRate(rate.id, 'is_active', e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="admin-btn admin-btn-primary" onClick={saveAll} disabled={saving} style={{ padding: '14px 48px', fontSize: '1rem' }}>
          {saving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
