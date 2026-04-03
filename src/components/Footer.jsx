import { useLang } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3>NS Luxurious</h3>
          <p>{t('heroSubtitle')}</p>
        </div>
        <div>
          <h3>{t('contactUs')}</h3>
          <p>Email: contact@nsluxurious.com</p>
          <p>{t('phone')}: +213 XX XX XX XX</p>
        </div>
        <div>
          <h3>{t('followUs')}</h3>
          <p><a href="#">Facebook</a></p>
          <p><a href="#">Instagram</a></p>
          <p><a href="#">TikTok</a></p>
        </div>
      </div>
      <div className="footer-bottom">{t('footerText')}</div>
    </footer>
  );
}
