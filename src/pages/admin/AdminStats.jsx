import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api';

const COLORS = ['#6B1D3A', '#C9A96E', '#8B2E4F', '#4A0E25', '#D4A0B0', '#2E7D32', '#1565C0', '#F57C00'];

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;
  if (!stats) return <div style={{ padding: 40, textAlign: 'center' }}>Erreur de chargement</div>;

  const statusData = stats.ordersByStatus.map(s => ({ name: s.status, value: parseInt(s.count) }));
  const shippingData = stats.shippingDistribution.map(s => ({
    name: s.shipping_type === 'home' ? 'Domicile' : 'Bureau',
    value: parseInt(s.count)
  }));

  return (
    <div>
      <div className="admin-header">
        <h1>Tableau de bord</h1>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Revenu total</div>
          <div className="stat-card-value">{stats.totalRevenue.toLocaleString()} DA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Revenu ce mois</div>
          <div className="stat-card-value">{stats.thisMonthRevenue.toLocaleString()} DA</div>
          <div className={`stat-card-change ${stats.revenueChange >= 0 ? 'positive' : 'negative'}`}>
            {stats.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueChange)}% vs mois dernier
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Commandes totales</div>
          <div className="stat-card-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Commandes ce mois</div>
          <div className="stat-card-value">{stats.thisMonthOrders}</div>
          <div className={`stat-card-change ${stats.ordersChange >= 0 ? 'positive' : 'negative'}`}>
            {stats.ordersChange >= 0 ? '↑' : '↓'} {Math.abs(stats.ordersChange)}% vs mois dernier
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Produits actifs</div>
          <div className="stat-card-value">{stats.totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Panier moyen</div>
          <div className="stat-card-value">
            {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0} DA
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-container">
          <h3>Revenus des 30 derniers jours</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('fr', { day: '2-digit', month: 'short' })} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => `${Number(v).toLocaleString()} DA`} labelFormatter={d => new Date(d).toLocaleDateString('fr')} />
              <Line type="monotone" dataKey="revenue" stroke="#6B1D3A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="chart-container">
          <h3>Commandes par jour</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('fr', { day: '2-digit', month: 'short' })} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={d => new Date(d).toLocaleDateString('fr')} />
              <Bar dataKey="orders" fill="#C9A96E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="chart-container">
          <h3>Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Shipping distribution */}
        <div className="chart-container">
          <h3>Type de livraison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={shippingData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {shippingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="chart-container">
        <h3>Top produits</h3>
        {stats.topProducts.length > 0 ? (
          <div className="admin-table-wrap" style={{ boxShadow: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Ventes</th>
                  <th>Revenu</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.product_name}</td>
                    <td>{p.total_sold}</td>
                    <td>{Number(p.revenue).toLocaleString()} DA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p style={{ color: 'var(--text-muted)' }}>Aucune donnée</p>}
      </div>

      {/* Top Wilayas */}
      <div className="chart-container" style={{ marginTop: 24 }}>
        <h3>Commandes par wilaya (Top 15)</h3>
        {stats.ordersByWilaya.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.ordersByWilaya} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="wilaya_name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B2E4F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ color: 'var(--text-muted)' }}>Aucune donnée</p>}
      </div>
    </div>
  );
}
