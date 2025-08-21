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

  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
  }, [initialData.docteur]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!initialData.docteur?.id) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `https://myhospital.archipel-dutyfree.com/api/disponibilites?docteur=${initialData.docteur.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Données reçues:", response.data);

        const slotsByDate = {};
        response.data.forEach(item => {
          const dateKey = item.date;
          slotsByDate[dateKey] = item.creneaux || [];
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
  }, [initialData.docteur]);

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

  if (loading) {
    return <Alert variant="info">Chargement des disponibilités...</Alert>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-4">2. Choisissez un créneau</h4>
          <p className="text-muted mb-4">
            Disponibilités du Dr. {initialData.docteur?.nom} ({initialData.docteur?.specialite?.nom})
          </p>

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
                            {`${slot.debut ? format(parse(slot.debut, 'HH:mm', new Date()), 'HH:mm') : ''} - ${slot.fin ? format(parse(slot.fin, 'HH:mm', new Date()), 'HH:mm') : ''}`}
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="warning">Aucun créneau disponible pour cette date</Alert>
                  )}
                </div>
              ) : (
                <Alert variant="warning">
                  Veuillez sélectionner une date pour voir les créneaux disponibles
                </Alert>
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
