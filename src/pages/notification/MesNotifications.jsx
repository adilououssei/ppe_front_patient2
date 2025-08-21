import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner, ListGroup, Badge, Alert } from 'react-bootstrap';
import api from '../../services/Api';

export default function MesNotificationsModal({ show, handleClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) return; // Ne pas fetch si modal fermée

    const fetchNotifications = async () => {
      setLoading(true);
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
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>Mes Notifications</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="text-center my-3">
            <Spinner animation="border" variant="info" />
          </div>
        )}
        {error && <Alert variant="danger" className="text-center">{error}</Alert>}
        {!loading && notifications.length === 0 && (
          <p className="text-center">Aucune notification pour le moment.</p>
        )}
        {!loading && notifications.length > 0 && (
          <ListGroup>
            {notifications.map((notif, index) => (
              <ListGroup.Item
                key={index}
                className="d-flex justify-content-between align-items-center"
              >
                {notif.message}
                <Badge bg="secondary">
                  {new Date(notif.createdAt).toLocaleString()}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
