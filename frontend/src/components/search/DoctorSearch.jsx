import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Stethoscope, Video, MapPin, X, ChevronDown, Activity } from 'lucide-react';
import api from '../../api';
import DoctorCard from './DoctorCard';
import InputField from '../common/InputField';
import Button from '../common/Button';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    mode: '',
    maxFee: '',
    sort: 'rating'
  });

  const specializations = [
    'General Medicine', 'General Physician', 'Cardiology', 'Dermatology', 
    'Pediatrics', 'Neurologist', 'Orthopedics', 'Psychiatry',
    'Gynecology', 'ENT Specialist', 'Ophthalmology', 'Gastroenterology',
    'Urology', 'Oncology', 'Endocrinology', 'Pulmonology',
    'Nephrology', 'Rheumatology', 'Homeopathy', 'Ayurveda',
    'Dentistry', 'Dietician', 'Nutritionist', 'Physiotherapy',
    'Radiology', 'Pathology'
  ].sort();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.specialization) params.append('specialization', currentFilters.specialization);
      if (currentFilters.mode) params.append('mode', currentFilters.mode);
      if (currentFilters.maxFee) params.append('maxFee', currentFilters.maxFee);
      if (currentFilters.sort) params.append('sort', currentFilters.sort);

      const { data } = await api.get(`/providers?${params.toString()}`);
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    fetchDoctors();
    setShowFilters(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      specialization: '',
      mode: '',
      maxFee: '',
      sort: 'rating'
    };
    setFilters(defaultFilters);
    fetchDoctors(defaultFilters);
  };

  return (
    <div className="search-page-container" style={{ paddingBottom: '80px' }}>
      {/* Search Hero Section */}
      <div className="search-hero" style={{ 
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
        padding: '60px 20px',
        textAlign: 'center',
        color: 'white',
        borderRadius: '0 0 40px 40px',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>
          Find Your Perfect Specialist
        </h1>
        <p style={{ opacity: 0.9, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px' }}>
          Book appointments with top-rated doctors for in-person or video consultations.
        </p>

        {/* Global Search Bar */}
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <form onSubmit={applyFilters} style={{ 
            display: 'flex', 
            background: 'white', 
            padding: '10px', 
            borderRadius: '20px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            gap: '10px' 
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 15px', borderRight: '1px solid #f1f5f9' }}>
              <Search size={20} color="#6366f1" style={{ marginRight: '12px' }} />
              <input 
                type="text" 
                name="search"
                placeholder="Search by name, clinic or specialization..." 
                value={filters.search}
                onChange={handleFilterChange}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: '#1e293b' }}
              />
            </div>
            
            <div className="desktop-filters" style={{ display: 'flex', gap: '10px' }}>
                <select 
                  name="specialization"
                  value={filters.specialization}
                  onChange={handleFilterChange}
                  style={{ border: 'none', background: '#f8fafc', padding: '0 20px', borderRadius: '12px', fontWeight: 600, color: '#475569', outline: 'none' }}
                >
                  <option value="">All Specialities</option>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <Button type="submit" style={{ borderRadius: '14px', padding: '12px 30px' }}>
              Search
            </Button>
            
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={{ 
                background: '#f1f5f9', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '14px', 
                color: '#475569', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <SlidersHorizontal size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Active Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {loading ? 'Finding experts...' : `${doctors.length} Doctors Found`}
            </h2>
            {(filters.specialization || filters.mode || filters.maxFee) && (
              <button 
                onClick={resetFilters}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Sort By:</span>
            <select 
              name="sort"
              value={filters.sort}
              onChange={(e) => {
                handleFilterChange(e);
                fetchDoctors({ ...filters, sort: e.target.value });
              }}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, color: '#0f172a' }}
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card" style={{ height: '300px', background: '#f1f5f9', borderRadius: '24px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : doctors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
            {doctors.map(doc => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: '32px' }}>
            <div style={{ display: 'inline-flex', padding: '20px', background: 'white', borderRadius: '50%', marginBottom: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                <Search size={40} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>No doctors found</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Try adjusting your filters or searching for something else.</p>
            <Button onClick={resetFilters} variant="secondary">Reset All Filters</Button>
          </div>
        )}
      </div>

      {/* Advanced Filters Modal (Mobile/Tablet Side) */}
      {showFilters && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="animate-slide-left" style={{ width: '100%', maxWidth: '400px', background: 'white', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Filters</h2>
              <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px', color: '#334155' }}>Specialization</label>
                <select 
                  name="specialization"
                  value={filters.specialization}
                  onChange={handleFilterChange}
                  className="input-field"
                  style={{ width: '100%' }}
                >
                  <option value="">All Specialities</option>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px', color: '#334155' }}>Consultation Mode</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['In-person', 'Video'].map(m => (
                    <button
                      key={m}
                      onClick={() => setFilters(prev => ({ ...prev, mode: prev.mode === m ? '' : m }))}
                      style={{ 
                        flex: 1, 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '2px solid', 
                        borderColor: filters.mode === m ? 'var(--primary)' : '#f1f5f9',
                        background: filters.mode === m ? 'var(--primary-light)' : 'white',
                        color: filters.mode === m ? 'var(--primary)' : '#64748b',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {m === 'Video' ? <Video size={16} /> : <MapPin size={16} />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px', color: '#334155' }}>Max Budget (₹)</label>
                <input 
                  type="number" 
                  name="maxFee"
                  placeholder="e.g. 1000"
                  value={filters.maxFee}
                  onChange={handleFilterChange}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '15px' }}>
              <Button variant="secondary" onClick={resetFilters} style={{ flex: 1 }}>Reset</Button>
              <Button onClick={applyFilters} style={{ flex: 1 }}>Apply Filters</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
