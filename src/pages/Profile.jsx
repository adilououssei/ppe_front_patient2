// src/pages/shared/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from "../services/Api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Récupérer le user connecté avec toutes les infos nécessaires
        const response = await api.get('/me');
        setUser(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du profil', error);
        setErrorMessage('Impossible de charger le profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    try {
      if (user.role === 'doctor') {
        await api.put(`/api/profile/update-doctor`, {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone
        });
      } else if (user.role === 'admin') {
        await api.put(`/api/profile/update-admin`, {
          email: user.email
        });
      }
      setSuccessMessage('Profil mis à jour avec succès !');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Erreur lors de la mise à jour du profil');
      console.error(error);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    try {
      await api.put('/api/profile/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMessage('Mot de passe mis à jour avec succès !');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe');
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Chargement du profil...</p>
      </Container>
    );
  }

  if (!user) return <Container>Impossible de charger le profil.</Container>;

  return (
    <Container className="my-4">
      <h2>Mon Profil</h2>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Card>
        <Card.Body>
          {editMode ? (
            <Form onSubmit={handleSubmitProfile}>
              {user.role === 'doctor' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom"
                      value={user.nom || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      name="prenom"
                      value={user.prenom || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="telephone"
                      value={user.telephone || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={user.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setEditMode(false)}>Annuler</Button>
                <Button variant="primary" type="submit">Enregistrer</Button>
              </div>
            </Form>
          ) : passwordMode ? (
            <Form onSubmit={handleSubmitPassword}>
              <Form.Group className="mb-3">
                <Form.Label>Ancien mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nouveau mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setPasswordMode(false)}>Annuler</Button>
                <Button variant="primary" type="submit">Changer le mot de passe</Button>
              </div>
            </Form>
          ) : (
            <>
              <div className="mb-3">
                {user.role === 'doctor' && <h5>{user.nom} {user.prenom}</h5>}
                <p className="text-muted mb-1">
                  Rôle: {user.role === 'admin' ? 'Administrateur' : 'Docteur'}
                </p>
              </div>

              <div className="mb-3"><strong>Email:</strong> {user.email}</div>
              {user.role === 'doctor' && (
                <div className="mb-3"><strong>Téléphone:</strong> {user.telephone}</div>
              )}

              <div className="d-flex gap-2">
                <Button variant="primary" onClick={() => setEditMode(true)}>Modifier le profil</Button>
                <Button variant="warning" onClick={() => setPasswordMode(true)}>Changer le mot de passe</Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
