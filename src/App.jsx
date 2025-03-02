import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Home from "./Pages/Home";
import Reviews from "./Pages/Reviews";
import OurService from "./Pages/OurService";
import Contacts from "./Pages/Contacts";
import Shop from "./Pages/Shop";
import Footer from "../components/Footer";
import { CartProvider } from '../components/CartContext';
import CartPage from "./Pages/CartPage";
import CompleteOrder from "../components/CompleteOrder";
import CancelOrder from "../components/CancelOrder";
// import { position } from "@cloudinary/url-gen/qualifiers/timeline";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Header />
        <Routes>
          <Route style={{position: 'absolute'}}  path="/" element={<Home />} />
          <Route style={{position: 'relative'}}  path="/ourservice" element={<OurService />} />
          <Route style={{position: 'relative'}}  path="/reviews" element={<Reviews />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/complete-order" element={<CompleteOrder />} />
          <Route path="/cancel-order" element={<CancelOrder />} />
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
};

export default App;