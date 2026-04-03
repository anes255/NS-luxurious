import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../api';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileRef = useRef();
  const variantFileRef = useRef();

  const [form, setForm] = useState({
    name_fr: '', name_ar: '', description_fr: '', description_ar: '',
    price: '', old_price: '', category: '', is_active: true, images: []
  });
  const [variants, setVariants] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeVariantIdx, setActiveVariantIdx] = useState(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(res => {
        const p = res.data;
        setForm({
          name_fr: p.name_fr, name_ar: p.name_ar || '', description_fr: p.description_fr || '',
          description_ar: p.description_ar || '', price: p.price, old_price: p.old_price || '',
          category: p.category || '', is_active: p.is_active, images: p.images || []
        });
        setVariants(p.variants || []);
      }).catch(() => toast.error('Erreur'));
    }
  }, [id]);

  const uploadImages = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    setUploading(true);
    try {
      const res = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.urls;
    } catch {
      toast.error('Erreur d\'upload');
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleMainImages = async (e) => {
    const urls = await uploadImages(e.target.files);
    setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const handleVariantImages = async (e) => {
    if (activeVariantIdx === null) return;
    const urls = await uploadImages(e.target.files);
    setVariants(prev => prev.map((v, i) => i === activeVariantIdx ? { ...v, images: [...(v.images || []), ...urls] } : v));
    setActiveVariantIdx(null);
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { color: '', color_hex: '#000000', size: '', images: [], stock: 0 }]);
  };

  const updateVariant = (idx, field, value) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const removeVariant = (idx) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const removeVariantImage = (vIdx, imgIdx) => {
    setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, images: v.images.filter((_, j) => j !== imgIdx) } : v));
  };

  const handleSave = async () => {
    if (!form.name_fr || !form.price) { toast.error('Nom et prix sont obligatoires'); return; }
    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price), old_price: form.old_price ? parseFloat(form.old_price) : null, variants };
      if (isEdit) {
        await api.put(`/products/${id}`, data);
        toast.success('Produit mis à jour');
      } else {
        await api.post('/products', data);
        toast.success('Produit créé');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const placeholderImg = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#F5E6EC" width="100" height="100"/><text fill="#8B2E4F" font-size="12" x="50%" y="50%" text-anchor="middle" dy=".3em">NS</text></svg>`);

  return (
    <div>
      <div className="admin-header">
        <h1>{isEdit ? 'Modifier le produit' : 'Ajouter un produit'}</h1>
        <button className="admin-btn admin-btn-secondary" onClick={() => navigate('/admin/products')}>← Retour</button>
      </div>

      <div className="admin-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Nom (Français) *</label>
            <input value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} placeholder="Nom du produit" />
          </div>
          <div className="form-group">
            <label>Nom (Arabe)</label>
            <input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} placeholder="اسم المنتج" dir="rtl" />
          </div>
          <div className="form-group full">
            <label>Description (Français)</label>
            <textarea value={form.description_fr} onChange={e => setForm({ ...form, description_fr: e.target.value })} placeholder="Description du produit..." />
          </div>
          <div className="form-group full">
            <label>Description (Arabe)</label>
            <textarea value={form.description_ar} onChange={e => setForm({ ...form, description_ar: e.target.value })} placeholder="وصف المنتج..." dir="rtl" />
          </div>
          <div className="form-group">
            <label>Prix (DA) *</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Ancien prix (DA)</label>
            <input type="number" value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="ex: Vêtements" />
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={form.is_active ? 'true' : 'false'} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
        </div>

        {/* Main images */}
        <div style={{ marginTop: 28 }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Images du produit</label>
          <div className="image-upload-area" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleMainImages} style={{ display: 'none' }} />
            <p style={{ color: 'var(--text-muted)' }}>{uploading ? 'Upload en cours...' : '📷 Cliquez pour ajouter des images'}</p>
          </div>
          {form.images.length > 0 && (
            <div className="uploaded-images">
              {form.images.map((img, i) => (
                <div key={i} className="uploaded-img-wrap">
                  <img src={getImageUrl(img)} alt="" onError={e => e.target.src = placeholderImg} />
                  <div className="uploaded-img-remove" onClick={() => removeImage(i)}>✕</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants */}
        <div style={{ marginTop: 36, borderTop: '2px solid var(--border)', paddingTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '1.05rem' }}>Variantes (optionnel)</label>
            <button className="admin-btn admin-btn-secondary" onClick={addVariant}>+ Ajouter une variante</button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            Ajoutez des couleurs et/ou tailles avec des images différentes si nécessaire.
          </p>

          {variants.map((v, idx) => (
            <div key={idx} style={{
              background: 'var(--off-white)', borderRadius: 12, padding: 20, marginBottom: 16,
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <strong>Variante {idx + 1}</strong>
                <button className="admin-btn admin-btn-danger admin-btn-small" onClick={() => removeVariant(idx)}>Supprimer</button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Couleur</label>
                  <input value={v.color} onChange={e => updateVariant(idx, 'color', e.target.value)} placeholder="ex: Rouge" />
                </div>
                <div className="form-group">
                  <label>Code couleur</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={v.color_hex || '#000000'} onChange={e => updateVariant(idx, 'color_hex', e.target.value)} style={{ width: 50, height: 40, padding: 2, cursor: 'pointer' }} />
                    <input value={v.color_hex || ''} onChange={e => updateVariant(idx, 'color_hex', e.target.value)} placeholder="#000000" style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Taille</label>
                  <input value={v.size} onChange={e => updateVariant(idx, 'size', e.target.value)} placeholder="ex: M, L, XL" />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" value={v.stock} onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)} />
                </div>
              </div>
              {/* Variant images */}
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Images de cette variante</label>
                <div className="image-upload-area" style={{ padding: 20, marginTop: 6 }} onClick={() => { setActiveVariantIdx(idx); variantFileRef.current?.click(); }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📷 Ajouter des images</p>
                </div>
                {v.images?.length > 0 && (
                  <div className="uploaded-images">
                    {v.images.map((img, j) => (
                      <div key={j} className="uploaded-img-wrap">
                        <img src={getImageUrl(img)} alt="" onError={e => e.target.src = placeholderImg} />
                        <div className="uploaded-img-remove" onClick={() => removeVariantImage(idx, j)}>✕</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <input ref={variantFileRef} type="file" multiple accept="image/*" onChange={handleVariantImages} style={{ display: 'none' }} />

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '14px 40px', fontSize: '1rem' }}>
            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer le produit')}
          </button>
          <button className="admin-btn admin-btn-secondary" onClick={() => navigate('/admin/products')} style={{ padding: '14px 40px' }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
