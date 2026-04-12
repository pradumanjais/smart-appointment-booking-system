import React from 'react';
import { MapPin, CheckCircle, PlusSquare, Calendar, User, MessageSquare, ArrowRight } from 'lucide-react';

const BookingJourney = () => {
  const steps = [
    { 
      id: 1, 
      title: "Identify Facility", 
      desc: "Choose from our network of verified hospitals across India.",
      icon: <MapPin size={24} />,
      color: "var(--primary)"
    },
    { 
      id: 2, 
      title: "Select Specialization", 
      desc: "Pick from 24+ medical departments and specialized care units.",
      icon: <PlusSquare size={24} />,
      color: "#0ea5e9"
    },
    { 
      id: 3, 
      title: "Choose Your Expert", 
      desc: "Select from 450+ top-rated medical experts and surgeons.",
      icon: <User size={24} />,
      color: "#8b5cf6"
    },
    { 
      id: 4, 
      title: "Instant Confirmation", 
      desc: "Receive your digital ticket and SMS confirmation immediately.",
      icon: <MessageSquare size={24} />,
      color: "var(--success)"
    }
  ];

  return (
    <section className="journey-section section container">
      <div className="section-header-center animate-fade-in">
        <h2 className="section-title-large">Seamless Path to <span className="text-gradient">Premium Care</span></h2>
        <p className="section-subtitle">Experience a digital-first booking flow designed for speed and patient convenience.</p>
      </div>

      <div className="journey-grid mt-12">
        {steps.map((step, index) => (
          <div key={step.id} className="journey-card-wrapper">
            <div className="journey-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="journey-icon-outer" style={{ borderColor: step.color }}>
                <div className="journey-icon-inner" style={{ background: step.color }}>
                  {step.icon}
                </div>
              </div>
              <div className="journey-content">
                <span className="step-number-badge">Step 0{step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="journey-connector">
                <ArrowRight size={24} className="connector-icon" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default BookingJourney;
