import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import BookingModal from './BookingModal';
import api from '../../api';

const UserDashboard = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data } = await api.get('/providers');
        setProviders(data);
        setFilteredProviders(data);
      } catch (err) {
        console.error('Error fetching providers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = providers;

    if (search) {
      result = result.filter(p => 
        p.userId?.name.toLowerCase().includes(search.toLowerCase()) ||
        p.specialization.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (specialization !== 'All') {
      result = result.filter(p => p.specialization === specialization);
    }

    setFilteredProviders(result);
  }, [search, specialization, providers]);

  const specializations = ['All', ...new Set(providers.map(p => p.specialization))];

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-header">
        <h1>Find Your Expert</h1>
        <p>Browse through our verified service providers and book an appointment.</p>
      </div>

      <div className="search-filters">
        <div className="search-bar glass">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or specialization..." 
            className="search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdown glass">
          <select 
            value={specialization} 
            onChange={(e) => setSpecialization(e.target.value)}
            className="dropdown-select"
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="providers-grid">
        {loading ? (
          <div className="loading-state">Loading experts...</div>
        ) : filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <Card key={provider._id} className="provider-card">
              <div className="provider-info">
                <img 
                  src={provider.userId?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} 
                  alt={provider.userId?.name} 
                  className="provider-avatar" 
                />
                <div>
                  <h3>{provider.userId?.name}</h3>
                  <p className="specialization">{provider.specialization}</p>
                </div>
              </div>
              <div className="provider-details">
                <div className="detail-item">
                  <MapPin size={16} /> {provider.location || 'Remote'}
                </div>
                <div className="detail-item">
                  <Star size={16} className="star-icon" /> {provider.rating} Rating
                </div>
              </div>
              <div className="provider-actions">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedProvider(provider);
                    setShowModal(true);
                  }}
                >
                  <Calendar size={16} /> Book Appointment
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p>No providers found matching your search.</p>
        )}
      </div>

      {showModal && selectedProvider && (
        <BookingModal 
          provider={selectedProvider} 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            // Optional: refresh data or show global toast
            console.log('Booking successful!');
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
