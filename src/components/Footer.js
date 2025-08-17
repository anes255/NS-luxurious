import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 NS Luxurious. All rights reserved.</p>
        <p>
          Follow us on Instagram: 
          <a 
            href="https://www.instagram.com/ns_luxurious_?igsh=bmk4M3h6dGdzbDlu" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#6c63ff', marginLeft: '0.5rem' }}
          >
            @ns_luxurious_
          </a>
        </p>
        <p>Premium luxury goods and accessories</p>
      </div>
    </footer>
  );
};

export default Footer;