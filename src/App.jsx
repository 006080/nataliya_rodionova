import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Home from "./Pages/Home";
import Contacts from "./Pages/Contacts";
import Footer from "../components/Footer";
import Terms from "./Pages/Terms";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import Collaboration from "./Pages/Collaboration";
import About from "./Pages/About";
import CookieBanner from "../components/CookieBanner";
import CookieSettings from "./Pages/CookieSettings";
import Impressum from "./Pages/Impressum";
import ScrollToTop from '../components/ScrollToTop';

// Компонент для страниц с ограниченным доступом (опционально)
const Unauthorized = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#ffffff', backgroundColor: '#000000', minHeight: '100vh' }}>
    <h1>Unauthorized Access</h1>
    <p>You don&apos;t have permission to access this page.</p>
    <button 
      style={{ background: 'none', border: '1px solid #ffffff', color: '#ffffff', padding: '8px 16px', cursor: 'pointer', marginTop: '1rem' }} 
      onClick={() => window.history.back()}
    >
      Go Back
    </button>
  </div>
);

const AppContent = () => {
  const location = useLocation();

  return (
    <>
      {/* Баннер куки и глобальный скролл */}
      <CookieBanner />
      <ScrollToTop />
      
      {/* Минималистичная навигация (иконка Home) */}
      <Header />
      
      {/* Матрица маршрутов */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/about" element={<About />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/cookie-settings" element={<CookieSettings />} />
        {/* Хендлер неавторизованного доступа на случай кастомных редиректов */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>

      {/* Условие отображения подвала сайта согласно контентной сетке страниц */}
      {location.pathname !== "/" && location.pathname !== "/contacts" && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;