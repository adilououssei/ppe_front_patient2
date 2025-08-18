import React, { useState, useEffect } from 'react';
import { Badge, Alert, Container, Button, Card } from 'react-bootstrap';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import { FaUserMd, FaVideo, FaHome, FaClinicMedical, FaCalendarPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './rdv.css'; 

const MesRendezVousListe = () => {
  const navigate = useNavigate();
  const [rendezvous, setRendezvous] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // tu peux changer
  const [totalPages, setTotalPages] = useState(1);

  const formatDateHeure = (dateStr, timeStr) => {
    try {
      const dateTime = parseISO(`${dateStr}T${timeStr}`);
      return format(dateTime, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return `${dateStr} à ${timeStr}`;
    }
  };

  const getBadgeVariant = (statut) => {
    switch (statut) {
      case 'confirmé':
        return 'success';
      case 'annulé':
        return 'danger';
      case 'en_attente':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getConsultationIcon = (type) => {
    switch (type) {
      case 'en_ligne':
        return <FaVideo className="me-1" />;
      case 'a_domicile':
        return <FaHome className="me-1" />;
      default:
        return <FaClinicMedical className="me-1" />;
    }
  };

  const chargerRendezVous = async () => {
    try {
      setChargement(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/mes-rendezvous?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // L'API retourne { data, total, page, limit, totalPages }
      const { data, totalPages } = response.data;

      const donnees = data.map(rdv => ({
        id: rdv.id,
        docteur: {
          nom: rdv.docteur?.nom || 'Nom inconnu',
          prenom: rdv.docteur?.prenom || '',
          specialite: rdv.docteur?.specialite || 'Spécialité inconnue',
        },
        date: rdv.dateConsultationAt ? rdv.dateConsultationAt.split('T')[0] : '',
        heure: rdv.heureConsultation ? rdv.heureConsultation.split('T')[1].substring(0, 5) : '',
        statut: rdv.statut || 'inconnu',
        type: rdv.typeConsultation || 'en_cabinet',
        motif: rdv.description || 'Non spécifié',
      }));

      setRendezvous(donnees);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Erreur:', error);
      setErreur('Erreur lors du chargement des rendez-vous');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerRendezVous();
  }, [page]); // recharger à chaque changement de page

  const annulerRendezVous = async (id) => {
    const confirmation = window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?");
    if (!confirmation) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/rendezvous/${id}/update`,
        { statut: "annulé" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRendezvous(prev =>
        prev.map(rdv =>
          rdv.id === id ? { ...rdv, statut: 'annulé' } : rdv
        )
      );
    } catch (error) {
      console.error('Erreur:', error);
      setErreur("Erreur lors de l'annulation du rendez-vous");
    }
  };

  if (chargement) {
    return (
      <Container className="my-4">
        <Alert variant="info">Chargement des rendez-vous...</Alert>
      </Container>
    );
  }

  if (erreur) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{erreur}</Alert>
      </Container>
    );
  }

  // Filtrer ici selon l'onglet
  const now = new Date();
  const filteredRendezVous = rendezvous.filter(rdv => {
    const rdvDate = parseISO(`${rdv.date}T${rdv.heure}`);
    if (activeTab === 'upcoming') {
      return isAfter(rdvDate, now) && rdv.statut !== 'annulé';
    } else {
      return isBefore(rdvDate, now) || rdv.statut === 'annulé';
    }
  });

  return (
    <Container className="my-4 appointment-container">
      <div className="appointment-header text-center mb-4">
        <h2 className="mb-2">Rendez-vous</h2>
        <p className="text-muted">Tous les types de consultations</p>
      </div>

      <div className="d-flex appointment-tabs mb-4">
        <Button
          variant="link"
          className={`flex-grow-1 tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          RDV à venir
        </Button>
        <Button
          variant="link"
          className={`flex-grow-1 tab-button ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          RDV passés
        </Button>
      </div>

      <div className="appointment-list mb-4">
        {filteredRendezVous.length === 0 ? (
          <Card className="text-center p-4 no-appointment-card">
            <Card.Body>
              <p className="text-muted">Aucun rendez-vous disponible</p>
            </Card.Body>
          </Card>
        ) : (
          filteredRendezVous.map(rdv => (
            <Card key={rdv.id} className="mb-3 appointment-card">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="d-flex align-items-center mb-2">
                      <FaUserMd className="me-2 text-primary" />
                      <h5 className="mb-0">Dr. {rdv.docteur.nom} {rdv.docteur.prenom}</h5>
                    </div>
                    <p className="text-muted mb-1">{rdv.docteur.specialite}</p>
                    <p className="mb-2">
                      <small>{formatDateHeure(rdv.date, rdv.heure)}</small>
                    </p>
                    <div className="d-flex align-items-center mb-2">
                      <Badge bg={getBadgeVariant(rdv.statut)} className="me-2 text-capitalize">
                        {rdv.statut.replace('_', ' ')}
                      </Badge>
                      <span className="text-muted">
                        {getConsultationIcon(rdv.type)}
                        {rdv.type === 'en_ligne' && ' Visio'}
                        {rdv.type === 'a_domicile' && ' À domicile'}
                        {rdv.type === 'en_cabinet' && ' Cabinet'}
                      </span>
                    </div>
                    <p className="mb-0"><strong>Motif :</strong> {rdv.motif}</p>
                  </div>
                  {activeTab === 'upcoming' && rdv.statut === 'en_attente' && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => annulerRendezVous(rdv.id)}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mb-4">
        <Button
          variant="outline-primary"
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
          className="me-2"
        >
          Précédent
        </Button>
        <span className="align-self-center">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline-primary"
          disabled={page === totalPages}
          onClick={() => setPage(prev => prev + 1)}
          className="ms-2"
        >
          Suivant
        </Button>
      </div>

      <Button variant="primary" className="w-100 new-appointment-button" onClick={() => navigate('/prise-rendez-vous')}>
        <FaCalendarPlus className="me-2" />
        Nouveau rendez-vous
      </Button>
    </Container>
  );
};

export default MesRendezVousListe;
