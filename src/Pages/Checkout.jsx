import { useState } from 'react'
import { useCart } from '../../components/CartContext'
import MeasureForm, { MeasurementsProvider } from '../../components/MeasureForm'
import styles from './Checkout.module.css'
import PayPalPayment from '../../components/PayPalPayment'

const Checkout = () => {
  const { cartItems, removeFromCart } = useCart()
  const [isMeasureFormValid, setIsMeasureFormValid] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState(null)

  const totalPrice =
    cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) ||
    0

  const handleMeasureFormValid = (isValid) => {
    setIsMeasureFormValid(isValid)
  }

  const handlePaymentSuccess = (data) => {
    setOrderComplete(true)
    setOrderData(data)
    removeFromCart()
  }

  const handlePaymentCancel = () => {
    console.log('Payment was cancelled')
  }

  const formattedCartItems = cartItems.map((item) => ({
    id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    description: item.description || `${item.name} product`,
    image: item.image,
  }))

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
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.name} x {item.quantity} - €
                {(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="total">
            <strong>Total: €{totalPrice.toFixed(2)}</strong>
          </p>
        </div>
        <button onClick={() => (window.location.href = '/shop')}>
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <MeasurementsProvider>
      <div className={styles.checkoutContainer}>
        <h2>Checkout</h2>

        <div className={styles.orderSummary}>
          {cartItems?.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id || item.name} className={styles.cartItem}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.productImage}
                />
                <div>
                  <p>
                    <strong>{item.name}</strong>
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: €{item.price.toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Your cart is empty</p>
          )}
          <h3 className={styles.sum}>Total Price: €{totalPrice.toFixed(2)}</h3>
        </div>

        {/* Updated to pass the correct prop */}
        <MeasureForm onFormValid={handleMeasureFormValid} />

        <button
          onClick={() => setIsMeasureFormValid(true)}
          className={styles.submitButton}
          disabled={isMeasureFormValid}
        >
          Proceed to Payment
        </button>

        {isMeasureFormValid && (
          <div className={styles.paypalContainer}>
            <PayPalPayment
              cart={formattedCartItems}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        )}
      </div>
    </MeasurementsProvider>
  )
}

export default Checkout


//========================Multiple payment =========================

// import { useState } from 'react';
// import { useCart } from '../../components/CartContext';
// import MeasureForm, { MeasurementsProvider } from '../../components/MeasureForm';
// import PaymentMethodSelector from '../../components/PaymentMethodSelector';
// import PayPalPayment from '../../components/PayPalPayment';
// import StripePayment from '../../components/StripePayment';
// import MolliePayment from '../../components/MolliePayment';
// import styles from './Checkout.module.css';

// const CheckoutContent = () => {
//   const { cartItems, removeFromCart } = useCart();
//   const [isMeasureFormValid, setIsMeasureFormValid] = useState(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
//   const [orderComplete, setOrderComplete] = useState(false);
//   const [orderData, setOrderData] = useState(null);

//   const totalPrice = cartItems?.reduce(
//     (total, item) => total + item.price * item.quantity, 
//     0
//   ) || 0;

//   const handleMeasureFormValid = (isValid) => {
//     setIsMeasureFormValid(isValid);
//   };

//   const handleSelectPaymentMethod = (method) => {
//     setSelectedPaymentMethod(method);
//   };

//   const handlePaymentSuccess = (data) => {
//     setOrderComplete(true);
//     setOrderData(data);
//     removeFromCart();
//   };

//   const handlePaymentCancel = () => {
//     console.log('Payment was cancelled');
//   };

//   const formattedCartItems = cartItems.map(item => ({
//     id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//     name: item.name,
//     price: Number(item.price),
//     quantity: Number(item.quantity),
//     description: item.description || `${item.name} product`,
//     image: item.image
//   }));


//   const renderPaymentComponent = () => {
//     if (!isMeasureFormValid) return null;
    
//     switch (selectedPaymentMethod) {
//       case 'paypal':
//         return (
//           <PayPalPayment
//             cart={formattedCartItems}
//             onSuccess={handlePaymentSuccess}
//             onCancel={handlePaymentCancel}
//           />
//         );
//       case 'stripe':
//         return (
//           <StripePayment
//             cart={formattedCartItems}
//             onSuccess={handlePaymentSuccess}
//             onCancel={handlePaymentCancel}
//           />
//         );
//       case 'mollie':
//         return (
//           <MolliePayment
//             cart={formattedCartItems}
//             onSuccess={handlePaymentSuccess}
//             onCancel={handlePaymentCancel}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   if (orderComplete) {
//     return (
//       <div className={styles.cartContainer}>
//         <h1>Order Confirmed!</h1>
//         <p>Thank you for your purchase.</p>
//         <div className="order-details">
//           <h2>Order Details</h2>
//           <p>Order ID: {orderData.id}</p>
//           <p>Status: {orderData.status}</p>
//           <h3>Items:</h3>
//           <ul>
//             {formattedCartItems.map((item, index) => (
//               <li key={item.id || `order-item-${index}`}>
//                 {item.name} x {item.quantity} - €
//                 {(item.price * item.quantity).toFixed(2)}
//               </li>
//             ))}
//           </ul>
//           <p className="total">
//             <strong>Total: €{totalPrice.toFixed(2)}</strong>
//           </p>
//         </div>
//         <button onClick={() => (window.location.href = '/shop')}>
//           Continue Shopping
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.checkoutContainer}>
//       <h2>Checkout</h2>

//       <div className={styles.orderSummary}>
//         {cartItems?.length > 0 ? (
//           cartItems.map((item) => (
//             <div key={item.id || item.name} className={styles.cartItem}>
//               <img 
//                 src={item.image} 
//                 alt={item.name} 
//                 className={styles.productImage} 
//               />
//               <div>
//                 <p><strong>{item.name}</strong></p>
//                 <p>Quantity: {item.quantity}</p>
//                 <p>Price: €{item.price.toFixed(2)}</p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>Your cart is empty</p>
//         )}
//         <h3 className={styles.sum}>Total Price: €{totalPrice.toFixed(2)}</h3>
//       </div>

//       {/* Measurements form */}
//       <MeasureForm onFormValid={handleMeasureFormValid} />

//       <button 
//         onClick={() => setIsMeasureFormValid(true)} 
//         className={styles.submitButton}
//         disabled={isMeasureFormValid}
//       >
//         Proceed to Payment
//       </button>

//       {isMeasureFormValid && (
//         <>
//           {/* Payment method selector */}
//           <PaymentMethodSelector 
//             onSelectMethod={handleSelectPaymentMethod} 
//             selectedMethod={selectedPaymentMethod} 
//           />
          
//           {/* Payment component */}
//           <div className={styles.paymentContainer}>
//             {renderPaymentComponent()}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// const Checkout = () => {
//   return (
//     <MeasurementsProvider>
//       <CheckoutContent />
//     </MeasurementsProvider>
//   );
// };

// export default Checkout;