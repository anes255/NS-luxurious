import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../api';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/products/admin/all').then(res => { setProducts(res.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const deleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produit supprimé');
      load();
    } catch { toast.error('Erreur'); }
  };

  const placeholderImg = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect fill="#F5E6EC" width="60" height="60"/><text fill="#8B2E4F" font-size="8" x="50%" y="50%" text-anchor="middle" dy=".3em">NS</text></svg>`);

  return (
    <div>
      <div className="admin-header">
        <h1>Produits</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/products/new')}>
          + Ajouter un produit
        </button>
      </div>

      {loading ? <p>Chargement...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.images?.[0] ? getImageUrl(p.images[0]) : placeholderImg}
                      alt=""
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                      onError={e => e.target.src = placeholderImg}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.name_fr}</td>
                  <td>{Number(p.price).toLocaleString()} DA</td>
                  <td>{p.category || '—'}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-small" onClick={() => navigate(`/admin/products/edit/${p.id}`)}>
                        Modifier
                      </button>
                      <button className="admin-btn admin-btn-danger admin-btn-small" onClick={() => deleteProduct(p.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Aucun produit</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
