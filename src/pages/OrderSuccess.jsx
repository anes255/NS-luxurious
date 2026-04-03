import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function OrderSuccess() {
  const { t } = useLang();
  return (
    <div className="order-success">
      <div className="order-success-icon">✓</div>
      <h2>{t('orderSuccess')}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{t('orderSuccessMsg')}</p>
      <Link to="/" className="hero-btn" style={{ textDecoration: 'none' }}>{t('backToHome')}</Link>
    </div>
  );
}
