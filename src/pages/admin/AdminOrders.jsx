import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';

const statuses = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' }
];

const statusLabels = { pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  const load = (p = page, f = filter) => {
    setLoading(true);
    api.get(`/orders?page=${p}&limit=15&status=${f}`).then(res => {
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const changeFilter = (f) => { setFilter(f); setPage(1); load(1, f); };
  const changePage = (p) => { setPage(p); load(p); };

  const toggleExpand = async (orderId) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    if (!orderDetails[orderId]) {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrderDetails(prev => ({ ...prev, [orderId]: res.data }));
      } catch { toast.error('Erreur'); }
    }
    setExpandedId(orderId);
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Statut: ${statusLabels[status]}`);
      load();
    } catch { toast.error('Erreur'); }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Supprimer cette commande ?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Commande supprimée');
      load();
    } catch { toast.error('Erreur'); }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Commandes ({total})</h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button
            key={s.value}
            className={`admin-btn admin-btn-small ${filter === s.value ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => changeFilter(s.value)}
          >{s.label}</button>
        ))}
      </div>

      {loading ? <p>Chargement...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Wilaya</th>
                <th>Livraison</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <>
                  <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(order.id)}>
                    <td>#{order.id}</td>
                    <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                    <td>{order.phone}</td>
                    <td>{order.wilaya_name}</td>
                    <td>{order.shipping_type === 'home' ? '🏠 Domicile' : '📦 Bureau'}</td>
                    <td style={{ fontWeight: 600 }}>{Number(order.total_price).toLocaleString()} DA</td>
                    <td><span className={`badge badge-${order.status}`}>{statusLabels[order.status]}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString('fr')}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.8rem' }}
                      >
                        {statuses.filter(s => s.value !== 'all').map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expandedId === order.id && orderDetails[order.id] && (
                    <tr key={`detail-${order.id}`}>
                      <td colSpan={9} style={{ background: 'var(--cream)', padding: 24 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div>
                            <strong>Adresse:</strong> {orderDetails[order.id].address}<br />
                            <strong>Commentaire:</strong> {orderDetails[order.id].comment || '—'}<br />
                            <strong>Sous-total:</strong> {Number(orderDetails[order.id].subtotal).toLocaleString()} DA<br />
                            <strong>Livraison:</strong> {Number(orderDetails[order.id].shipping_price).toLocaleString()} DA
                          </div>
                          <div>
                            <strong>Articles:</strong>
                            <ul style={{ marginTop: 8, paddingInlineStart: 20 }}>
                              {orderDetails[order.id].items?.map((item, i) => (
                                <li key={i} style={{ marginBottom: 4 }}>
                                  {item.product_name} × {item.quantity} — {Number(item.price).toLocaleString()} DA
                                  {item.variant_info && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> ({item.variant_info})</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <button className="admin-btn admin-btn-danger admin-btn-small" onClick={() => deleteOrder(order.id)} style={{ marginTop: 12 }}>
                          Supprimer la commande
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>Aucune commande</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`admin-btn admin-btn-small ${page === i + 1 ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              onClick={() => changePage(i + 1)}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
