import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

const Step2SelectTime = ({ nextStep, prevStep, updateData, initialData }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const docteurId = initialData?.docteur?.id || initialData?.docteur; 
  const docteurInfo = initialData?.docteur;

  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
  }, [docteurId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!docteurId) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8000/api/disponibilites?docteur=${docteurId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Données reçues:", response.data);

        const slotsByDate = {};
        response.data.forEach(item => {
          slotsByDate[item.date] = item.creneaux || [];
        });

        setAvailableSlots(slotsByDate);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement des disponibilités");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [docteurId]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      updateData({
        date: selectedDate,
        time: selectedTime,
      });
      nextStep();
    }
  };

  const formatDay = (dateStr) => {
    if (!dateStr || isNaN(Date.parse(dateStr))) return 'Date invalide';
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  const renderSpecialites = (specialites) => {
    if (!specialites || specialites.length === 0) return "Non spécifié";
    return Array.isArray(specialites)
      ? specialites.map(s => s.nom).join(', ')
      : specialites.nom || "Non spécifié";
  };

  if (loading) return <Alert variant="info">Chargement des disponibilités...</Alert>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-4">2. Choisissez un créneau</h4>

          {docteurInfo && (
            <p className="text-muted mb-4">
              Disponibilités du Dr. {docteurInfo.nom} {docteurInfo.prenom} ({renderSpecialites(docteurInfo.specialites)})
            </p>
          )}

          <Row>
            <Col md={5}>
              <h5>Date</h5>
              <ListGroup className="mb-3">
                {Object.keys(availableSlots).map(date => (
                  <ListGroup.Item
                    key={date}
                    active={selectedDate === date}
                    onClick={() => handleDateSelect(date)}
                    action
                  >
                    {formatDay(date)}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>

            <Col md={7}>
              <h5>Heure</h5>
              {selectedDate ? (
                <div className="time-slots-container">
                  {availableSlots[selectedDate]?.length > 0 ? (
                    <Row className="g-2">
                      {availableSlots[selectedDate].map((slot, index) => (
                        <Col xs={6} sm={4} key={slot.id ?? index}>
                          <Button
                            variant={selectedTime?.id === slot.id ? 'primary' : 'outline-primary'}
                            className="w-100 mb-2"
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot.debut && slot.fin
                              ? `${slot.debut} - ${slot.fin}`
                              : "Heure indisponible"}
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="warning">Aucun créneau disponible pour cette date</Alert>
                  )}
                </div>
              ) : (
                <Alert variant="warning">Veuillez sélectionner une date pour voir les créneaux disponibles</Alert>
              )}
            </Col>
          </Row>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={prevStep}>Retour</Button>
            <Button variant="primary" type="submit" disabled={!selectedDate || !selectedTime}>Suivant</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Step2SelectTime;
