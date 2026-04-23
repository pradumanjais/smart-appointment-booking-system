import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Video, MapPin, X, Activity } from 'lucide-react';
import api from '../../api';
import DoctorCard from './DoctorCard';

// Hook for debouncing filter inputs to prevent excessive API calls
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    mode: '',
    maxFee: '',
    sort: 'rating'
  });

  const debouncedFilters = useDebounce(filters, 400);

  const specializations = [
    'General Medicine', 'General Physician', 'Cardiology', 'Dermatology', 
    'Pediatrics', 'Neurologist', 'Orthopedics', 'Psychiatry',
    'Gynecology', 'ENT Specialist', 'Ophthalmology', 'Gastroenterology',
    'Urology', 'Oncology', 'Endocrinology', 'Pulmonology',
    'Nephrology', 'Rheumatology', 'Homeopathy', 'Ayurveda',
    'Dentistry', 'Dietician', 'Nutritionist', 'Physiotherapy',
    'Radiology', 'Pathology'
  ].sort();

  const fetchDoctors = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      // Clean empty values to prevent malformed queries
      const cleanFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '')
      );
      const { data } = await api.get('/providers', { params: cleanFilters });
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever debounced filters change
  useEffect(() => {
    fetchDoctors(debouncedFilters);
  }, [debouncedFilters, fetchDoctors]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      specialization: '',
      mode: '',
      maxFee: '',
      sort: 'rating'
    });
  };

  const hasActiveFilters = filters.specialization || filters.mode || filters.maxFee;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '60px 20px 80px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative circles */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', right: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.2)', filter: 'blur(50px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.5px' }}>
            Find & Book the <span style={{ color: '#38bdf8' }}>Best Doctors</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto' }}>
            Get instant access to top-tier healthcare professionals for online or clinic consultations.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ 
        maxWidth: '1280px', 
        margin: '-40px auto 0', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        gap: '30px',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}>
        
        {/* Left Sidebar Filters (Desktop) */}
        <aside style={{
          width: '320px',
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)',
          border: '1px solid #f1f5f9',
          position: 'sticky',
          top: '20px',
          display: window.innerWidth > 992 ? 'block' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Filters</h3>
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Clear all
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Search filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Search Keyword
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  name="search"
                  placeholder="Doctor, Clinic, Specialization" 
                  value={filters.search}
                  onChange={handleFilterChange}
                  style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', fontWeight: 500 }}
                  onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Specialization
              </label>
              <select 
                name="specialization"
                value={filters.specialization}
                onChange={handleFilterChange}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', fontWeight: 500, color: '#334155', cursor: 'pointer' }}
              >
                <option value="">All Specialities</option>
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Consultation Mode */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Consultation Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['In-person', 'Video'].map(m => (
                  <button
                    key={m}
                    onClick={() => setFilters(prev => ({ ...prev, mode: prev.mode === m ? '' : m }))}
                    style={{ 
                      padding: '12px 0', 
                      borderRadius: '12px', 
                      border: '1.5px solid', 
                      borderColor: filters.mode === m ? '#6366f1' : '#e2e8f0',
                      background: filters.mode === m ? '#eef2ff' : 'white',
                      color: filters.mode === m ? '#4f46e5' : '#64748b',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {m === 'Video' ? <Video size={16} /> : <MapPin size={16} />}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Budget */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Max Fee (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#94a3b8' }}>₹</span>
                <input 
                  type="number" 
                  name="maxFee"
                  placeholder="e.g. 1000"
                  value={filters.maxFee}
                  onChange={handleFilterChange}
                  style={{ width: '100%', padding: '12px 16px 12px 36px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', fontWeight: 500 }}
                  onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Bar for Mobile Filter Trigger & Sort */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px',
            background: 'white',
            padding: '16px 24px',
            borderRadius: '20px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {loading ? 'Finding experts...' : `${doctors.length} Doctors Available`}
              </h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setShowMobileFilters(true)}
                style={{
                  display: window.innerWidth <= 992 ? 'flex' : 'none',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f1f5f9',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <SlidersHorizontal size={18} /> Filters
                {hasActiveFilters && <span style={{ background: '#6366f1', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>!</span>}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Sort:</span>
                <select 
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  style={{ padding: '10px 32px 10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2364748b%27 stroke-width=%273%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpolyline points=%276 9 12 15 18 9%27%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="rating">Top Rated</option>
                  <option value="experience">Experienced</option>
                  <option value="priceLow">Fee Filter: Low</option>
                  <option value="priceHigh">Fee Filter: High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Doctor Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton-card" style={{ height: '320px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite linear', borderRadius: '24px', border: '1px solid #e2e8f0' }} />
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {doctors.map(doc => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '32px', border: '1.5px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Search size={40} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>No matches found</h3>
              <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '400px' }}>We couldn't find any doctors matching your current filters. Try relaxing your criteria or search across all specialities.</p>
              <button 
                onClick={resetFilters} 
                style={{ padding: '12px 28px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global styles for shimmers */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
};

export default DoctorSearch;
