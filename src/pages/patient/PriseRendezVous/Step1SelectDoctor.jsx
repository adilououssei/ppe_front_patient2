import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Step1SelectDoctor = ({ nextStep, updateData, initialData }) => {
  const [docteurs, setDocteurs] = useState([]);
  const [selectedDocteur, setSelectedDocteur] = useState(initialData?.docteur || null);
  const [consultationType, setConsultationType] = useState(initialData?.consultationType || 'en_ligne');
  const [symptoms, setSymptoms] = useState(initialData?.symptoms || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocteur = async () => {
      try {
        const token = localStorage.getItem('token'); // Récupération du token JWT
        if (!token) {
          throw new Error("Utilisateur non authentifié");
        }

        const response = await axios.get('http://localhost:8000/api/docteurs', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        setDocteurs(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des docteurs', error);
        setError(error.message || "Erreur inconnue");
      }
    };

    fetchDocteur();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData({ docteur: selectedDocteur, consultationType, symptoms });
    nextStep();
  };

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-4">1. Choisissez votre médecin</h4>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <Form.Group className="mb-4">
            <Form.Label>Type de consultation</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="En ligne"
                name="consultationType"
                value="en_ligne"
                checked={consultationType === 'en_ligne'}
                onChange={() => setConsultationType('en_ligne')}
              />
              <Form.Check
                inline
                type="radio"
                label="À domicile"
                name="consultationType"
                value="a_domicile"
                checked={consultationType === 'a_domicile'}
                onChange={() => setConsultationType('a_domicile')}
              />
              <Form.Check
                inline
                type="radio"
                label="À l'hôpital"
                name="consultationType"
                value="a_hopital"
                checked={consultationType === 'a_hopital'}
                onChange={() => setConsultationType('a_hopital')}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Décrivez vos symptômes ou le motif de consultation</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ex: Maux de tête persistants depuis 3 jours, fièvre modérée..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              Cette information aidera le médecin à préparer votre consultation.
            </Form.Text>
          </Form.Group>

          <Form.Label>Choisissez un médecin</Form.Label>
          <Row className="g-4">
            {docteurs.map(docteur => (
              <Col md={4} key={docteur.id}>
                <Card
                  className={`doctor-card ${selectedDocteur?.id === docteur.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDocteur(docteur)}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Img 
                    variant="top" 
                    src={docteur.image || '/img/default-doctor.jpg'} 
                    alt={`${docteur.nom} ${docteur.prenom}`} 
                  />
                  <Card.Body>
                    <Card.Title>{docteur.nom} {docteur.prenom}</Card.Title>
                    <Card.Text className="text-muted">{docteur.specialite}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedDocteur}
            >
              Suivant
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Step1SelectDoctor;
