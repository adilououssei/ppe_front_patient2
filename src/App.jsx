import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Service from './pages/Service';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Pharmacies from './pages/services/Pharmacie';
import Hopital from './pages/services/Hopital';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './custom-bootstrap.scss';
import MesNotifications from './pages/notification/MesNotifications';
import MesNotificationsDocteur from './pages/notification/MesNotificationsDocteur';
import PriseRendezVous from './pages/patient/PriseRendezVous/PriseRendezVous';
import MesRendezVous from './pages/patient/PriseRendezVous/MesRendezVous';
import PatientConsultationsEnLigne from './pages/patient/PatientConsultationsEnLigne';
import Profile from './pages/Profile';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/mes-consultations-en-ligne" element={<PrivateRoute><PatientConsultationsEnLigne /></PrivateRoute>} />

          {/* Routes protégées */}
          <Route path="/" element={<PrivateRoute><Home /><Service /></PrivateRoute>} />
          <Route path="/service" element={<PrivateRoute><Service /></PrivateRoute>} />
          <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
          <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
          <Route path="/pharmacies" element={<PrivateRoute><Pharmacies /></PrivateRoute>} />
          <Route path="/Hopital" element={<PrivateRoute><Hopital /></PrivateRoute>} />
          <Route path="/mes-notifications" element={<PrivateRoute><MesNotifications /></PrivateRoute>} />
          <Route path="/mes-notifications" element={<PrivateRoute><MesNotificationsDocteur /></PrivateRoute>} />
          <Route path="/prise-rendez-vous" element={<PrivateRoute><PriseRendezVous /></PrivateRoute>} />
          <Route path="/mes-rdv" element={<PrivateRoute><MesRendezVous /></PrivateRoute>} />

          {/* Routes publiques */}



        </Routes>
        <Footer />
      </AuthProvider>
    </Router>

  );
}

export default App;
