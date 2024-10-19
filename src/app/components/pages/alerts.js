import { useEffect, useState } from 'react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('/api/alerts') // Fetch alerts from LoopBack API
      .then(response => response.json())
      .then(data => setAlerts(data));
  }, []);

  return (
    <div>
      <h1>Alerts and Notifications</h1>
      {alerts.length === 0 ? (
        <p>No alerts.</p>
      ) : (
        <ul>
          {alerts.map((alert, index) => (
            <li key={index}>{alert.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
