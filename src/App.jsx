import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Home from "./Pages/Home";
import Reviews from "./Pages/Reviews";
import OurService from "./Pages/OurService";
import Contacts from "./Pages/Contacts";
import Shop from "./Pages/Shop";
import Footer from "../components/Footer";
import Terms from "./Pages/Terms"; // Assuming your Terms page is at this path
import { CartProvider } from '../components/CartContext';
import CartPage from "./Pages/CartPage";
import CompleteOrder from "../components/CompleteOrder";
import CancelOrder from "../components/CancelOrder";
// import { position } from "@cloudinary/url-gen/qualifiers/timeline";
import ReturnPolicy from "./Pages/ReturnPolicy";
import Checkout from "./Pages/Checkout";
import PaymentSuccess from "./Pages/PaymentSuccess";
import PaymentCancel from "./Pages/PaymentCancel";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Header />
        <Routes> 
          <Route style={{position: 'absolute'}}  path="/" element={<Home />} />
          <Route style={{position: 'relative'}}  path="/ourservice" element={<OurService />} />
          <Route style={{position: 'relative'}}  path="/reviews" element={<Reviews />} />
          <Route style={{position: 'relative'}}  path="/terms" element={<Terms />} />
          <Route style={{position: 'relative'}}  path="/return" element={<ReturnPolicy/>} />
          <Route style={{position: 'relative'}}  path="/checkout" element={<Checkout/>} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/" element={<Shop />} />
          {/* <Route path="/product/:productId" element={<ProductPage />} /> */}
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
};

export default App;