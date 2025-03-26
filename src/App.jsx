import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Home from "./Pages/Home";
import Reviews from "./Pages/Reviews";
import OurService from "./Pages/OurService";
import Contacts from "./Pages/Contacts";
import Shop from "./Pages/Shop";
import Footer from "../components/Footer";
import Terms from "./Pages/Terms"; 
import { CartProvider } from '../components/CartContext';
// import { position } from "@cloudinary/url-gen/qualifiers/timeline";
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


const Unauthorized = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Unauthorized Access</h1>
    <p>You don&apos;t have permission to access this page.</p>
    <button onClick={() => window.history.back()}>Go Back</button>
  </div>
);

const AppContent = () => {
  const location = useLocation();  


  return (
    <>
     <AuthProvider>
     <Header />
      <Routes> 
        <Route style={{ position: 'absolute' }} path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />

        <Route style={{ position: 'relative' }} path="/ourservice" element={<OurService />} />
        <Route style={{ position: 'relative' }} path="/reviews" element={<Reviews />} />
        <Route style={{ position: 'relative' }} path="/terms" element={<Terms />} />
        <Route style={{ position: 'relative' }} path="/return" element={<ReturnPolicy />} />
        <Route style={{ position: 'relative' }} path="/checkout" element={<Checkout />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/order-status/:orderId" element={<OrderStatus />} />
        <Route path="/" element={<Shop />} />
         {/* Protected routes (require authentication) */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/orders/:id" 
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } 
                />
              
              {/* <Route 
                path="/checkout"
                style={{ position: 'relative' }} 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              /> */}
              
              {/* <Route 
                path="/orders/:orderId" 
                element={
                  <ProtectedRoute>
                    <OrderStatus />
                  </ProtectedRoute>
                } 
              /> */}
              
              {/* Admin routes (require admin role) */}
              {/* <Route 
                path="/admin" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              /> */}
              
              <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {location.pathname !== "/contacts" && <Footer />}
      
     </AuthProvider>  
    </>
  );
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
};

export default App;
