import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBell } from "react-icons/fa";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isPatient = user && user.roles.includes("ROLE_PATIENT");
    const isDocteur = user && user.roles.includes("ROLE_DOCTEUR");

    return (
        <div className="container-fluid sticky-top bg-white shadow-sm">
            <div className="container">
                <nav className="navbar navbar-expand-lg bg-white navbar-light py-3 py-lg-0">
                    <Link to="/" className="navbar-brand">
                        <h1 className="m-0 logo" style={{ color: "#0077B6" }}>
                            <i className="bi bi-h-square" style={{ color: "#0077B6" }}></i>
                            MyHospital
                        </h1>
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarCollapse"
                        aria-controls="navbarCollapse"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarCollapse">
                        <div className="navbar-nav ms-auto py-0">
                            <Link to="/" className="nav-item nav-link">Accueil</Link>
                            <Link to="/about" className="nav-item nav-link">A propos</Link>
                            <Link to="/service" className="nav-item nav-link">Service</Link>

                            <div className="nav-item dropdown">
                                <Link to="#" className="nav-link dropdown-toggle"
                                    id="navbarDropdown" role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    onClick={(e) => e.preventDefault()}>
                                    Pages
                                </Link>
                                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li><Link to="/prise-rendez-vous" className="dropdown-item">Rendez-vous</Link></li>
                                    <li><Link to="/pharmacies" className="dropdown-item">Pharmacies de garde</Link></li>
                                    <li><Link to="/mes-rdv" className="dropdown-item">Mes rendez-vous</Link></li>
                                    <li><Link to="/mes-consultations-en-ligne" className="dropdown-item">Mes consultations en ligne</Link></li>
                                </ul>
                            </div>

                            <Link to="/contact" className="nav-item nav-link me-3">Contact</Link>

                            {/* 🔔 Notifications pour Patient ou Docteur */}
                            {/* {(isPatient || isDocteur) && (
                                <Link to="/mes-notifications" className="nav-link position-relative me-3">
                                    <FaBell size={24} color="#0077B6" />
                                    <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle">
                                        <span className="visually-hidden">New alerts</span>
                                    </span>
                                </Link>
                            )} */}

                            {/* Dropdown "Mon Compte" pour Patient */}
                            {isPatient && (
                                <div className="nav-item dropdown">
                                    <Link to="#" className="nav-link dropdown-toggle"
                                        id="accountDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        onClick={(e) => e.preventDefault()}>
                                        Mon Compte
                                    </Link>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                                        <li>
                                            <Link to="/profile" className="dropdown-item">Profile</Link>
                                        </li>
                                        
                                        <li>
                                            <Link to="/mes-notifications" className="dropdown-item">Notifications</Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button onClick={handleLogout} className="dropdown-item">Déconnexion</button>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {/* Connexion si non connecté */}
                            {!user && (
                                <Link to="/login" className="login-button">Connexion</Link>
                            )}
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}

export default Navbar;
