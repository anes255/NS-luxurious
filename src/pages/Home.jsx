import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import api, { getImageUrl } from '../api';

export default function Home() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    const name = lang === 'ar' ? (p.name_ar || p.name_fr) : p.name_fr;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const placeholderImg = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#F5E6EC" width="400" height="400"/><text fill="#8B2E4F" font-family="serif" font-size="24" x="50%" y="50%" text-anchor="middle" dy=".3em">NS Luxurious</text></svg>`);

  return (
    <>
      <section className="hero">
        <h1>{t('heroTitle')}</h1>
        <p>{t('heroSubtitle')}</p>
        <a href="#products" className="hero-btn">{t('shopNow')}</a>
      </section>

      {/* Features */}
      <section style={{ background: '#fff', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { icon: '🚚', text: t('freeShipping') },
            { icon: '💰', text: t('securePayment') },
            { icon: '✨', text: t('qualityGuarantee') }
          ].map((f, i) => (
            <div key={i} style={{ padding: 20 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{f.icon}</div>
              <p style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="products">
        <h2 className="section-title">{t('ourProducts')}</h2>

        <div style={{ maxWidth: 400, margin: '0 auto 32px', position: 'relative' }}>
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 50,
              border: '2px solid var(--border)', fontSize: '0.95rem',
              background: 'var(--white)'
            }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('loading')}</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('noProducts')}</p>
        ) : (
          <div className="products-grid">
            {filtered.map(product => {
              const name = lang === 'ar' ? (product.name_ar || product.name_fr) : product.name_fr;
              const img = product.images?.length > 0 ? getImageUrl(product.images[0]) : placeholderImg;
              return (
                <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
                  <div className="product-card-img-wrap">
                    <img src={img} alt={name} className="product-card-img" onError={e => e.target.src = placeholderImg} />
                    {product.old_price && <span className="product-card-badge">-{Math.round((1 - product.price / product.old_price) * 100)}%</span>}
                  </div>
                  <div className="product-card-body">
                    <h3 className="product-card-name">{name}</h3>
                    <div className="product-card-price">
                      {Number(product.price).toLocaleString()} {t('da')}
                      {product.old_price && (
                        <span className="product-card-old-price">{Number(product.old_price).toLocaleString()} {t('da')}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
