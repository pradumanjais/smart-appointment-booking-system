import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import api from '../../api';
import './dashboard.css';

const ProviderDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await api.get('/bookings/provider-appointments');
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-header">
        <h1>Provider Dashboard</h1>
        <p>Manage your upcoming appointments and schedule.</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-value">{appointments.length}</div>
          <div className="stat-label">Total Appointments</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{appointments.filter(a => a.status === 'confirmed').length}</div>
          <div className="stat-label">Confirmed</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{appointments.filter(a => a.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </Card>
      </div>

      <div className="appointments-section">
        <h2>Upcoming Appointments</h2>
        <div className="appointments-list">
          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card key={appointment._id} className="appointment-card" hoverEffect={false}>
                <div className="appointment-user">
                  <User size={20} className="primary-icon" />
                  <div>
                    <h3>{appointment.userId?.name}</h3>
                    <p className="detail-item"><Clock size={14} /> {appointment.startTime} - {appointment.endTime}</p>
                    <p className="detail-item"><Calendar size={14} /> {new Date(appointment.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="appointment-status">
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="appointment-actions">
                  <Button size="sm" variant="outline" className="btn-success">
                    <CheckCircle size={16} /> Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="btn-danger" style={{ marginLeft: '8px' }}>
                    <XCircle size={16} /> Cancel
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p>No appointments found for your profile.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
