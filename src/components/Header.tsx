import { useEffect, useState } from 'react';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const [time, setTime] = useState('00:00');
  const [cpuUsage, setCpuUsage] = useState(73);
  const [day, setDay] = useState('SATURDAY');
  const [month, setMonth] = useState('SEPTEMBER');
  const [dayNumber, setDayNumber] = useState('14');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      
      setDay(days[now.getDay()]);
      setMonth(months[now.getMonth()]);
      setDayNumber(String(now.getDate()));
    };

    updateDate();
  }, []);

  useEffect(() => {
    const updateCPU = () => {
      const usage = Math.floor(Math.random() * 30) + 50; // 50-80%
      setCpuUsage(usage);
    };

    updateCPU();
    const interval = setInterval(updateCPU, 2000);
    return () => clearInterval(interval);
  }, []);

  const circumference = 2 * Math.PI * 35;
  const offset = circumference - (cpuUsage / 100) * circumference;

  return (
    <>
      <div className="header">
        <div className="mission-day">M - DAY 29</div>
        <button className="settings-btn" onClick={onSettingsClick}>⚙ SETTINGS</button>
      </div>

      <div className="main-info">
        <div className="clock-container">
          <div className="clock-left">
            <div className="clock-left-space">
              <div className="time-label">TIME</div>
              <div className="time-display" id="time">{time}</div>
              <div className="day-badge" id="dayNumber">{dayNumber}</div>
            </div>
          </div>

          <div className="clock-center">
            <div className="hexagon-wrapper">
              <div className="hexagon">
                <div className="cpu-monitor">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" className="cpu-bg" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      className="cpu-progress" 
                      id="cpuProgress"
                      style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset
                      }}
                    />
                    <text x="50" y="58" className="cpu-text" id="cpuText">{cpuUsage}</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="clock-right">
            <div className="day-name" id="day">{day}</div>
            <div className="month-name" id="month">{month}</div>
          </div>
        </div>
        
        <div className="clock-bottom">
          <div className="year-label" id="year">YEAR {new Date().getFullYear()}</div>
          <div className="week-label">WEEK 39</div>
        </div>
      </div>
    </>
  );
}
