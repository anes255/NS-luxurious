import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function Header() {
  const { t, toggleLang } = useLang();
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">NS <span>Luxurious</span></Link>
        <nav className="nav-links">
          <Link to="/">{t('home')}</Link>
          <Link to="/#products">{t('products')}</Link>
          <button className="lang-btn" onClick={toggleLang}>{t('language')}</button>
        </nav>
      </div>
    </header>
  );
}
