import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';
import api, { getImageUrl } from '../api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wilayas, setWilayas] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customer_name: '', phone: '', address: '',
    wilaya_code: '', shipping_type: '', comment: ''
  });

  const placeholderImg = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#F5E6EC" width="400" height="400"/><text fill="#8B2E4F" font-family="serif" font-size="24" x="50%" y="50%" text-anchor="middle" dy=".3em">NS Luxurious</text></svg>`);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get('/shipping')
    ]).then(([prodRes, shipRes]) => {
      setProduct(prodRes.data);
      setMainImage(prodRes.data.images?.[0] || '');
      setWilayas(shipRes.data.filter(w => w.is_active));
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error(t('error')); });
  }, [id]);

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}>{t('loading')}</div>;
  if (!product) return <div style={{ padding: 60, textAlign: 'center' }}>{t('error')}</div>;

  const name = lang === 'ar' ? (product.name_ar || product.name_fr) : product.name_fr;
  const desc = lang === 'ar' ? (product.description_ar || product.description_fr) : product.description_fr;

  // Get unique colors and sizes from variants
  const colors = [];
  const colorMap = {};
  const sizes = new Set();
  (product.variants || []).forEach(v => {
    if (v.color && !colorMap[v.color]) {
      colorMap[v.color] = v;
      colors.push(v);
    }
    if (v.size) sizes.add(v.size);
  });

  // Get all images including variant images
  const allImages = [...(product.images || [])];
  if (selectedColor) {
    const cv = product.variants.filter(v => v.color === selectedColor.color);
    cv.forEach(v => { if (v.images?.length) allImages.push(...v.images); });
  }
  const uniqueImages = [...new Set(allImages)];

  // Selected wilaya shipping info
  const selectedWilaya = wilayas.find(w => w.wilaya_code === form.wilaya_code);
  const shippingPrice = selectedWilaya
    ? (form.shipping_type === 'home' ? Number(selectedWilaya.home_price) : form.shipping_type === 'office' ? Number(selectedWilaya.office_price) : 0)
    : 0;
  const subtotal = Number(product.price) * quantity;
  const total = subtotal + shippingPrice;

  const handleSubmit = async () => {
    if (!form.customer_name || !form.phone || !form.address || !form.wilaya_code || !form.shipping_type) {
      toast.error(t('required'));
      return;
    }
    setSubmitting(true);
    const wilayaName = lang === 'ar' ? selectedWilaya.wilaya_name_ar : selectedWilaya.wilaya_name_fr;
    let variantInfo = '';
    if (selectedColor) variantInfo += `${t('color')}: ${selectedColor.color}`;
    if (selectedSize) variantInfo += ` | ${t('size')}: ${selectedSize}`;

    try {
      await api.post('/orders', {
        ...form,
        wilaya_name: wilayaName,
        shipping_price: shippingPrice,
        items: [{
          product_id: product.id,
          product_name: product.name_fr,
          variant_info: variantInfo,
          quantity,
          price: Number(product.price)
        }],
        comment: form.comment
      });
      navigate('/order-success');
    } catch (err) {
      toast.error(err.response?.data?.error || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product-detail">
      <div className="product-detail-grid">
        {/* Gallery */}
        <div className="product-gallery">
          <img
            src={mainImage ? getImageUrl(mainImage) : placeholderImg}
            alt={name}
            className="product-main-img"
            onError={e => e.target.src = placeholderImg}
          />
          {uniqueImages.length > 1 && (
            <div className="product-thumbs">
              {uniqueImages.map((img, i) => (
                <img
                  key={i}
                  src={getImageUrl(img)}
                  alt=""
                  className={`product-thumb ${mainImage === img ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                  onError={e => e.target.src = placeholderImg}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          <h1>{name}</h1>
          <div className="product-price-big">
            {Number(product.price).toLocaleString()} {t('da')}
            {product.old_price && (
              <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '1.1rem', marginInlineStart: 12 }}>
                {Number(product.old_price).toLocaleString()} {t('da')}
              </span>
            )}
          </div>
          {desc && <p className="product-desc">{desc}</p>}

          {/* Color selection */}
          {colors.length > 0 && (
            <div className="variant-section">
              <span className="variant-label">{t('selectColor')}</span>
              <div className="color-options">
                {colors.map((v, i) => (
                  <div
                    key={i}
                    className={`color-swatch ${selectedColor?.color === v.color ? 'active' : ''}`}
                    style={{ background: v.color_hex || '#ccc' }}
                    title={v.color}
                    onClick={() => {
                      setSelectedColor(v);
                      if (v.images?.length) setMainImage(v.images[0]);
                    }}
                  />
                ))}
              </div>
              {selectedColor && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{selectedColor.color}</span>}
            </div>
          )}

          {/* Size selection */}
          {sizes.size > 0 && (
            <div className="variant-section">
              <span className="variant-label">{t('selectSize')}</span>
              <div className="size-options">
                {[...sizes].map(s => (
                  <button
                    key={s}
                    className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="variant-section">
            <span className="variant-label">{t('quantity')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="size-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{quantity}</span>
              <button className="size-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <button className="order-btn" onClick={() => document.getElementById('order-form').scrollIntoView({ behavior: 'smooth' })}>
            {t('addToCart')} — {subtotal.toLocaleString()} {t('da')}
          </button>
        </div>
      </div>

      {/* Order Form */}
      <div className="order-form-section" id="order-form">
        <h2>{t('orderForm')}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('fullName')} *</label>
            <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder={t('fullName')} />
          </div>
          <div className="form-group">
            <label>{t('phone')} *</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0XX XX XX XX" type="tel" />
          </div>
          <div className="form-group full">
            <label>{t('address')} *</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder={t('address')} />
          </div>
          <div className="form-group">
            <label>{t('wilaya')} *</label>
            <select value={form.wilaya_code} onChange={e => setForm({ ...form, wilaya_code: e.target.value })}>
              <option value="">{t('selectWilaya')}</option>
              {wilayas.map(w => (
                <option key={w.wilaya_code} value={w.wilaya_code}>
                  {w.wilaya_code} - {lang === 'ar' ? w.wilaya_name_ar : w.wilaya_name_fr}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('shippingType')} *</label>
            <div className="shipping-type-options">
              <div
                className={`shipping-type-card ${form.shipping_type === 'home' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, shipping_type: 'home' })}
              >
                <div className="type-name">🏠 {t('homeDelivery')}</div>
                {selectedWilaya && <div className="type-price">{Number(selectedWilaya.home_price).toLocaleString()} {t('da')}</div>}
              </div>
              <div
                className={`shipping-type-card ${form.shipping_type === 'office' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, shipping_type: 'office' })}
              >
                <div className="type-name">📦 {t('officeDelivery')}</div>
                {selectedWilaya && <div className="type-price">{Number(selectedWilaya.office_price).toLocaleString()} {t('da')}</div>}
              </div>
            </div>
          </div>
          <div className="form-group full">
            <label>{t('comment')}</label>
            <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder={t('commentPlaceholder')} />
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="order-summary-row">
            <span>{name} × {quantity}</span>
            <span>{subtotal.toLocaleString()} {t('da')}</span>
          </div>
          <div className="order-summary-row">
            <span>{t('shippingCost')}</span>
            <span>{shippingPrice.toLocaleString()} {t('da')}</span>
          </div>
          <div className="order-summary-row total">
            <span>{t('total')}</span>
            <span>{total.toLocaleString()} {t('da')}</span>
          </div>
        </div>

        <button className="order-btn" onClick={handleSubmit} disabled={submitting} style={{ marginTop: 24, opacity: submitting ? 0.6 : 1 }}>
          {submitting ? t('loading') : t('placeOrder')}
        </button>
      </div>
    </div>
  );
}
