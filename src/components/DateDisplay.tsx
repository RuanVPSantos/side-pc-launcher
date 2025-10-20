import { useEffect, useState } from 'react';

export function DateDisplay() {
  const [dateInfo, setDateInfo] = useState({
    day: 'MONDAY',
    month: 'JANUARY',
    year: 'YEAR 2025',
    dayNumber: '1'
  });

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

      setDateInfo({
        day: days[now.getDay()],
        month: months[now.getMonth()],
        year: `YEAR ${now.getFullYear()}`,
        dayNumber: String(now.getDate())
      });
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="date-display">
      <div className="date-row">
        <span id="day">{dateInfo.day}</span>
        <span id="dayNumber">{dateInfo.dayNumber}</span>
      </div>
      <div className="date-row">
        <span id="month">{dateInfo.month}</span>
      </div>
      <div className="date-row">
        <span id="year">{dateInfo.year}</span>
      </div>
    </div>
  );
}
