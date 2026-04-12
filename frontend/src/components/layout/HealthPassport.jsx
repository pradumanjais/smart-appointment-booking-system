import React from 'react';
import { Download, ShieldCheck, CreditCard, Heart } from 'lucide-react';
import Button from '../common/Button';

const HealthPassport = () => {
  return (
    <section className="passport-section section container">
      <div className="passport-grid">
        <div className="passport-content animate-fade-in">
          <span className="premium-badge-alt">Digital Healthcare Ecosystem</span>
          <h2 className="section-title-large">Your Secure <span className="text-gradient">Health Passport</span></h2>
          <p className="section-subtitle-left">
            Manage your entire medical journey in one encrypted profile. Access verified history, 
            track current bookings, and carry your digital health identity across India's premier 
            hospital network.
          </p>
          
          <div className="passport-features mt-8">
            <div className="p-feature-item">
              <ShieldCheck className="text-primary" size={24} />
              <div>
                <h4>Verified Patient Identity</h4>
                <p>Multi-layered authentication for secure health records.</p>
              </div>
            </div>
            <div className="p-feature-item">
              <CreditCard className="text-primary" size={24} />
              <div>
                <h4>Digital Booking Tickets</h4>
                <p>Lose the paperwork. Access high-fidelity digital tickets instantly.</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Button size="lg" className="btn-glow">Explore Your Profile</Button>
          </div>
        </div>

        <div className="passport-visual animate-fade-in">
          <div className="ticket-mockup-wrapper">
            <div className="ticket-mockup glass shadow-xl">
              <div className="ticket-header">
                <div className="ticket-logo">
                  <Heart fill="var(--primary)" color="var(--primary)" size={16} />
                  <span>SmartBook Digital Ticket</span>
                </div>
                <div className="ticket-status">CONFIRMED</div>
              </div>
              <div className="ticket-body">
                <div className="ticket-user">
                  <div className="avatar-placeholder"></div>
                  <div>
                    <div className="ticket-label">Patient Name</div>
                    <div className="ticket-value">Praduman Jaiswal</div>
                  </div>
                </div>
                <div className="ticket-info-grid">
                  <div>
                    <div className="ticket-label">Department</div>
                    <div className="ticket-value">Cardiology</div>
                  </div>
                  <div>
                    <div className="ticket-label">Date</div>
                    <div className="ticket-value">OCT 24, 2026</div>
                  </div>
                </div>
                <div className="ticket-hospital">
                  <div className="ticket-label">Facility</div>
                  <div className="ticket-value">Apollo Flagship Hospital</div>
                </div>
              </div>
              <div className="ticket-footer">
                <div className="qr-code-placeholder"></div>
                <Button variant="secondary" size="sm" className="w-full">
                  <Download size={14} /> Download Ticket
                </Button>
              </div>
            </div>
            {/* Decors */}
            <div className="decoration-blob-1"></div>
            <div className="decoration-blob-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthPassport;
