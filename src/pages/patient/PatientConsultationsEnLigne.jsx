import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Badge, Alert, Spinner, Button, Modal } from 'react-bootstrap';

const canJoinConsultation = (statut) => {
  const s = statut.toLowerCase();
  return s === 'confirmé' || s === 'en_attente' || s === 'en attente';
};

const PatientConsultationsEnLigne = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/consultations/patient/online', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Erreur de chargement');

        const data = await response.json();

        const formattedData = data.map(c => ({
          id: c.id,
          docteur: c.rendezVous?.docteur
            ? `${c.rendezVous.docteur.prenom} ${c.rendezVous.docteur.nom}`
            : 'Docteur',
          date: c.rendezVous?.dateConsultationAt
            ? new Date(c.rendezVous.dateConsultationAt).toLocaleDateString()
            : 'N/A',
          time: c.rendezVous?.heureConsultation
            ? c.rendezVous.heureConsultation.substring(0, 5)
            : 'N/A',
          symptoms: c.symptoms || 'Non spécifié',
          statut: c.statut || c.rendezVous?.statut || 'inconnu',
          prescription: c.prescription || '',
          lienVideo: `https://meet.jit.si/${c.id}-consultation`
        }));

        setConsultations(formattedData);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const handleJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement des consultations...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h2 className="my-4">Mes consultations en ligne</h2>

      <Card>
        <Card.Header>Liste de vos consultations en ligne</Card.Header>
        <ListGroup variant="flush">
          {consultations.length === 0 ? (
            <ListGroup.Item>
              <em>Aucune consultation en ligne prévue.</em>
            </ListGroup.Item>
          ) : (
            consultations.map(consultation => (
              <ListGroup.Item key={consultation.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">Dr. {consultation.docteur}</h5>
                    <p className="mb-1">
                      Date: {consultation.date} à {consultation.time}
                    </p>
                    <p className="mb-1">Symptômes: {consultation.symptoms}</p>
                    <Badge
                      bg={
                        consultation.statut.toLowerCase() === 'confirmé'
                          ? 'success'
                          : consultation.statut.toLowerCase() === 'annulé'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {consultation.statut}
                    </Badge>
                  </div>

                  {canJoinConsultation(consultation.statut) && (
                    <Button
                      variant="primary"
                      onClick={() => handleJoinConsultation(consultation)}
                    >
                      Rejoindre la consultation
                    </Button>
                  )}
                </div>

                {consultation.prescription && consultation.statut === 'terminé' && (
                  <div className="mt-3">
                    <h6>Prescription:</h6>
                    <p>{consultation.prescription}</p>
                  </div>
                )}
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card>

      {/* Modal avec l'iframe Jitsi */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        fullscreen
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Consultation en ligne avec Dr. {selectedConsultation?.docteur}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "90vh", padding: 0 }}>
          <iframe
            src={selectedConsultation?.lienVideo}
            allow="camera; microphone; fullscreen; display-capture"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Consultation Vidéo"
          />
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default PatientConsultationsEnLigne;
