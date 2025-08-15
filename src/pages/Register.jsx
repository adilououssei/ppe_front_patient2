import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Card, Row, Col } from 'react-bootstrap';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [adresse, setAdresse] = useState('');
    const [telephone, setTelephone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email.includes('@')) {
            return setError('Email invalide');
        }
        if (password.length < 6) {
            return setError('Le mot de passe doit contenir au moins 6 caractères');
        }

        try {
            setError('');
            setLoading(true);

            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, nom, prenom, adresse, telephone }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Échec de l\'inscription');
            }

            const data = await response.json();

            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/login');
            } else {
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            setError(`Échec de l'inscription: ${err.message}`);
        }

        setLoading(false);
    }

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card className="w-100" style={{ maxWidth: '500px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Créer un compte</h2>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col>
                                <Form.Label>Nom</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    required
                                />
                            </Col>
                            <Col>
                                <Form.Label>Prénom</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    required
                                />
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Label>Téléphone</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={telephone}
                                    onChange={(e) => setTelephone(e.target.value)}
                                    required
                                />
                            </Col>
                            <Col>
                                <Form.Label>Adresse</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={adresse}
                                    onChange={(e) => setAdresse(e.target.value)}
                                    required
                                />
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button
                            disabled={loading}
                            className="w-100 mb-3"
                            type="submit"
                            variant="primary"
                        >
                            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        <Link to="/login" className="text-decoration-none">
                            Déjà un compte ? Se connecter
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}
