import { Link } from 'react-router-dom';
import { FaGamepad, FaFacebook, FaTwitter, FaInstagram, FaDiscord, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-container">
          {/* Columna 1: Sobre Game Tracker */}
          <div className="footer-column">
            <div className="footer-brand">
              <FaGamepad className="footer-logo" size={35} />
              <h3>
                <span className="brand-white">Game </span>
                <span className="brand-yellow">Tracker</span>
              </h3>
            </div>
            <p className="footer-description">
              Tu plataforma definitiva para descubrir, rastrear y gestionar tu colección de videojuegos. 
              Únete a la comunidad gamer más grande.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <FaDiscord />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>

          

          {/* Columna 3: Recursos */}
          <div className="footer-column">
            <h4 className="footer-title">Recursos</h4>
            <ul className="footer-links">
              <li><Link to="/games">Games</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
              <li><Link to="/forum">Foro</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div className="footer-column">
            <h4 className="footer-title">Contacto</h4>
            <ul className="footer-contact">
              <li>
                <FaEnvelope className="contact-icon" />
                <a href="mailto:info@gametracker.com">info@gametracker.com</a>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                <a href="tel:+573001234567">+57 300 123 4567</a>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>Bogotá, Colombia</span>
              </li>
            </ul>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <p>&copy; {currentYear} Game Tracker. Todos los derechos reservados.</p>
          <p className="footer-credits">
            Hecho con <span className="heart">❤️</span> por gamers, para gamers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;