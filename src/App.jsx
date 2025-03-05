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
import ReturnPolicy from "./Pages/ReturnPolicy";
import Checkout from "./Pages/Checkout";

const AppContent = () => {
  const location = useLocation();  // Get current route

  return (
    <>
      <Header />
      <Routes> 
        <Route style={{ position: 'absolute' }} path="/" element={<Home />} />
        <Route style={{ position: 'relative' }} path="/ourservice" element={<OurService />} />
        <Route style={{ position: 'relative' }} path="/reviews" element={<Reviews />} />
        <Route style={{ position: 'relative' }} path="/terms" element={<Terms />} />
        <Route style={{ position: 'relative' }} path="/return" element={<ReturnPolicy />} />
        <Route style={{ position: 'relative' }} path="/checkout" element={<Checkout />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/" element={<Shop />} />
      </Routes>

      {location.pathname !== "/contacts" && <Footer />}
      
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
