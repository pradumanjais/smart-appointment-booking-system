import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, ShieldCheck, Award } from 'lucide-react';
import './calendar.css';

const DailyScheduleCalendar = ({ appointments = [], providerData = {} }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Slots Configuration
  const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 AM to 8:00 PM
  const slotsPerHour = providerData.slotsPerHour || 1;

  // Generate Week Dates
  const weekDates = useMemo(() => {
    const dates = [];
    const firstDay = new Date(currentDate);
    firstDay.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start with Monday

    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentDate]);

  // Data Mapping Engine: Map appointments into Grid Slots
  const gridMap = useMemo(() => {
    const map = {};
    
    appointments.forEach(appt => {
      const apptDate = new Date(appt.date).toLocaleDateString();
      const hour = parseInt(appt.startTime.split(':')[0]);
      
      if (!map[apptDate]) map[apptDate] = {};
      if (!map[apptDate][hour]) map[apptDate][hour] = { appts: [], count: 0 };
      
      map[apptDate][hour].appts.push(appt);
      map[apptDate][hour].count++;
    });
    
    return map;
  }, [appointments]);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const getCapacityClass = (count) => {
    const ratio = count / slotsPerHour;
    if (ratio === 0) return '';
    if (ratio < 0.5) return 'low';
    if (ratio < 1) return 'medium';
    return 'full';
  };

  return (
    <div className="calendar-wrapper animate-slide-up">
      {/* Calendar Header with Navigation */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="btn-icon" onClick={() => navigateWeek(-1)}>
            <ChevronLeft size={20} />
          </button>
          <span className="current-week-label">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
            {' - '} 
            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button className="btn-icon" onClick={() => navigateWeek(1)}>
            <ChevronRight size={20} />
          </button>
          <button className="btn-pill ml-4" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
        </div>
        
        <div className="calendar-meta" style={{ display: 'flex', gap: '16px' }}>
          <div className="meta-badge">
            <Users size={14} className="text-primary" />
            <span>Capacity: {slotsPerHour}/hr</span>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="calendar-grid-container">
        <div className="calendar-grid">
          {/* Time Column */}
          <div className="time-col">
            <div className="day-header" style={{ borderBottom: 'none' }}></div> {/* Spacer */}
            {HOURS.map(hour => (
              <div key={hour} className="time-slot-label">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDates.map(date => {
            const dateStr = date.toLocaleDateString();
            const dayAppts = gridMap[dateStr] || {};
            const today = isToday(date);

            return (
              <div key={dateStr} className="day-col">
                <div className={`day-header ${today ? 'is-today' : ''}`}>
                  <span className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="day-date">{date.getDate()}</span>
                </div>

                {HOURS.map(hour => {
                   const slotData = dayAppts[hour] || { appts: [], count: 0 };
                   const fillWidth = Math.min((slotData.count / slotsPerHour) * 100, 100);

                   return (
                     <div key={hour} className="grid-slot">
                        {slotData.appts.map(appt => (
                          <div 
                            key={appt._id} 
                            className={`event-pill event-${appt.status}`}
                            title={`${appt.userId?.name} (${appt.startTime})`}
                          >
                            <span className="event-time">{appt.startTime}</span>
                            <span className="event-patient">{appt.userId?.name.split(' ')[0]}</span>
                          </div>
                        ))}

                        {/* Capacity Meter at Bottom of Slot */}
                        <div className="capacity-meter">
                          <div 
                            className={`capacity-fill ${getCapacityClass(slotData.count)}`} 
                            style={{ width: `${fillWidth}%` }}
                          />
                        </div>
                     </div>
                   );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyScheduleCalendar;
