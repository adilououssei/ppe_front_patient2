import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Step1SelectDoctor = ({ nextStep, updateData, initialData }) => {
  const [docteurs, setDocteurs] = useState([]);
  const [selectedDocteur, setSelectedDocteur] = useState(initialData?.docteur || null);
  const [consultationType, setConsultationType] = useState(initialData?.consultationType || 'en_ligne');
  const [symptoms, setSymptoms] = useState(initialData?.symptoms || '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const fetchDocteurs = async (currentPage = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Utilisateur non authentifié");

      const response = await axios.get(
        `http://localhost:8000/api/docteurs?page=${currentPage}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend peut renvoyer un objet avec data et totalPages
      const data = Array.isArray(response.data.data) ? response.data.data : response.data;
      setDocteurs(data);
      setTotalPages(response.data.totalPages || 1);
      setPage(currentPage);
    } catch (err) {
      console.error('Erreur lors de la récupération des docteurs', err);
      setError(err.response?.data?.error || err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocteurs(page);
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData({
      docteur: selectedDocteur || null,
      consultationType,
      symptoms
    });
    nextStep();
  };

  const handlePrevPage = () => {
    if (page > 1) fetchDocteurs(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) fetchDocteurs(page + 1);
  };

  const renderSpecialites = (specialites) => {
    if (!specialites || specialites.length === 0) return "Non renseigné";
    return Array.isArray(specialites)
      ? specialites.map(s => s.nom).join(', ')
      : specialites.nom || "Non renseigné";
  };

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-4">1. Choisissez votre médecin</h4>

          {error && <div className="alert alert-danger">{error}</div>}

          <Form.Group className="mb-4">
            <Form.Label>Type de consultation</Form.Label>
            <div>
              {['en_ligne', 'a_domicile', 'en_cabinet'].map((type) => (
                <Form.Check
                  inline
                  key={type}
                  type="radio"
                  label={type.replace('_', ' ')}
                  name="consultationType"
                  value={type}
                  checked={consultationType === type}
                  onChange={() => setConsultationType(type)}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Motif / Symptômes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ex: Maux de tête persistants, fièvre..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              Cette information aidera le médecin à préparer votre consultation.
            </Form.Text>
          </Form.Group>

          <Form.Label>Choisissez un médecin</Form.Label>
          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <Row className="g-4">
                {docteurs.length > 0 ? (
                  docteurs.map((docteur) => (
                    <Col md={4} key={docteur.id}>
                      <Card
                        className={`doctor-card ${selectedDocteur?.id === docteur.id ? 'selected' : ''}`}
                        onClick={() => setSelectedDocteur(docteur)}
                        style={{ cursor: "pointer" }}
                      >
                        {docteur.image ? (
                          <Card.Img variant="top" src={docteur.image} alt={`${docteur.nom} ${docteur.prenom}`} />
                        ) : (
                          <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ height: '90px', fontSize: '3rem', color: '#6c757d' }}
                          >
                            <i className="bi bi-person-circle"></i>
                          </div>
                        )}
                        <Card.Body>
                          <Card.Title>{docteur.nom} {docteur.prenom}</Card.Title>
                          <Card.Text className="text-muted">
                            {renderSpecialites(docteur.specialites)}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col>
                    <p>Aucun médecin trouvé pour cette page.</p>
                  </Col>
                )}
              </Row>

              <div className="d-flex justify-content-center my-3">
                <Button variant="secondary" onClick={handlePrevPage} disabled={page <= 1} className="me-2">
                  Précédent
                </Button>
                <span className="align-self-center">{page} / {totalPages}</span>
                <Button variant="secondary" onClick={handleNextPage} disabled={page >= totalPages} className="ms-2">
                  Suivant
                </Button>
              </div>
            </>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit" disabled={!selectedDocteur}>
              Suivant
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Step1SelectDoctor;
