import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageCircle, 
  Send, 
  Camera, 
  ExternalLink, 
  Code, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Award,
  Globe
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer-wrapper">
      <footer className="floating-footer glass">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="logo-icon">
                  <Calendar size={22} color="white" />
                </div>
                <span className="logo-text">Smart<span className="text-primary">Book</span></span>
              </Link>
              <p className="footer-mission">
                Revolutionizing healthcare accessibility across India with absolute precision and trust.
              </p>
              
              <div className="footer-newsletter">
                <input type="email" placeholder="Enter your email" className="glass-input" />
                <button className="icon-btn-primary"><ArrowRight size={18} /></button>
              </div>

              <div className="social-links">
                <a href="#" className="social-icon" title="Facebook"><MessageCircle size={18} /></a>
                <a href="#" className="social-icon" title="Twitter"><Send size={18} /></a>
                <a href="#" className="social-icon" title="Instagram"><Camera size={18} /></a>
                <a href="#" className="social-icon" title="LinkedIn"><ExternalLink size={18} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-links">
              <h4>Network</h4>
              <ul>
                <li><Link to="/">Hospitals</Link></li>
                <li><Link to="/">Experts</Link></li>
                <li><Link to="/">Care</Link></li>
                <li><Link to="/">Passport</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-links">
              <h4>Trust</h4>
              <ul>
                <li><Link to="/">Help Center</Link></li>
                <li><Link to="/">Privacy</Link></li>
                <li><Link to="/">Terms</Link></li>
                <li><Link to="/">Partner</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-contact">
              <h4>Hotline</h4>
              <div className="contact-item">
                <Phone size={16} className="text-primary" />
                <p className="contact-value">+91 1800-SMART</p>
              </div>
              <div className="contact-item">
                <Mail size={16} className="text-primary" />
                <p className="contact-value">care@smartbook.in</p>
              </div>
              <div className="contact-item">
                <MapPin size={16} className="text-primary" />
                <p className="contact-value">Gurugram, IN</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div className="bottom-content">
              <div className="copyright">
                <p>&copy; {currentYear} SmartBook. All Rights Reserved.</p>
              </div>
              <div className="trust-badges">
                <div className="trust-badge" title="ISO 27001 Certified">
                  <ShieldCheck size={14} /> ISO
                </div>
                <div className="trust-badge" title="NABH Accredited">
                  <Award size={14} /> NABH
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
