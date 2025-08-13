import React, { useState, useEffect } from 'react';
import { ListGroup, Badge, Alert, Container, Button } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import { FaUserMd, FaVideo, FaHome, FaClinicMedical } from 'react-icons/fa';

const MesRendezVousListe = () => {
  const [rendezvous, setRendezvous] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

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

  useEffect(() => {
    const chargerRendezVous = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/mes-rendezvous', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const donnees = response.data.map(rdv => ({
          id: rdv.id,
          docteur: {
            nom: rdv.docteur?.nom || 'Nom inconnu',
            prenom: rdv.docteur?.prenom || '',
            specialite: rdv.docteur?.specialite || 'Spécialité inconnue',
          },
          date: rdv.dateConsultationAt?.split('T')[0] || '',
          heure: rdv.heureConsultation?.substring(0, 5) || '',
          statut: rdv.statut || 'inconnu',
          type: rdv.typeConsultation || 'en_cabinet',
          motif: rdv.description || 'Non spécifié',
        }));

        setRendezvous(donnees);
      } catch (error) {
        console.error('Erreur:', error);
        setErreur('Erreur lors du chargement des rendez-vous');
      } finally {
        setChargement(false);
      }
    };

    chargerRendezVous();
  }, []);

  const annulerRendezVous = async (id) => {
    const confirmation = window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?");
    if (!confirmation) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/rendezvous/${id}/update`,
        { statut: "annulé" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
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

  return (
    <Container className="my-4">
      <h2 className="mb-4"><FaClinicMedical className="me-2" />Mes Rendez-vous</h2>

      {rendezvous.length === 0 ? (
        <Alert variant="info">Aucun rendez-vous programmé</Alert>
      ) : (
        <ListGroup variant="flush">
          {rendezvous.map(rdv => (
            <ListGroup.Item key={rdv.id} className="py-3 border-start-0 border-end-0">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">
                    <FaUserMd className="me-2" />
                    Dr. {rdv.docteur.nom} {rdv.docteur.prenom}
                  </h5>
                  <small className="text-muted">
                    {rdv.docteur.specialite} • {formatDateHeure(rdv.date, rdv.heure)}
                  </small>
                  <div className="mt-2">
                    <Badge bg={getBadgeVariant(rdv.statut)} className="me-2 text-capitalize">
                      {rdv.statut.replace('_', ' ')}
                    </Badge>
                    <Badge bg="light" text="dark">
                      {rdv.type === 'en_ligne' && <><FaVideo className="me-1" /> Visio</>}
                      {rdv.type === 'a_domicile' && <><FaHome className="me-1" /> À domicile</>}
                      {rdv.type === 'en_cabinet' && <><FaClinicMedical className="me-1" /> Cabinet</>}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="mb-1"><strong>Motif :</strong></p>
                    <p className="text-muted">{rdv.motif}</p>
                  </div>
                </div>
                <div>
                  {rdv.statut === 'en_attente' && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => annulerRendezVous(rdv.id)}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default MesRendezVousListe;
