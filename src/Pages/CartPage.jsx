import { useEffect, useState } from 'react'
// import PayPalPayment from '../../components/PayPalPayment'
import PaymentProcessor from '../../components/PaymentProcessor'
import styles from './CartPage.module.css'

function CartPage() {
  // const [cart, setCart] = useState([
  //   {
  //     id: '1',
  //     name: 'Silk Scarf',
  //     description: 'Luxury silk scarf with elegant pattern',
  //     price: 100.0,
  //     quantity: 1,
  //   },
  //   {
  //     id: '2',
  //     name: 'Cap',
  //     description: 'Elegant cap with a matching scarf',
  //     price: 50.0,
  //     quantity: 2,
  //   },
  // ])

  //==========================================================================

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/products?limit=5');
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Initialize cart with first two products (or adjust as needed)
      if (data.products.length) {
        const initialCart = data.products.slice(0, 2).map(product => ({
          id: product._id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl
        }));
        
        setCart(initialCart);
      }
      
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch products: ${err.message}`);
      setLoading(false);
    }
  };

  //==========================================================================


  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState(null)

  const handlePaymentSuccess = (data) => {
    setOrderComplete(true)
    setOrderData(data)
    // You could also clear the cart here
    // setCart([]);
  }

  const handlePaymentCancel = () => {
    console.log('Payment was cancelled')
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return

    setCart(
      cart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  // Calculate cart total
  const cartTotal = cart
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div className="error">{error}</div>;

  if (orderComplete) {
    return (
      <div className={styles.cartContainer}>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase.</p>
        <div className="order-details">
          <h2>Order Details</h2>
          <p>Order ID: {orderData.id}</p>
          <p>Status: {orderData.status}</p>
          <h3>Items:</h3>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} x {item.quantity} - €
                {(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="total">
            <strong>Total: €{cartTotal}</strong>
          </p>
        </div>
        <button onClick={() => (window.location.href = '/shop')}>
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <>
     <h1 className={styles.cartTitle}>Your Cart</h1>
    <div className={styles.cartContainer}>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className={styles.productContainer}>
            <div>
              {cart.map((item) => (
                <div key={item.id} className={styles.cartItems}>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p className="price">€{item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="item-total">
                    €{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>€{cartTotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>€{cartTotal}</span>
              </div>
            </div>
          </div>

          <div className={styles.paymentContainer}>
            {/* <PayPalPayment
              cart={cart}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            /> */}
            < PaymentProcessor 
               cart={cart}
               onSuccess={handlePaymentSuccess}
               onCancel={handlePaymentCancel}
            />
          </div>
        </>
      )}
    </div>
    </>
  )
}

export default CartPage

// import CardProduct from "../../components/CardProduct";
// import PayPalPayment from "../../components/PayPalPayment";
// import styles from "./CartPage.module.css";

// const CartPage = () => {
//   return (
//     <div className={styles.cartContainer}>
//       <div className={styles.productContainer}>
//         <CardProduct />
//       </div>
//         <div className={styles.paymentContainer}>
//           <PayPalPayment />
//         </div>
//     </div>
//   );
// };

// export default CartPage;
