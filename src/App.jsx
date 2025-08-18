import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Home from "./Pages/Home";
import Reviews from "./Pages/Reviews";
import OurService from "./Pages/OurService";
import Contacts from "./Pages/Contacts";
import Shop from "./Pages/Shop";
import Footer from "../components/Footer";
import Terms from "./Pages/Terms"; 
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import { CartProvider } from '../components/CartContext';
import ReturnPolicy from "./Pages/ReturnPolicy";
import Checkout from "./Pages/Checkout";
import OrderStatus from "./Pages/OrderStatus";
import Profile from "./Pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import NotFoundPage from "./NotFoundPage";
import VerifyEmail from "../components/VerifyEmail";
import ResetPasswordForm from "../components/ResetPasswordForm";
import MyOrders from "./Pages/MyOrders";
import OrderDetail from "./Pages/OrderDetail";
import { FavoriteProvider } from "../components/FavoriteContext";
import Collaboration from "./Pages/Collaboration";
import FavoritesPage from "./Pages/FavoritesPage";
import GoodbyePage from "./Pages/GoodbyePage";
import WelcomeBackPage from "./Pages/WelcomeBackPage";
import CookieBanner from "../components/CookieBanner";
import { initConsentManagement } from "../src/utils/enhancedConsentUtils";
import LegalNotice from "./Pages/LegalNotice";

const Unauthorized = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Unauthorized Access</h1>
    <p>You don&apos;t have permission to access this page.</p>
    <button onClick={() => window.history.back()}>Go Back</button>
  </div>
);

const AppContent = () => {
  const location = useLocation();

  // Initialize enhanced consent management
  useEffect(() => {
    initConsentManagement();
  }, []);  

  return (
    <>
      <CookieBanner />
      <Header />
      <Routes> 
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />

        <Route path="/ourservice" element={<OurService />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/legal-notice" element={<LegalNotice />} />
        <Route path="/return" element={<ReturnPolicy />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/collaboration" element={<Collaboration />} />
        {/* <Route path="/contacts" element={<Contacts />} /> */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/order-status/:orderId" element={<OrderStatus />} />

        <Route path="/goodbye" element={<GoodbyePage />} />

        {/* Protected routes (require authentication) */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/welcome-back" element={<ProtectedRoute><WelcomeBackPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {location.pathname !== "/" && location.pathname !== "/contacts" && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <FavoriteProvider>
            <AppContent />
          </FavoriteProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;