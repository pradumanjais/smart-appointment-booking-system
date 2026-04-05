import React, { useState } from 'react';
import { X, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import api from '../../api';

const BookingModal = ({ provider, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Slot, 2: Payment, 3: Success
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    setLoading(true);
    try {
      // Step 2: Simulate Payment Delay
      setTimeout(async () => {
        try {
          await api.post('/bookings/book', {
            providerId: provider._id,
            date: new Date(), // Simulating today for simplicity
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
          });
          setStep(3);
          if (onSuccess) onSuccess();
        } catch (err) {
          alert(err.response?.data?.message || 'Booking failed');
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay glass">
      <Card className="modal-content animate-fade-in" hoverEffect={false}>
        <div className="modal-header">
          <h3>{step === 3 ? 'Booking Confirmed' : `Book with ${provider.userId.name}`}</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        {step === 1 && (
          <div className="step-content">
            <p className="step-instruction">Select an available time slot for today:</p>
            <div className="slots-grid">
              {provider.availability[0]?.slots.map((slot, index) => (
                <div 
                  key={index} 
                  className={`slot-item ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <Clock size={16} /> {slot.startTime} - {slot.endTime}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <Button 
                disabled={!selectedSlot} 
                className="w-full"
                onClick={() => setStep(2)}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content text-center">
            <CreditCard size={48} className="primary-icon mb-4" />
            <h3>Complete Payment</h3>
            <p>You are about to book a session for **${provider.pricePerHour}**.</p>
            <div className="modal-actions">
              <Button 
                loading={loading}
                className="w-full"
                onClick={handleBook}
              >
                Pay & Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content text-center">
            <CheckCircle size={64} className="success-icon mb-4" />
            <h2 className="success-text">Success!</h2>
            <p>Your appointment has been scheduled and a confirmation email was sent.</p>
            <div className="modal-actions">
              <Button className="w-full" onClick={onClose}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookingModal;
