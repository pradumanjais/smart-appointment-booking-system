import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import Button from '../common/Button';

const NationalNetwork = () => {
  const flagshipLocations = [
    "New Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Lucknow"
  ];

  return (
    <section className="network-section section container">
      <div className="network-container glass p-lg animate-fade-in">
        <div className="network-info">
          <div className="network-header">
            <Globe size={48} className="network-icon" />
            <h2 className="section-title-large">Bharat Healthcare Network</h2>
          </div>
          <p className="section-subtitle">
            Our presence spans across all 36 States and Union Territories, 
            connecting rural and urban centers to flagship medical facilities.
          </p>
          <div className="location-chips">
            {flagshipLocations.map(loc => (
              <span key={loc} className="loc-chip">{loc}</span>
            ))}
            <span className="loc-chip more">+28 more States</span>
          </div>
        </div>
        <div className="network-cta">
           <Link to="/register">
             <Button variant="outline" size="lg" className="w-full">Join the Network</Button>
           </Link>
           <p className="cta-note">Join 500+ clinics already verified.</p>
        </div>
      </div>
    </section>
  );
};

export default NationalNetwork;
