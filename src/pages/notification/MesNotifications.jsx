import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

export default function MesNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/mes-notifications');
        setNotifications(response.data);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement des notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div className="text-center mt-4">Chargement...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h4 className="mb-0">Mes Notifications</h4>
        </div>
        <div className="card-body">
          {notifications.length === 0 ? (
            <p className="text-center">Aucune notification pour le moment.</p>
          ) : (
            <ul className="list-group">
              {notifications.map((notif, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {notif.message}
                  <span className="badge bg-secondary">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
