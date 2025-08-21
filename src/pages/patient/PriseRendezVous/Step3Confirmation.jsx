import React, { useState } from 'react';
import { Card, Button, Alert, ListGroup } from 'react-bootstrap';
import { fr } from 'date-fns/locale';
import { format, parseISO, isValid } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Step3Confirmation = ({ prevStep, data = {} }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    // Vérification des champs obligatoires
    if (!data?.docteur?.id) {
      setError('Veuillez sélectionner un médecin avant de confirmer');
      return;
    }
    if (!data.date || !data.time?.debut) {
      setError('Veuillez sélectionner une date et une heure');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentification requise');

    const response = await axios.post(
      'https://myhospital.archipel-dutyfree.com/api/rendezVous',
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

      navigate('/mes-rdv', { state: { success: true } });

    } catch (err) {
      console.error('Erreur:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'Erreur lors de la création du rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConsultationType = () => {
    switch (data?.consultationType) {
      case 'en_ligne': return 'En ligne';
      case 'en_cabinet': return 'En cabinet';
      case 'a_domicile': return 'À domicile';
      default: return 'Non spécifié';
    }
  };

  const formatDateTime = () => {
    try {
      if (!data?.date || !data?.time?.debut) return 'Date ou heure non spécifiée';
      const date = parseISO(data.date);
      if (!isValid(date)) return 'Date invalide';
      return `${format(date, "EEEE d MMMM yyyy", { locale: fr })} à ${data.time.debut}`;
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-4">3. Confirmation</h4>

        {error && <Alert variant="danger">{error}</Alert>}

        <ListGroup variant="flush" className="mb-4">
          <ListGroup.Item>
            <strong>Médecin:</strong> {data?.docteur?.nom
              ? `Dr. ${data.docteur.nom} (${data.docteur.specialite || 'Spécialité non précisée'})`
              : 'Non spécifié'}
          </ListGroup.Item>

          <ListGroup.Item>
            <strong>Motif/Symptômes:</strong> {data?.symptoms || 'Non spécifié'}
          </ListGroup.Item>

          <ListGroup.Item>
            <strong>Type:</strong> {getConsultationType()}
          </ListGroup.Item>

          <ListGroup.Item>
            <strong>Date et heure:</strong> {formatDateTime()}
          </ListGroup.Item>

          {data?.consultationType === 'a_domicile' && (
            <ListGroup.Item>
              <strong>Adresse:</strong> {data?.address || 'À confirmer'}
            </ListGroup.Item>
          )}
        </ListGroup>

        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={prevStep}>Retour</Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={isSubmitting || !data?.docteur?.id || !data?.date || !data?.time?.debut}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Confirmer le rendez-vous'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Step3Confirmation;
