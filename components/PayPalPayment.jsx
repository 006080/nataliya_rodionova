// import { useState } from 'react'
// import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
// import { useMeasurements } from './MeasureForm';
// import styles from './PayPalPayment.module.css'

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL
//   return baseUrl
// }

// function PayPalPayment({ cart = [], onSuccess, onCancel }) {
//   const [paymentStatus, setPaymentStatus] = useState('')
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [error, setError] = useState(null)
//   const { measurements } = useMeasurements();

//     const formatCartItems = (cartItems) => {
//       return cartItems.map(item => ({
//         id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//         name: item.name,
//         price: Number(item.price),
//         quantity: Number(item.quantity),
//         description: item.description || `${item.name} product`
//       }));
//     };

//   const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

//   const createOrder = async () => {
//     setIsProcessing(true)
//     setError(null)
//     setPaymentStatus('Creating order...')

//     try {
//         // Ensure cart items are properly formatted
//         const formattedCart = formatCartItems(cart);
//         console.log('Sending cart to API:', formattedCart);

//       const res = await fetch(`${getApiUrl()}/api/payments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             //  cart 
//              cart: formattedCart,
//              measurements: measurements
//         }),
//       })

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json()
//       console.log('Raw API Response:', data) // ✅ Debugging

//       if (!data.id) {
//         throw new Error('No order ID returned from backend')
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error)
//       setError(error.message || 'Payment failed')
//       setPaymentStatus('Error creating order')
//       throw error
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   const onApprove = async (data, actions) => {
//     setIsProcessing(true)
//     setPaymentStatus('Processing payment...')

//     try {
//       console.log('Payment approved:', data.orderID)
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       )

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || 'Failed to capture payment')
//       }

//       const orderData = await response.json()
//       console.log('Order Captured:', orderData)

//       const paymentStatus = orderData.status

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!')
//         // window.location.href = 'http://localhost:5173/complete-order'

//         if (onSuccess && typeof onSuccess === 'function') {
//             onSuccess(orderData);
//           }
//         } else {
//           setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//         }

//       return orderData

//     } catch (error) {
//       console.error('Error capturing payment:', error)
//       setError(error.message || 'Payment failed')
//       setPaymentStatus('Payment failed')
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   const handleCancel = (data) => {
//     console.log("Payment cancelled:", data);
//     setPaymentStatus("Payment cancelled");
    
//     if (onCancel && typeof onCancel === 'function') {
//       onCancel(data);
//     }
//   };
// //   const onCancel = (data) => {
// //     console.log('Payment cancelled:', data)
// //     setPaymentStatus('Payment cancelled')
// //     window.location.href = 'http://localhost:5173/cancel-order'
// //   }

//   const onError = (error) => {
//     console.error('PayPal error:', error)
//     setError('An error occurred with PayPal')
//     setPaymentStatus('Payment error')
//   }

//   if (!cart.length) {
//     return <div>No items in cart</div>;
//   }

//   return (
//     <PayPalScriptProvider
//       options={{
//         'client-id': `${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
//         currency: 'EUR',
//       }}
//     >
//       <div className={styles.payPalContainer}>

//         {error && <div className="error-message">{error}</div>}
//         {paymentStatus && <div className="status-message">{paymentStatus}</div>}


//         <div className={styles.paypalButtonContainer}>
//           <PayPalButtons
//             createOrder={createOrder}
//             onApprove={onApprove}
//             onCancel={handleCancel}
//             onError={onError}
//             disabled={isProcessing}
//             style={{
//               layout: 'vertical',
//               color: 'gold',
//               shape: 'rect',
//             //   label: 'pay',
//             }}
//           />
//         </div>
//       </div>
//     </PayPalScriptProvider>
//   )
// }

// export default PayPalPayment



//==========================================================================



import { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useMeasurements } from './MeasureForm';
import styles from './PayPalPayment.module.css';

const getApiUrl = () => {
  const baseUrl =
    import.meta.env.VITE_NODE_ENV === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  return baseUrl;
};

function PayPalPayment({ cart = [], onSuccess, onCancel }) {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderReference, setOrderReference] = useState(''); 
  const { measurements } = useMeasurements();

  const formatCartItems = (cartItems) => {
    return cartItems.map(item => ({
      id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      description: item.description || `${item.name} product`
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  const createOrder = async () => {
    setIsProcessing(true);
    setError(null);
    setPaymentStatus('Creating order...');

    try {
      // Ensure cart items are properly formatted
      const formattedCart = formatCartItems(cart);
      console.log('Sending cart to API:', formattedCart);

      const res = await fetch(`${getApiUrl()}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: formattedCart,
          measurements: measurements
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await res.json();
      console.log('Raw API Response:', data);

      if (!data.id) {
        throw new Error('No order ID returned from backend');
      }

      // Store the order reference for later use in capture
      if (data.orderReference) {
        setOrderReference(data.orderReference);
        console.log('Order reference saved:', data.orderReference);
      } else {
        console.warn('No orderReference returned from backend');
      }

      setPaymentStatus("Order created successfully");
      return data.id;

    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || 'Payment failed');
      setPaymentStatus('Error creating order');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const onApprove = async (data, actions) => {
    setIsProcessing(true);
    setPaymentStatus('Processing payment...');

    try {
      console.log('Payment approved:', data.orderID);
      console.log('Using order reference:', orderReference);

      const response = await fetch(
        `${getApiUrl()}/api/payments/${data.orderID}/capture`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderReference: orderReference,
            paymentMethod: 'paypal'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to capture payment');
      }

      const orderData = await response.json();
      console.log('Order Captured:', orderData);

      const paymentStatus = orderData.status;

      if (paymentStatus === 'COMPLETED') {
        setPaymentStatus('Payment successful!');

        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(orderData);
        }
      } else {
        setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
      }

      return orderData;

    } catch (error) {
      console.error('Error capturing payment:', error);
      setError(error.message || 'Payment failed');
      setPaymentStatus('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = (data) => {
    console.log("Payment cancelled:", data);
    setPaymentStatus("Payment cancelled");
    
    if (onCancel && typeof onCancel === 'function') {
      onCancel(data);
    }
  };

  const onError = (error) => {
    console.error('PayPal error:', error);
    setError('An error occurred with PayPal');
    setPaymentStatus('Payment error');
  };

  if (!cart.length) {
    return <div>No items in cart</div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id': `${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
        currency: 'EUR',
      }}
    >
      <div className={styles.payPalContainer}>
        {error && <div className="error-message">{error}</div>}
        {paymentStatus && <div className="status-message">{paymentStatus}</div>}

        <div className={styles.paypalButtonContainer}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onCancel={handleCancel}
            onError={onError}
            disabled={isProcessing}
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

export default PayPalPayment;